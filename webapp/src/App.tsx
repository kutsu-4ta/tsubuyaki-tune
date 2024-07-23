import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import './App.css';
import TimeLineView from "./scene/timeLine/TimeLineView";
import SignInView from "./scene/signIn/SignInView";
import {GoogleOAuthProvider} from "@react-oauth/google";
import UniteTuneDrawer from "./uiComponent/layout/AppDrawer";
import {createTheme, ThemeProvider} from "@mui/material";
import Preferrence from "./scene/preference/PreferenceView";
import {RecoilRoot} from "recoil";
import ProfileView from "./scene/profile/ProfileView";
import TsubuyakiDetailView from "./scene/tsubuyakiDetail/TsubuyakiDetailView";

function App() {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID as string;

    // const [darkMode,] = useState(true);
    const theme = createTheme({
        palette: {
            // mode: darkMode ? 'dark' : 'light',
            mode: 'dark'
        },
        breakpoints: {
            values: {
                xs: 320,  // ミニ
                sm: 480, // モバイル
                md: 768, // タブレット
                lg: 1285, // 基準
                xl: 1536, // ワイドモニター
            },
        },
    });

  return (
      <RecoilRoot>
          <ThemeProvider theme={theme}>
              <GoogleOAuthProvider clientId={clientId}>
                  {/*<header className="App-header">*/}
                  {/*  <img src={logo} className="App-logo" alt="logo" />*/}
                  {/*  <p>*/}
                  {/*    Edit <code>src/App.tsx</code> and save to reload.*/}
                  {/*  </p>*/}
                  {/*  <a*/}
                  {/*      className="App-link"*/}
                  {/*      href="https://reactjs.org"*/}
                  {/*      target="_blank"*/}
                  {/*      rel="noopener noreferrer"*/}
                  {/*  >*/}
                  {/*    Learn React*/}
                  {/*  </a>*/}
                  {/*</header>*/}
                  <BrowserRouter>
                      <UniteTuneDrawer/>
                      <Routes>
                          <Route path={'/'} element={<TimeLineView/>}/>
                      </Routes>
                      <Routes>
                          <Route path={'/signin'} element={<SignInView/>}/>
                      </Routes>
                      <Routes>
                          <Route path={'/preference'} element={<Preferrence/>}/>
                      </Routes>
                      <Routes>
                          <Route path={'/profile'} element={<ProfileView/>}/>
                      </Routes>
                      <Routes>
                          <Route path={'/post/:postId/'} element={<TsubuyakiDetailView/>}/>
                      </Routes>
                      <Routes>
                          <Route path={'/home'} element={<TimeLineView/>}/>
                      </Routes>
                  </BrowserRouter>
              </GoogleOAuthProvider>
          </ThemeProvider>
      </RecoilRoot>
  );
}

export default App;
