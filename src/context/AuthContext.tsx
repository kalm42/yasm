import { createContext, useContext, useEffect, useState } from "react";
import { UserType } from "../models";
import { loginWithGoogle, signOut, subscribeToAuth } from "../services";

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
    subscribeToAuth(setUser);
  }, []);

  const login = () => loginWithGoogle();

  const logout = () => signOut();

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
