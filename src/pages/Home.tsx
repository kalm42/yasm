import React from "react";
import * as Sentry from "@sentry/react";
import Feed from "../components/Feed";
import WritePost from "../components/WritePost";

const HomePage = () => {
  return (
    <Sentry.ErrorBoundary fallback={FallbackHomePage}>
      <div>
        <h1>YASM: Yet Another Social Media</h1>
        <WritePost />
        <Feed />
        <div>
          <h3>Features still in development:</h3>
          <ul>
            <li>Mention system</li>
            <li>Push Notifications</li>
            <li>Offline use</li>
            <li>PWA Install</li>
            <li>PWA install prompts</li>
          </ul>
        </div>
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackHomePage() {
  return (
    <div>
      <h1>Error: Home Page</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default HomePage;
