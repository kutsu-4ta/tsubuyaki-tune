import React, {useEffect, useState} from 'react';
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import {Button, Card, CardContent, CardMedia, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import SyncIcon from '@mui/icons-material/Sync';
import {useRecoilState} from "recoil";
import {authenticationState} from "../../atoms/AuthenticationState";
import {profileState} from "../../atoms/ProfileState";
import Avatar from "@mui/material/Avatar";
import IosShareIcon from '@mui/icons-material/IosShare';
import ReplyIcon from '@mui/icons-material/Reply';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RepeatIcon from '@mui/icons-material/Repeat';
import IconButton from "@mui/material/IconButton";
import TsubuyakuButton from "../../uiComponent/tsubuyakuBottun/TsubuyakuButton";
import AddTsubuyakiModal from "../../uiComponent/addTsubuyakiModal/AddTsubuyakiModal";
import {Tsubuyaki} from "../../models/Tsubuyaki/Tsubuyaki";
import {TimeLineViewModel} from "./TimeLineViewModel";
import {TsubuyakiDraft} from "../../models/TsubuyakiDraft/TsubuyakiDraft";
import ImagePath from "../../models/data/ImagePath";
import Mention from "../../models/data/Mention";
import {hashTagString} from "../../models/data/types";

const timeLineViewModel = new TimeLineViewModel();

const TimeLineView = () => {
    const [profile] = useRecoilState(profileState);
    const [authState] = useRecoilState(authenticationState);
    const [viewModel] = useState<TimeLineViewModel>(timeLineViewModel);
    const [tsubuyakiList, setTsubuyakiList] = useState<Tsubuyaki[]>([]);
    const [tsubuyakiDraft, setTsubuyakiDraft] = useState<TsubuyakiDraft | null>(null);

    /**
     * タイムラインの読み込み
     */
    const loadTimeLine = ():void => {
        viewModel.loadTimeLine();
        setTsubuyakiList(viewModel.tsubuyakiTable.getTsubuyakiList());
    }

    /**
     * Tsubuyakiの下書きの状態の監視および更新
     * @param event
     */
    const tsubuyakiDraftHandler = (event:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const sentence = event.target.value;

        if(sentence === ''){
            setTsubuyakiDraft(null);
            return
        }

        // TODO: 仮
        const imagePathList = [
            ImagePath.create({alt:'sample1',path:'http://hogehoge-sample1.hoge.com'}),
            ImagePath.create({alt:'sample2',path:'http://hogehoge-sample2.hoge.com'})
        ];

        // TODO:仮
        const mentionList = [
            Mention.create({idCategory: 'user', idValue:'2'}),
            Mention.create({idCategory: 'user', idValue:'3'})
        ];

        const draft = TsubuyakiDraft.createTsubuyakiDraftInstance({
            sentence: sentence,
            hashTagStringList: ['#abc', '#efg', '#hij'],
            imageList: imagePathList,
            mentionList: mentionList,
            parentTsubuyakiId:'',
        })

        setTsubuyakiDraft(draft);
        console.log(draft);
    }

    /**
     * つぶやきの投稿をおこなう
     */
    const addTsubuyakiButtonHandler = async (): Promise<void> => {
        if (tsubuyakiDraft === null) {
            return
        }
        const response = await viewModel.addTsubuyaki(tsubuyakiDraft, authState.accessToken).then((response) => {
            console.log('成功', response);
            return response;
        }).catch((error) => {
            console.log('失敗', error);
            return error;
        });
        console.log(response);
    }

    /**
     * スマホだけ表示
     */
    const styleOfOnlyDisplaySmartPhone = {
        display:{xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}
    }
    /**
     * PCだけ表示
     */
    const styleOfOnlyDisplayPc = {
        display:{xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}
    }

    /**
     * 下書きの入力エリア
     */
    const styleAddTsubuyakiTextFillArea = {
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 2,
        textAlign: "start"
    }

    useEffect(() => {
        viewModel.setUp({
            authentication: {
                accessToken: authState.accessToken,
                uid: authState.uid,
                email: authState.email
            }
        });
        // タイムラインの初期化
        setTsubuyakiList(viewModel.tsubuyakiTable.getTsubuyakiList());
    }, []);

    return (
        <div className="Home" style={{paddingLeft: '5rem'}}>
            <Grid container spacing={2} className={"projectByLanguage"}>
                <Grid sx={{textAlign: "start"}} xs={12} sm={12} md={12} lg={12}>
                    <Box sx={{textAlign: "center"}}>
                        <Button onClick={() => loadTimeLine()}>
                            <SyncIcon/>
                        </Button>
                    </Box>
                </Grid>
                <Grid xs={12} sm={2} md={2} lg={2} >
                    <Box sx={{textAlign: "center"}}>
                    </Box>
                </Grid>
                <Grid xs={12} sm={7} md={7} lg={7} sx={{backgroundColor: "gray",height: "85vh", overflow:"auto"}}>
                    <Box sx={styleOfOnlyDisplayPc}>
                        <Box sx={{textAlign: "center", paddingBottom: 0.2}}>
                            <Card
                                sx={{'&:hover': {
                                        boxShadow: 6,
                                        cursor: 'pointer',
                                        // transform: 'scale(1.05)',
                                    },
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                }}
                            >
                                <CardContent>
                                    <CardMedia sx={{textAlign: "start"}}>
                                        <Box sx={{display: "flex"}}>
                                            <Avatar src={profile.iconImage} alt={profile.nickName}/>
                                            <Typography sx={{alignContent: "center", paddingLeft: 1}}>
                                                {profile.nickName}
                                            </Typography>
                                        </Box>
                                    </CardMedia>
                                    <Box sx={styleAddTsubuyakiTextFillArea}>
                                        <Typography variant="body1" component="div">
                                            <TextField
                                                onChange={(e) => tsubuyakiDraftHandler(e)}
                                                id="add-tsubuyaki-text-field"
                                                multiline
                                                rows={4}
                                                placeholder="いまの気持ちをつぶやいてみよう！"
                                                variant="outlined"
                                                fullWidth
                                                InputLabelProps={{
                                                    shrink: false,
                                                }}
                                            />
                                        </Typography>
                                    </Box>
                                    <Box sx={{width: "100%", display:"inline-block", textAlign:"end", paddingTop:2}}>
                                        <TsubuyakuButton onClick={addTsubuyakiButtonHandler}/>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                    <Box sx={{textAlign: "center"}}>
                        {tsubuyakiList.map((item, index) => (
                            <Box key={index} sx={{paddingBottom: 0.2}}>
                                <Card
                                    sx={{
                                        '&:hover': {
                                            boxShadow: 6,
                                            cursor: 'pointer',
                                            // transform: 'scale(1.01)',
                                        },
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                    }}
                                >
                                    <CardContent>
                                        <CardMedia sx={{textAlign: "start"}}>
                                            {/*【UI名】つぶやきヘッダー*/}
                                            <Box sx={{display: "flex"}} onClick={()=>{console.log('この人のプロフィールへ飛ぶ')}}>
                                                <Avatar src={item.tsubuyakiMetaInfo.tsubuyakiUserName} alt={'user_icon_image'}/>
                                                <Box sx={{display: "flex"}}>
                                                    <Typography sx={{alignContent: "center", paddingLeft: 1}} fontSize={20}>
                                                        {item.tsubuyakiMetaInfo.tsubuyakiUserName}
                                                    </Typography>
                                                    <Typography sx={{alignContent: "center", paddingLeft: 2}} color={"gray"} fontSize={14}>
                                                        {item.tsubuyakiMetaInfo.dateTimeString}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardMedia>
                                        {/*【UI名】つぶやきボディ*/}
                                        <Box onClick={()=>{
                                            window.location.href=`/tsubuyaki/${item.tsubuyakiMetaInfo.tsubuyakiId}`
                                        }}>
                                            <Typography variant="body1" component="div">
                                                <Box sx={{paddingLeft: 2, paddingTop: 2, textAlign: "start"}}>
                                                    {item.tsubuyakiInfo.sentence}
                                                </Box>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <Box sx={{paddingRight: 2, paddingTop: 2, textAlign: "end"}}>
                                                    {item.tsubuyakiInfo.hashTagList.toString()}
                                                </Box>
                                            </Typography>
                                        </Box>
                                        {/*【UI名】つぶやきメニュー*/}
                                        <Box sx={{width: "100%", display:"flex"}}>
                                            <IconButton sx={{marginRight:2}} onClick={()=>{console.log('レッツクソリプ！')}}>
                                                <ReplyIcon sx={{color: "white"}}/>
                                            </IconButton>
                                            <IconButton sx={{marginRight:2}} onClick={()=>{console.log('いいね！')}}>
                                                <FavoriteIcon sx={{color: "#ff4c4c"}}/>
                                            </IconButton>
                                            <IconButton sx={{marginRight:2}} onClick={()=>{console.log('リポスト！')}}>
                                                <RepeatIcon sx={{color: "#4cffa7"}}/>
                                            </IconButton>
                                            <IconButton sx={{marginRight:2}} onClick={()=>{console.log('共有する！')}}>
                                                <IosShareIcon sx={{color: "#4cc2ff"}}/>
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                    <Box sx={styleOfOnlyDisplaySmartPhone}>
                        <AddTsubuyakiModal/>
                    </Box>
                </Grid>
                <Grid xs={12} sm={3} md={3} lg={3}>
                    <Box sx={{textAlign: "center"}}>
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
};

export default TimeLineView;
