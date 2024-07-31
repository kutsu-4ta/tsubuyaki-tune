import TimeLIneViewModelIF from "./TimeLIneViewModelIF";
import {TsubuyakiTable} from "../../models/TsubuyakiTable/TsubuyakiTable";
import {TsubuyakiDraft, TsubuyakiDraftArgumentIF} from "../../models/TsubuyakiDraft/TsubuyakiDraft";
import ImagePath from "../../models/data/ImagePath";
import Mention from "../../models/data/Mention";
import Authentication, {AuthenticationArgumentIF} from "../../models/Authentication/Authentication";
import {Tsubuyaki} from "../../models/Tsubuyaki/Tsubuyaki";
import axios from "axios";

export class TimeLineViewModel implements TimeLIneViewModelIF {
    protected authState:Authentication = Authentication.initAuthentication();
    public tsubuyakiTable: TsubuyakiTable = TsubuyakiTable.initTsubuyakiTable();
    constructor(
    ) {
        console.log('====================TimeLineViewModel_called====================');
    }

    /**
     * セットアップ処理
     * @param argument
     */
    setUp(argument: { authentication: AuthenticationArgumentIF }): void {
        console.log('====================TimeLineViewModel_setup====================');
        this.authState.setAuthentication(argument.authentication);
        this.tsubuyakiTable.fetchTsubuyakiList();
        console.log('====================TimeLineViewModel_setup_end====================');
    }

    /**
     * クリーンアップ処理
     */
    cleanUp():void {
        console.log('TimeLineViewModel');
        console.log('cleanUp');
    }


    /**
     * Tsubuyakiを投稿する
     */
    public async addTsubuyaki(tsubuyakiDraft: TsubuyakiDraft, accessToken:string) {
        console.log(tsubuyakiDraft);
        return tsubuyakiDraft.postAsTsubuyaki(accessToken);
    };


    /**
     * 下書きを作成するための開発用コード
     * @private
     */
    private _devCreateDraft(): TsubuyakiDraftArgumentIF {
        const imagePathList = [
            ImagePath.create({alt:'sample1',path:'http://hogehoge-sample1.hoge.com'}),
            ImagePath.create({alt:'sample2',path:'http://hogehoge-sample2.hoge.com'})
        ];

        const mentionList = [
            Mention.create({idCategory: 'user', idValue:'2'}),
            Mention.create({idCategory: 'user', idValue:'3'})
        ];

        return {
            sentence: 'hello world!',
            hashTagStringList: ['#abc', '#efg', '#hij'],
            imageList: imagePathList,
            mentionList: mentionList,
            parentTsubuyakiId:'',
        }
    }

    /**
     * タイムラインを読み込む
     * @param props
     */
    async loadTimeLine(props: { accessToken: string }): Promise<Tsubuyaki[]> {
        console.log('loadTimeLine');
        // つふやきを取得する
        const endPoint = process.env.REACT_APP_FETCH_TSUBUYAKI as string;
        const axiosInstance = axios.create({
            headers: {
                'Authorization': props.accessToken,
                'x-api-key': '1yIDLcQTj28kU0fpfZFdCaZoi4dCoEgC8hLh1duf'
            }
        });
        return await axiosInstance.get(endPoint);
    }

    /**
     * TODO:実装
     */
    shareTsubuyaki(): void {
    }

    /**
     * TODO:実装
     */
    toggleFavorite(): void {
    }

    /**
     * TODO:実装
     */
    toggleRepost(): void {
    }
}