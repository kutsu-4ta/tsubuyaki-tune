import {BaseHttpResponse} from "../../http/response/BaseHttpResponse";
import {ResponseHeaders} from "../../http/response/ResponseIF";
import {TsubuyakiListItem} from "./app";

export interface FetchTsubuyakiResponseBody {
    message: string
    tsubuyakiList: TsubuyakiListItem[],
}

export class FetchTsubuyakiSuccessResponse extends BaseHttpResponse {
    constructor(responseBody: FetchTsubuyakiResponseBody) {
        const statusCode = 200;
        const headers: ResponseHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        const body = {
            message: responseBody.message,
            tsubuyakiList: responseBody.tsubuyakiList
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


