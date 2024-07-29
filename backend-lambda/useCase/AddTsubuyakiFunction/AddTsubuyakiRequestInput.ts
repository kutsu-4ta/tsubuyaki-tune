/**
 * このlambdaHandlerでの入力の値オブジェクト
 */
import {ErrorMessages, Messages} from "../../consts/systems";
import LambdaEvent from "../../http/LambdaEventIF";
import ImagePath from "../../models/data/ImagePath";
import Mention from "../../models/data/Mention";
import {hashTagString} from "../../models/data/types";
import {User} from "../../models/User";

export interface AddTsubuyakiRequestInputIF {
    sentence: string
    parentTsubuyakiId: string,
    ownerUserUid: string,
    dateTimeString: string,
    imageList: ImagePath[],
    mentionList: Mention[],
    hashTagStringList: hashTagString
}

export class AddTsubuyakiRequestInput {
    public readonly sentence: string
    public readonly parentTsubuyakiId: string
    public readonly ownerUserUid: string
    public readonly dateTimeString: string
    public readonly imageList: ImagePath[]
    public readonly mentionList: Mention[]
    public readonly hashTagStringList: hashTagString

    private constructor(property: AddTsubuyakiRequestInputIF) {
        this.sentence = property.sentence;
        this.parentTsubuyakiId = property.parentTsubuyakiId;
        this.ownerUserUid = property.ownerUserUid;
        this.dateTimeString = property.dateTimeString;
        this.imageList = property.imageList;
        this.mentionList = property.mentionList;
        this.hashTagStringList = property.hashTagStringList
    }

    static async create(event: LambdaEvent): Promise<AddTsubuyakiRequestInput> {
        console.log("========input========")

        if (event === undefined) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        console.log(event);
        console.log(event.body);
        const eventBody = JSON.parse(event.body);
        const sentence = eventBody.sentence;

        if (!sentence) {
            throw new Error(ErrorMessages.BAD_INPUT);
        }

        const accessToken = event.headers.Authorization
        const authUser = await User.fetchUserByAccessToken({accessToken: accessToken});

        if (authUser === null) {
            console.error("authUser is null");
            throw new Error(Messages.BAD_REQUEST);
        }

        return new AddTsubuyakiRequestInput({
            parentTsubuyakiId: eventBody.parentTsubuyakiId,
            ownerUserUid: authUser.uid,
            sentence: eventBody.sentence,
            dateTimeString: eventBody.dateTimeString,
            imageList: eventBody.imageList,
            mentionList: eventBody.mentionList,
            hashTagStringList: eventBody.hashTagStringList
        })
    }
}