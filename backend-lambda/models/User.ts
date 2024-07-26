import {ENVIRONMENT, Messages} from "../consts/systems";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {UserRepository} from "../db/Repository/UserRepository";

export class User {
    public userRepository: UserRepository = new UserRepository();

    private constructor(
        public readonly userId: string,
        public readonly uid: string,
        public readonly email: string,
        public readonly accessToken: string,
    ) {
    }

    /**
     * 認証情報からユーザーインスタンスを作成する
     * @param authInfo
     */
    static async createInstance(authInfo: { userId: string, uid: string, email: string, accessToken: string }): Promise<User> {
        return new User(authInfo.userId, authInfo.uid, authInfo.email, authInfo.accessToken);
    }


    /**
     * ユーザーを新規作成する
     * 外部から呼び出すための
     * @param props
     */
    static async createUser(props: { email: string, accessToken: string }): Promise<User>  {
        const userDraft = new User("", "", props.email, props.accessToken);

        return userDraft.createRecord({email: props.email, accessToken: props.accessToken});
    }

    /**
     * ユーザーを新規作成する
     * @param props
     */
     private async createRecord(props: {
        email: string
        accessToken: string
    }): Promise<User> {

        const item = await this.userRepository.createUser({
            email: props.email,
            accessToken: props.accessToken
        });

        return User.createInstance({
            userId: item.userId,
            uid: item.uid,
            email: item.email,
            accessToken: item.accessToken
        });
    }

    /**
     * ログインする
     */
    public async login() {

        const accessToken = this.accessToken;
        // const timeStamp = this.timestamp;

        await this.updateAccessToken(accessToken);
    }

    /**
     * アクセストークンを更新する
     */
    private async updateAccessToken(accessToken: string): Promise<void> {
        const client = new DynamoDBClient({region: ENVIRONMENT.region});
        const docClient = DynamoDBDocumentClient.from(client);
        const updateCommand = new UpdateCommand({
            TableName: ENVIRONMENT.authTableName,
            Key: {
                userId: this.userId
            },
            UpdateExpression: "set accessToken = :accessToken",
            ExpressionAttributeValues: {
                ":accessToken": accessToken,
            },
            ReturnValues: "ALL_NEW",
        });
        await docClient.send(updateCommand);
    }
}