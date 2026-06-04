"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, AlertCircle, CheckCircle2, Upload, ImageIcon } from "lucide-react";

const YAPE_QR_URL = process.env.NEXT_PUBLIC_YAPE_QR_URL || "/images/yape-qr.png";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: datos, 2: pago, 3: éxito
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [captureFile, setCaptureFile] = useState<File | null>(null);
  const [capturePreview, setCapturePreview] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten imágenes");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar 5MB");
        return;
      }
      setCaptureFile(file);
      setCapturePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      // Paso 1: Crear usuario
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setUserId(data.userId);
        setStep(2); // Ir al paso de pago
      } else {
        setError(data.message || "Error al registrarse");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!captureFile) {
      setError("Debes subir la captura del pago");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload image
      const uploadFormData = new FormData();
      uploadFormData.append("file", captureFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir la imagen");
      }

      const uploadData = await uploadRes.json();
      const captureUrl = uploadData.url;

      // Create payment record linked to participant
      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, captureUrl }),
      });

      if (!paymentRes.ok) {
        const errData = await paymentRes.json();
        throw new Error(errData.message || "Error al registrar el pago");
      }

      setStep(3);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success || step === 3) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="bg-green-100 p-4 rounded-full mb-6 mx-auto w-fit">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">¡Registro exitoso!</h2>
          <p className="mt-4 text-gray-600">
            Tu cuenta ha sido creada y tu pago está en revisión. Serás redirigido al login en unos segundos...
          </p>
          <Link
            href="/login"
            className="mt-8 block w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            Ir al login ahora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 1 ? "Crear Cuenta" : "Pagar Inscripción"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1
              ? "Únete a la Polla Deportiva y compite por el gran pozo"
              : "Escanea el QR de Yape y sube tu comprobante"}
          </p>

          {/* Step indicator */}
          <div className="flex items-center space-x-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`w-8 h-0.5 ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {step === 1 && (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                <input id="name" name="name" type="text" required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input id="email" name="email" type="email" required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input id="phone" name="phone" type="tel" required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input id="password" name="password" type="password" required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors mt-6">
              {loading ? "Registrando..." : "Crear mi cuenta"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-6">
            {/* QR Yape */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="font-bold text-gray-900 mb-4">Paga con Yape</h3>
              <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                {YAPE_QR_URL ? (
                  <img
                    src={YAPE_QR_URL}
                    alt="QR Yape"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `
                        <div class="text-center p-4">
                          <p class="text-3xl mb-2">📱</p>
                          <p class="text-sm text-gray-500">Yape QR</p>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-3xl mb-2">📱</p>
                    <p className="text-sm text-gray-500">Escanea con Yape</p>
                    <p className="text-xs text-gray-400 mt-1">Configura NEXT_PUBLIC_YAPE_QR_URL</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Número: <strong>999 999 999</strong>
              </p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                S/ {process.env.NEXT_PUBLIC_ENTRY_FEE || "5.00"}
              </p>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sube la captura de tu pago
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => document.getElementById("capture-upload")?.click()}
              >
                {capturePreview ? (
                  <div className="relative">
                    <img src={capturePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCaptureFile(null);
                        setCapturePreview("");
                      }}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Haz clic para seleccionar la imagen</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP • Máx 5MB</p>
                  </div>
                )}
              </div>
              <input
                id="capture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button onClick={handlePaymentSubmit} disabled={loading || !captureFile}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors">
              {loading ? "Subiendo..." : "Enviar comprobante"}
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
