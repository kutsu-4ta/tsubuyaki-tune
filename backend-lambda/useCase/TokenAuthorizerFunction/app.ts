import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {User} from "../../models/User";
import {ErrorMessages, Messages} from "../../consts/systems";
import {UserRepository} from "../../db/Repository/UserTable/UserRepository";
import {DataValidator} from "../../utility/DataValidator";


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
    console.log(event.methodArn);
    console.log(event.authorizationToken);
    console.log(event.accessToken);

    const tmp = event.methodArn.split(':');
    const apiGatewayArnTmp = tmp[5].split('/');
    const resource = tmp[0] + ":" + tmp[1] + ":" + tmp[2] + ":" + tmp[3] + ":" + tmp[4] + ":" + apiGatewayArnTmp[0] + '/*/*';

    const accessToken = event.authorizationToken;
    console.log(accessToken);

    if(accessToken === undefined){
        throw new Error(`${ErrorMessages.UNAUTHORIZED} Token is Undefined`);
    }

    const authUser = await fetchUserByAccessToken({accessToken: accessToken});

    // 認可失敗
    if (authUser === null) {
        console.error(Messages.BAD_REQUEST);

        callback(null, generatePolicy('user', 'Deny', resource));
    }

    console.log('==============auth_user=================');
    console.log(authUser);
    console.log('===============================');

    // 認可成功
    callback(null, generatePolicy('user', 'Allow', resource));
};

/**
 * DBのユーザー情報を元にユーザーモデルを組み立てる
 */
const fetchUserByAccessToken = async (props: { accessToken: string }): Promise<User> => {
    console.log("=====================TokenAuthorizer_fetchUserByAccessToken=====================");
    console.log(props);
    // 問い合わせ
    const userRepository = new UserRepository();
    await userRepository.getAll();
    const attributesList = userRepository.filteredByMatchAccessToken(props.accessToken).getAsTableAttributes();

    console.log(props.accessToken);
    console.log(attributesList);
    // ガード
    if (DataValidator.isEmpty(attributesList)) {
        console.error(userRepository.getRecords());
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // ユーザーのインスタンスを生成
    const userTableAttributes = attributesList[0];
    const user = await User.createInstance({
        userId: userTableAttributes.userId,
        uid: userTableAttributes.uid,
        email: userTableAttributes.email,
        accessToken: userTableAttributes.accessToken
    });

    return user;
}

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
