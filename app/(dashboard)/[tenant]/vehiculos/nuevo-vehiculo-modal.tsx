"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export function NuevoVehiculoModal({ tenantId, tenantSlug, clientes }: { tenantId: string; tenantSlug: string; clientes: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ clienteId: "", marca: "", modelo: "", anio: "", color: "", placa: "", vin: "", kilometraje: "" });

  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenantId, anio: parseInt(form.anio), kilometraje: form.kilometraje ? parseInt(form.kilometraje) : null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Vehículo registrado");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al registrar vehículo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Nuevo vehículo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Registrar vehículo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Propietario *</Label>
            <Select value={form.clienteId} onValueChange={(v) => update("clienteId", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Marca *</Label>
              <Input placeholder="Toyota" value={form.marca} onChange={(e) => update("marca", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo *</Label>
              <Input placeholder="Corolla" value={form.modelo} onChange={(e) => update("modelo", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Año *</Label>
              <Input type="number" placeholder="2020" value={form.anio} onChange={(e) => update("anio", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input placeholder="Blanco" value={form.color} onChange={(e) => update("color", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Placa</Label>
              <Input placeholder="ABC-1234" value={form.placa} onChange={(e) => update("placa", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>VIN</Label>
              <Input placeholder="Número de serie" value={form.vin} onChange={(e) => update("vin", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Kilometraje</Label>
              <Input type="number" placeholder="45000" value={form.kilometraje} onChange={(e) => update("kilometraje", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={loading || !form.clienteId || !form.marca || !form.modelo || !form.anio}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
