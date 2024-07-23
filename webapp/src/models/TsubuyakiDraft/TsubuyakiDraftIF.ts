import ImagePath from "../data/ImagePath";
import {hashTagString} from "../data/types";
import Mention from "../data/Mention";

export interface TsubuyakiDraftIF {
    tsubuyakiDraftInfo: TsubuyakiDraftInfoIF
    tsubuyakiDraftMetaInfo: TsubuyakiDraftMetaInfoIF
    postAsTsubuyaki():void
    saveAsDraft():void
}

export interface TsubuyakiDraftInfoIF {
    sentence: string
    imagePathList: ImagePath[]
    hashTagList: hashTagString[]
    mentionList: Mention[]
}

export interface TsubuyakiDraftMetaInfoIF {
    parentTsubuyakiId: string
}