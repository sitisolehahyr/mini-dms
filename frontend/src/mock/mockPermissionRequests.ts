import { PermissionRequest } from "../types/dms";

const now = Date.now();

function daysAgo(days: number, hour = 11): string {
  return new Date(now - days * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000).toISOString();
}

export const mockPermissionRequests: PermissionRequest[] = [
  {
    id: 701,
    documentId: 103,
    action: "REPLACE",
    requestedBy: 2,
    requestedAt: daysAgo(1, 9),
    status: "PENDING",
    reviewedBy: null,
    reviewedAt: null,
    note: "Need to update owner matrix and onboarding sequence.",
    payload: {
      newTitle: "Employee Onboarding SOP",
      newDescription: "Updated onboarding process with revised manager approvals.",
      newFileUrl: "mock://pending/employee-onboarding-sop-v5.pdf",
    },
  },
  {
    id: 702,
    documentId: 107,
    action: "DELETE",
    requestedBy: 3,
    requestedAt: daysAgo(2, 15),
    status: "PENDING",
    reviewedBy: null,
    reviewedAt: null,
    note: "Lease addendum was superseded by a newer consolidated contract.",
  },
  {
    id: 703,
    documentId: 105,
    action: "REPLACE",
    requestedBy: 2,
    requestedAt: daysAgo(9, 13),
    status: "APPROVED",
    reviewedBy: 1,
    reviewedAt: daysAgo(8, 10),
    note: "Corrected invoice references and payment terms.",
    payload: {
      newTitle: "Invoice Batch - 2026-01",
      newDescription: "Finalized invoice packet with corrected references.",
      newFileUrl: "mock://docs/invoice-batch-2026-01-v2.pdf",
    },
  },
  {
    id: 704,
    documentId: 106,
    action: "DELETE",
    requestedBy: 3,
    requestedAt: daysAgo(13, 11),
    status: "REJECTED",
    reviewedBy: 1,
    reviewedAt: daysAgo(12, 14),
    note: "Retention period not reached. Keep document active.",
  },
];
