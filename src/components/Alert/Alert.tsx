import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useAlert } from "../../context/AlertContext";
import { AlertType } from "../../models";
import styles from "./Alert.module.css";

interface Props {
  alert: AlertType;
  length: number;
}
const Alert = (props: Props) => {
  const { alert, length } = props;
  const { removeAlert } = useAlert();

  // after 10 seconds remove the function from the array
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      removeAlert(alert);
    }, 100 * 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [alert, removeAlert]);

  return (
    <section className={styles.root}>
      <p className={styles.message}>{alert.message}</p>
      <section className={styles.deets}>
        <button className={styles.action} onClick={() => removeAlert(alert)}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </button>
        <p className={styles.length}>1 of {length}</p>
      </section>
    </section>
  );
};

export default Alert;
