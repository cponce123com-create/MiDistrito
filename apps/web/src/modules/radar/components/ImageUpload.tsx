import { useState, useRef, type ChangeEvent } from "react";

interface Props {
  onImageSelect: (file: File | null) => void;
  currentUrl?: string | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUpload({ onImageSelect, currentUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    setError(null);

    if (!file) {
      setPreview(null);
      onImageSelect(null);
      return;
    }

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Solo se aceptan imágenes .jpg, .png y .webp.");
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      setError("La imagen no debe superar los 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--md-muted)",
        }}
      >
        Foto (opcional)
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Upload button */}
        <button
          type="button"
          className="btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 44,
            padding: "0 16px",
          }}
          onClick={() => inputRef.current?.click()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          {preview ? "Cambiar foto" : "Agregar foto"}
        </button>

        {/* Preview */}
        {preview && (
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              borderRadius: 12,
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid var(--md-border)",
            }}
          >
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Eliminar foto"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {/* Error message */}
      {error && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--md-danger)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
