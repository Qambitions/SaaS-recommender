import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../theme";


// pages
import Signin from "./Signin";
import NotFoundPage from "./NotFound";
import ImportData from "./Import";
import Dashboard from "./Dashboard";
import ViewClicks from "./ViewClicks";
import Config from "./Config";
import ViewAddToCart from "./ViewAddToCart";
import ViewRemoveCart from "./ViewRemoveCart";
import View from "./View";

// components
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import Footer from "../component/Footer";
import Preloader from "../component/Preloader";
import Signup from "./Signup";


const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const login = localStorage.getItem('token') ? true : false;

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) =>
        login && rest.path === Routes.Signin.path ? (
          <Redirect to={Routes.Dashboard.path} />
        ) : (
          <>
            {" "}
            <Preloader show={loaded ? false : true} /> <Component {...props} />{" "}
          </>
        )
      }
    />
  );
};

const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const login = localStorage.getItem('token') ? true : false;
  const [isSidebar, setIsSidebar] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem("settingsVisible") === "false" ? false : true;
  };

  const [showSettings, setShowSettings] = useState(
    localStorageIsSettingsVisible
  );

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem("settingsVisible", !showSettings);
  };

  

  return (
    <Route
      {...rest}
      render={(props) =>
        login ? (
          <>
            <Preloader show={loaded ? false : true} />
            {/* <Sidebar /> */}

            <div className="d-flex flex-row">
              <Sidebar isSidebar={isSidebar}/>
              <main>
                  <Topbar setIsSidebar={setIsSidebar} />
                  <Component {...props} />
                  <Footer
                    toggleSettings={toggleSettings}
                    showSettings={showSettings}
                  />
              </main>
            </div>
          </>
        ) : (
          <Redirect to={Routes.Signin.path} />
        )
      }
    />
  );
};

export default () => {
  const [theme, colorMode] = useMode();
return (
  <ColorModeContext.Provider value={colorMode}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <RouteWithLoader exact path={Routes.Signin.path} component={Signin} />
        <RouteWithLoader exact path={Routes.Signup.path} component={Signup} />
        <RouteWithSidebar exact path={Routes.Dashboard.path} component={Dashboard} />
        <RouteWithSidebar exact path={Routes.Import.path} component={ImportData} />
        <RouteWithSidebar exact path={Routes.ViewClicks.path} component={ViewClicks} />
        <RouteWithSidebar exact path={Routes.ViewAddToCart.path} component={ViewAddToCart} />
        <RouteWithSidebar exact path={Routes.ViewRemoveCart.path} component={ViewRemoveCart} />
        <RouteWithSidebar exact path={Routes.View.path} component={View} />

        <RouteWithSidebar exact path={Routes.Config.path} component={Config} />
        <RouteWithLoader exact path={Routes.NotFound.path} component={NotFoundPage} />



        <Redirect to={Routes.NotFound.path} />

      </Switch>
      {/* {login ? 
      <>
              <div className="app d-flex flex-row">
        <Sidebar isSidebar={isSidebar}/>
        <div>
            <Topbar setIsSidebar={setIsSidebar} />
            <Switch>
                
                <RouteWithSidebar exact path={Routes.Dashboard.path} component={Dashboard} />
                <Route exact path={Routes.Import.path} component={ImportData} />
                 */}
                {/* <Route
                  exact
                  path={Routes.NotFound.path}
                  component={NotFoundPage}
                />
                <RouteWithLoader
                  exact
                  path={Routes.ServerError.path}
                  component={ServerError}
                />
                <RouteWithSidebar
                  exact
                  path={Routes.Presentation.path}
                  component={DashboardOverview}
                />
                <RouteWithSidebar
                  exact
                  path={Routes.DashboardOverview.path}
                  component={DashboardOverview}
                />
                <RouteWithSidebar
                  exact
                  key="web-activity"
                  path={Routes.Activities.path}
                  component={ListItems}
                />
                <RouteWithSidebar
                  exact
                  key="google-analytic-report"
                  path={Routes.GoogleAnalyticReports.path}
                  component={ListItems}
                />
                <RouteWithSidebar
                  exact
                  key="event"
                  path={Routes.Events.path}
                  component={ListItems}
                />
                <RouteWithSidebar
                  exact
                  key="article"
                  path={Routes.Articles.path}
                  component={ListItems}
                />
                <RouteWithSidebar
                  exact
                  path={Routes.SynchronizeGA.path}
                  component={SynchronizeGA}
                />
                <RouteWithSidebar path={Routes.ItemDetail.path} component={Form} />
                <RouteWithSidebar path={Routes.ImportAPI.path} component={ImportAPI} />
                <RouteWithSidebar path={Routes.ImportFile.path} component={ImportFile} />
                <RouteWithSidebar path={Routes.ImportHistory.path} component={ImportHistory} />
                <RouteWithSidebar path={Routes.DeleteItems.path} component={DeleteItems} />
                <RouteWithSidebar
                  exact
                  path={Routes.Recommend.path}
                  component={Recommend}
                />
                <RouteWithSidebar
                  exact
                  path={Routes.Configuration.path}
                  component={Configuration}
                />
                <RouteWithSidebar
                  exact
                  path={Routes.Analytics.path}
                  component={Analytics}
                />
                <RouteWithSidebar
                  exact
                  path={Routes.Documentation.path}
                  component={Documentation}
                />
                <RouteWithLoader
                  exact
                  path={Routes.ForgotPassword.path}
                  component={ForgotPassword}
                />
                <RouteWithSidebar exact path={Routes.Profile.path} component={Profile} /> */}
                {/* <Redirect to={Routes.NotFound.path} />
            </Switch>
        </div>
      </div>
        
      </> : 
      <>
        <RouteWithLoader exact path={Routes.Signin.path} component={Signin} />
        <RouteWithLoader exact path={Routes.Signup.path} component={Signup} />

      </>} */}
      
      
    </ThemeProvider>
  </ColorModeContext.Provider>
);
      }