"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const pasos = ["Datos del taller", "Tu cuenta", "¡Listo!"];

export default function RegistroPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombreTaller: "",
    ciudad: "",
    telefono: "",
    nombre: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (form.password !== form.passwordConfirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreTaller: form.nombreTaller,
          ciudad: form.ciudad,
          telefono: form.telefono,
          nombre: form.nombre,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar");
      }

      setPaso(2);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrar";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (paso === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Taller registrado!</h1>
          <p className="text-gray-500 mb-8">
            Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y comenzar a gestionar tu taller.
          </p>
          <Button onClick={() => router.push("/login")} size="lg">
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">MecánicaPro</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Registra tu taller</h1>
          <p className="text-gray-500 mt-1 text-sm">30 días gratis, sin tarjeta de crédito</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {pasos.slice(0, 2).map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= paso ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === paso ? "text-gray-900 font-medium" : "text-gray-400"}`}>{p}</span>
              {i < 1 && <div className={`w-8 h-0.5 ${i < paso ? "bg-indigo-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {paso === 0 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label>Nombre del taller *</Label>
                <Input
                  placeholder="Ej: Taller García Automotriz"
                  value={form.nombreTaller}
                  onChange={(e) => update("nombreTaller", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ciudad</Label>
                <Input
                  placeholder="Ej: Guadalajara, Jalisco"
                  value={form.ciudad}
                  onChange={(e) => update("ciudad", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input
                  placeholder="Ej: 333-123-4567"
                  value={form.telefono}
                  onChange={(e) => update("telefono", e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => setPaso(1)}
                disabled={!form.nombreTaller}
              >
                Siguiente
              </Button>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label>Tu nombre *</Label>
                <Input
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Correo electrónico *</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Contraseña *</Label>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirmar contraseña *</Label>
                <Input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={form.passwordConfirm}
                  onChange={(e) => update("passwordConfirm", e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setPaso(0)}>
                  Atrás
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={loading || !form.nombre || !form.email || !form.password}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
