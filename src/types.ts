export interface VaultSchema {
  uuid: string;
  name: string;
  description: string | null;
  bundle_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaultAccessErrorSchema {
  detail: string;
  password_required?: boolean | null;
}

export interface APIErrorSchema {
  detail: string;
}

export interface CreateUploadRequest {
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export interface CreateUploadResponse {
  uploadUuid: string;
  status: string;
  partSize: number;
  maxParts: number;
}

export interface UploadPartUrlSchema {
  partNumber: number;
  url: string;
  expiresAt: string;
}

export interface UploadPartsRequest {
  partNumbers: number[];
}

export interface UploadPartsResponse {
  status: string;
  parts: UploadPartUrlSchema[];
}

export interface CompleteUploadPartSchema {
  partNumber: number;
  etag: string;
}

export interface CompleteUploadRequest {
  parts: CompleteUploadPartSchema[];
}

export interface UploadStatusResponse {
  status: string;
  detail?: string | null;
}
