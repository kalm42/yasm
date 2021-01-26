import { createContext, useContext, useState } from "react";
import firebase from "firebase/app";
import { auth, firestore } from "../Firebase";
import { User } from "../models/posts";

interface AuthContextInterface {
  login: Function;
  logout: Function;
  user: User | null;
}
const AuthContext = createContext<AuthContextInterface>({
  login: () => false,
  logout: () => false,
  user: null,
});

interface Props {}
function AuthProvider(props: Props) {
  const [user, setUser] = useState<User | null>(null);
  firebase.auth().onAuthStateChanged((googleUser) => {
    if (googleUser) {
      firestore
        .collection("users")
        .doc(googleUser.uid)
        .onSnapshot(
          (doc) => {
            const fireUser = doc.data();
            setUser(fireUser as User);
          },
          (error) => {
            console.error(error);
          }
        );
    } else if (user) {
      setUser(null);
    }
  });

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  const logout = () => {
    if (auth.currentUser) {
      auth.signOut();
    }
  };

  return <AuthContext.Provider value={{ login, logout, user }} {...props} />;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within an AuthProvider`);
  }
  return context;
}

export { AuthProvider, useAuth };
