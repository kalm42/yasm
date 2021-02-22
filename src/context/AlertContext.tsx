import { createContext, useContext, useState } from "react";
import { AlertType } from "../models";

interface AlertContextInterface {
  alerts: AlertType[];
  addAlert: (T: AlertType) => void;
  removeAlert: (T: AlertType) => void;
}

const AlertContext = createContext<AlertContextInterface>({
  alerts: [],
  addAlert: () => {},
  removeAlert: () => {},
});

interface Props {}
function AlertProvider(props: Props) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const addAlert = (a: AlertType) => {
    setAlerts([a, ...alerts]);
  };
  const removeAlert = (a: AlertType) => {
    console.log("AlertContext:removeAlert => ", alerts);
    setAlerts(alerts.filter((alert) => alert.id !== a.id));
  };

  return (
    <AlertContext.Provider
      value={{ alerts, addAlert, removeAlert }}
      {...props}
    />
  );
}

function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within an AlertProvider`);
  }
  return context;
}

export default AlertContext;
export { useAlert, AlertProvider };
