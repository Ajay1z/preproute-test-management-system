import { forwardRef, ForwardedRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface BaseInputProps {
  label: string;
  error?: FieldError;
}

type InputProps = BaseInputProps &
  InputHTMLAttributes<HTMLInputElement> & {
    textarea?: false;
  };

type TextareaProps = BaseInputProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    textarea: true;
  };

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps | TextareaProps>(
  ({ label, error, textarea, ...props }, ref) => (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          ref={ref as ForwardedRef<HTMLTextAreaElement>}
          className={`${fieldClass} min-h-28 resize-y`}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as ForwardedRef<HTMLInputElement>}
          className={fieldClass}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error?.message ? <span className="mt-1 block text-xs font-medium text-rose-600">{error.message}</span> : null}
    </label>
  )
);

Input.displayName = "Input";

export default Input;
