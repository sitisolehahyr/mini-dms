export type PermissionAction = "REPLACE" | "DELETE";
export type PermissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PermissionRequest = {
  id: number;
  document_id: number | null;
  action: PermissionAction;
  requested_by: number;
  requester_email: string;
  requested_at: string;
  status: PermissionStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  note: string | null;
  payload: Record<string, unknown> | null;
};
