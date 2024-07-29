import {BaseHttpResponse} from "../../http/response/BaseHttpResponse";
import {ResponseHeaders} from "../../http/response/ResponseIF";

export interface AddTsubuyakiResponseBody {
    message: string
    tsubuyakiId: string,
}

export class AddTsubuyakiSuccessResponse extends BaseHttpResponse {
    constructor(responseBody: AddTsubuyakiResponseBody) {
        const statusCode = 200;
        const headers: ResponseHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        const body = {
            message: responseBody.message,
            tsubuyakiId: responseBody.tsubuyakiId
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


