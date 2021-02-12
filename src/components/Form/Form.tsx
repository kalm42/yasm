import { faArrowCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject } from "react";
import styles from "./Form.module.css";

interface Props {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  placeholder: string;
  name: string;
  inputRef?: RefObject<HTMLInputElement>;
}

const Form = (props: Props) => {
  const {
    handleSubmit,
    handleChange,
    value,
    placeholder,
    name,
    inputRef,
  } = props;
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        required
        value={value}
        onChange={handleChange}
        className={styles.input}
        ref={inputRef}
      />
      <button type="submit" className={styles.submit}>
        <FontAwesomeIcon
          icon={faArrowCircleUp}
          className={styles["submit-icon"]}
        />
      </button>
    </form>
  );
};

export default Form;
