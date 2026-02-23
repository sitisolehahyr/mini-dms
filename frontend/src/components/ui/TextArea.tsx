import { TextareaHTMLAttributes } from "react";

import Field from "./Field";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

function TextArea({ label, hint, error, className, required, ...props }: TextAreaProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      <textarea
        className={["ui-input", "ui-textarea", error ? "is-error" : "", className].filter(Boolean).join(" ")}
        required={required}
        {...props}
      />
    </Field>
  );
}

export default TextArea;
