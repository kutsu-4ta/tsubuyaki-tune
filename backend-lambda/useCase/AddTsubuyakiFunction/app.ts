import LambdaEvent from "../../http/LambdaEventIF";
import {Tsubuyaki} from "../../models/Tsubuyaki";
import {AddTsubuyakiSuccessResponse} from "./AddTsubuyakiSuccessResponse";
import {Messages} from "../../consts/systems";
import {AddTsubuyakiRequestInput} from "./AddTsubuyakiRequestInput";

export const lambdaHandler = async (event: LambdaEvent): Promise<any> => {

    console.log("==========set up==========")
    console.log(event.body)
    const requestInput = await AddTsubuyakiRequestInput.create(event);
    console.log(requestInput);
    console.log("==========================")

    const newTsubuyaki = await Tsubuyaki.createTsubuyaki({
        parentTsubuyakiId: requestInput.parentTsubuyakiId,
        ownerUserUid: requestInput.ownerUserUid,
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
