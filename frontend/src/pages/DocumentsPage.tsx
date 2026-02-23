import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DocumentTable from "../components/DocumentTable";
import Pagination from "../components/Pagination";
import UploadModal from "../components/UploadModal";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import Input from "../components/ui/Input";
import LoadingState from "../components/ui/LoadingState";
import Select from "../components/ui/Select";
import { listDocuments } from "../data/documentDataSource";
import { Document, DocumentStatus } from "../types/dms";
import { getErrorMessage } from "../utils/httpError";

function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DocumentStatus | "">("");
  const [documentType, setDocumentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const loadDocuments = async (targetPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocuments({
        page: targetPage,
        pageSize,
        q: search || undefined,
        status: status || undefined,
        type: documentType || undefined,
      });
      setDocuments(data.items);
      setTotalPages(data.meta.total_pages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load documents"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments(page);
  }, [page]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("upload") === "1") {
      setShowUploadModal(true);
      navigate("/documents", { replace: true });
    }
  }, [location.search, navigate]);

  const applyFilters = () => {
    if (page !== 1) {
      setPage(1);
      return;
    }
    void loadDocuments(1);
  };

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="muted">Search, filter, and manage your document library.</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} icon={<Icon name="upload" size={16} />}>
          Upload document
        </Button>
      </div>

      <Card>
        <div className="filters">
          <Input
            label="Search"
            placeholder="Search by title or description"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as DocumentStatus | "")}> 
            <option value="">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING_REPLACE">PENDING REPLACE</option>
            <option value="PENDING_DELETE">PENDING DELETE</option>
          </Select>
          <Input
            label="Document Type"
            placeholder="e.g. Contract"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
          />
          <div className="filter-actions">
            <Button onClick={applyFilters} icon={<Icon name="search" size={16} />}>
              Apply filters
            </Button>
          </div>
        </div>
      </Card>

      {loading ? <LoadingState message="Loading documents..." /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && documents.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Try different filters or upload a new document to get started."
          action={
            <Button onClick={() => setShowUploadModal(true)} icon={<Icon name="upload" size={16} />}>
              Upload document
            </Button>
          }
        />
      ) : null}

      {!loading && !error && documents.length > 0 ? (
        <>
          <DocumentTable documents={documents} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : null}

      {showUploadModal ? (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => {
            setPage(1);
            void loadDocuments(1);
          }}
        />
      ) : null}
    </section>
  );
}

export default DocumentsPage;
