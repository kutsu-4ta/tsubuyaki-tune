import React, {useEffect} from 'react';
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import {useRecoilState} from "recoil";
import {profileState} from "../../atoms/ProfileState";
import {authenticationState} from "../../atoms/AuthenticationState";
import Avatar from "@mui/material/Avatar";

const ProfileView = () => {
    const [authentication] = useRecoilState(authenticationState);
    const [profile, setProfile] = useRecoilState(profileState);
    /**
     * プロフィールを取得する
     */
    // const getProfile = (endPoint: string, params: { uid: string}): void => {
    //     void axios.get(`${endPoint}/${params.uid}`).then((response) => {
    //         console.log(response)
    //             console.log('成功', response);
    //             // ユーザー情報のストアを更新
    //             setProfile({
    //                 role: response.data.role,
    //                 nickName: response.data.nickName,
    //                 iconImage: response.data.iconImage,
    //             });
    //             console.log(profile);
    //     }).catch((error) => {
    //         console.log('失敗', error);
    //     });
    // }

    useEffect(()=>{
        console.log('実行');
        console.log(profile);
        // getProfile("http://localhost:8000/api/v1/profile", {uid: authentication.uid})
    return (() => {
    })
}, [])

    return (
        <div className="Home" style={{paddingLeft: '5rem'}}>
            <Grid container spacing={2} className={"projectByLanguage"}>
                <Grid sx={{textAlign: "center"}} xs={12} sm={12} md={12} lg={12}>
                    <Box sx={{display: "flex"}}>
                        <Avatar src={profile.iconImage} alt={'user_icon_image'}/>
                        <Typography variant="h4" component="div" sx={{textAlign: "center", paddingLeft:3}}>
                            {profile.nickName}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
};

export default ProfileView;
