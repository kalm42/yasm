import { useAlert } from "../../context/AlertContext";
import Alert from "../Alert";

const Alerts = () => {
  const { alerts } = useAlert();

  if (!alerts.length) return null;
  return <Alert alert={alerts[0]} length={alerts.length} />;
};

export default Alerts;
