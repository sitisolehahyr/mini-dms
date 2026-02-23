import { PaginatedData } from "../types/api";
import { PermissionRequest, PermissionStatus } from "../types/dms";
import {
  listPermissionRequests as listPermissionRequestsApi,
  reviewPermissionRequest as reviewPermissionRequestApi,
} from "../api/permissionApi";
import { mapApiPermissionRequest, mapPaginated } from "./mappers";
import { mockApproveRequest, mockListRequests, mockRejectRequest } from "./mockStore";
import { runWithFallback } from "./dataSourceUtils";

export type ListRequestsInput = {
  status?: PermissionStatus;
  page?: number;
  pageSize?: number;
};

export async function listRequests(input: ListRequestsInput = {}): Promise<PaginatedData<PermissionRequest>> {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 10;
  const status = input.status;

  return runWithFallback(
    async () => {
      const response = await listPermissionRequestsApi(page, pageSize, status ?? "PENDING");
      return mapPaginated(response, mapApiPermissionRequest);
    },
    async () => mockListRequests({ status, page, pageSize }),
  );
}

export async function approveRequest(requestId: number): Promise<void> {
  return runWithFallback(
    async () => {
      await reviewPermissionRequestApi(requestId, "APPROVE");
    },
    async () => {
      mockApproveRequest(requestId);
    },
  );
}

export async function rejectRequest(requestId: number, note?: string): Promise<void> {
  return runWithFallback(
    async () => {
      await reviewPermissionRequestApi(requestId, "REJECT", note);
    },
    async () => {
      mockRejectRequest(requestId, note);
    },
  );
}
