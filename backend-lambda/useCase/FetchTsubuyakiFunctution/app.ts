import LambdaEvent from "../../http/request/LambdaEventIF";
import {FetchTsubuyakiSuccessResponse} from "./FetchTsubuyakiSuccessResponse";
import {ErrorMessages, Messages} from "../../consts/systems";
import {FetchTsubuyakiRequestInput} from "./FetchTsubuyakiRequestInput";
import {TsubuyakiRepository} from "../../db/Repository/TsubuyakiTable/TsubuyakiRepository";
import {hashTagString} from "../../models/data/types";
import Mention from "../../models/data/Mention";
import ImagePath from "../../models/data/ImagePath";
import {TsubuyakiTableAttributes} from "../../db/Repository/TsubuyakiTable/TsubuyakiTableAttributes";
import {UserRepository} from "../../db/Repository/UserTable/UserRepository";
import {UserTableAttributes} from "../../db/Repository/UserTable/UserTableAttributes";
import {DataValidator} from "../../utility/DataValidator";
import {User} from "../../models/User";
import {Profile} from "../../models/Profile";
import {ProfileRepository} from "../../db/Repository/ProfileTable/ProfileRepository";
import {ProfileTableAttributes} from "../../db/Repository/ProfileTable/ProfileAttributes";

class dateTimeString {
}

// フロントエンドと揃えている
export interface TsubuyakiListItem {
    sentence: string
    tsubuyakiUserName: string
    tsubuyakiId: string
    hashTagStringList: hashTagString[];
    imageList: ImagePath[];
    mentionList: Mention[];
    createdAt: Date
    parentTsubuyakiId: string
    userIconImagePath: string
    favoriteCount: number
    repostCount: number
}

export const lambdaHandler = async (event: LambdaEvent): Promise<any> => {

    console.log("==========set up==========")
    console.log(event);
    const requestInput = await FetchTsubuyakiRequestInput.create(event);
    await requestInput.setAuthUser();
    console.log(requestInput);
    console.log("==========================")

    const user =　requestInput.getAuthUser();

    if (user === null) {
        console.error("auth user is null.");
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    console.log("==========business_logic================")
    const tsubuyakiRepository = new TsubuyakiRepository();
    await tsubuyakiRepository.getAll();
    console.log(tsubuyakiRepository.getAsTableAttributes());

    const userRepository = new UserRepository();
    await userRepository.getAll();
    const allUsersAttributesList: UserTableAttributes[] = userRepository.getAsTableAttributes();

    const profileRepository = new ProfileRepository();
    await profileRepository.getAll();
    const allProfileAttributesList: ProfileTableAttributes[] = profileRepository.getAsTableAttributes();


    const allUsers: User[] = allUsersAttributesList.map((attributes): User => {
        const user = User.createInstance({
            userId: attributes.userId,
            uid: attributes.uid,
            email: attributes.email,
            accessToken: attributes.accessToken
        });

        const profileList: ProfileTableAttributes[] = allProfileAttributesList.filter((profileAttributes: ProfileTableAttributes) => profileAttributes.uid === attributes.uid);
        if (DataValidator.isEmpty(profileList)) {
            // throw new Error("Profile is null");

            // プロフィールセット
            user.profile = Profile.createInstance({
                uid: user.uid,
                nickName: "user",
                iconImagePath: ''
            });
        }else{
            // プロフィールセット
            user.profile = Profile.createInstance({
                uid: profileList[0].uid,
                nickName: profileList[0].nickName,
                iconImagePath: profileList[0].iconImagePath
            });
        }

        return user
    });

    const tsubuyakiList: TsubuyakiListItem[] = tsubuyakiRepository.getAsTableAttributes().map((item: TsubuyakiTableAttributes): TsubuyakiListItem => {

        const users: User[] = allUsers.filter((user) => user.uid === item.ownerUserUid);
        if (DataValidator.isEmpty(users)) {
            throw new Error("owner user is not found");
        }
        const user = users[0]

        if (user.profile == null) {
            const DEFAULT_ICON_PATH = '';
            user.profile = Profile.createInstance({
                nickName: 'Noname User',
                uid: user.uid,
                iconImagePath: DEFAULT_ICON_PATH
            });
        }

        const createdAt = new Date(item.createdAt);

        const listItem: TsubuyakiListItem = {
            sentence: item.sentence,
            tsubuyakiUserName: user.profile.nickName,
            userIconImagePath: user.profile.iconImagePath,
            tsubuyakiId: item.tsubuyakiId,
            hashTagStringList: item.hashTagStringList,
            imageList: item.imageList,
            mentionList: item.mentionList,
            createdAt: createdAt,
            parentTsubuyakiId: item.parentTsubuyakiId,
            favoriteCount: 0, // TODO: コンピューティングで出す
            repostCount: 0, // TODO: コンピューティングで出す
        };

        console.log("=======================TsubuyakiListItem=======================")
        console.log(listItem);

        return listItem;
    });

    // createdAtプロパティで並び替える（昇順）
    const sortedTsubuyakiList = tsubuyakiList.slice().sort((a:TsubuyakiListItem, b:TsubuyakiListItem) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    console.log("==========================")

    const message = Messages.SUCCESS + "get TsubuyakiList";
    const response = new FetchTsubuyakiSuccessResponse({
        message: message,
        tsubuyakiList: sortedTsubuyakiList
    });
    return response.returnResponse();
}
