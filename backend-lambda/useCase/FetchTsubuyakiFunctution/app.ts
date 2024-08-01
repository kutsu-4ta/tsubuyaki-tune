import LambdaEvent from "../../http/request/LambdaEventIF";
import {FetchTsubuyakiSuccessResponse} from "./FetchTsubuyakiSuccessResponse";
import {ErrorMessages, Messages} from "../../consts/systems";
import {FetchTsubuyakiRequestInput} from "./FetchTsubuyakiRequestInput";
import {TsubuyakiRepository} from "../../db/Repository/TsubuyakiTable/TsubuyakiRepository";
import {hashTagString} from "../../models/data/types";
import Mention from "../../models/data/Mention";
import ImagePath from "../../models/data/ImagePath";
import {TsubuyakiTableAttributes} from "../../db/Repository/TsubuyakiTable/TsubuyakiTableAttributes";

class dateTimeString {
}

// フロントエンドと揃えている
export interface TsubuyakiListItem {
    sentence: string
    tsubuyakiUserName: string
    tsubuyakiId: string
    hashTagStringList: hashTagString[];
    imageList: ImagePath[];
    mentionList: Mention[];
    dateTimeString: dateTimeString
    parentTsubuyakiId: string
    userIconImagePath: string
    favoriteCount: number
    repostCount: number
}

export const lambdaHandler = async (event: LambdaEvent): Promise<any> => {

    console.log("==========set up==========")
    console.log(event);
    const requestInput = await FetchTsubuyakiRequestInput.create(event);
    await requestInput.setAuthUser();
    console.log(requestInput);
    console.log("==========================")

    const user =　requestInput.getAuthUser();

    if (user === null) {
        console.error("auth user is null.");
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    console.log("==========business_logic================")
    const tsubuyakiRepository = new TsubuyakiRepository();
    await tsubuyakiRepository.getAll();
    // const tableAttributes = tsubuyakiRepository.getAsTableAttributes();
    console.log(tsubuyakiRepository.getAsTableAttributes());


    const tsubuyakiList: TsubuyakiListItem[] = tsubuyakiRepository.getAsTableAttributes().map((item: TsubuyakiTableAttributes): TsubuyakiListItem => {
        const listItem: TsubuyakiListItem = {
            sentence: item.sentence,
            tsubuyakiUserName: item.ownerUserUid, // TODO: 名前を取得する
            userIconImagePath: "", // TODO: ユーザーから引っ張ってくる
            tsubuyakiId: item.tsubuyakiId,
            hashTagStringList: item.hashTagStringList,
            imageList: item.imageList,
            mentionList: item.mentionList,
            dateTimeString: item.dateTimeString,
            parentTsubuyakiId: item.parentTsubuyakiId,
            favoriteCount: 0, // TODO: コンピューティングで出す
            repostCount: 0, // TODO: コンピューティングで出す
        };

        console.log("=======================TsubuyakiListItem=======================")
        console.log(listItem);

        return listItem;
    });


    console.log("==========================")

    const message = Messages.SUCCESS + "get TsubuyakiList";
    const response = new FetchTsubuyakiSuccessResponse({
        message: message,
        tsubuyakiList: tsubuyakiList
    });
    return response.returnResponse();
}
