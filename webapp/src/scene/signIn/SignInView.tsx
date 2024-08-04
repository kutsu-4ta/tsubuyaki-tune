import React, {useEffect, useState} from 'react';
import {useRecoilState} from "recoil";
import swal from "sweetalert";
import {authenticationState} from "../../atoms/AuthenticationState";
import Box from "@mui/material/Box";
import GoogleAuthenticationButton from "./authorization/google/GoogleAuthenticationButton";
import {profileState} from "../../atoms/ProfileState";
import {SignInViewModel} from "./SignInViewModel";

const languageLocale = 'ja';
const explainJa = <span>Googleアカウントでサインインしてください.</span>
const explainEn = <span>Please sign in with your Google account.</span>
const signUp = languageLocale === 'ja' ? 'サインイン' : 'please sign in.';

const signInViewModel = new SignInViewModel();

const params = new URLSearchParams(window.location.search);
const code = params.get("code") ?? '';

const SignInView: () => JSX.Element = () => {
    const [authState, setAuthentication] = useRecoilState(authenticationState);
    const [profile, setProfile] = useRecoilState(profileState);
    const [googleOneTimeCode, setGoogleOneTimeCode] = useState(code);
    const [viewModel] = useState<SignInViewModel>(signInViewModel);

    // ログイン中はホームへ遷移する
    console.log(authState);
    const isLogin: boolean = authState.uid.length > 0;
    if (isLogin) {
        window.location.href = '/';
    }

    /**
     * サインインを実行する
     */
    const signIn = ():void => {

        if (googleOneTimeCode === '') {
            //　何もしない
            console.log('何もしない');
            return
        }

        void viewModel.signIn(googleOneTimeCode)
            .then(response => {
                console.log('googleLogin')
                console.log(response)
                void swal("おかえりなさい", response.data.message ?? 'undefined', "success").then(res => {
                    console.log('成功', res);

                    // ユーザーの認証情報のストアを更新
                    setAuthentication({
                        uid: response.data.uid,
                        accessToken: response.data.accessToken,
                        email: response.data.email
                    });

                    // ユーザー情報のストアを更新
                    setProfile({
                        nickName: response.data?.nickName ?? 'user',
                        iconImage: response.data?.iconImagePath ?? '',
                    });

                    // ホーム画面へ遷移
                    window.location.href = '/';
                });
            }).catch((er) => {
                console.log(er);
                void swal("Whoops !", er.message, "error").then(error => {
                    // ログイン画面へ遷移
                    console.log(error);
                    window.location.href = '/signin';
                });
                setGoogleOneTimeCode('');
            });
    }

    // 開発環境においてStrictModeの2回目を無視するフラグ
    let strictModeIgnore = false;
    useEffect(() => {
        viewModel.setUp({
            authentication: {
                accessToken: authState.accessToken,
                uid: authState.uid,
                email: authState.email
            }
        });

        if (!strictModeIgnore) {
            signIn();
        }

        return () => {
            strictModeIgnore = true;
        };
    }, []);

    return (
        <Box className="container" sx={{
            color: "#d7d7d7",
            paddingLeft: 30,
            backgroundColor: "black",
            display: 'flex',
            height: "100vh",
            alignContent: "center"
        }}>
            <section className="signup">
                <Box sx={{textAlign: "center", paddingTop: 30}}>
                    <h2>TSUBUYAKIに{signUp}</h2>
                    <div>
                        <p>
                            {languageLocale === 'ja' ? explainJa : explainEn}
                        </p>
                    </div>
                </Box>
                <Box sx={{textAlign: "center", paddingTop: 5}}>
                    <GoogleAuthenticationButton/>
                </Box>
            </section>
        </Box>
    );
};

export default SignInView;