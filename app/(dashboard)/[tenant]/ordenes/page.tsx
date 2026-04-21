import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, ESTADOS_ORDEN, PRIORIDADES } from "@/lib/utils";

interface Props {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ estado?: string; q?: string }>;
}

export default async function OrdenesPage({ params, searchParams }: Props) {
  const { tenant: tenantSlug } = await params;
  const { estado, q } = await searchParams;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const where: any = { tenantId: tenant.id };
  if (estado) where.estado = estado;
  if (q) {
    where.OR = [
      { cliente: { nombre: { contains: q } } },
      { cliente: { apellido: { contains: q } } },
      { vehiculo: { marca: { contains: q } } },
      { vehiculo: { placa: { contains: q } } },
    ];
  }

  const ordenes = await prisma.ordenTrabajo.findMany({
    where,
    include: {
      cliente: true,
      vehiculo: true,
      empleado: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const conteos = await prisma.ordenTrabajo.groupBy({
    by: ["estado"],
    where: { tenantId: tenant.id },
    _count: true,
  });

  const conteoPorEstado = conteos.reduce((acc, c) => {
    acc[c.estado] = c._count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de trabajo</h1>
          <p className="text-sm text-gray-500 mt-1">{ordenes.length} órdenes</p>
        </div>
        <Link
          href={`/${tenantSlug}/ordenes/nueva`}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva orden
        </Link>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Link
          href={`/${tenantSlug}/ordenes`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            !estado ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Todas <span className="text-xs opacity-70">{ordenes.length}</span>
        </Link>
        {Object.entries(ESTADOS_ORDEN).map(([key, info]) => (
          <Link
            key={key}
            href={`/${tenantSlug}/ordenes?estado=${key}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              estado === key ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {info.label}
            {conteoPorEstado[key] && (
              <span className="text-xs opacity-70">{conteoPorEstado[key]}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por cliente, vehículo, placa..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {ordenes.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No hay órdenes</p>
            <p className="text-gray-400 text-sm mt-1">Crea la primera orden de trabajo</p>
            <Link
              href={`/${tenantSlug}/ordenes/nueva`}
              className="inline-flex items-center gap-2 mt-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Nueva orden
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"># Orden</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mecánico</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordenes.map((orden) => {
                  const estadoInfo = ESTADOS_ORDEN[orden.estado] ?? { label: orden.estado, color: "bg-gray-100 text-gray-700" };
                  const prioridadInfo = PRIORIDADES[orden.prioridad] ?? { label: orden.prioridad, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/${tenantSlug}/ordenes/${orden.id}`} className="font-mono text-sm font-bold text-indigo-600 hover:underline">
                          OT-{String(orden.numero).padStart(4, "0")}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${estadoInfo.color}`}>
                          {estadoInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/${tenantSlug}/clientes/${orden.clienteId}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                          {orden.cliente.nombre} {orden.cliente.apellido}
                        </Link>
                        <p className="text-xs text-gray-400">{orden.cliente.telefono}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{orden.vehiculo.marca} {orden.vehiculo.modelo}</p>
                        <p className="text-xs text-gray-400">{orden.vehiculo.anio} · {orden.vehiculo.placa || "Sin placa"}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {orden.empleado ? `${orden.empleado.nombre} ${orden.empleado.apellido}` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${prioridadInfo.color}`}>
                          {prioridadInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(Number(orden.total))}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {formatDateTime(orden.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
