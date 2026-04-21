import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { formatCurrency, formatDate, ESTADOS_FACTURA } from "@/lib/utils";

interface Props {
  params: Promise<{ tenant: string }>;
}

export default async function FacturasPage({ params }: Props) {
  const { tenant: tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const facturas = await prisma.factura.findMany({
    where: { tenantId: tenant.id },
    include: { cliente: true, orden: true },
    orderBy: { createdAt: "desc" },
  });

  const totales = {
    pagadas: facturas.filter((f) => f.estado === "PAGADA").reduce((s, f) => s + Number(f.total), 0),
    pendientes: facturas.filter((f) => f.estado === "PENDIENTE").reduce((s, f) => s + Number(f.total), 0),
    vencidas: facturas.filter((f) => f.estado === "VENCIDA").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-sm text-gray-500 mt-1">{facturas.length} facturas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Cobrado</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totales.pagadas)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Por cobrar</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totales.pendientes)}</p>
        </div>
        <div className={`rounded-xl border p-4 ${totales.vencidas > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500">Vencidas</p>
          <p className={`text-2xl font-bold ${totales.vencidas > 0 ? "text-red-600" : "text-gray-900"}`}>{totales.vencidas}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {facturas.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay facturas aún</p>
            <p className="text-gray-400 text-sm mt-1">Las facturas se generan desde las órdenes de trabajo</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"># Factura</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Orden</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facturas.map((f) => {
                const estadoInfo = ESTADOS_FACTURA[f.estado] ?? { label: f.estado, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-bold text-indigo-600">{f.numero}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoInfo.color}`}>
                        {estadoInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {f.cliente.nombre} {f.cliente.apellido}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {f.orden ? (
                        <Link href={`/${tenantSlug}/ordenes/${f.ordenId}`} className="text-indigo-600 hover:underline">
                          OT-{String(f.orden.numero).padStart(4, "0")}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(f.total))}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">{formatDate(f.createdAt)}</td>
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
