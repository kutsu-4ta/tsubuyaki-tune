import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// import {DynamoDBClient, ScanCommand} from '@aws-sdk/client-dynamodb'
import * as https from 'https';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput, ScanCommand, UpdateCommand, ScanCommandInput, UpdateCommandInput , ScanCommandOutput} from "@aws-sdk/lib-dynamodb";

/**
 * Lambdaの引数
 */
interface LambdaEvent {
    resource: string;
    path: string;
    httpMethod: string;
    headers: {
        [key: string]: string;
    };
    multiValueHeaders: {
        [key: string]: string[];
    };
    queryStringParameters: { [key: string]: string | null } | null;
    multiValueQueryStringParameters: { [key: string]: string[] | null } | null;
    pathParameters: { [key: string]: string | null } | null;
    stageVariables: { [key: string]: string | null } | null;
    requestContext: {
        resourceId: string;
        authorizer: {
            numberKey: string;
            booleanKey: string;
            stringKey: string;
            principalId: string;
            integrationLatency: number;
        };
        resourcePath: string;
        httpMethod: string;
        extendedRequestId: string;
        requestTime: string;
        path: string;
        accountId: string;
        protocol: string;
        stage: string;
        domainPrefix: string;
        requestTimeEpoch: number;
        requestId: string;
        identity: {
            cognitoIdentityPoolId: string | null;
            cognitoIdentityId: string | null;
            apiKey: string;
            principalOrgId: string | null;
            cognitoAuthenticationType: string | null;
            userArn: string | null;
            apiKeyId: string;
            userAgent: string;
            accountId: string | null;
            caller: string | null;
            sourceIp: string;
            accessKey: string | null;
            cognitoAuthenticationProvider: string | null;
            user: string | null;
        };
        domainName: string;
        deploymentId: string;
        apiId: string;
    };
    body: string;
    isBase64Encoded: boolean;
}

/**
 * access_token取得用のGoogleAPIが返してくれるレスポンス
 */
interface OAuthResponse {
    id_token: string
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
    token_type: string
}

/**
 * id_tokenデコード用のGoogleAPIが返してくれるレスポンス
 */
interface decodeJwtTokenResponseType {
    id: string // id
    email: string // email
    verified_email: true // sub email
    name: string // account name
    given_name: string // first name
    family_name: string // last name
    picture: string // image url
    locale: string // ja
}

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

    console.log('=============================env=============================')
    console.log(process.env.ClientSecret);
    console.log(process.env.RedirectUri);
    console.log(process.env.Region);
    console.log(process.env.AuthTableName);
    console.log('=============================env=============================')

    // 環境変数
    const clientSecret= process.env.ClientSecret;
    const redirectUrl = process.env.RedirectUri;
    const region = process.env.Region;
    const authTableName = process.env.AuthTableName;
    if ((redirectUrl == undefined)
        || (clientSecret == undefined)
        || (region == undefined)
        || (authTableName == undefined)
    ) {
        console.log('environment parameter is undefined.');
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    try {
        console.log('=============================come=============================')
        console.log(event.body);
        console.log('=============================come=============================')
        if (event.body === undefined) {
            console.log('TODO: エラーレスポンス');
        }

        // Googleの同意画面から送られてきたcodeとclient_idを取得する
        const eventBody = JSON.parse(event.body);
        const code = eventBody.code;
        const clientId = eventBody.client_id;

        console.log(eventBody);
        console.log(code);
        console.log(clientId);

        /****************************************************
         *  send code from ResourceServer
         *  and, OAuthServer return access_token and other Info
         *****************************************************/
        const getTokenResponse: OAuthResponse = await new Promise((resolve, reject) => {
            // オプション
            const options: https.RequestOptions = {
                hostname: 'www.googleapis.com',
                port: 443,
                path: '/oauth2/v4/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            const req = https.request(options, (res: any) => {
                let data = '';

                res.on('data', (chunk: any) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });

            req.on('error', (error: any) => {
                reject(error);
            });

            const postData = `grant_type=authorization_code&access_type=offline&redirect_uri=${redirectUrl}&client_secret=${clientSecret}&client_id=${clientId}&code=${code}`;
            req.write(postData);

            req.end();
        });

        // ログイン情報
        const idToken = getTokenResponse.id_token;
        const accessToken = getTokenResponse.access_token;

        console.log('=============getTokenResponse============')
        console.log(getTokenResponse);
        console.log('=============getTokenResponse============')

        // ユーザーチェック
        const client = new DynamoDBClient({ region: region });
        const docClient = DynamoDBDocumentClient.from(client);
        const scanParams = {
            TableName: authTableName,
        };

        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await client.send(scanCommand);

        //　ユーザーが存在している場合はサインイン処理
        const user = getTuneUser(accessToken, scanResult);
        if (user) {
            console.log('=============user_exist============');
            console.log(user);
            console.log(getTokenResponse.access_token);
            console.log('=============user_exist============')
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

        /****************************************************
         *  send id_token from ResourceServer
         *  and, OAuthServer return GoogleUserInfo
         *****************************************************/
        console.log('=============decodedJwtTokenResponse============')
        const decodedJwtTokenResponse: decodeJwtTokenResponseType = await new Promise((resolve, reject) => {
            // オプション
            const options: https.RequestOptions = {
                hostname: 'www.googleapis.com',
                path: `/oauth2/v1/userinfo?id_toke=${idToken}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            };

            const req = https.request(options, (res: any) => {
                let data = '';

                res.on('data', (chunk: any) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });

            req.on('error', (error: any) => {
                reject(error);
            });

            req.end();
        });

        console.log('=============decodedJwtTokenResponse============')
        console.log(decodedJwtTokenResponse);
        console.log('=============decodedJwtTokenResponse============')

        if (decodedJwtTokenResponse === undefined) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'failed to decode JWT.' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
            };
        }

        const email = decodedJwtTokenResponse.email;

        if(email === undefined || email === ''){
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'failed to decode JWT.' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
            };
        }

        console.log('=============insertUser============')
        // 発番するUserIdを算出
        const newUserId = getNewUserId(scanResult);
        const updateCommand = new UpdateCommand({
            TableName: authTableName,
            Key: {
                userId: `${newUserId}`
            },
            UpdateExpression: "set accessToken = :accessToken, email = :email",
            ExpressionAttributeValues: {
                ":accessToken": accessToken,
                ":email": email
            },
            ReturnValues: "ALL_NEW",
        });
        const updateResult = await docClient.send(updateCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'success sign up',
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
        throw new Error('Failed to SignIn.');

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
        };
    }
};

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