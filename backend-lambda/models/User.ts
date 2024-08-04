import {ENVIRONMENT, ErrorMessages, Messages} from "../consts/systems";
import {UserRepository} from "../db/Repository/UserTable/UserRepository";
import {Profile} from "./Profile";
import {UserTableAttributes} from "../db/Repository/UserTable/UserTableAttributes";
import {DataValidator} from "../utility/DataValidator";

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
    static createInstance(authInfo: { userId: string, uid: string, email: string, accessToken: string }): User {
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

        // ユーザーのインスタンスを生成
        const userTableAttributes = attributesList[0];
        const user = await User.createInstance({
            userId: userTableAttributes.userId,
            uid: userTableAttributes.uid,
            email: userTableAttributes.email,
            accessToken: userTableAttributes.accessToken
        });

        // プロフィールをセット
        user.profile = await Profile.fetchProfile({uid: user.uid});

        return user;
    }

    /**
     * DBのユーザー情報を元にユーザーモデルを組み立てる
     */
    static async fetchUserByAccessToken(props: { accessToken: string }): Promise<User> {
        console.log("=====================fetchUserByAccessToken=====================");
        console.log(props);
        // 問い合わせ
        const userRepository = new UserRepository();
        await userRepository.getAll();
        const attributesList = userRepository.filteredByMatchAccessToken(props.accessToken).getAsTableAttributes();

        console.log(props.accessToken);
        console.log(attributesList);
        // ガード
        if (DataValidator.isEmpty(attributesList)) {
            console.error(userRepository.getRecords());
            throw new Error(ErrorMessages.UNAUTHORIZED);
        }

        // ユーザーのインスタンスを生成
        const userTableAttributes = attributesList[0];
        const user = await User.createInstance({
            userId: userTableAttributes.userId,
            uid: userTableAttributes.uid,
            email: userTableAttributes.email,
            accessToken: userTableAttributes.accessToken
        });

        // プロフィールをセット
        user.profile = await Profile.fetchProfile({uid: user.uid});

        return user;
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
}