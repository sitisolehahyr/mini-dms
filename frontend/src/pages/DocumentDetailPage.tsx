import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { downloadDocument, getDocument, requestDelete, requestReplace } from "../data/documentDataSource";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import Input from "../components/ui/Input";
import LoadingState from "../components/ui/LoadingState";
import TextArea from "../components/ui/TextArea";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Document } from "../types/dms";
import { getErrorMessage } from "../utils/httpError";

function DocumentDetailPage() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"replace" | "delete" | "download" | null>(null);

  const [replaceNote, setReplaceNote] = useState("");
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [deleteNote, setDeleteNote] = useState("");

  const loadDocument = async () => {
    if (!documentId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const doc = await getDocument(Number(documentId));
      setDocument(doc);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load document"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocument();
  }, [documentId]);

  const onReplace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!document || !replaceFile) {
      setActionError("Select a replacement file");
      return;
    }

    setActionLoading("replace");
    setActionError(null);
    try {
      await requestReplace(document.id, {
        expectedVersion: document.version,
        file: replaceFile,
        note: replaceNote || undefined,
      });
      showToast({ type: "success", title: "Replace request submitted" });
      await loadDocument();
      setReplaceNote("");
      setReplaceFile(null);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to request replace");
      setActionError(message);
      showToast({ type: "error", title: "Request failed", description: message });
    } finally {
      setActionLoading(null);
    }
  };

  const onDelete = async () => {
    if (!document) {
      return;
    }

    setActionLoading("delete");
    setActionError(null);
    try {
      await requestDelete(document.id, {
        expectedVersion: document.version,
        note: deleteNote || undefined,
      });
      showToast({ type: "success", title: "Delete request submitted" });
      await loadDocument();
      setDeleteNote("");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to request delete");
      setActionError(message);
      showToast({ type: "error", title: "Request failed", description: message });
    } finally {
      setActionLoading(null);
    }
  };

  const onDownload = async () => {
    if (!document) {
      return;
    }

    setActionLoading("download");
    setActionError(null);
    try {
      await downloadDocument(document.id, `${document.title}.bin`);
      showToast({ type: "success", title: "Download started" });
    } catch (err) {
      const message = getErrorMessage(err, "Failed to download document");
      setActionError(message);
      showToast({ type: "error", title: "Download failed", description: message });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading document..." />;
  }

  if (error || !document) {
    return (
      <EmptyState
        title="Document not found"
        description={error ?? "The document may have been deleted or you no longer have access."}
      />
    );
  }

  const canManage = user?.role === "ADMIN" || user?.id === document.createdBy;

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <h1>{document.title}</h1>
          <p className="muted">Version {document.version} • {document.documentType}</p>
        </div>
        <div className="header-actions">
          <StatusBadge status={document.status} />
          <Button
            variant="secondary"
            onClick={onDownload}
            loading={actionLoading === "download"}
            icon={<Icon name="documents" size={16} />}
          >
            Download
          </Button>
        </div>
      </div>

      <Card>
        <h2>Overview</h2>
        <p>{document.description}</p>
      </Card>

      {canManage && document.status === "ACTIVE" ? (
        <div className="two-col">
          <Card>
            <h2>Request Replace</h2>
            <form onSubmit={onReplace} className="stack-form">
              <label className="ui-file-drop">
                <input type="file" onChange={(event) => setReplaceFile(event.target.files?.[0] ?? null)} required className="sr-only" />
                <span className="ui-file-drop-icon">
                  <Icon name="upload" size={20} />
                </span>
                <div>
                  <strong>{replaceFile ? replaceFile.name : "Choose replacement file"}</strong>
                  <p className="muted">Upload the new file version for approval.</p>
                </div>
              </label>
              <TextArea
                label="Note"
                placeholder="Optional note for reviewer"
                value={replaceNote}
                onChange={(event) => setReplaceNote(event.target.value)}
              />
              <Button type="submit" loading={actionLoading === "replace"}>
                Submit replace request
              </Button>
            </form>
          </Card>

          <Card>
            <h2>Request Delete</h2>
            <div className="stack-form">
              <Input label="Current Version" value={`v${document.version}`} readOnly />
              <TextArea
                label="Note"
                placeholder="Optional reason for deletion"
                value={deleteNote}
                onChange={(event) => setDeleteNote(event.target.value)}
              />
              <Button variant="danger" onClick={onDelete} loading={actionLoading === "delete"}>
                Submit delete request
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {actionError ? <p className="error-text">{actionError}</p> : null}
    </section>
  );
}

export default DocumentDetailPage;
