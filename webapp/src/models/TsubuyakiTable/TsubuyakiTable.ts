import {TsubuyakiTableIF} from "./TsubuyakiTableIF";
import {Tsubuyaki} from "../Tsubuyaki/Tsubuyaki";

export class TsubuyakiTable implements TsubuyakiTableIF {
    constructor(public tsubuyakiList: Tsubuyaki[]) {
    }

    public static initTsubuyakiTable(): TsubuyakiTable {
        return new TsubuyakiTable([]);
    }

    /**
     * TODO:実装
     */
    public fetchTsubuyakiList(): void {
        console.log('fetchTsubuyakiList');
        this.tsubuyakiList = [
            Tsubuyaki.createTsubuyakiInstance({
                sentence: '社内システム開発がめんどくさい。なんかいい方法ないかな。',
                tsubuyakiUserName: 'aaaaaaaaaaaa',
                userIconImagePath: '',
                tsubuyakiId:'1',
                hashTagStringList: [],
                imageList:[],
                mentionList:[],
                dateTimeString: '2024-07-18-14:23',
                parentTsubuyakiId: '',
                favoriteCount: 10,
                repostCount: 0,
            })
        ];
    }

    public dev_fetchTsubuyakiList2(): void {
        console.log('fetchTsubuyakiList');
        this.tsubuyakiList = [
            Tsubuyaki.createTsubuyakiInstance({
                sentence:'ギター弾きてぇー。',
                tsubuyakiUserName: 'aaaaaaaaaaaa',
                userIconImagePath: '',
                tsubuyakiId:'2',
                hashTagStringList: [],
                imageList:[],
                mentionList:[],
                dateTimeString: '2024-07-18-14:23',
                parentTsubuyakiId: '',
                favoriteCount: 10,
                repostCount: 0,
            }),
            Tsubuyaki.createTsubuyakiInstance({
                sentence:'3DCG作ってるけど、モデリングからつまいずいてる。',
                tsubuyakiUserName: 'aaaaaaaaaaaa',
                userIconImagePath: '',
                tsubuyakiId:'3',
                hashTagStringList: [],
                imageList:[],
                mentionList:[],
                dateTimeString: '2024-07-18-14:23',
                parentTsubuyakiId: '',
                favoriteCount: 10,
                repostCount: 0,
            }),
            Tsubuyaki.createTsubuyakiInstance({
                sentence: '社内システム開発がめんどくさい。なんかいい方法ないかな。',
                tsubuyakiUserName: 'aaaaaaaaaaaa',
                userIconImagePath: '',
                tsubuyakiId:'1',
                hashTagStringList: [],
                imageList:[],
                mentionList:[],
                dateTimeString: '2024-07-18-14:23',
                parentTsubuyakiId: '',
                favoriteCount: 10,
                repostCount: 0,
            })
            ];
    }

    getTsubuyakiList(): Tsubuyaki[] {
        return this.tsubuyakiList;
    }
}