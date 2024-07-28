import {ResponseHeaders} from "./ResponseIF";

export abstract class BaseHttpResponse {
    statusCode: number
    body: string
    responseHeaders: ResponseHeaders

    protected constructor(response: {
                    statusCode: number,
                    body: any,
                    responseHeaders: ResponseHeaders
                }
    ) {
        console.log('=====response body====');
        const body = JSON.stringify(response.body);
        console.log(body);
        console.log('=======================');

        this.statusCode = response.statusCode;
        this.body = body;
        this.responseHeaders = response.responseHeaders;
    }

    /**
     * httpレスポンスを返す
     */
    public returnResponse() {
        return {
            statusCode: this.statusCode,
            headers: this.responseHeaders,
            body: this.body
        }
    }
}