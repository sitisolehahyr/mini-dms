import { PaginatedData } from "../types/api";
import { Document, DocumentStatus } from "../types/dms";
import {
  downloadDocument as downloadDocumentApi,
  getDocument as getDocumentApi,
  listDocuments as listDocumentsApi,
  requestDelete as requestDeleteApi,
  requestReplace as requestReplaceApi,
  uploadDocument as uploadDocumentApi,
} from "../api/documentApi";
import { mapApiDocument, mapPaginated } from "./mappers";
import {
  mockCreateDeleteRequest,
  mockCreateReplaceRequest,
  mockGetDocument,
  mockListDocuments,
  mockUploadDocument,
} from "./mockStore";
import { runWithFallback } from "./dataSourceUtils";

export type ListDocumentsInput = {
  page: number;
  pageSize: number;
  q?: string;
  status?: DocumentStatus;
  type?: string;
};

export type UploadDocumentInput = {
  title: string;
  description: string;
  documentType: string;
  file?: File | null;
};

export type ReplaceRequestInput = {
  expectedVersion: number;
  file?: File | null;
  note?: string;
};

export type DeleteRequestInput = {
  expectedVersion: number;
  note?: string;
};

export async function listDocuments(input: ListDocumentsInput): Promise<PaginatedData<Document>> {
  return runWithFallback(
    async () => {
      const response = await listDocumentsApi({
        page: input.page,
        pageSize: input.pageSize,
        search: input.q,
        status: input.status,
        documentType: input.type,
      });

      return mapPaginated(response, mapApiDocument);
    },
    async () => mockListDocuments(input),
  );
}

export async function getDocument(documentId: number): Promise<Document> {
  return runWithFallback(
    async () => mapApiDocument(await getDocumentApi(documentId)),
    async () => mockGetDocument(documentId),
  );
}

export async function uploadDocument(payload: UploadDocumentInput): Promise<Document> {
  return runWithFallback(
    async () => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("document_type", payload.documentType);
      if (payload.file) {
        formData.append("file", payload.file);
      }

      return mapApiDocument(await uploadDocumentApi(formData));
    },
    async () =>
      mockUploadDocument({
        title: payload.title,
        description: payload.description,
        documentType: payload.documentType,
        fileName: payload.file?.name,
      }),
  );
}

export async function requestReplace(documentId: number, payload: ReplaceRequestInput): Promise<void> {
  return runWithFallback(
    async () => {
      if (!payload.file) {
        throw new Error("Replacement file is required");
      }
      await requestReplaceApi(documentId, payload.expectedVersion, payload.file, payload.note);
    },
    async () => {
      mockCreateReplaceRequest({
        documentId,
        expectedVersion: payload.expectedVersion,
        note: payload.note,
        fileName: payload.file?.name,
      });
    },
  );
}

export async function requestDelete(documentId: number, payload: DeleteRequestInput): Promise<void> {
  return runWithFallback(
    async () => {
      await requestDeleteApi(documentId, payload.expectedVersion, payload.note);
    },
    async () => {
      mockCreateDeleteRequest({
        documentId,
        expectedVersion: payload.expectedVersion,
        note: payload.note,
      });
    },
  );
}

export async function downloadDocument(documentId: number, filename: string): Promise<void> {
  return runWithFallback(
    async () => {
      await downloadDocumentApi(documentId, filename);
    },
    async () => {
      const mockDocument = mockGetDocument(documentId);
      const blob = new Blob([
        `Mock file for ${mockDocument.title}\n\nType: ${mockDocument.documentType}\nVersion: ${mockDocument.version}\n`,
      ]);

      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  );
}
