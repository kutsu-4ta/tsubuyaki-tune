import LambdaEvent from "../../http/request/LambdaEventIF";
import {Tsubuyaki} from "../../models/Tsubuyaki";
import {AddTsubuyakiSuccessResponse} from "./AddTsubuyakiSuccessResponse";
import {ErrorMessages, Messages} from "../../consts/systems";
import {AddTsubuyakiRequestInput} from "./AddTsubuyakiRequestInput";

export const lambdaHandler = async (event: LambdaEvent): Promise<any> => {

    console.log("==========set up==========")
    console.log(event.body)
    const requestInput = await AddTsubuyakiRequestInput.create(event);
    await requestInput.setAuthUser();
    console.log(requestInput);
    console.log("==========================")

    const authUser = requestInput.getAuthUser();
    if (authUser === null) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const newTsubuyaki = await Tsubuyaki.createTsubuyaki({
        parentTsubuyakiId: requestInput.parentTsubuyakiId,
        ownerUserUid: authUser.uid,
        sentence: requestInput.sentence,
        dateTimeString: requestInput.dateTimeString,
        imageList: requestInput.imageList,
        mentionList: requestInput.mentionList,
        hashTagStringList: requestInput.hashTagStringList
    });

    console.log(newTsubuyaki);

    const message = Messages.SUCCESS + "to add Tsubuyaki";
    const response = new AddTsubuyakiSuccessResponse({
        message: message,
        tsubuyakiId: ''
    });
    return response.returnResponse();
}
