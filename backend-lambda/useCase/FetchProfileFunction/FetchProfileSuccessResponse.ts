import {BaseHttpResponse} from "../../http/response/BaseHttpResponse";
import {ResponseHeaders} from "../../http/response/ResponseIF";
import {Profile} from "../../models/Profile";

export interface AddTsubuyakiResponseBody {
    message: string
    profileInfo: Profile|null,
}

export class FetchProfileSuccessResponse extends BaseHttpResponse {
    constructor(responseBody: AddTsubuyakiResponseBody) {
        const statusCode = 200;
        const headers: ResponseHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        const body = {
            message: responseBody.message,
            profileInfo: responseBody.profileInfo
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


