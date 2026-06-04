import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
  ghost: "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:ring-slate-400"
};

const Button = ({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  disabled,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
    {...props}
  >
    {isLoading ? "Loading..." : children}
  </button>
);

export default Button;
