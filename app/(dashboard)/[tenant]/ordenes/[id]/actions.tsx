"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ESTADOS_ORDEN } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  ordenId: string;
  estadoActual: string;
  tenantSlug: string;
  empleadoId: string;
  empleados: { id: string; nombre: string; apellido: string }[];
}

const TRANSICIONES: Record<string, string[]> = {
  RECIBIDO: ["DIAGNOSTICO", "CANCELADO"],
  DIAGNOSTICO: ["APROBADO", "CANCELADO"],
  APROBADO: ["EN_PROCESO", "EN_ESPERA", "CANCELADO"],
  EN_PROCESO: ["EN_ESPERA", "LISTO", "CANCELADO"],
  EN_ESPERA: ["EN_PROCESO", "CANCELADO"],
  LISTO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

export function OrdenActions({ ordenId, estadoActual, tenantSlug, empleadoId, empleados }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [nuevoEmpleado, setNuevoEmpleado] = useState(empleadoId);

  const siguientesEstados = TRANSICIONES[estadoActual] ?? [];

  async function cambiarEstado() {
    if (!nuevoEstado) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ordenes/${ordenId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Estado cambiado a: ${ESTADOS_ORDEN[nuevoEstado]?.label ?? nuevoEstado}`);
      router.refresh();
      setNuevoEstado("");
    } catch {
      toast.error("Error al cambiar estado");
    } finally {
      setLoading(false);
    }
  }

  async function asignarEmpleado() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ordenes/${ordenId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empleadoId: nuevoEmpleado || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Mecánico actualizado");
      router.refresh();
    } catch {
      toast.error("Error al asignar mecánico");
    } finally {
      setLoading(false);
    }
  }

  if (estadoActual === "ENTREGADO" || estadoActual === "CANCELADO") {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-gray-500 text-center">
            {estadoActual === "ENTREGADO" ? "Orden entregada" : "Orden cancelada"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Acciones</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {siguientesEstados.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Cambiar estado</Label>
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                {siguientesEstados.map((e) => (
                  <SelectItem key={e} value={e}>
                    {ESTADOS_ORDEN[e]?.label ?? e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={cambiarEstado} className="w-full" size="sm" disabled={!nuevoEstado || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar estado"}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Asignar mecánico</Label>
          <Select value={nuevoEmpleado} onValueChange={setNuevoEmpleado}>
            <SelectTrigger>
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin asignar</SelectItem>
              {empleados.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nombre} {e.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={asignarEmpleado} variant="outline" className="w-full" size="sm" disabled={loading}>
            Guardar asignación
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
