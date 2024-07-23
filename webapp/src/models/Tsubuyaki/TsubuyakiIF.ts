import ImagePath from "../data/ImagePath";
import {dateTimeString, hashTagString} from "../data/types";
import Mention from "../data/Mention";

export interface TsubuyakiIF {

    toggleFavorite():void

    toggleRepost():void

    shareTsubuyaki():void

    tsubuyakiInfo: TsubuyakiInfoIF

    tsubuyakiMetaInfo: TsubuyakiMetaInfoIF
}

export interface TsubuyakiInfoIF {
    sentence: string
    imagePathList: ImagePath[]
    hashTagList: hashTagString[]
    mentionList: Mention[]
}

export interface TsubuyakiMetaInfoIF {
    tsubuyakiId: string
    userIconImagePath: string
    tsubuyakiUserName: string
    dateTimeString: dateTimeString
    parentTsubuyakiId: string
    favoriteCount: number
    repostCount: number
}
