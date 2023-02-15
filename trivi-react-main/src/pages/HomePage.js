import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../theme";


// pages
import Form from "./Form";
import Signin from "./Signin";
import ImportAPI from "./ImportAPI";
import ImportFile from "./ImportFile";
import ListItems from "./ListItems";
import DeleteItems from "./DeleteItems";
import Configuration from "./Configuration";
import Documentation from "./Documentation";
import Analytics from "./Analytics";
import Recommend from "./Recommend";
import NotFoundPage from "./examples/NotFound";
import ServerError from "./examples/ServerError";
import DashboardOverview from "./DashboardOverview";
import ForgotPassword from "./ForgotPassword";
import ImportHistory from "./ImportHistory";
import SynchronizeGA from "./SynchronizeGA";

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
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";

import Upgrade from "./Upgrade";
import Transactions from "./Transactions";
import Settings from "./Settings";
import BootstrapTables from "./tables/BootstrapTables";
import Signup from "./examples/Signup";
import ResetPassword from "./examples/ResetPassword";
import Lock from "./examples/Lock";
import Profile from "./Profile";

// documentation pages
import DocsOverview from "./documentation/DocsOverview";
import DocsDownload from "./documentation/DocsDownload";
import DocsQuickStart from "./documentation/DocsQuickStart";
import DocsLicense from "./documentation/DocsLicense";
import DocsFolderStructure from "./documentation/DocsFolderStructure";
import DocsBuild from "./documentation/DocsBuild";
import DocsChangelog from "./documentation/DocsChangelog";
import Accordion from "./components/Accordion";
import Alerts from "./components/Alerts";
import Badges from "./components/Badges";
import Breadcrumbs from "./components/Breadcrumbs";
import Buttons from "./components/Buttons";
import Forms from "./components/Forms";
import Modals from "./components/Modals";
import Navs from "./components/Navs";
import Navbars from "./components/Navbars";
import Pagination from "./components/Pagination";
import Popovers from "./components/Popovers";
import Progress from "./components/Progress";
import Tables from "./components/Tables";
import Tabs from "./components/Tabs";
import Tooltips from "./components/Tooltips";
import Toasts from "./components/Toasts";


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
            {/* <main className="content">
              <Navbar />
              <Component {...props} />
              <Footer
                toggleSettings={toggleSettings}
                showSettings={showSettings}
              />
            </main> */}
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