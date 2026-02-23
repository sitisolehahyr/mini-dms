import { InputHTMLAttributes } from "react";

import Field from "./Field";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

function Input({ label, hint, error, className, required, ...props }: InputProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      <input className={["ui-input", error ? "is-error" : "", className].filter(Boolean).join(" ")} required={required} {...props} />
    </Field>
  );
}

export default Input;
