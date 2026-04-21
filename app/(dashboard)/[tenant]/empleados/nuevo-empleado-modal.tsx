"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export function NuevoEmpleadoModal({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", telefono: "", puesto: "", especialidad: "" });

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenantId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Empleado agregado");
      setOpen(false);
      setForm({ nombre: "", apellido: "", email: "", telefono: "", puesto: "", especialidad: "" });
      router.refresh();
    } catch {
      toast.error("Error al crear empleado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Nuevo empleado</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nuevo empleado</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="Juan" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Apellido *</Label>
              <Input placeholder="García" value={form.apellido} onChange={(e) => update("apellido", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Puesto</Label>
              <Input placeholder="Mecánico, Recepcionista..." value={form.puesto} onChange={(e) => update("puesto", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Especialidad</Label>
              <Input placeholder="Motor, Frenos, Eléctrico..." value={form.especialidad} onChange={(e) => update("especialidad", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={loading || !form.nombre || !form.apellido}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear empleado"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
