import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand, ScanCommandOutput} from "@aws-sdk/lib-dynamodb";
import LambdaEvent from "../Utility/LambdaEventIF";
import {ErrorMessages, Messages} from "../../consts/systems";
import {PostRequest} from "../Utility/Http/PostRequest";
import {GetRequest} from "../Utility/Http/GetRequest";
import {decodeJwtTokenResponseType, EnvironmentsIF, OAuthResponse, RequestInputIF} from "./GoogleSignInFunctionIF";

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
        // 環境変数
        const ENV = Environments.create();
        // 入力値
        const requestInput = RequestInput.create(event);

        // OAuth実行
        const oAuthResponse = await doOAuthRequest(ENV, requestInput);

        // ログイン情報
        const accessToken = oAuthResponse.access_token;

        // ユーザーチェック
        const client = new DynamoDBClient({region: ENV.region});
        const docClient = DynamoDBDocumentClient.from(client);
        const scanParams = {
            TableName: ENV.authTableName,
        };

        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await client.send(scanCommand);

        //　ユーザーが存在している場合はサインイン処理
        const user = getTuneUser(accessToken, scanResult);
        if (user) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'success sign in',
                    data: user
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
            };
        }

        // ユーザーの詳細情報を問い合わせる
        const decodedJwtTokenResponse = await doDecodeJWTToken(oAuthResponse).then((response: decodeJwtTokenResponseType) => {
            if (!response.email) {
                console.error(response);
                throw new Error(Messages.INTERNAL_SERVER_ERROR);
            }
            return response;
        }).catch((err) => {
            console.error(err);
            throw new Error(Messages.INTERNAL_SERVER_ERROR);
        });

        // 発番するUserIdを算出
        const newUserId = getNewUserId(scanResult);
        const updateCommand = new UpdateCommand({
            TableName: ENV.authTableName,
            Key: {
                userId: `${newUserId}`
            },
            UpdateExpression: "set accessToken = :accessToken, email = :email",
            ExpressionAttributeValues: {
                ":accessToken": accessToken,
                ":email": decodedJwtTokenResponse.email
            },
            ReturnValues: "ALL_NEW",
        });
        const updateResult = await docClient.send(updateCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: Messages.SUCCESS,
                data: updateResult
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
        };

    } catch (error) {
        console.error(error);
        throw new Error(Messages.INTERNAL_SERVER_ERROR);
    }
};

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
 * @param ENV
 * @param requestInput
 */
function  doOAuthRequest(ENV: Environments, requestInput: RequestInput): Promise<OAuthResponse> {
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
    const postData = `grant_type=authorization_code&access_type=offline&redirect_uri=${ENV.redirectUrl}&client_secret=${ENV.clientSecret}&client_id=${clientId}&code=${code}`;

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
 * @param token
 * @param scanResult
 */
const getTuneUser = (token: string, scanResult: ScanCommandOutput): TuneUser | false => {
    if (scanResult.Count === 0) {
        return false;
    }

    for (const item of scanResult.Items!) {
        if (token === item.access_token) {
            return new TuneUser(item.email, item.access_token);
        }
    }

    return false;
};

class TuneUser {
    constructor(
        public readonly email: string,
        public readonly access_token: string
    ) {
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

/**
 * 環境変数
 */
class Environments {
    public readonly clientSecret: string
    public readonly redirectUrl: string
    public readonly region: string
    public readonly authTableName: string
    private constructor(property:EnvironmentsIF
    ) {
        this.clientSecret = property.clientSecret;
        this.redirectUrl = property.redirectUrl;
        this.region = property.region;
        this.authTableName = property.authTableName;
    }

    static create(): Environments {
        const clientSecret = process.env.ClientSecret;
        const redirectUrl = process.env.RedirectUri;
        const region = process.env.Region;
        const authTableName = process.env.AuthTableName;

        // クラスバリデーション
        if ((redirectUrl == undefined)
            || (clientSecret == undefined)
            || (region == undefined)
            || (authTableName == undefined)
        ) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        return new Environments({
                clientSecret: clientSecret,
                redirectUrl: redirectUrl,
                region: region,
                authTableName: authTableName
            }
        )
    }
}