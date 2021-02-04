import React, { ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Link } from "react-router-dom";
import { useUser } from "../context";
import UserCard from "./UserCard";
import "./Layout.css";

interface Props {
  children: ReactNode;
}

const Layout = (props: Props) => {
  const { children } = props;
  const { user } = useUser();
  return (
    <Sentry.ErrorBoundary fallback={FallbackLayout}>
      <div className="layout__root">
        <header className="layout__header">
          <nav className="layout__nav">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link to="/notifications">Notifications</Link>
                  </li>
                  <li>
                    <Link to="/bookmarks">Bookmarks</Link>
                  </li>
                  <li>
                    <Link to={`/${user.at}`}>Profile</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <UserCard />
        </header>
        <main>{children}</main>
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
