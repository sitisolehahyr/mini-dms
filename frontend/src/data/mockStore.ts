import { PaginationMeta, PaginatedData } from "../types/api";
import {
  Document,
  DocumentStatus,
  Notification,
  PermissionRequest,
  PermissionRequestPayload,
  PermissionStatus,
  User,
} from "../types/dms";
import { mockDocuments } from "../mock/mockDocuments";
import { mockNotifications } from "../mock/mockNotifications";
import { mockPermissionRequests } from "../mock/mockPermissionRequests";
import { adminUser, mockUsers } from "../mock/mockUsers";

type MockListDocumentsParams = {
  page: number;
  pageSize: number;
  q?: string;
  status?: DocumentStatus;
  type?: string;
};

type MockListRequestsParams = {
  status?: PermissionStatus;
  page?: number;
  pageSize?: number;
};

type UploadDocumentInput = {
  title: string;
  description: string;
  documentType: string;
  createdBy?: number;
  fileName?: string;
};

type CreateReplaceRequestInput = {
  documentId: number;
  expectedVersion?: number;
  requestedBy?: number;
  note?: string;
  fileName?: string;
};

type CreateDeleteRequestInput = {
  documentId: number;
  expectedVersion?: number;
  requestedBy?: number;
  note?: string;
};

let documents: Document[] = mockDocuments.map((item) => ({ ...item }));
let permissionRequests: PermissionRequest[] = mockPermissionRequests.map((item) => ({ ...item }));
let notifications: Notification[] = mockNotifications.map((item) => ({ ...item }));

const usersById = new Map<number, User>(mockUsers.map((item) => [item.id, item]));

let nextDocumentId = Math.max(...documents.map((item) => item.id)) + 1;
let nextPermissionRequestId = Math.max(...permissionRequests.map((item) => item.id)) + 1;
let nextNotificationId = Math.max(...notifications.map((item) => item.id)) + 1;

function nowIso(): string {
  return new Date().toISOString();
}

function sortByNewest<T extends { createdAt?: string; requestedAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.createdAt ?? a.requestedAt ?? nowIso()).getTime();
    const bDate = new Date(b.createdAt ?? b.requestedAt ?? nowIso()).getTime();
    return bDate - aDate;
  });
}

function paginate<T>(items: T[], page = 1, pageSize = 10): PaginatedData<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const meta: PaginationMeta = {
    page: currentPage,
    page_size: pageSize,
    total,
    total_pages: totalPages,
  };

  return {
    items: pageItems,
    meta,
  };
}

function getDocumentOrThrow(documentId: number): Document {
  const item = documents.find((doc) => doc.id === documentId);
  if (!item) {
    throw new Error("Document not found");
  }
  return item;
}

function getUserEmail(userId: number): string {
  return usersById.get(userId)?.email ?? `user${userId}@example.com`;
}

function pushNotification(input: Omit<Notification, "id" | "createdAt" | "isRead"> & { isRead?: boolean }): Notification {
  const created: Notification = {
    id: nextNotificationId,
    createdAt: nowIso(),
    isRead: input.isRead ?? false,
    ...input,
  };
  nextNotificationId += 1;
  notifications.unshift(created);
  return { ...created };
}

function markDocumentPendingStatus(documentId: number, status: DocumentStatus): void {
  documents = documents.map((doc) => (doc.id === documentId ? { ...doc, status } : doc));
}

export function mockListDocuments(params: MockListDocumentsParams): PaginatedData<Document> {
  const q = (params.q ?? "").trim().toLowerCase();
  const typeFilter = (params.type ?? "").trim().toLowerCase();

  let filtered = [...documents];

  if (q) {
    filtered = filtered.filter((doc) => {
      const haystack = `${doc.title} ${doc.description}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  if (params.status) {
    filtered = filtered.filter((doc) => doc.status === params.status);
  }

  if (typeFilter) {
    filtered = filtered.filter((doc) => doc.documentType.toLowerCase().includes(typeFilter));
  }

  return paginate(sortByNewest(filtered), params.page, params.pageSize);
}

export function mockGetDocument(documentId: number): Document {
  return { ...getDocumentOrThrow(documentId) };
}

export function mockUploadDocument(input: UploadDocumentInput): Document {
  const created: Document = {
    id: nextDocumentId,
    title: input.title,
    description: input.description,
    documentType: input.documentType,
    fileUrl: input.fileName ? `mock://uploads/${input.fileName}` : `mock://uploads/document-${nextDocumentId}.pdf`,
    version: 1,
    status: "ACTIVE",
    createdBy: input.createdBy ?? adminUser.id,
    createdAt: nowIso(),
  };

  nextDocumentId += 1;
  documents.unshift(created);

  pushNotification({
    userId: created.createdBy,
    type: "DOCUMENT_UPLOADED",
    message: `${created.title} was uploaded successfully.`,
    relatedEntityId: created.id,
  });

  return { ...created };
}

export function mockCreateReplaceRequest(input: CreateReplaceRequestInput): PermissionRequest {
  const document = getDocumentOrThrow(input.documentId);
  if (typeof input.expectedVersion === "number" && input.expectedVersion !== document.version) {
    throw new Error("Version conflict while creating replace request");
  }

  markDocumentPendingStatus(document.id, "PENDING_REPLACE");

  const payload: PermissionRequestPayload = {
    newTitle: document.title,
    newDescription: document.description,
    newFileUrl: input.fileName ? `mock://pending/${input.fileName}` : `${document.fileUrl}?pending=${Date.now()}`,
  };

  const created: PermissionRequest = {
    id: nextPermissionRequestId,
    documentId: document.id,
    action: "REPLACE",
    requestedBy: input.requestedBy ?? adminUser.id,
    requesterEmail: getUserEmail(input.requestedBy ?? adminUser.id),
    requestedAt: nowIso(),
    status: "PENDING",
    reviewedBy: null,
    reviewedAt: null,
    note: input.note,
    payload,
  };

  nextPermissionRequestId += 1;
  permissionRequests.unshift(created);

  pushNotification({
    userId: adminUser.id,
    type: "WORKFLOW_ALERT",
    message: `New replace request submitted for ${document.title}.`,
    relatedEntityId: created.id,
  });

  return { ...created };
}

export function mockCreateDeleteRequest(input: CreateDeleteRequestInput): PermissionRequest {
  const document = getDocumentOrThrow(input.documentId);
  if (typeof input.expectedVersion === "number" && input.expectedVersion !== document.version) {
    throw new Error("Version conflict while creating delete request");
  }

  markDocumentPendingStatus(document.id, "PENDING_DELETE");

  const created: PermissionRequest = {
    id: nextPermissionRequestId,
    documentId: document.id,
    action: "DELETE",
    requestedBy: input.requestedBy ?? adminUser.id,
    requesterEmail: getUserEmail(input.requestedBy ?? adminUser.id),
    requestedAt: nowIso(),
    status: "PENDING",
    reviewedBy: null,
    reviewedAt: null,
    note: input.note,
  };

  nextPermissionRequestId += 1;
  permissionRequests.unshift(created);

  pushNotification({
    userId: adminUser.id,
    type: "WORKFLOW_ALERT",
    message: `New delete request submitted for ${document.title}.`,
    relatedEntityId: created.id,
  });

  return { ...created };
}

export function mockListRequests(params: MockListRequestsParams): PaginatedData<PermissionRequest> {
  const statusFilter = params.status;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  let filtered = [...permissionRequests];
  if (statusFilter) {
    filtered = filtered.filter((item) => item.status === statusFilter);
  }

  filtered = filtered
    .map((item) => ({
      ...item,
      requesterEmail: item.requesterEmail ?? getUserEmail(item.requestedBy),
    }))
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  return paginate(filtered, page, pageSize);
}

export function mockApproveRequest(requestId: number): PermissionRequest {
  const target = permissionRequests.find((item) => item.id === requestId);
  if (!target) {
    throw new Error("Request not found");
  }

  if (target.status !== "PENDING") {
    return { ...target };
  }

  const reviewedAt = nowIso();
  target.status = "APPROVED";
  target.reviewedBy = adminUser.id;
  target.reviewedAt = reviewedAt;

  if (target.documentId !== null) {
    const doc = documents.find((item) => item.id === target.documentId);

    if (doc) {
      if (target.action === "DELETE") {
        documents = documents.filter((item) => item.id !== doc.id);
      } else {
        doc.version += 1;
        doc.status = "ACTIVE";
        if (target.payload?.newTitle) {
          doc.title = target.payload.newTitle;
        }
        if (target.payload?.newDescription) {
          doc.description = target.payload.newDescription;
        }
        if (target.payload?.newFileUrl) {
          doc.fileUrl = target.payload.newFileUrl;
        }
      }

      pushNotification({
        userId: target.requestedBy,
        type: "REQUEST_APPROVED",
        message:
          target.action === "DELETE"
            ? `Your delete request for ${doc.title} was approved.`
            : `Your replace request for ${doc.title} was approved.`,
        relatedEntityId: target.id,
      });
    }
  }

  return { ...target };
}

export function mockRejectRequest(requestId: number, note?: string): PermissionRequest {
  const target = permissionRequests.find((item) => item.id === requestId);
  if (!target) {
    throw new Error("Request not found");
  }

  if (target.status !== "PENDING") {
    return { ...target };
  }

  target.status = "REJECTED";
  target.reviewedBy = adminUser.id;
  target.reviewedAt = nowIso();
  if (note) {
    target.note = note;
  }

  if (target.documentId !== null) {
    const doc = documents.find((item) => item.id === target.documentId);
    if (doc) {
      doc.status = "ACTIVE";

      pushNotification({
        userId: target.requestedBy,
        type: "REQUEST_REJECTED",
        message:
          target.action === "DELETE"
            ? `Your delete request for ${doc.title} was rejected.`
            : `Your replace request for ${doc.title} was rejected.`,
        relatedEntityId: target.id,
      });
    }
  }

  return { ...target };
}

export function mockListNotifications(page = 1, pageSize = 20): PaginatedData<Notification> {
  return paginate(sortByNewest(notifications), page, pageSize);
}

export function mockMarkNotificationAsRead(notificationId: number): void {
  notifications = notifications.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item));
}

export function mockMarkAllNotificationsAsRead(): number {
  let updated = 0;
  notifications = notifications.map((item) => {
    if (item.isRead) {
      return item;
    }

    updated += 1;
    return { ...item, isRead: true };
  });

  return updated;
}

export function mockListUsers(): User[] {
  return mockUsers.map((item) => ({ ...item }));
}
