import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
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

const CallToAction = styled.div`
  flex: 1;
`;

interface Props {
  children: ReactNode;
}

const Layout = (props: Props) => {
  const { children } = props;
  return (
    <Base>
      <Header>
        <p>YASM</p>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/notifications">Notifications</Link>
            </li>
            <li>
              <Link to="/bookmarks">Bookmarks</Link>
            </li>
            <li>
              <Link to={`/kalm42`}>Profile</Link>
            </li>
          </ul>
        </nav>
        <CallToAction>
          <button>Post Sumthin'</button>
        </CallToAction>
        <UserCard />
      </Header>
      <main>{children}</main>
    </Base>
  );
};

export default Layout;
