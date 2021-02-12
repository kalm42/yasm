import React from "react";
import * as Sentry from "@sentry/react";
import Feed from "../components/Feed";
import WritePost from "../components/WritePost";
import { useUser } from "../context";
import styles from "./Home.module.css";

const HomePage = () => {
  const { user } = useUser();
  return (
    <Sentry.ErrorBoundary fallback={FallbackHomePage}>
      <div>
        {!!user ? (
          <section className={styles.write}>
            <WritePost />
            <img
              src={user.profileImage}
              alt={user.at}
              className={styles.profile}
            />
          </section>
        ) : (
          <section>
            <button>login</button>
          </section>
        )}
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
