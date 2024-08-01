/**
 * このlambdaHandlerでの入力の値オブジェクト
 */
import {ErrorMessages} from "../../consts/systems";
import LambdaEvent from "../../http/request/LambdaEventIF";
import {BaseHttpRequest} from "../../http/request/BaseHttpRequest";

export interface FetchTsubuyakiRequestInput {
    chunk: number
}

export class FetchTsubuyakiRequestInput extends BaseHttpRequest {
    public chunk: number

    private constructor(property: { lambdaEvent: LambdaEvent, chunk: number }) {
        super({lambdaEvent: property.lambdaEvent});
        this.chunk = property.chunk
    }

    static async create(event: any): Promise<FetchTsubuyakiRequestInput> {
        console.log("========input========")
        if (event === undefined) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        console.log(event.queryStringParameters);
        const queryStringParameters = event.queryStringParameters;
        const chunk = queryStringParameters.chunk ?? 0

        const fetchTsubuyakiRequestInput = new FetchTsubuyakiRequestInput({
            lambdaEvent: event,
            chunk: chunk
        });

        // 認証ユーザーのセット
        await fetchTsubuyakiRequestInput.setAuthUser();

        return fetchTsubuyakiRequestInput
    }
}