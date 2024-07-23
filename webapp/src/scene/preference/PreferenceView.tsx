import React from 'react';

import {useRecoilState} from "recoil";
import {Button} from "@mui/material";
import {authenticationState} from "../../atoms/AuthenticationState";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

const PreferenceView: React.FunctionComponent = () => {
    const [authentication, setAuthentication] = useRecoilState(authenticationState);

    const signOut = (): void => {
        // googleLogout();
        setAuthentication({uid:''});
    }

    return (
        <Grid container spacing={2} className={"preference"} style={{paddingLeft: '5rem'}}>
            <Grid sx={{textAlign: "center"}} xs={12} sm={12} md={12} lg={12}>
                <Typography variant="h5" component="div">
                    設定
                </Typography>
            </Grid>
            <Grid sx={{textAlign: "center"}} xs={12} sm={12} md={12} lg={12}>
                <Typography variant="h6" component="div">
                    ユーザーID : {authentication.uid}
                </Typography>
            </Grid>
            <Grid sx={{textAlign: "center"}} xs={12} sm={12} md={12} lg={12}>
                <Typography variant="h6" component="div">
                    連携済みGoogleアカウント : {authentication.email}
                </Typography>
            </Grid>
            {/*<Grid sx={{textAlign: "center"}} xs={12} sm={12} md={12} lg={12}>*/}
            {/*    <Typography variant="h6" component="div">*/}
            {/*        トークン : {authentication.token}*/}
            {/*    </Typography>*/}
            {/*</Grid>*/}

            <Grid sx={{textAlign: "end"}} xs={6} sm={6} md={6} lg={6}>
                <Button onClick={signOut}>サインアウト
                </Button>
            </Grid>
            <Grid sx={{textAlign: "start"}} xs={6} sm={6} md={6} lg={6}>
                <Button onClick={()=>{console.log('脱退')}}>脱退する</Button>
            </Grid>
        </Grid>
    );
};
export default PreferenceView;
