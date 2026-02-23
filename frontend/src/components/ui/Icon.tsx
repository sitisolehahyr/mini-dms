import { HTMLAttributes } from "react";

type IconName =
  | "dashboard"
  | "documents"
  | "approvals"
  | "notifications"
  | "menu"
  | "close"
  | "chevronLeft"
  | "chevronRight"
  | "upload"
  | "search"
  | "empty"
  | "check"
  | "alert"
  | "logout"
  | "user"
  | "clock";

type IconProps = HTMLAttributes<HTMLSpanElement> & {
  name: IconName;
  size?: number;
};

function pathFor(name: IconName) {
  switch (name) {
    case "dashboard":
      return "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v11h-7zM4 13h7v8H4z";
    case "documents":
      return "M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm6 1.5V9h4.5";
    case "approvals":
      return "M12 2 3 6v6c0 5.2 3.4 10 9 11 5.6-1 9-5.8 9-11V6l-9-4zm-1.2 13.2-3-3 1.4-1.4 1.6 1.6 4-4 1.4 1.4-5.4 5.4z";
    case "notifications":
      return "M12 3a5 5 0 0 0-5 5v2.6c0 .7-.2 1.4-.6 2l-1 1.5c-.5.7 0 1.9 1 1.9h11.2c1 0 1.5-1.2 1-1.9l-1-1.5a3.7 3.7 0 0 1-.6-2V8a5 5 0 0 0-5-5zm0 18a2.8 2.8 0 0 0 2.7-2h-5.4A2.8 2.8 0 0 0 12 21z";
    case "menu":
      return "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z";
    case "close":
      return "M7.4 6 6 7.4 10.6 12 6 16.6 7.4 18 12 13.4 16.6 18 18 16.6 13.4 12 18 7.4 16.6 6 12 10.6z";
    case "chevronLeft":
      return "M14.7 6.3 13.3 5l-7 7 7 7 1.4-1.3L9.1 12z";
    case "chevronRight":
      return "M9.3 17.7 10.7 19l7-7-7-7-1.4 1.3 5.6 5.7z";
    case "upload":
      return "M12 3 7.5 7.5l1.4 1.4 2.1-2.1V15h2V6.8l2.1 2.1 1.4-1.4L12 3zM5 17h14v4H5z";
    case "search":
      return "M11 4a7 7 0 1 0 4.4 12.5l4 4 1.4-1.4-4-4A7 7 0 0 0 11 4zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z";
    case "empty":
      return "M4 6h16v12H4zM8 3h8v2H8zM8 10h8v2H8zM8 14h5v2H8z";
    case "check":
      return "M9.5 16.2 5 11.7l1.4-1.4 3.1 3.1 8.1-8.1 1.4 1.4-9.5 9.5z";
    case "alert":
      return "M12 3 2 20h20L12 3zm1 13h-2v-2h2v2zm0-4h-2V8h2v4z";
    case "logout":
      return "M14 4h6v16h-6v-2h4V6h-4V4zM4 12l5-5v3h7v4H9v3l-5-5z";
    case "user":
      return "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z";
    case "clock":
      return "M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm1 9.4V7h-2v6.2l4.6 2.8 1-1.7-3.6-2.1z";
    default:
      return "";
  }
}

function Icon({ name, size = 18, className, ...props }: IconProps) {
  return (
    <span className={["ui-icon", className].filter(Boolean).join(" ")} {...props}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <path d={pathFor(name)} />
      </svg>
    </span>
  );
}

export default Icon;
