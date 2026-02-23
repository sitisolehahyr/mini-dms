import { ReactNode } from "react";

type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <label className="ui-field">
      {label ? (
        <span className="ui-field-label">
          {label}
          {required ? <span className="ui-required">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="ui-field-error">{error}</span> : hint ? <span className="ui-field-hint">{hint}</span> : null}
    </label>
  );
}

export default Field;
