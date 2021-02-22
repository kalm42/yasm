import React, { ReactNode } from "react";
import { AuthProvider, UserProvider } from ".";
import { AlertProvider } from "./AlertContext";

interface Props {
  children: ReactNode;
}
const ApplicationContext = (props: Props) => {
  const { children } = props;
  return (
    <AuthProvider>
      <UserProvider>
        <AlertProvider>{children}</AlertProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default ApplicationContext;
