import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import SidebarNavItem from "../components/layout/SidebarNavItem";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import { useAuth } from "../contexts/AuthContext";

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const onLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div
      className={[
        "app-shell",
        isCollapsed ? "sidebar-collapsed" : "",
        isMobileOpen ? "sidebar-mobile-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="sidebar-overlay"
        onClick={() => setIsMobileOpen(false)}
        aria-label="Close sidebar"
      />

      <aside className="sidebar" aria-label="Sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand" title="Mini DMS">
            <div className="brand-mark">MD</div>
            <div className="sidebar-brand-copy">
              <strong>Mini DMS</strong>
              <p className="muted">Document Management</p>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-collapse-toggle"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <Icon name={isCollapsed ? "chevronRight" : "chevronLeft"} size={16} />
          </button>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-group">
          <p className="sidebar-section-title">Navigation</p>
          <nav className="sidebar-nav" aria-label="Primary">
            <SidebarNavItem
              to="/"
              end
              label="Dashboard"
              icon={<Icon name="dashboard" size={18} />}
              collapsed={isCollapsed}
            />
            <SidebarNavItem
              to="/documents"
              label="Documents"
              icon={<Icon name="documents" size={18} />}
              collapsed={isCollapsed}
            />
            {user?.role === "ADMIN" ? (
              <SidebarNavItem
                to="/permission-requests"
                label="Approvals"
                icon={<Icon name="approvals" size={18} />}
                collapsed={isCollapsed}
              />
            ) : null}
            <SidebarNavItem
              to="/notifications"
              label="Notifications"
              icon={<Icon name="notifications" size={18} />}
              collapsed={isCollapsed}
            />
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user" title={user?.full_name}>
            <span className="sidebar-user-icon">
              <Icon name="user" size={16} />
            </span>
            <div className="sidebar-user-copy">
              <p>{user?.full_name}</p>
              <span className="sidebar-user-email muted">{user?.email}</span>
            </div>
          </div>

          <div className="sidebar-footer-actions">
            {user?.role === "ADMIN" ? <Badge tone="info">ADMIN</Badge> : <Badge tone="neutral">USER</Badge>}
            <button type="button" className="sidebar-logout" onClick={onLogout} title="Logout" aria-label="Logout">
              <Icon name="logout" size={14} />
              <span className="sidebar-logout-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-topbar">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileOpen((current) => !current)}
            aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
          >
            <Icon name={isMobileOpen ? "close" : "menu"} size={18} />
          </button>
          <div className="mobile-topbar-copy">
            <strong>Mini DMS</strong>
            <span>Workspace</span>
          </div>
        </div>

        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
