import {Tsubuyaki} from "../../models/Tsubuyaki/Tsubuyaki";
import {TsubuyakiTable} from "../../models/TsubuyakiTable/TsubuyakiTable";
import {AuthenticationArgumentIF} from "../../models/Authentication/Authentication";
import {TsubuyakiDraft} from "../../models/TsubuyakiDraft/TsubuyakiDraft";

export default interface TimeLIneViewModelIF {
    /**
     * データのフェッチやモデルのインスタンス化などを行う
     */
    setUp(argument: { authentication: AuthenticationArgumentIF }): void

    addTsubuyaki(tsubuyakiDraft: TsubuyakiDraft, accessToken: string): Promise<void>

    loadTimeLine():void

    reloadTimeLine():void

    toggleFavorite():void

    toggleRepost():void

    shareTsubuyaki():void

    tsubuyakiTable: TsubuyakiTable
}