/**
 * DBと紐づいたモデル.
 * 他のモジュールはRepositoryを通してしのみDBとの接続を行うこと.
 */
import {BaseRepository} from "../BaseRepository";
import {ENVIRONMENT, Messages} from "../../../consts/systems";
import {UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {ProfileTableAttributes} from "./ProfileAttributes";
import {DataValidator} from "../../../utility/DataValidator";

export class ProfileRepository extends BaseRepository {
    constructor() {
        super({
            tableName: ENVIRONMENT.profileTableName,
            pKey: 'profileId',
            attributes: [
                'uid',
                'nickName',
                'iconImagePath',
            ]
        });
    }

    /**
     * DynamoDBから取得したレコードをTableAttributesとして取得する
     */
    public getAsTableAttributes(): ProfileTableAttributes[] {
        return this.records.map((record: Record<string, any>) => {
            return ProfileTableAttributes.createInstance(record);
        });
    }

    /**
     * レコードの初めの一つをTableAttributesとして取り出す
     */
    public getFirstAsTableAttributes(): ProfileTableAttributes | null {

        // ガード
        if (DataValidator.isEmpty(this.records)) {
            return null;
        }

        return ProfileTableAttributes.createInstance(this.records[0]);
    }

    /**
     * レコードの配列の中から一致するレコードを取得する
     * HACK:本当はDynamoDBの取得で行いたい...
     */
    public filteredByMatchUid(expected: string) {
        this.records.filter((record) => record.uid === expected);
        return this
    }

    /**
     * プロフィールレコードを新規作成する
     * @param props
     */
    public async createProfile(
        props: {
            nickName: string
            iconImagePath: string
            uid: string
        }): Promise<ProfileTableItemIF> {

        const newProfileId = await this.getNewProfileId()

        //　プロフィール作成
        const updateCommand = new UpdateCommand({
            TableName: ENVIRONMENT.profileTableName,
            Key: {
                profileId: `${newProfileId}`
            },
            UpdateExpression: "set uid = :uid, nickName = :nickName, iconImagePath = :iconImagePath",
            ExpressionAttributeValues: {
                ":uid": props.uid,
                ":nickName": props.nickName,
                ":iconImagePath": props.iconImagePath
            },
            ReturnValues: "ALL_NEW",
        });
        const updateResult = await this.docClient.send(updateCommand);
        console.log(Messages.SUCCESS + "_Update " + this.tableInfo.tableName);
        console.log(updateResult);

        return {
            nickName: "",
            iconImagePath: "",
            uid: ""
        }
    }

    /**
     * 新しいインクリメントIDを発番する　TODO: できれば共通化したい
     * @private
     */
    private async getNewProfileId(): Promise<number> {
        const all = await this.getAll();
        const allRecords = all.getRecords();

        let newIncrementId = 1;
        if (DataValidator.isEmpty(allRecords)) {
            return newIncrementId;
        }

        for (const item of allRecords) {
            if (newIncrementId < item.profileId) {
                newIncrementId = item.profileId;
            }
        }
        return Number(newIncrementId) + 1;
    };
}

interface ProfileTableItemIF {
    nickName: string
    iconImagePath: string
    uid: string
}