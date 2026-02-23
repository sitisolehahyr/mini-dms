import { PaginatedData } from "../types/api";
import { Document as ApiDocument } from "../types/document";
import { Notification as ApiNotification } from "../types/notification";
import { PermissionRequest as ApiPermissionRequest } from "../types/permission";
import {
  Document,
  Notification,
  PermissionRequest,
  PermissionRequestPayload,
} from "../types/dms";

export function mapApiDocument(item: ApiDocument): Document {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    documentType: item.document_type,
    fileUrl: item.file_url,
    version: item.version,
    status: item.status,
    createdBy: item.created_by,
    createdAt: item.created_at,
  };
}

export function mapApiPermissionRequest(item: ApiPermissionRequest): PermissionRequest {
  return {
    id: item.id,
    documentId: item.document_id,
    action: item.action,
    requestedBy: item.requested_by,
    requestedAt: item.requested_at,
    status: item.status,
    reviewedBy: item.reviewed_by,
    reviewedAt: item.reviewed_at,
    requesterEmail: item.requester_email,
    note: item.note ?? undefined,
    payload: (item.payload ?? undefined) as PermissionRequestPayload | undefined,
  };
}

export function mapApiNotification(item: ApiNotification): Notification {
  return {
    id: item.id,
    userId: item.user_id,
    type: item.type,
    message: item.message,
    relatedEntityId: item.related_entity_id,
    isRead: item.is_read,
    createdAt: item.created_at,
  };
}

export function mapPaginated<TSource, TTarget>(
  source: PaginatedData<TSource>,
  mapper: (item: TSource) => TTarget,
): PaginatedData<TTarget> {
  return {
    items: source.items.map(mapper),
    meta: source.meta,
  };
}
