import React from 'react';
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {useParams} from "react-router-dom";

const TsubuyakiDetailView = () => {
    const params = useParams();
    console.log(params.seedId);
    return (
        <div className="Home" style={{paddingLeft: '5rem'}}>
            <Grid container spacing={2} className={"projectByLanguage"}>
                <Grid sx={{textAlign: "start"}} xs={12} sm={12} md={12} lg={12}>
                    <Typography variant="h4" component="div" sx={{textAlign: "center"}}>
                        Seed 詳細
                    </Typography>
                </Grid>
                <Grid xs={6} sm={6} md={6} lg={6}>
                    <>
                        SeedId {params.seedId}
                    </>
                    <Box sx={{textAlign:"start"}}>

                    </Box>
                </Grid>
                <Grid xs={6} sm={6} md={6} lg={6} sx={{textAlign: "center"}}>
                    <Box sx={{textAlign:"start"}}>
                        <Typography>
                           詳細
                        </Typography>
                    </Box>
                </Grid>


                <Grid xs={3} sm={3} md={3} lg={3} >
                </Grid>
                <Grid sx={{textAlign: "center"}} xs={6} sm={6} md={6} lg={6}>
                    <Typography variant="h4" component="div" sx={{textAlign: "center"}}>
                        コメント
                    </Typography>
                </Grid>
                <Grid xs={3} sm={3} md={3} lg={3} >
                </Grid>

            </Grid>
        </div>
    );
};

export default TsubuyakiDetailView;
