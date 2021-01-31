import { createContext, useContext, useEffect, useState } from "react";
import firebase from "firebase/app";
import { auth, getUserWithId } from "../services/firebase";
import { UserType } from "../models";

interface AuthContextInterface {
  login: Function;
  logout: Function;
  user: UserType | null;
}
const AuthContext = createContext<AuthContextInterface>({
  login: () => false,
  logout: () => false,
  user: null,
});

interface Props {}
const AuthProvider = (props: Props) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((googleUser) => {
      if (googleUser) {
        getUserWithId(googleUser.uid).then((fireUser) => {
          setUser(fireUser as UserType);
        });
      } else {
        setUser(null);
      }
    });
  }, []);

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  const logout = () => {
    if (auth.currentUser) {
      auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
      {...props}
    />
  );
};

export default AuthContext;

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within an AuthProvider`);
  }
  return context;
}

export { AuthProvider, useAuth };
