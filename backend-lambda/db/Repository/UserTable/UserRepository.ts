/**
 * DBと紐づいたモデル.
 * 他のモジュールはRepositoryを通してしのみDBとの接続を行うこと.
 */
import { ScanCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {BaseRepository} from "../BaseRepository";
import {ENVIRONMENT, ErrorMessages, Messages} from "../../../consts/systems";
import {DataValidator} from "../../../utility/DataValidator";
import {UserTableAttributes, UserTableAttributesIF} from "./UserTableAttributes";

export class UserRepository extends BaseRepository {
    constructor() {
        super({
            tableName: ENVIRONMENT.authTableName,
            pKey: 'userId',
            attributes: [
                'userId',
                'uid',
                'email',
                'accessToken'
            ],
        });
    }

    /**
     * DynamoDBから取得したレコードをTableAttributesとして取得する
     */
    public getAsTableAttributes(): UserTableAttributes[] {
        return this.records.map((record: Record<string, any>) => {
            return UserTableAttributes.createInstance(record);
        });
    }

    /**
     * レコードの初めの一つをTableAttributesとして取り出す
     */
    public getFirstAsTableAttributes(): UserTableAttributes | null {

        // ガード
        if (DataValidator.isEmpty(this.records)) {
            return null;
        }

        return UserTableAttributes.createInstance(this.records[0]);
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
     * レコードの配列の中から一致するレコードを取得する
     * HACK:本当はDynamoDBの取得で行いたい...
     */
    public filteredByMatchEmail(expected: string) {
        this.records.filter((record) => record.email === expected);
        return this
    }

    /**
     * ユーザーレコードを新規作成する
     * @param props
     */
    public async createUser(
        props: {
            email: string
            accessToken: string
        }): Promise<UserTableAttributesIF> {

        // 一意の値を生成
        const newUserId = await this.getNewUserId();
        // const uid = uuidv4() as string; // TODO: DBでユニークチェックが必要 Lambadaレイヤー作成後に使える
        const uid = 'not_use_this_is_under_construction'+ `${newUserId}`; // TODO:仮

        //　ユーザー作成
        const updateCommand = new UpdateCommand({
            TableName: this.tableInfo.tableName,
            Key: {
                userId: `${newUserId}`
            },
            UpdateExpression: "set accessToken = :accessToken, email = :email, uid = :uid",
            ExpressionAttributeValues: {
                ":accessToken": props.accessToken,
                ":email": props.email,
                ":uid": uid
            },
            ReturnValues: "ALL_NEW",
        });
        const updateResult = await this.docClient.send(updateCommand);
        console.log(Messages.SUCCESS + "_Update " + this.tableInfo.tableName);
        console.log(updateResult);

        // const item:UserTableAttributesIF = updateResult

        return {
            userId: "aaaa",
            uid: "aaaa",
            email: "aaaaa",
            accessToken: "aaaa"
        }
    }

    /**
     * アクセストークンを更新する
     * @param props
     * @private
     */
    private async updateAccessToken(props: { accessToken: string, userId: string }): Promise<void | Error> {
        try {
            const updateCommand = new UpdateCommand({
                TableName: this.tableInfo.tableName,
                Key: {
                    userId: props.userId
                },
                UpdateExpression: "set accessToken = :accessToken",
                ExpressionAttributeValues: {
                    ":accessToken": props.accessToken,
                },
                ReturnValues: "ALL_NEW",
            });
            await this.docClient.send(updateCommand);
        } catch {
            console.error("updateAccessToken");
            throw new Error(ErrorMessages.CRUD_UPDATE);
        }
    }

    /**
     * 新しいユーザーIDを発番する
     * @private
     */
    private async getNewUserId(): Promise<number> {
        const scanParams = {
            TableName: this.tableInfo.tableName,
        };
        const scanCommand = new ScanCommand(scanParams);
        const scanResult = await this.client.send(scanCommand);

        const all = await this.getAll();
        const allRecords = all.getRecords();

        let newIncrementId = 1;
        if (DataValidator.isEmpty(allRecords)) {
            return newIncrementId;
        }

        // increment logic
        console.log()
        for (const item of allRecords) {
            if (newIncrementId < item.userId) {
                newIncrementId = item.userId;
            }
        }
        return Number(newIncrementId) + 1;
    };


}

