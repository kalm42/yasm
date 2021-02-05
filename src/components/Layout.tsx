import React, { ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { NavLink } from "react-router-dom";
import { useUser } from "../context";
import styles from "./Layout.module.css";

interface Props {
  children: ReactNode;
}

const Layout = (props: Props) => {
  const { children } = props;
  const { user } = useUser();
  console.log({ styles });
  return (
    <Sentry.ErrorBoundary fallback={FallbackLayout}>
      <div className={styles.root}>
        <header className={styles.header}>
          <nav className={styles.nav}>
            <ul>
              <li>
                <NavLink exact activeClassName={styles.active} to="/">
                  Home
                </NavLink>
              </li>
              {user && (
                <>
                  <li>
                    <NavLink
                      exact
                      activeClassName={styles.active}
                      to="/notifications"
                    >
                      Notifications
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      exact
                      activeClassName={styles.active}
                      to="/bookmarks"
                    >
                      Bookmarks
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      exact
                      activeClassName={styles.active}
                      to={`/${user.at}`}
                    >
                      Profile
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackLayout() {
  return (
    <div>
      <h1>Error: Layout</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default Layout;
