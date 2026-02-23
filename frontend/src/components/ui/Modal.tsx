import { ReactNode, useEffect } from "react";

import Button from "./Button";

type ModalProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

function Modal({ title, subtitle, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="ui-modal-backdrop" onMouseDown={onClose} role="presentation">
      <div className="ui-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header className="ui-modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </header>
        <div className="ui-modal-body">{children}</div>
        {footer ? <footer className="ui-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}

export default Modal;
