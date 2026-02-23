import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type SidebarNavItemProps = {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
};

function SidebarNavItem({ to, label, icon, end = false, collapsed = false, onNavigate }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
      data-tooltip={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      <span className="sidebar-link-icon">{icon}</span>
      <span className="sidebar-link-label">{label}</span>
    </NavLink>
  );
}

export default SidebarNavItem;
