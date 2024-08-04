import LambdaEvent from "../../http/request/LambdaEventIF";
import {FetchProfileSuccessResponse} from "./FetchProfileSuccessResponse";
import {ErrorMessages, Messages} from "../../consts/systems";
import {FetchProfileRequestInput} from "./FetchProfileRequestInput";
import {User} from "../../models/User";

export const lambdaHandler = async (event: LambdaEvent): Promise<any> => {
    console.log("==========set up==========")
    console.log(event.body)
    const requestInput = await FetchProfileRequestInput.create(event);
    await requestInput.setAuthUser();
    console.log(requestInput);
    console.log("==========================")

    const authUser = requestInput.getAuthUser();
    if (authUser === null) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 自分自身をフェッチ
    if (authUser.uid === requestInput.uid ) {
        const message = Messages.SUCCESS + "Fetch User";
        const response = new FetchProfileSuccessResponse({
            message: message,
            profileInfo: authUser.profile
        });
        return response.returnResponse();
    }

    const user = await User.fetchUser({uid: requestInput.uid});

    console.log(user);

    const message = Messages.SUCCESS + "to add Tsubuyaki";
    const response = new FetchProfileSuccessResponse({
        message: message,
        profileInfo: user.profile
    });
    return response.returnResponse();
}
