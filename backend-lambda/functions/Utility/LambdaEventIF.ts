
/**
 * Lambdaの引数
 */
export default interface LambdaEvent {
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