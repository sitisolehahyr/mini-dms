export type UserRole = "ADMIN" | "USER";

export type DocumentStatus = "ACTIVE" | "PENDING_DELETE" | "PENDING_REPLACE";

export type PermissionAction = "REPLACE" | "DELETE";

export type PermissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  documentType: string;
  fileUrl: string;
  version: number;
  status: DocumentStatus;
  createdBy: number;
  createdAt: string;
}

export interface PermissionRequestPayload {
  newTitle?: string;
  newDescription?: string;
  newFileUrl?: string;
}

export interface PermissionRequest {
  id: number;
  documentId: number | null;
  action: PermissionAction;
  requestedBy: number;
  requesterEmail?: string;
  requestedAt: string;
  status: PermissionStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  note?: string;
  payload?: PermissionRequestPayload;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  relatedEntityId: number | null;
  isRead: boolean;
  createdAt: string;
}
