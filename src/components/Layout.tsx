import React, { ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useUser } from "../context";
import UserCard from "./UserCard";

const Base = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  min-height: calc(100vh);
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  left: 0;
  max-height: calc(100vh);
`;

interface Props {
  children: ReactNode;
}

const Layout = (props: Props) => {
  const { children } = props;
  const { user } = useUser();
  return (
    <Sentry.ErrorBoundary fallback={FallbackLayout}>
      <Base>
        <Header>
          <p>YASM</p>
          <nav style={{ flex: 1 }}>
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
        </Header>
        <main>{children}</main>
      </Base>
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
