import { FormEvent, useState } from "react";

import { uploadDocument } from "../data/documentDataSource";
import { useToast } from "../contexts/ToastContext";
import { getErrorMessage } from "../utils/httpError";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import TextArea from "./ui/TextArea";

type UploadModalProps = {
  onClose: () => void;
  onUploaded: () => void;
};

function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fileError = submitted && !file ? "Please select a file" : null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (!file) {
      setError("Please select a file");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await uploadDocument({
        title,
        description,
        documentType,
        file,
      });
      onUploaded();
      showToast({ type: "success", title: "Document uploaded", description: `${title} is now available.` });
      onClose();
    } catch (err) {
      const message = getErrorMessage(err, "Upload failed");
      setError(message);
      showToast({ type: "error", title: "Upload failed", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Upload Document" subtitle="Add metadata and attach a document file" onClose={onClose}>
      <form onSubmit={onSubmit} className="stack-form">
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <TextArea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
        <Input
          label="Document Type"
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
          placeholder="e.g. Contract, Policy, Invoice"
          required
        />

        <label className={["ui-file-drop", fileError ? "is-error" : ""].filter(Boolean).join(" ")}>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
            className="sr-only"
            aria-invalid={Boolean(fileError)}
          />
          <span className="ui-file-drop-icon">
            <Icon name="upload" size={20} />
          </span>
          <div>
            <strong>{file ? file.name : "Drop a file here or click to browse"}</strong>
            <p className="muted">Supports any file type up to your API limit</p>
          </div>
        </label>

        {fileError ? <p className="error-text">{fileError}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Upload document
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UploadModal;
