import { useState, useEffect, useCallback, useRef } from "react";

interface Props {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex = 0, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preload next image
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % images.length;
    const img = new Image();
    img.src = images[nextIdx];
  }, [currentIndex, images]);

  // Reset loaded state on index change
  useEffect(() => {
    setLoaded(false);
  }, [currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    },
    [images.length, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-label="Visor de imágenes"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(0,0,0,0.5)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
        onClick={onClose}
        aria-label="Cerrar"
      >
        <svg
          width="20"
          height="20"
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

      {/* Previous button */}
      {images.length > 1 && (
        <button
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(0,0,0,0.5)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? images.length - 1 : prev - 1,
            )
          }
          aria-label="Anterior"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <img
        ref={imgRef}
        src={images[currentIndex]}
        alt={`Imagen ${currentIndex + 1} de ${images.length}`}
        onLoad={() => setLoaded(true)}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          objectFit: "contain",
          borderRadius: 8,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.25s ease",
          userSelect: "none",
        }}
      />

      {/* Loading placeholder */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.2)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(0,0,0,0.5)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === images.length - 1 ? 0 : prev + 1,
            )
          }
          aria-label="Siguiente"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Counter indicator */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 16px",
            borderRadius: 20,
          }}
        >
          {currentIndex + 1} de {images.length}
        </div>
      )}

      {/* Dots navigation */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
          }}
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              style={{
                width: idx === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background:
                  idx === currentIndex
                    ? "#fff"
                    : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: 0,
              }}
              aria-label={`Ir a imagen ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
