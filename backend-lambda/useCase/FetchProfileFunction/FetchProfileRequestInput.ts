/**
 * このlambdaHandlerでの入力の値オブジェクト
 */
import {ErrorMessages} from "../../consts/systems";
import LambdaEvent from "../../http/request/LambdaEventIF";
import ImagePath from "../../models/data/ImagePath";
import Mention from "../../models/data/Mention";
import {hashTagString} from "../../models/data/types";
import {BaseHttpRequest} from "../../http/request/BaseHttpRequest";

export class FetchProfileRequestInput extends BaseHttpRequest {
    public uid: string

    private constructor(property: {
        lambdaEvent: LambdaEvent
        uid: string
    }) {
        super({lambdaEvent: property.lambdaEvent});
        this.uid = property.uid
    }

    static async create(event: LambdaEvent): Promise<FetchProfileRequestInput> {
        console.log("========FetchUserRequestInput_create========")
        if (event === undefined) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        // リクエストパラメータのバリデーションチェック
        console.log(event);
        console.log(event.body);
        const eventBody = JSON.parse(event.body);
        const sentence = eventBody.sentence;

        if (!sentence) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        const createdAt = Date().toString();

        // リクエストクラスインスタンス
        const fetchUserRequest = new FetchProfileRequestInput({
            lambdaEvent: event,
            uid: eventBody.uid
        });

        // 認証ユーザーのセット
        await fetchUserRequest.setAuthUser();
        fetchUserRequest.uid = fetchUserRequest.authUser!.uid;

        return fetchUserRequest
    }
}