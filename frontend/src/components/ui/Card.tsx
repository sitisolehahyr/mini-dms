import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "base" | "subtle" | "tint";
  padded?: boolean;
};

function Card({ variant = "base", padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={["ui-card", `ui-card-${variant}`, padded ? "ui-card-padded" : "", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
