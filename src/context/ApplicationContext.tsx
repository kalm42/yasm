import React, { ReactNode } from "react";
import { AuthProvider, UserProvider } from ".";

interface Props {
  children: ReactNode;
}
const ApplicationContext = (props: Props) => {
  const { children } = props;
  return (
    <AuthProvider>
      <UserProvider>{children}</UserProvider>
    </AuthProvider>
  );
};

export default ApplicationContext;
