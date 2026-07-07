/**
 * object-storage — Cloudinary facade para MiDistrito.
 *
 * Abstrae la subida y gestión de archivos (imágenes, documentos)
 * detrás de una interfaz simple. Actualmente implementa Cloudinary.
 */

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: string;
}

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface ObjectStorageProvider {
  upload(
    file: string | Buffer | File,
    options?: UploadOptions,
  ): Promise<UploadResult>;
  delete(publicId: string): Promise<boolean>;
  getUrl(publicId: string, transformation?: string): string;
}

// ── Cloudinary Provider ────────────────────────────────────────────────────

interface CloudinaryResponse {
  secure_url: string;
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryStorage implements ObjectStorageProvider {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    this.apiKey = process.env.CLOUDINARY_API_KEY || "";
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || "";
    this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      console.warn(
        "[object-storage] Cloudinary not configured. Set CLOUDINARY_* env vars.",
      );
    }
  }

  async upload(
    file: string | Buffer | File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file as Blob);
    formData.append("upload_preset", "ml_default");

    if (options.folder) formData.append("folder", options.folder);
    if (options.publicId) formData.append("public_id", options.publicId);

    const response = await fetch(`${this.baseUrl}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Cloudinary upload failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as CloudinaryResponse;

    return {
      url: data.url,
      secureUrl: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    };
  }

  async delete(publicId: string): Promise<boolean> {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = await this.generateSignature(
      `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`,
    );

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", this.apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const response = await fetch(`${this.baseUrl}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    return response.ok;
  }

  getUrl(publicId: string, transformation?: string): string {
    const base = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    if (transformation) {
      return `${base}/${transformation}/${publicId}`;
    }
    return `${base}/${publicId}`;
  }

  private async generateSignature(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-1",
      encoder.encode(data),
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}

// ── Factory ────────────────────────────────────────────────────────────────

let _instance: ObjectStorageProvider | null = null;

export function getStorage(): ObjectStorageProvider {
  if (!_instance) {
    _instance = new CloudinaryStorage();
  }
  return _instance;
}

export function setStorage(provider: ObjectStorageProvider): void {
  _instance = provider;
}
