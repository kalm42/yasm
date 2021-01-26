import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import { ApplicationContext } from "./context";
import Auth from "./pages/Auth";
import Bookmarks from "./pages/Bookmarks";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <div>
      <ApplicationContext>
        <BrowserRouter>
          <Layout>
            <Switch>
              <Route path="/auth">
                <Auth />
              </Route>
              <Route path="/bookmarks">
                <Bookmarks />
              </Route>
              <Route path="/notifications">
                <Notifications />
              </Route>
              <Route path="/settings">
                <Settings />
              </Route>
              <Route path="/:id">
                <Profile />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Layout>
        </BrowserRouter>
      </ApplicationContext>
    </div>
  );
}

export default App;
