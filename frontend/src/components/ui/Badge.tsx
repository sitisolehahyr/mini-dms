import { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span className={["ui-badge", `ui-badge-${tone}`, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </span>
  );
}

export default Badge;
