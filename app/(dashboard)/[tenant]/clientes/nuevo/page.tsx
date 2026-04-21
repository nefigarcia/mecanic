"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NuevoClientePage() {
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", telefono: "", celular: "", direccion: "", ciudad: "", notas: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.telefono) {
      toast.error("Nombre, apellido y teléfono son requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenantSlug }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success("Cliente creado exitosamente");
      router.push(`/${tenantSlug}/clientes/${data.id}`);
    } catch {
      toast.error("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/${tenantSlug}/clientes`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Información personal</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="Juan" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Apellido *</Label>
              <Input placeholder="García" value={form.apellido} onChange={(e) => update("apellido", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono *</Label>
              <Input placeholder="333-123-4567" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Celular</Label>
              <Input placeholder="333-987-6543" value={form.celular} onChange={(e) => update("celular", e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Correo electrónico</Label>
              <Input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dirección</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Dirección</Label>
              <Input placeholder="Calle, número, colonia" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Ciudad</Label>
              <Input placeholder="Guadalajara, Jalisco" value={form.ciudad} onChange={(e) => update("ciudad", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardContent>
            <Textarea placeholder="Notas o información adicional..." value={form.notas} onChange={(e) => update("notas", e.target.value)} rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</> : "Crear cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
