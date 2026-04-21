import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { NuevaParteModal } from "./nueva-parte-modal";

interface Props {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string; filtro?: string }>;
}

export default async function InventarioPage({ params, searchParams }: Props) {
  const { tenant: tenantSlug } = await params;
  const { q, filtro } = await searchParams;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const partes = await prisma.parte.findMany({
    where: {
      tenantId: tenant.id,
      activo: true,
      ...(q ? {
        OR: [
          { nombre: { contains: q } },
          { sku: { contains: q } },
          { marca: { contains: q } },
        ],
      } : {}),
    },
    include: { categoria: true },
    orderBy: { nombre: "asc" },
  });

  const partesFiltradas = filtro === "bajo"
    ? partes.filter((p) => p.stock <= p.stockMinimo)
    : partes;

  const stockBajo = partes.filter((p) => p.stock <= p.stockMinimo).length;
  const valorInventario = partes.reduce((sum, p) => sum + p.stock * Number(p.costo), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">{partes.length} productos</p>
        </div>
        <NuevaParteModal tenantId={tenant.id} tenantSlug={tenantSlug} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total productos</p>
          <p className="text-2xl font-bold text-gray-900">{partes.length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${stockBajo > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {stockBajo > 0 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            Stock bajo
          </p>
          <p className={`text-2xl font-bold ${stockBajo > 0 ? "text-amber-600" : "text-gray-900"}`}>{stockBajo}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Valor del inventario</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(valorInventario)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <form>
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar producto, SKU, marca..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        </div>
        <div className="flex gap-2">
          <Link href={`/${tenantSlug}/inventario`}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${!filtro ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            Todos
          </Link>
          <Link href={`/${tenantSlug}/inventario?filtro=bajo`}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${filtro === "bajo" ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            <AlertTriangle className="h-3.5 w-3.5" /> Stock bajo
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {partesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No hay productos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Mín.</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Costo</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partesFiltradas.map((parte) => {
                const bajStock = parte.stock <= parte.stockMinimo;
                const margen = Number(parte.precio) > 0
                  ? ((Number(parte.precio) - Number(parte.costo)) / Number(parte.precio) * 100).toFixed(0)
                  : "0";
                return (
                  <tr key={parte.id} className={`hover:bg-gray-50 ${bajStock ? "bg-amber-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{parte.nombre}</p>
                      {parte.marca && <p className="text-xs text-gray-400">{parte.marca}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-500">{parte.sku || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {parte.categoria?.nombre || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${bajStock ? "text-amber-600" : "text-gray-900"}`}>
                        {bajStock && <AlertTriangle className="h-3.5 w-3.5" />}
                        {parte.stock}
                        <span className="text-xs text-gray-400">{parte.unidad}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-400">{parte.stockMinimo}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(Number(parte.costo))}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(Number(parte.precio))}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium text-green-600">{margen}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
