import { useEffect, useState } from "react";

import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Select from "../components/ui/Select";
import { approveRequest, listRequests, rejectRequest } from "../data/approvalDataSource";
import { useToast } from "../contexts/ToastContext";
import { PermissionRequest, PermissionStatus } from "../types/dms";
import { getErrorMessage } from "../utils/httpError";

function PermissionRequestsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<PermissionRequest[]>([]);
  const [status, setStatus] = useState<PermissionStatus>("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRequests({ status, page, pageSize: 10 });
      setItems(data.items);
      setTotalPages(data.meta.total_pages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [status, page]);

  const review = async (requestId: number, decision: "APPROVE" | "REJECT") => {
    setReviewingId(requestId);
    try {
      if (decision === "APPROVE") {
        await approveRequest(requestId);
      } else {
        await rejectRequest(requestId);
      }
      showToast({ type: "success", title: `Request ${decision === "APPROVE" ? "approved" : "rejected"}` });
      await loadData();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to review request");
      setError(message);
      showToast({ type: "error", title: "Review failed", description: message });
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <h1>Permission Requests</h1>
          <p className="muted">Review replacement and deletion workflows.</p>
        </div>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as PermissionStatus)}
          label="Status"
        >
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </Select>
      </div>

      {loading ? <LoadingState message="Loading requests..." /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No requests"
          description="There are no permission requests in this status right now."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <Card className="table-card" padded={false}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Document</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Requester</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((request) => (
                  <tr key={request.id} className="data-row">
                    <td>#{request.id}</td>
                    <td>{request.documentId ?? "Deleted"}</td>
                    <td>{request.action}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>{request.requesterEmail ?? `User #${request.requestedBy}`}</td>
                    <td>{new Date(request.requestedAt).toLocaleString()}</td>
                    <td>
                      {request.status === "PENDING" ? (
                        <div className="inline-actions">
                          <Button
                            size="sm"
                            onClick={() => review(request.id, "APPROVE")}
                            loading={reviewingId === request.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => review(request.id, "REJECT")}
                            loading={reviewingId === request.id}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="muted">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

export default PermissionRequestsPage;
