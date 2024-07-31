import {ProfileRepository} from "../db/Repository/ProfileTable/ProfileRepository";

export class Profile {
    public profileRepository: ProfileRepository = new ProfileRepository();

    private constructor(
        public readonly uid: string,
        public readonly nickName: string,
        public readonly iconImagePath: string
    ) {
    }

    /**
     * プロフィールを取得する
     * @param key
     */
    static async fetchProfile(key: { uid: string }): Promise<Profile | null> {
        console.log("============fetchProfile==============");
        console.log(key);
        const profileRepository = new ProfileRepository();
        await profileRepository.getAll()
        const profileTableAttributes = profileRepository.filteredByMatchUid(key.uid).getFirstAsTableAttributes();

        if (profileTableAttributes === null) {
            return null;
        }

        console.log(profileTableAttributes);

        return Profile.createInstance({
            uid: profileTableAttributes.uid,
            nickName: profileTableAttributes.nickName,
            iconImagePath: profileTableAttributes.iconImagePath
        });
    }

    /**
     * インスタンスを作成する
     * @param profileInfo
     */
    static createInstance(profileInfo: { uid: string, nickName: string, iconImagePath: string }): Profile {
        return new Profile(
            profileInfo.uid,
            profileInfo.nickName,
            profileInfo.iconImagePath
        );
    }

    /**
     * レコードを更新する（Pキーが存在しない場合は新規作成）
     */
    public async updateRecord(): Promise<Profile> {
        const item = await this.profileRepository.createProfile({
            uid: this.uid,
            nickName: this.nickName,
            iconImagePath: this.iconImagePath
        });

        return Profile.createInstance({
            uid: item.uid,
            nickName: item.nickName,
            iconImagePath: item.iconImagePath
        });
    }
}