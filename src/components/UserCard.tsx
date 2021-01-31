import styled from "styled-components";
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

  return user ? (
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
  );
};

export default UserCard;
