import type { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "secondary";
};

export function Button({ variant, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${styles.button} ${styles[variant]}`} {...props} />;
}
