import {User} from "../../models/User";
import LambdaEvent from "./LambdaEventIF";
import {Messages} from "../../consts/systems";

export abstract class BaseHttpRequest {
    protected authUser: User | null = null
    protected readonly lambdaEvent: LambdaEvent

    protected constructor(request: {
                              lambdaEvent: LambdaEvent
                          }
    ) {
        this.lambdaEvent = request.lambdaEvent;
    }

    /**
     * トークンでユーザーを認可する
     */
    public async setAuthUser() {
        console.log("========setAuthUser=========");
        // トークンを取得
        const accessToken = this.lambdaEvent.headers.Authorization
        console.log(accessToken);
        const authUser = await User.fetchUserByAccessToken({accessToken: accessToken});

        if (authUser === null) {
            console.error("authUser is null");
            throw new Error(Messages.BAD_REQUEST);
        }
        this.authUser = authUser;
    }

    public getAuthUser(): User | null {
        return this.authUser;
    }

}