import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import * as Sentry from "@sentry/react";
import Layout from "./components/Layout";
import { ApplicationContext } from "./context";
import Bookmarks from "./pages/Bookmarks";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import Post from "./pages/Post";
import Profile from "./pages/Profile";

function App() {
  return (
    <div>
      <Sentry.ErrorBoundary fallback={FallbackApp}>
        <ApplicationContext>
          <BrowserRouter>
            <Layout>
              <Switch>
                <Route path="/bookmarks">
                  <Bookmarks />
                </Route>
                <Route path="/notifications">
                  <Notifications />
                </Route>
                <Route path="/post/:id">
                  <Post />
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
      </Sentry.ErrorBoundary>
    </div>
  );
}

function FallbackApp() {
  return (
    <div>
      <p>
        An error has occured please refresh the page. If this continues to
        happen please contact support.
      </p>
    </div>
  );
}

export default App;
