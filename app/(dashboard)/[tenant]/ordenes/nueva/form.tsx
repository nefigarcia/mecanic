"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface ItemOrden {
  tipo: "SERVICIO" | "PARTE" | "OTRO";
  descripcion: string;
  cantidad: number;
  precioUnit: number;
  servicioId?: string;
  parteId?: string;
}

interface Props {
  tenantSlug: string;
  tenantId: string;
  clientes: any[];
  empleados: any[];
  servicios: any[];
  partes: any[];
}

export function NuevaOrdenForm({ tenantSlug, tenantId, clientes, empleados, servicios, partes }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [clienteId, setClienteId] = useState("");
  const [vehiculoId, setVehiculoId] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [prioridad, setPrioridad] = useState("NORMAL");
  const [descripcion, setDescripcion] = useState("");
  const [notas, setNotas] = useState("");
  const [promesa, setPromesa] = useState("");
  const [kilometraje, setKilometraje] = useState("");
  const [items, setItems] = useState<ItemOrden[]>([]);

  const clienteSeleccionado = clientes.find((c) => c.id === clienteId);
  const vehiculos = clienteSeleccionado?.vehiculos ?? [];

  function addServicio(servicioId: string) {
    const svc = servicios.find((s) => s.id === servicioId);
    if (!svc) return;
    setItems((prev) => [
      ...prev,
      {
        tipo: "SERVICIO",
        descripcion: svc.nombre,
        cantidad: 1,
        precioUnit: Number(svc.precio),
        servicioId: svc.id,
      },
    ]);
  }

  function addParte(parteId: string) {
    const parte = partes.find((p) => p.id === parteId);
    if (!parte) return;
    setItems((prev) => [
      ...prev,
      {
        tipo: "PARTE",
        descripcion: parte.nombre,
        cantidad: 1,
        precioUnit: Number(parte.precio),
        parteId: parte.id,
      },
    ]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof ItemOrden, value: any) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  const subtotal = items.reduce((sum, item) => sum + item.cantidad * item.precioUnit, 0);
  const impuesto = subtotal * 0.16;
  const total = subtotal + impuesto;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !vehiculoId) {
      toast.error("Selecciona un cliente y vehículo");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          clienteId,
          vehiculoId,
          empleadoId: empleadoId || null,
          prioridad,
          descripcion,
          notas,
          promesa: promesa || null,
          kilometraje: kilometraje ? parseInt(kilometraje) : null,
          items,
        }),
      });

      if (!res.ok) throw new Error("Error al crear orden");
      const data = await res.json();
      toast.success("Orden creada exitosamente");
      router.push(`/${tenantSlug}/ordenes/${data.id}`);
    } catch {
      toast.error("Error al crear la orden");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cliente y vehículo */}
        <Card>
          <CardHeader><CardTitle>Cliente y vehículo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={(v) => { setClienteId(v); setVehiculoId(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} — {c.telefono}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clienteId && (
              <div className="space-y-1.5">
                <Label>Vehículo *</Label>
                <Select value={vehiculoId} onValueChange={setVehiculoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.marca} {v.modelo} {v.anio} {v.placa ? `· ${v.placa}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vehiculos.length === 0 && (
                  <p className="text-xs text-amber-600">Este cliente no tiene vehículos registrados.</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Kilometraje actual</Label>
              <Input type="number" placeholder="Ej: 45000" value={kilometraje} onChange={(e) => setKilometraje(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Detalles */}
        <Card>
          <CardHeader><CardTitle>Detalles de la orden</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mecánico asignado</Label>
              <Select value={empleadoId} onValueChange={setEmpleadoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre} {e.apellido} {e.puesto ? `— ${e.puesto}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Fecha promesa de entrega</Label>
              <Input type="datetime-local" value={promesa} onChange={(e) => setPromesa(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Descripción del problema</Label>
              <Textarea
                placeholder="El cliente reporta..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servicios y partes */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios y refacciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agregar rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Agregar servicio</Label>
              <Select onValueChange={addServicio} value="">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio..." />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre} — {formatCurrency(Number(s.precio))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Agregar refacción</Label>
              <Select onValueChange={addParte} value="">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar refacción..." />
                </SelectTrigger>
                <SelectContent>
                  {partes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} — {formatCurrency(Number(p.precio))} (stock: {p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de items */}
          {items.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs text-gray-500">Descripción</th>
                    <th className="text-center px-3 py-2 text-xs text-gray-500 w-24">Cantidad</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 w-32">Precio unit.</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 w-32">Subtotal</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <Input
                          value={item.descripcion}
                          onChange={(e) => updateItem(i, "descripcion", e.target.value)}
                          className="h-7 text-xs border-0 shadow-none focus:ring-0 p-0"
                        />
                        <span className={`text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                          item.tipo === "SERVICIO" ? "bg-blue-50 text-blue-600" : item.tipo === "PARTE" ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600"
                        }`}>
                          {item.tipo === "SERVICIO" ? "Servicio" : item.tipo === "PARTE" ? "Refacción" : "Otro"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={item.cantidad}
                          onChange={(e) => updateItem(i, "cantidad", parseFloat(e.target.value) || 1)}
                          className="h-7 text-xs text-center w-20 mx-auto"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precioUnit}
                          onChange={(e) => updateItem(i, "precioUnit", parseFloat(e.target.value) || 0)}
                          className="h-7 text-xs text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {formatCurrency(item.cantidad * item.precioUnit)}
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { tipo: "OTRO", descripcion: "", cantidad: 1, precioUnit: 0 }])}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-4 w-4" /> Agregar línea personalizada
          </button>

          {/* Totales */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 pt-4 space-y-2 ml-auto max-w-xs">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA (16%)</span>
                <span>{formatCurrency(impuesto)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader><CardTitle>Notas internas</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            placeholder="Notas para el equipo (no visibles para el cliente)..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !clienteId || !vehiculoId}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</> : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}
