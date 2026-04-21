"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  tenantSlug: string;
}

export function NuevaParteModal({ tenantId, tenantSlug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "", sku: "", marca: "", precio: "", costo: "", stock: "0", stockMinimo: "5", unidad: "pza",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.costo) {
      toast.error("Nombre, precio y costo son requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tenantId,
          precio: parseFloat(form.precio),
          costo: parseFloat(form.costo),
          stock: parseInt(form.stock),
          stockMinimo: parseInt(form.stockMinimo),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Producto agregado");
      setOpen(false);
      setForm({ nombre: "", sku: "", marca: "", precio: "", costo: "", stock: "0", stockMinimo: "5", unidad: "pza" });
      router.refresh();
    } catch {
      toast.error("Error al agregar producto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo producto de inventario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nombre *</Label>
            <Input placeholder="Ej: Aceite Motor 5W30" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input placeholder="Ej: ACE-5W30" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input placeholder="Ej: Castrol" value={form.marca} onChange={(e) => update("marca", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Precio de venta *</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.precio} onChange={(e) => update("precio", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Costo *</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.costo} onChange={(e) => update("costo", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Stock actual</Label>
              <Input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Stock mínimo</Label>
              <Input type="number" min="0" value={form.stockMinimo} onChange={(e) => update("stockMinimo", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Input placeholder="pza" value={form.unidad} onChange={(e) => update("unidad", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
