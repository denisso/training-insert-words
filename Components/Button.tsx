import classNames from "classnames";
import styles from "./Button.module.css";

const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button {...props} className={classNames(styles.button, className)}>
      {children}
    </button>
  );
};

export default Button;
