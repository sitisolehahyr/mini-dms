import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listRequests } from "../data/approvalDataSource";
import { listDocuments } from "../data/documentDataSource";
import { listNotifications } from "../data/notificationDataSource";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import LoadingState from "../components/ui/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { Document } from "../types/dms";

function DashboardPage() {
  const { user } = useAuth();
  const [latestDocuments, setLatestDocuments] = useState<Document[]>([]);
  const [recentDocumentCount, setRecentDocumentCount] = useState(0);
  const [pendingWorkflowCount, setPendingWorkflowCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const [documentsResult, requestsResult, notificationsResult] = await Promise.allSettled([
        listDocuments({ page: 1, pageSize: 200 }),
        user?.role === "ADMIN"
          ? listRequests({ status: "PENDING", page: 1, pageSize: 200 })
          : Promise.resolve({ items: [], meta: { page: 1, page_size: 200, total: 0, total_pages: 1 } }),
        listNotifications({ page: 1, pageSize: 200 }),
      ]);

      try {
        const documentsResponse = documentsResult.status === "fulfilled" ? documentsResult.value : null;
        const requestsResponse = requestsResult.status === "fulfilled" ? requestsResult.value : null;
        const notificationsResponse = notificationsResult.status === "fulfilled" ? notificationsResult.value : null;

        if (!documentsResponse && !requestsResponse && !notificationsResponse) {
          setError("Failed to load dashboard data");
          setLatestDocuments([]);
          setRecentDocumentCount(0);
          setPendingWorkflowCount(0);
          setUnreadNotifications(0);
          return;
        }

        const allDocuments = [...(documentsResponse?.items ?? [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const recentCount = allDocuments.filter((doc) => new Date(doc.createdAt).getTime() >= sevenDaysAgo).length;
        const pendingDocIds = new Set(
          allDocuments
            .filter((doc) => doc.status === "PENDING_DELETE" || doc.status === "PENDING_REPLACE")
            .map((doc) => doc.id),
        );

        let pendingWorkflow = pendingDocIds.size;
        for (const request of requestsResponse?.items ?? []) {
          if (request.documentId === null || !pendingDocIds.has(request.documentId)) {
            pendingWorkflow += 1;
          }
        }

        const unreadCount = (notificationsResponse?.items ?? []).filter((item) => !item.isRead).length;

        setLatestDocuments(allDocuments.slice(0, 5));
        setRecentDocumentCount(recentCount);
        setPendingWorkflowCount(pendingWorkflow);
        setUnreadNotifications(unreadCount);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.role]);

  const stats = useMemo(
    () => [
      {
        label: "Docs in last 7 days",
        value: recentDocumentCount,
        icon: "documents" as const,
        tintClass: "stat-tint-blue",
      },
      {
        label: "Pending workflow",
        value: pendingWorkflowCount,
        icon: "approvals" as const,
        tintClass: "stat-tint-amber",
      },
      {
        label: "Unread notifications",
        value: unreadNotifications,
        icon: "notifications" as const,
        tintClass: "stat-tint-green",
      },
    ],
    [pendingWorkflowCount, recentDocumentCount, unreadNotifications],
  );

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Track document activity and pending approvals.</p>
        </div>
      </header>

      {loading ? <LoadingState message="Loading dashboard..." /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading ? (
        <>
          <div className="stats-grid">
            {stats.map((stat) => (
              <Card key={stat.label} className={`stat-card ${stat.tintClass}`}>
                <div className="stat-card-head">
                  <span className="stat-icon">
                    <Icon name={stat.icon} size={18} />
                  </span>
                  <p className="muted">{stat.label}</p>
                </div>
                <p className="stat-value">{stat.value}</p>
              </Card>
            ))}
          </div>

          <Card>
            <div className="section-head">
              <h2>Latest Documents</h2>
              <Link to="/documents" className="table-action-link">
                View all
              </Link>
            </div>

            {latestDocuments.length === 0 ? (
              <EmptyState
                title="No documents yet"
                description="Upload your first document to start the approval workflow."
                action={
                  <Link to="/documents?upload=1" className="ui-button ui-button-primary ui-button-md">
                    <span className="ui-button-icon">
                      <Icon name="upload" size={16} />
                    </span>
                    <span>Upload document</span>
                  </Link>
                }
              />
            ) : (
              <ul className="simple-list">
                {latestDocuments.map((doc) => (
                  <li key={doc.id}>
                    <div>
                      <strong>{doc.title}</strong>
                      <small className="muted">{doc.documentType}</small>
                    </div>
                    <Badge tone={doc.status === "ACTIVE" ? "success" : "warning"}>
                      {doc.status.replace(/_/g, " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </section>
  );
}

export default DashboardPage;
