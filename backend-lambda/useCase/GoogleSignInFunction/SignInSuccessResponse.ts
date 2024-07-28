import {BaseHttpResponse} from "../../http/response/BaseHttpResponse";
import {ResponseHeaders} from "../../http/response/ResponseIF";

export interface SignInResponseBody {
    message: string
    uid: string,
    accessToken: string
    email: string,
    nickName: string,
    iconImagePath: string
}

export class SignInSuccessResponse extends BaseHttpResponse {
    constructor(responseBody: SignInResponseBody) {
        const statusCode = 200;
        const headers: ResponseHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        const body = {
            message: responseBody.message,
            uid: responseBody.uid,
            accessToken: responseBody.accessToken,
            email: responseBody.email,
            nickName: responseBody.nickName,
            iconImagePath: responseBody.iconImagePath
        }

        super({
                statusCode: statusCode,
                body: body,
                responseHeaders: headers
            }
        );
    }

    /**
     * httpレスポンスを返す
     */
    public returnResponse() {
        return {
            statusCode: this.statusCode,
            body: this.body,
            headers: this.responseHeaders,
        }
    }
}


