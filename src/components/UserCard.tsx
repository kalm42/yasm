import styled from "styled-components";
import ProfileImage from "./ProfileImage";
import { auth } from "../Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase/app";

const Card = styled.div`
  display: flex;
`;
const UserDeets = styled.div`
  flex: 1;
`;

const UserCard = () => {
  const [user] = useAuthState(auth);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return user ? (
    <Card>
      <ProfileImage />
      <UserDeets>
        <p>Username</p>
        <p>@userId</p>
      </UserDeets>
      <button onClick={() => auth.currentUser && auth.signOut()}>
        Sign Out
      </button>
    </Card>
  ) : (
    <Card>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </Card>
  );
};

export default UserCard;
