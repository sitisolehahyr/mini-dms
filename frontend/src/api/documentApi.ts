import api from "./client";
import { ApiSuccess, PaginatedData } from "../types/api";
import { Document } from "../types/document";

export type ListDocsParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  documentType?: string;
};

export const listDocuments = async (params: ListDocsParams): Promise<PaginatedData<Document>> => {
  const { data } = await api.get<ApiSuccess<PaginatedData<Document>>>("/documents", {
    params: {
      page: params.page,
      page_size: params.pageSize,
      search: params.search || undefined,
      status: params.status || undefined,
      document_type: params.documentType || undefined,
    },
  });
  return data.data;
};

export const uploadDocument = async (formData: FormData): Promise<Document> => {
  const { data } = await api.post<ApiSuccess<Document>>("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const getDocument = async (documentId: number): Promise<Document> => {
  const { data } = await api.get<ApiSuccess<Document>>(`/documents/${documentId}`);
  return data.data;
};

export const requestReplace = async (
  documentId: number,
  expectedVersion: number,
  file: File,
  note?: string,
): Promise<void> => {
  const formData = new FormData();
  formData.append("expected_version", String(expectedVersion));
  formData.append("file", file);
  if (note) {
    formData.append("note", note);
  }

  await api.post(`/documents/${documentId}/replace-request`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const requestDelete = async (documentId: number, expectedVersion: number, note?: string): Promise<void> => {
  await api.post(`/documents/${documentId}/delete-request`, {
    expected_version: expectedVersion,
    note,
  });
};

export const downloadDocument = async (documentId: number, filename: string): Promise<void> => {
  const response = await api.get(`/documents/${documentId}/download`, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
};
