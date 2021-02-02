import styled from "styled-components";
import * as Sentry from "@sentry/react";
import ProfileImage from "./ProfileImage";
import { useUser, useAuth } from "../context";

const Card = styled.div`
  display: flex;
`;
const UserDeets = styled.div`
  flex: 1;
`;

const UserCard = () => {
  const { login, logout } = useAuth();
  const { user } = useUser();

  return (
    <Sentry.ErrorBoundary fallback={FallbackUserCard}>
      {user ? (
        <Card>
          <ProfileImage url={user.profileImage} userAt={user.at} />
          <UserDeets>
            <p>{user.name}</p>
            <p>@{user.at}</p>
          </UserDeets>
          <button onClick={() => logout()}>Sign Out</button>
        </Card>
      ) : (
        <Card>
          <button onClick={() => login()}>Sign in with Google</button>
        </Card>
      )}
    </Sentry.ErrorBoundary>
  );
};

function FallbackUserCard() {
  return (
    <div>
      <h1>Error: User Card</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default UserCard;
