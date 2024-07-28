import {ENVIRONMENT, ErrorMessages, Messages} from "../consts/systems";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {UserRepository} from "../db/Repository/UserTable/UserRepository";
import {Profile} from "./Profile";
import {UserTableAttributes} from "../db/Repository/UserTable/UserTableAttributes";
import {ProfileRepository} from "../db/Repository/ProfileTable/ProfileRepository";
import {DataValidator} from "../utility/DataValidator";
import {ProfileTableAttributes} from "../db/Repository/ProfileTable/ProfileAttributes";

export class User {
    public userRepository: UserRepository = new UserRepository();
    public profile: Profile | null;

    private constructor(
        public readonly userId: string,
        public readonly uid: string,
        public readonly email: string,
        public readonly accessToken: string
    ) {
        this.profile = null;
    }

    /**
     * 認証情報からユーザーインスタンスを作成する
     * @param authInfo
     */
    static async createInstance(authInfo: { userId: string, uid: string, email: string, accessToken: string }): Promise<User> {
        return new User(authInfo.userId, authInfo.uid, authInfo.email, authInfo.accessToken);
    }

    /**
     * DBのユーザー情報を元にユーザーモデルを組み立てる
     */
    static async fetchUser(props: { uid: string }): Promise<User> {
        // 問い合わせ
        const userRepository = new UserRepository();
        const users = await userRepository.getAll();
        const attributesList = users.filteredByMatchUid(props.uid).getAsTableAttributes();

        // ガード
        if (DataValidator.isEmpty(attributesList)) {
            console.error(users);
            throw new Error(ErrorMessages.CRUD_READ);
        }

        const userTableAttributes = attributesList[0];
        return User.createInstance({
            userId: userTableAttributes.userId,
            uid: userTableAttributes.uid,
            email: userTableAttributes.email,
            accessToken: userTableAttributes.accessToken
        })
    }

    /**
     * ユーザーを新規作成する
     * 外部から呼び出すための
     * @param props
     */
    static async createUser(props: { email: string, accessToken: string }): Promise<User> {
        const userDraft = new User("", "", props.email, props.accessToken);
        return userDraft.createRecord({email: props.email, accessToken: props.accessToken});
    }

    /**
     * ユーザーの詳細を取得する
     */
    public async getUserAttributes(): Promise<UserTableAttributes | null> {
        // DBから取得する
        const users = await this.userRepository.getAll();
        // HACK: uidでもいいが、信用できるユニークがメールなので取得する
        return users.filteredByMatchUid(this.uid).getFirstAsTableAttributes();
    };

    /**
     * ユーザーを新規作成する
     * @param props
     */
    private async createRecord(props: { // TODO: 引数いらない
        email: string
        accessToken: string
    }): Promise<User> {

        const item = await this.userRepository.createUser({
            email: props.email,
            accessToken: props.accessToken
        });

        const user = await User.createInstance({
            userId: item.userId,
            uid: item.uid,
            email: item.email,
            accessToken: item.accessToken
        });

        const defaultNickName = "user name" + user.uid;
        const defaultIconImagePath = "";
        const profile = Profile.createInstance({uid: user.uid, nickName: "", iconImagePath: ""})

        return user;

    }

    /**
     * DBからユーザーのプロフィールをセットする
     */
    private async setProfileByRecord(): Promise<boolean> {
        // プロフィール問い合わせ
        const profileRepository = new ProfileRepository();
        const allRecords = await profileRepository.getAll();
        const profileAttributesList = allRecords.getAsTableAttributes();

        // ガード
        if (DataValidator.isEmpty(profileAttributesList)) {
            return false;
        }

        // セット
        const profileAttributes = profileAttributesList[0];
        this.profile = await Profile.createInstance({
            uid: this.uid,
            nickName: profileAttributes.nickName,
            iconImagePath: profileAttributes.iconImagePath
        });
        return true;
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