import { SelectHTMLAttributes } from "react";

import Field from "./Field";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

function Select({ label, hint, error, className, required, children, ...props }: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      <select
        className={["ui-input", "ui-select", error ? "is-error" : "", className].filter(Boolean).join(" ")}
        required={required}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

export default Select;
