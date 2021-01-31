import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { UserType } from "../models";
interface UserContextInterface {
  user: UserType | null;
}
const UserContext = createContext<UserContextInterface>({ user: null });

interface Props {}
function UserProvider(props: Props) {
  const { user } = useAuth();

  return <UserContext.Provider value={{ user }} {...props} />;
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider`);
  }
  return context;
}

export { UserProvider, useUser };
