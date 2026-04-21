"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  tenantSlug: string;
  clientes: any[];
  empleados: any[];
}

export function NuevaCitaModal({ tenantId, tenantSlug, clientes, empleados }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [vehiculoId, setVehiculoId] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  const clienteSel = clientes.find((c) => c.id === clienteId);
  const vehiculos = clienteSel?.vehiculos ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !vehiculoId || !titulo || !inicio || !fin) {
      toast.error("Completa todos los campos requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          clienteId,
          vehiculoId,
          empleadoId: empleadoId || null,
          titulo,
          descripcion,
          inicio,
          fin,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Cita agendada");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al crear cita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> Nueva cita</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Agendar nueva cita</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input placeholder="Ej: Cambio de aceite, Afinación..." value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Cliente *</Label>
            <Select value={clienteId} onValueChange={(v) => { setClienteId(v); setVehiculoId(""); }}>
              <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {clienteId && (
            <div className="space-y-1.5">
              <Label>Vehículo *</Label>
              <Select value={vehiculoId} onValueChange={setVehiculoId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar vehículo..." /></SelectTrigger>
                <SelectContent>
                  {vehiculos.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>{v.marca} {v.modelo} {v.anio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Mecánico</Label>
            <Select value={empleadoId} onValueChange={setEmpleadoId}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent>
                {empleados.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nombre} {e.apellido}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Inicio *</Label>
              <Input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Fin *</Label>
              <Input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea placeholder="Descripción del servicio..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agendar cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
