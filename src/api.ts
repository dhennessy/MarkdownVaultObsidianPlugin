import type {
  APIErrorSchema,
  CompleteUploadRequest,
  CreateUploadRequest,
  CreateUploadResponse,
  UploadPartsRequest,
  UploadPartsResponse,
  UploadStatusResponse,
  VaultAccessErrorSchema,
  VaultSchema,
} from "./types.js";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  vaultPassword?: string;
  apiKey?: string;
}

export class VaultApiClient {
  private readonly baseUrl: string;
  private readonly vaultPassword?: string;
  private readonly apiKey?: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://localhost:8000/v1").replace(/\/$/, "");
    this.vaultPassword = options.vaultPassword;
    this.apiKey = options.apiKey;
  }

  async getVault(vaultUuid: string): Promise<VaultSchema> {
    return this.requestJson<VaultSchema>({
      path: `/vaults/${encodeURIComponent(vaultUuid)}`,
      method: "GET",
    });
  }

  async createUpload(vaultUuid: string, requestBody: CreateUploadRequest): Promise<CreateUploadResponse> {
    return this.requestJson<CreateUploadResponse>({
      path: `/vaults/${encodeURIComponent(vaultUuid)}/uploads`,
      method: "POST",
      body: requestBody,
    });
  }

  async createUploadParts(
    vaultUuid: string,
    uploadUuid: string,
    requestBody: UploadPartsRequest,
  ): Promise<UploadPartsResponse> {
    return this.requestJson<UploadPartsResponse>({
      path: `/vaults/${encodeURIComponent(vaultUuid)}/uploads/${encodeURIComponent(uploadUuid)}/parts`,
      method: "POST",
      body: requestBody,
    });
  }

  async abandonUpload(
    vaultUuid: string,
    uploadUuid: string,
  ): Promise<UploadStatusResponse> {
    return this.requestJson<UploadStatusResponse>({
      path: `/vaults/${encodeURIComponent(vaultUuid)}/uploads/${encodeURIComponent(uploadUuid)}/abandon`,
      method: "POST",
    });
  }

  async completeUpload(
    vaultUuid: string,
    uploadUuid: string,
    requestBody: CompleteUploadRequest,
  ): Promise<UploadStatusResponse> {
    return this.requestJson<UploadStatusResponse>({
      path: `/vaults/${encodeURIComponent(vaultUuid)}/uploads/${encodeURIComponent(uploadUuid)}/complete`,
      method: "POST",
      body: requestBody,
    });
  }

  private async requestJson<T>(options: {
    path: string;
    method: "GET" | "POST";
    body?: unknown;
  }): Promise<T> {
    const headers = new Headers();
    if (this.vaultPassword) {
      headers.set("Vault-Password", this.vaultPassword);
    }
    if (this.apiKey) {
      headers.set("authorization", `Bearer ${this.apiKey}`);
      headers.set("x-api-key", this.apiKey);
    }

    let body: string | undefined;
    if (options.body !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${options.path}`, {
        method: options.method,
        headers,
        body,
      });
    } catch (error: unknown) {
      throw new Error(`Request failed: ${describeNetworkError(error)}`);
    }

    const parsedBody = await parseJson(response);
    if (!response.ok) {
      const detail = getErrorDetail(parsedBody);
      throw new ApiError(
        detail ? `Request failed: ${detail}` : `Request failed (${response.status})`,
        response.status,
        parsedBody,
      );
    }

    return parsedBody as T;
  }
}

function describeNetworkError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error && cause.message) {
    return `${error.message} (${cause.message})`;
  }

  return error.message;
}

function getErrorDetail(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const candidate = body as VaultAccessErrorSchema | APIErrorSchema;
  if (typeof candidate.detail !== "string") {
    return undefined;
  }

  return candidate.detail;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
