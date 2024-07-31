/**
 * このlambdaHandlerでの入力の値オブジェクト
 */
import {GoogleSignInRequestInputIF} from "./GoogleSignInFunctionIF";
import {ErrorMessages} from "../../consts/systems";
import LambdaEvent from "../../http/request/LambdaEventIF";

export class GoogleSignInRequestInput {
    public readonly code: string
    public readonly clientId: string

    private constructor(property: GoogleSignInRequestInputIF) {
        this.code = property.code;
        this.clientId = property.clientId;
    }

    static create(event: LambdaEvent): GoogleSignInRequestInput {
        console.log("========input========")

        if (event === undefined) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        const eventBody = JSON.parse(event.body);
        const code = eventBody.code;
        const clientId = eventBody.client_id;

        if (!(code && clientId)) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        return new GoogleSignInRequestInput({code: code, clientId: clientId})
    }
}