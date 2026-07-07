/**
 * storage.ts — Subida firmada a Cloudinary para el módulo Radar.
 *
 * - POST /upload → genera URL firmada para upload directo (resource_type=image)
 *
 * Solo usuarios autenticados. Formatos: jpg/png/webp. Máx 10MB.
 */
import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";
import { requireAuth } from "../../../../apps/api/src/core/auth";

const router: IRouter = Router();

// ── Configuración ───────────────────────────────────────────────────────────
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_FORMATS = ["jpg", "png", "webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function getFormatFromContentType(contentType: string): string | null {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[contentType] ?? null;
}

/**
 * POST /upload — Genera credenciales firmadas para upload directo a Cloudinary.
 *
 * El cliente debe enviar posteriormente multipart/form-data a uploadURL con:
 *   file: <el archivo>
 *   api_key: <apiKey>
 *   timestamp: <timestamp>
 *   signature: <signature>
 *   folder: "radarvecinal"
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { name, size, contentType } = req.body as {
    name?: string;
    size?: number;
    contentType?: string;
  };

  if (!name || !size || !contentType) {
    res.status(400).json({ error: "Faltan campos requeridos: name, size, contentType." });
    return;
  }

  // Validar tipo de contenido
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    res.status(400).json({
      error: `Tipo de archivo no permitido: "${contentType}". Solo se aceptan: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
    });
    return;
  }

  // Validar tamaño
  if (size > MAX_FILE_SIZE_BYTES) {
    res.status(400).json({
      error: `Archivo demasiado grande (${(size / 1024 / 1024).toFixed(1)}MB). Máximo: 10MB.`,
    });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  if (!cloudName || !apiKey || !apiSecret) {
    req.log.error("[storage] Cloudinary no configurado");
    res.status(500).json({ error: "Servicio de almacenamiento no disponible." });
    return;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "radarvecinal";
    const format = getFormatFromContentType(contentType);

    // Firmar parámetros
    const params: Record<string, string> = {
      timestamp: String(timestamp),
      folder,
    };
    if (format) {
      params.allowed_formats = format;
    }

    // Ordenar alfabéticamente y concatenar
    const signatureStr =
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&") + apiSecret;

    const signature = crypto
      .createHash("sha1")
      .update(signatureStr)
      .digest("hex");

    const uploadURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    res.json({
      uploadURL,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      objectPath: `/pending/${Date.now()}-${name}`,
      metadata: { name, size, contentType },
    });
  } catch (error) {
    req.log.error({ err: error }, "Error generando URL de upload Cloudinary");
    res.status(500).json({ error: "Error al generar URL de subida." });
  }
});

export default router;
