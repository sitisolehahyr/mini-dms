import api from "./client";
import { ApiSuccess, PaginatedData } from "../types/api";
import { PermissionRequest } from "../types/permission";

export const listPermissionRequests = async (
  page = 1,
  pageSize = 10,
  status = "PENDING",
): Promise<PaginatedData<PermissionRequest>> => {
  const { data } = await api.get<ApiSuccess<PaginatedData<PermissionRequest>>>("/permission-requests", {
    params: { page, page_size: pageSize, status },
  });
  return data.data;
};

export const reviewPermissionRequest = async (
  requestId: number,
  decision: "APPROVE" | "REJECT",
  note?: string,
): Promise<void> => {
  await api.post(`/permission-requests/${requestId}/review`, {
    decision,
    note,
  });
};
