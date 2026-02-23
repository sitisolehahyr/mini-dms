import { useEffect, useState } from "react";

import Pagination from "../components/Pagination";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import { listNotifications, markAllAsRead, markAsRead } from "../data/notificationDataSource";
import { useToast } from "../contexts/ToastContext";
import { Notification } from "../types/dms";
import { formatFullTimestamp, formatRelativeTime } from "../utils/dateTime";
import { getErrorMessage } from "../utils/httpError";

function NotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotifications({ page, pageSize: 10 });
      setItems(
        [...data.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
      setTotalPages(data.meta.total_pages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page]);

  const onMarkRead = async (id: number) => {
    setActionLoading(true);
    try {
      await markAsRead(id);
      setItems((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
      showToast({ type: "success", title: "Notification marked as read" });
    } catch (err) {
      const message = getErrorMessage(err, "Failed to mark notification");
      setError(message);
      showToast({ type: "error", title: "Action failed", description: message });
    } finally {
      setActionLoading(false);
    }
  };

  const onMarkAll = async () => {
    setActionLoading(true);
    try {
      const updated = await markAllAsRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      showToast({ type: "success", title: "Notifications updated", description: `${updated} marked as read.` });
    } catch (err) {
      const message = getErrorMessage(err, "Failed to mark all notifications");
      setError(message);
      showToast({ type: "error", title: "Action failed", description: message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="muted">Keep up with workflow events and review updates.</p>
        </div>
        <Button onClick={onMarkAll} variant="secondary" loading={actionLoading}>
          Mark all as read
        </Button>
      </div>

      {loading ? <LoadingState message="Loading notifications..." /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState title="No notifications" description="You are all caught up. New events will appear here." />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className="cards-list">
          {items.map((notification) => (
            <li key={notification.id}>
              <Card className={`notification-card ${notification.isRead ? "read" : "unread"}`}>
                <div className="notification-main">
                  <div className="notification-type-row">
                    {!notification.isRead ? <span className="notification-unread-dot" aria-hidden="true" /> : null}
                    <h3 className="notification-type">{notification.type.replace(/_/g, " ")}</h3>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                </div>

                <div className="notification-meta">
                  <time
                    className="notification-time"
                    dateTime={notification.createdAt}
                    title={formatFullTimestamp(notification.createdAt)}
                  >
                    {formatRelativeTime(notification.createdAt)}
                  </time>

                  {!notification.isRead ? (
                    <Button size="sm" onClick={() => onMarkRead(notification.id)} loading={actionLoading}>
                      Mark read
                    </Button>
                  ) : (
                    <span className="notification-read-label">Read</span>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

export default NotificationsPage;
