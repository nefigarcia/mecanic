"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Tenant {
  id: string;
  slug: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  codigoPostal: string | null;
  rfc: string | null;
  plan: string;
}

export function ConfiguracionForm({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: tenant.nombre,
    email: tenant.email || "",
    telefono: tenant.telefono || "",
    direccion: tenant.direccion || "",
    ciudad: tenant.ciudad || "",
    estado: tenant.estado || "",
    codigoPostal: tenant.codigoPostal || "",
    rfc: tenant.rfc || "",
  });

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Configuración guardada");
      router.refresh();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Información del taller</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nombre del taller</Label>
            <Input value={form.nombre} onChange={(e) => update("nombre", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>RFC</Label>
            <Input placeholder="XAXX010101000" value={form.rfc} onChange={(e) => update("rfc", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={(e) => update("direccion", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Ciudad</Label>
            <Input value={form.ciudad} onChange={(e) => update("ciudad", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Input placeholder="Jalisco" value={form.estado} onChange={(e) => update("estado", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Código postal</Label>
            <Input placeholder="44100" value={form.codigoPostal} onChange={(e) => update("codigoPostal", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Plan actual</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 capitalize">{tenant.plan.toLowerCase()}</p>
              <p className="text-sm text-gray-500">Tu plan actual</p>
            </div>
            <Button type="button" variant="outline">Mejorar plan</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
