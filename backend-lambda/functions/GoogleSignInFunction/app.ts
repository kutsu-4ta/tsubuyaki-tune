import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {ScanCommand} from "@aws-sdk/lib-dynamodb";
import LambdaEvent from "../Utility/LambdaEventIF";
import {PostRequest} from "../Utility/Http/PostRequest";
import {OAuthResponse, RequestInputIF} from "./GoogleSignInFunctionIF";
import {ENVIRONMENT, ErrorMessages, Messages} from "../../consts/systems";
import {User} from "../../models/User";
import {GoogleOAuth} from "../Utility/AuthManager/googleOAuth";

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
        const detailUserInfo = await GoogleOAuth.fetchAuthInfoDetail({
            idToken: oAuthResponse.id_token,
            accessToken: oAuthResponse.access_token
        });

        // ユーザを取得
        let user = await getUser(detailUserInfo.email);

        if (user == null) {
            // 新規登録
            user = await User.createUser({email: detailUserInfo.email, accessToken: oAuthResponse.access_token});
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
 * Googleの認証サーバーからアクセストークンを受け取る
 * @param requestInput
 */
function fetchAccessToken(requestInput: RequestInput): Promise<OAuthResponse> {
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
 * Userを取得する
 * @param email
 */
const getUser = async (email: string): Promise<User | null> => {
    // ユーザーチェック
    const client = new DynamoDBClient({region: ENVIRONMENT.region});
    const scanParams = {
        TableName: ENVIRONMENT.authTableName,
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await client.send(scanCommand);

    if (scanResult.Items == undefined) {
        console.error("item is undefined");
        throw new Error(Messages.INTERNAL_SERVER_ERROR);
    }

    console.log("========scanResult========");
    console.log(scanResult.Items);
    console.log(scanResult.Items!.length);
    console.log(scanResult.Items![0]);
    console.log(scanResult.Items![1]);

    //　ユーザーが存在している場合はサインイン
    for (let i = 0; i < scanResult.Items!.length; i++) {
        const user = scanResult.Items![i];
        if (user.email === email) {
            console.log("user find!");
            return User.createInstance({
                userId: user.userId,
                uid: user.uid,
                email: user.email,
                accessToken: user.accessToken
            });
        }
    }
    return null;
};

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