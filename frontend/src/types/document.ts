export type DocumentStatus = "ACTIVE" | "PENDING_DELETE" | "PENDING_REPLACE";

export type Document = {
  id: number;
  title: string;
  description: string;
  document_type: string;
  file_url: string;
  version: number;
  status: DocumentStatus;
  created_by: number;
  created_at: string;
};
