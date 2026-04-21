"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Search, Package, AlertTriangle, X, ExternalLink, Globe, Warehouse } from "lucide-react";
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

// ─── Buscador de refacciones ──────────────────────────────────────────────────

interface PartesBuscadorProps {
  partes: any[];
  vehiculo: any | null;
  onSelect: (parte: any) => void;
}

type Tab = "inventario" | "web";

interface ResultadoWeb {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  image: string | null;
  price: string | null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function PartesBuscador({ partes, vehiculo, onSelect }: PartesBuscadorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("inventario");
  const [highlighted, setHighlighted] = useState(0);
  const [webResults, setWebResults] = useState<ResultadoWeb[]>([]);
  const [webLoading, setWebLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  // Tokens del vehículo para priorizar resultados
  const vehiculoTokens = vehiculo
    ? [vehiculo.marca, vehiculo.modelo, String(vehiculo.anio)]
        .filter(Boolean)
        .map((t: string) => t.toLowerCase())
    : [];

  const vehiculoLabel = vehiculo
    ? `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}`
    : "";

  // Resultados de inventario filtrados y priorizados
  const resultadosInventario = (() => {
    const q = query.trim().toLowerCase();
    const filtered = partes.filter((p) => {
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.marca && p.marca.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
      );
    });
    if (!q && vehiculoTokens.length === 0) return filtered.slice(0, 30);
    return filtered.sort((a, b) => {
      const scoreA = vehiculoTokens.filter(
        (t) => a.nombre.toLowerCase().includes(t) || (a.marca && a.marca.toLowerCase().includes(t))
      ).length;
      const scoreB = vehiculoTokens.filter(
        (t) => b.nombre.toLowerCase().includes(t) || (b.marca && b.marca.toLowerCase().includes(t))
      ).length;
      return scoreB - scoreA;
    });
  })();

  // Buscar en Google cuando cambia el query (debounced) y estamos en tab web
  useEffect(() => {
    if (tab !== "web" || debouncedQuery.trim().length < 2) {
      setWebResults([]);
      return;
    }
    setWebLoading(true);
    const params = new URLSearchParams({ q: debouncedQuery });
    if (vehiculoLabel) params.set("vehiculo", vehiculoLabel);
    fetch(`/api/buscar-partes?${params}`)
      .then((r) => r.json())
      .then((data) => setWebResults(data.items ?? []))
      .catch(() => setWebResults([]))
      .finally(() => setWebLoading(false));
  }, [debouncedQuery, tab, vehiculoLabel]);

  // Resetea highlight cuando cambia query o tab
  useEffect(() => { setHighlighted(0); }, [query, tab]);

  // Cierra al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || tab !== "inventario") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, resultadosInventario.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (resultadosInventario[highlighted]) handleSelectInventario(resultadosInventario[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleSelectInventario(parte: any) {
    onSelect(parte);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleSelectWeb(item: ResultadoWeb) {
    // Agrega como línea "OTRO" con el título como descripción
    onSelect({
      id: undefined,
      nombre: item.title,
      precio: item.price ? parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0 : 0,
      _webItem: true,
      _link: item.link,
    });
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function highlight(text: string) {
    const q = query.trim();
    if (!q) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            vehiculo
              ? `Buscar refacción para ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}...`
              : "Buscar refacción por nombre, SKU, marca..."
          }
          className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setWebResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Contexto del vehículo */}
      {vehiculo && (
        <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
          <span className="font-medium">Vehículo:</span>
          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
          {vehiculo.placa && <span className="text-gray-400">· {vehiculo.placa}</span>}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{ width: "420px", maxHeight: "420px" }}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setTab("inventario"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                tab === "inventario"
                  ? "text-indigo-600 border-b-2 border-indigo-500 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Warehouse className="h-3.5 w-3.5" />
              Inventario ({resultadosInventario.length})
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setTab("web"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                tab === "web"
                  ? "text-indigo-600 border-b-2 border-indigo-500 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Vendedores web
              {webLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </button>
          </div>

          {/* Contenido del tab */}
          <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>

            {/* ── Tab Inventario ── */}
            {tab === "inventario" && (
              resultadosInventario.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  <Package className="h-6 w-6 mx-auto mb-1 opacity-40" />
                  No se encontraron refacciones en inventario
                </div>
              ) : (
                <>
                  <div className="sticky top-0 bg-gray-50 border-b border-gray-100 px-3 py-1 text-xs text-gray-400">
                    {resultadosInventario.length} resultado{resultadosInventario.length !== 1 ? "s" : ""}
                    {vehiculo && " · ordenados por relevancia al vehículo"}
                  </div>
                  {resultadosInventario.map((parte, i) => {
                    const bajStock = parte.stock <= parte.stockMinimo;
                    return (
                      <button
                        key={parte.id}
                        type="button"
                        onMouseEnter={() => setHighlighted(i)}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectInventario(parte); }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                          i === highlighted ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">{highlight(parte.nombre)}</span>
                              {parte.marca && <span className="text-xs text-gray-500">{highlight(parte.marca)}</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {parte.sku && <span className="text-xs font-mono text-gray-400">{highlight(parte.sku)}</span>}
                              <span className={`inline-flex items-center gap-1 text-xs font-medium ${bajStock ? "text-amber-600" : "text-green-600"}`}>
                                {bajStock && <AlertTriangle className="h-3 w-3" />}
                                Stock: {parte.stock} {parte.unidad}{bajStock && " (bajo)"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(parte.precio)}</p>
                            <p className="text-xs text-gray-400">costo {formatCurrency(parte.costo)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )
            )}

            {/* ── Tab Vendedores web ── */}
            {tab === "web" && (
              query.trim().length < 2 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  <Globe className="h-6 w-6 mx-auto mb-1 opacity-40" />
                  Escribe al menos 2 caracteres para buscar
                </div>
              ) : webLoading ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  <Loader2 className="h-5 w-5 mx-auto mb-2 animate-spin opacity-50" />
                  Buscando en la web...
                </div>
              ) : webResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  <Package className="h-6 w-6 mx-auto mb-1 opacity-40" />
                  Sin resultados externos para "{query}"
                </div>
              ) : (
                <>
                  <div className="sticky top-0 bg-gray-50 border-b border-gray-100 px-3 py-1 text-xs text-gray-400">
                    {webResults.length} resultado{webResults.length !== 1 ? "s" : ""} · resultados de Google
                    {vehiculo && ` para ${vehiculoLabel}`}
                  </div>
                  {webResults.map((item, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        {/* Imagen */}
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="w-14 h-14 object-contain rounded border border-gray-100 flex-shrink-0 bg-white"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-14 h-14 flex-shrink-0 rounded border border-gray-100 bg-gray-50 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-300" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                            {item.title}
                          </p>
                          <p className="text-xs text-indigo-600 mt-0.5">{item.displayLink}</p>
                          {item.snippet && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.snippet}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {item.price && (
                              <span className="text-sm font-bold text-gray-900">${item.price}</span>
                            )}
                            <button
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); handleSelectWeb(item); }}
                              className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded hover:bg-indigo-700 transition-colors"
                            >
                              Usar precio
                            </button>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onMouseDown={(e) => e.stopPropagation()}
                              className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-0.5 transition-colors"
                            >
                              Ver <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formulario principal ─────────────────────────────────────────────────────

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
  const vehiculoSeleccionado = vehiculos.find((v: any) => v.id === vehiculoId) ?? null;

  function addServicio(servicioId: string) {
    const svc = servicios.find((s) => s.id === servicioId);
    if (!svc) return;
    setItems((prev) => [
      ...prev,
      { tipo: "SERVICIO", descripcion: svc.nombre, cantidad: 1, precioUnit: Number(svc.precio), servicioId: svc.id },
    ]);
  }

  function addParte(parte: any) {
    const esWeb = !!parte._webItem;
    setItems((prev) => [
      ...prev,
      {
        tipo: esWeb ? "OTRO" : "PARTE",
        descripcion: parte.nombre,
        cantidad: 1,
        precioUnit: Number(parte.precio) || 0,
        parteId: esWeb ? undefined : parte.id,
      },
    ]);
    toast.success(`"${parte.nombre}" agregado`, { duration: 1500 });
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clienteId || !vehiculoId) { toast.error("Selecciona un cliente y vehículo"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId, clienteId, vehiculoId,
          empleadoId: empleadoId || null,
          prioridad, descripcion, notas,
          promesa: promesa || null,
          kilometraje: kilometraje ? parseInt(kilometraje) : null,
          items,
        }),
      });
      if (!res.ok) throw new Error();
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
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
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
                  <SelectTrigger><SelectValue placeholder="Seleccionar vehículo..." /></SelectTrigger>
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
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
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
              <Textarea placeholder="El cliente reporta..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servicios y partes */}
      <Card>
        <CardHeader><CardTitle>Servicios y refacciones</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Servicios: sigue siendo select */}
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">Agregar servicio</Label>
              <Select onValueChange={addServicio} value="">
                <SelectTrigger><SelectValue placeholder="Seleccionar servicio..." /></SelectTrigger>
                <SelectContent>
                  {servicios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre} — {formatCurrency(Number(s.precio))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Refacciones: nuevo buscador */}
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">Buscar refacción</Label>
              <PartesBuscador
                partes={partes}
                vehiculo={vehiculoSeleccionado}
                onSelect={addParte}
              />
            </div>
          </div>

          {/* Lista de items */}
          {items.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
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
                          item.tipo === "SERVICIO" ? "bg-blue-50 text-blue-600"
                          : item.tipo === "PARTE" ? "bg-orange-50 text-orange-600"
                          : "bg-gray-50 text-gray-600"
                        }`}>
                          {item.tipo === "SERVICIO" ? "Servicio" : item.tipo === "PARTE" ? "Refacción" : "Otro"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number" min="0.1" step="0.1"
                          value={item.cantidad}
                          onChange={(e) => updateItem(i, "cantidad", parseFloat(e.target.value) || 1)}
                          className="h-7 text-xs text-center w-20 mx-auto"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number" min="0" step="0.01"
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
          <Textarea placeholder="Notas para el equipo (no visibles para el cliente)..." value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={loading || !clienteId || !vehiculoId}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</> : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}
