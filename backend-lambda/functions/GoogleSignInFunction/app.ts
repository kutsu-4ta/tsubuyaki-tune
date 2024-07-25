import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand, ScanCommandOutput} from "@aws-sdk/lib-dynamodb";
import LambdaEvent from "../Utility/LambdaEventIF";
import {PostRequest} from "../Utility/Http/PostRequest";
import {GetRequest} from "../Utility/Http/GetRequest";
import {decodeJwtTokenResponseType, OAuthResponse, RequestInputIF} from "./GoogleSignInFunctionIF";
import {ENVIRONMENT, ErrorMessages, Messages} from "../../consts/systems";

/**
 * OAuthの流れ
 * ① React → Googleの同意画面 → React
 * ② React → Lambda
 * ③ Lambda → Googleサーバのアクセストークン取得用API
 * ④ Lambda → GoogleサーバのJWTトークンデコード用API
 *
 * ②〜④の処理
 * @param event
 */
export const lambdaHandler = async (event: LambdaEvent): Promise<any> => {
    try {
        console.log("input");
        // 入力値
        const requestInput = RequestInput.create(event);

        // OAuth実行
        const oAuthResponse = await fetchAccessToken(requestInput);
        // ユーザーの詳細な認証情報
        const detailUserInfo = await fetchAuthInfoDetail(oAuthResponse);

        // ユーザを取得
        let user = await getUser(detailUserInfo.email);

        // 新規登録
        if (user == null) {
            user = await createUser(oAuthResponse, detailUserInfo);
            // ログイン
            user?.login();
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "signUp & login " + Messages.SUCCESS,
                    data: user
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            }
        }

        // ログイン
        user?.login();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "login " + Messages.SUCCESS,
                data: user
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(Messages.INTERNAL_SERVER_ERROR);
    }
};

/**
 * 新規ユーザーを作成する
 * @param oAuthResponse
 * @param detailUserInfo
 */
async function createUser(oAuthResponse: OAuthResponse, detailUserInfo: decodeJwtTokenResponseType): Promise<User> {
    console.log("user is null");
    // 発番するUserIdを算出
    // ユーザーチェック
    const client = new DynamoDBClient({region: ENVIRONMENT.region});
    const docClient = DynamoDBDocumentClient.from(client);
    const scanParams = {
        TableName: ENVIRONMENT.authTableName,
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await client.send(scanCommand);
    const newUserId = getNewUserId(scanResult);

    const updateCommand = new UpdateCommand({
        TableName: ENVIRONMENT.authTableName,
        Key: {
            userId: `${newUserId}`
        },
        UpdateExpression: "set accessToken = :accessToken, email = :email",
        ExpressionAttributeValues: {
            ":accessToken": oAuthResponse.access_token,
            ":email": detailUserInfo.email
        },
        ReturnValues: "ALL_NEW",
    });
    const updateResult = await docClient.send(updateCommand);
    console.log("updateResult");
    console.log(updateResult);

    const createdUserId = updateResult!.Attributes!.userId! as string;
    const email = updateResult!.Attributes!.email! as string;
    const createdAccessToken = updateResult!.Attributes!.accessToken! as string;

    return await User.createInstance({
        userId: createdUserId,
        email: email,
        accessToken: createdAccessToken
    });
}

/**
 * ユーザーの詳細情報を問い合わせる
 */
async function fetchAuthInfoDetail(oAuthResponse: OAuthResponse): Promise<decodeJwtTokenResponseType> {
    return await doDecodeJWTToken(oAuthResponse).then((response: decodeJwtTokenResponseType) => {
        if (!response.email) {
            console.error(response);
            throw new Error(Messages.INTERNAL_SERVER_ERROR);
        }
        return response;
    }).catch((err) => {
        console.error(err);
        throw new Error(Messages.INTERNAL_SERVER_ERROR);
    });
}

/**
 * Googleのサーバーに問い合わせてJWTトークンのデコードを行う
 */
function doDecodeJWTToken(oAuthResponse: OAuthResponse): Promise<decodeJwtTokenResponseType> {
    const getRequest = new GetRequest({
        hostname: 'www.googleapis.com',
        path: `/oauth2/v1/userinfo?id_toke=${oAuthResponse.id_token}`,
        headers: {
            'Authorization': `Bearer ${oAuthResponse.access_token}`
        }
    });

    return getRequest.get();
}

/**
 * Googleの認証サーバーからアクセストークンを受け取る
 * @param requestInput
 */
function  fetchAccessToken(requestInput: RequestInput): Promise<OAuthResponse> {
    const postRequest = new PostRequest({
        hostname: 'www.googleapis.com',
        port: 443,
        path: '/oauth2/v4/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const clientId = requestInput.clientId;
    const code = requestInput.code;
    const postData = `grant_type=authorization_code&access_type=offline&redirect_uri=${ENVIRONMENT.redirectUrl}&client_secret=${ENVIRONMENT.clientSecret}&client_id=${clientId}&code=${code}`;

    // OAuth認証を実行
    return postRequest.post(postData);
}

/**
 * 新しいユーザーIDを発番する
 * @param scanResult
 */
const getNewUserId = (scanResult: ScanCommandOutput): number => {
    let newUserId = 1;
    if (scanResult.Count === 0) {
        return newUserId;
    }

    // increment logic
    for (const item of scanResult.Items!) {
        if (newUserId < item.userId) {
            newUserId = item.userId;
        }
    }
    return Number(newUserId) + 1;
};

/**
 * Userを取得する
 * @param email
 */
const getUser = async (email: string ): Promise<User | null> => {
    // ユーザーチェック
    const client = new DynamoDBClient({region: ENVIRONMENT.region});
    const scanParams = {
        TableName: ENVIRONMENT.authTableName,
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await client.send(scanCommand);

    if(scanResult.Items == undefined) {
        console.error("item is undefined");
        // TODO: エラーレスポンス
        new Error(Messages.INTERNAL_SERVER_ERROR);
    }

    console.log("========scanResult========");
    console.log(scanResult.Items);
    console.log(scanResult.Items!.length);
    console.log(scanResult.Items![0]);
    console.log(scanResult.Items![1]);

    //　ユーザーが存在している場合はサインイン
    for(let i = 0; i < scanResult.Items!.length; i++) {
        const user = scanResult.Items![i];
        console.log("=========in_for========");
        console.log(user);
        console.log(user.email);
        console.log(email);
        console.log(user.email === email);

        if (user.email === email) {
            console.log("user find!");
            return User.createInstance({userId: user.userId, email: user.email, accessToken: user.accessToken});
        }
    }
    return null;
};

class User {
    private constructor(
        public readonly userId: string,
        public readonly email: string,
        public readonly accessToken: string
    ) {
    }

    static async createInstance(authInfo: { userId: string, email: string, accessToken: string }): Promise<User> {
        return new User(authInfo.userId, authInfo.email, authInfo.accessToken);
    }

    /**
     * ログインする
     */
    public async login() {

        const accessToken = this.accessToken;
        // const timeStamp = this.timestamp;

        await this.updateAccessToken(accessToken);
    }

    /**
     * アクセストークンを更新する
     */
    private async updateAccessToken(accessToken: string): Promise<void> {
        const client = new DynamoDBClient({region: ENVIRONMENT.region});
        const docClient = DynamoDBDocumentClient.from(client);
        const updateCommand = new UpdateCommand({
            TableName: ENVIRONMENT.authTableName,
            Key: {
                userId: this.userId
            },
            UpdateExpression: "set accessToken = :accessToken",
            ExpressionAttributeValues: {
                ":accessToken": accessToken,
            },
            ReturnValues: "ALL_NEW",
        });
        await docClient.send(updateCommand);
    }
}

/**
 * このlambdaHandlerでの入力の値オブジェクト
 */
class RequestInput {
    public readonly code: string
    public readonly clientId: string

   private constructor(property: RequestInputIF) {
        this.code = property.code;
        this.clientId = property.clientId;
    }

    static create(event: LambdaEvent): RequestInput {
        console.log("========input========")

        if (event === undefined) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        const eventBody = JSON.parse(event.body);
        const code = eventBody.code;
        const clientId = eventBody.client_id;

        if (!(code && clientId)) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        return new RequestInput({code: code, clientId: clientId})
    }
}