import { Notification } from "../types/dms";

const now = Date.now();

function hoursAgo(hours: number): string {
  return new Date(now - hours * 60 * 60 * 1000).toISOString();
}

export const mockNotifications: Notification[] = [
  {
    id: 901,
    userId: 2,
    type: "REQUEST_SUBMITTED",
    message: "Your replace request for Employee Onboarding SOP is pending review.",
    relatedEntityId: 701,
    isRead: false,
    createdAt: hoursAgo(4),
  },
  {
    id: 902,
    userId: 3,
    type: "REQUEST_SUBMITTED",
    message: "Your delete request for Office Lease Addendum is pending review.",
    relatedEntityId: 702,
    isRead: false,
    createdAt: hoursAgo(8),
  },
  {
    id: 903,
    userId: 2,
    type: "REQUEST_APPROVED",
    message: "Your replace request for Invoice Batch - 2026-01 was approved.",
    relatedEntityId: 703,
    isRead: true,
    createdAt: hoursAgo(26),
  },
  {
    id: 904,
    userId: 3,
    type: "REQUEST_REJECTED",
    message: "Your delete request for Security Incident Report was rejected.",
    relatedEntityId: 704,
    isRead: true,
    createdAt: hoursAgo(33),
  },
  {
    id: 905,
    userId: 1,
    type: "WORKFLOW_ALERT",
    message: "2 permission requests require admin review.",
    relatedEntityId: null,
    isRead: false,
    createdAt: hoursAgo(12),
  },
  {
    id: 906,
    userId: 2,
    type: "DOCUMENT_UPLOADED",
    message: "Vendor Contract 2026 was uploaded successfully.",
    relatedEntityId: 101,
    isRead: true,
    createdAt: hoursAgo(60),
  },
  {
    id: 907,
    userId: 3,
    type: "DOCUMENT_UPDATED",
    message: "Monthly Report - Jan metadata was updated.",
    relatedEntityId: 102,
    isRead: false,
    createdAt: hoursAgo(18),
  },
  {
    id: 908,
    userId: 1,
    type: "SYSTEM",
    message: "Document workflow demo dataset loaded in mock mode.",
    relatedEntityId: null,
    isRead: true,
    createdAt: hoursAgo(1),
  },
];
