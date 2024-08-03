import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {User} from "../../models/User";
import {Messages} from "../../consts/systems";


/**
 * Lambdaのトークンオーソライザーハンドラー
 * @param event
 * @param context
 * @param callback
 */
export const lambdaHandler = async function (event: any, context: any, callback: any) {

    const httpMethod = event.httpMethod;
    if (httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: {}
        };
    }

    const accessToken = event.authorizationToken;
    console.log(accessToken);
    const authUser = await User.fetchUserByAccessToken({accessToken: accessToken});

    // 認可失敗
    if (authUser === null) {
        console.error(Messages.BAD_REQUEST);
        callback(null, generatePolicy('user', 'Deny', event.methodArn));
    }

    console.log('==============auth_user=================');
    console.log(authUser);
    console.log('===============================');

    // 認可成功
    callback(null, generatePolicy('user', 'Allow', event.methodArn));
};

const generatePolicy = (principalId: any, effect: any, resource: any) => {

    let policyDocument: PolicyDocumentInterface = {
        Version: '2012-10-17',
        Statement: []
    }

    const context: AuthContext = {
        "stringKey": "stringval",
        "numberKey": 123,
        "booleanKey": true
    };

    const authResponse: AuthResponseInterface = {
        principalId: principalId,
        policyDocument: policyDocument,
        context: context
    };

    // ガード節
    if (!effect && !resource) {
        // 必須パラメータがないのでリターン
        return authResponse
    }

    // statementを追加
    policyDocument.Statement[0] = {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
    }

    return authResponse;
};

interface PolicyDocumentInterface {
    Version: string
    Statement: StatementN[]
}

interface StatementN {
    Action: string
    Effect: number
    Resource: string
}

interface AuthContext {
    "stringKey": string,
    "numberKey": number,
    "booleanKey": boolean
}

interface AuthResponseInterface {
    principalId: any
    policyDocument: PolicyDocumentInterface
    context: AuthContext
}
