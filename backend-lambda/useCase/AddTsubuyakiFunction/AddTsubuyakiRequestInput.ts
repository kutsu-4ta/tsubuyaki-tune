/**
 * このlambdaHandlerでの入力の値オブジェクト
 */
import {ErrorMessages} from "../../consts/systems";
import LambdaEvent from "../../http/request/LambdaEventIF";
import ImagePath from "../../models/data/ImagePath";
import Mention from "../../models/data/Mention";
import {hashTagString} from "../../models/data/types";
import {BaseHttpRequest} from "../../http/request/BaseHttpRequest";

export interface AddTsubuyakiRequestInputIF {
    lambdaEvent: LambdaEvent
    sentence: string
    parentTsubuyakiId: string,
    ownerUserUid: string | null,
    createdAt: string,
    imageList: ImagePath[],
    mentionList: Mention[],
    hashTagStringList: hashTagString
}

export class AddTsubuyakiRequestInput extends BaseHttpRequest{
    public readonly sentence: string
    public readonly parentTsubuyakiId: string
    protected ownerUserUid: string | null
    public createdAt: string
    public readonly imageList: ImagePath[]
    public readonly mentionList: Mention[]
    public readonly hashTagStringList: hashTagString

    private constructor(property: AddTsubuyakiRequestInputIF) {
        super({lambdaEvent: property.lambdaEvent});
        this.sentence = property.sentence;
        this.parentTsubuyakiId = property.parentTsubuyakiId;
        this.ownerUserUid = property.ownerUserUid;
        this.createdAt = property.createdAt;
        this.imageList = property.imageList;
        this.mentionList = property.mentionList;
        this.hashTagStringList = property.hashTagStringList
    }

    static async create(event: LambdaEvent): Promise<AddTsubuyakiRequestInput> {
        console.log("========input========")
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
        const addTsubuyakiRequest = new AddTsubuyakiRequestInput({
            lambdaEvent: event,
            parentTsubuyakiId: eventBody.parentTsubuyakiId,
            ownerUserUid: null,
            createdAt: createdAt,
            sentence: eventBody.sentence,
            imageList: eventBody.imageList,
            mentionList: eventBody.mentionList,
            hashTagStringList: eventBody.hashTagStringList
        });

        // 認証ユーザーのセット
        await addTsubuyakiRequest.setAuthUser();
        addTsubuyakiRequest.ownerUserUid = addTsubuyakiRequest.authUser!.uid;

        return addTsubuyakiRequest
    }
}