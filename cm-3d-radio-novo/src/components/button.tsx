import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import styles from "./button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "secondary";
};

export function Button({ variant, type = "button", className, ...props }: ButtonProps) {
  return <button type={type} className={[styles.button, styles[variant], className].filter(Boolean).join(" ")} {...props} />;
}

export function ButtonLink({ href, variant, children }: { href: string; variant: ButtonProps["variant"]; children: ReactNode }) {
  return <Link href={href} className={[styles.button, styles.buttonLink, styles[variant]].join(" ")}>{children}</Link>;
}
