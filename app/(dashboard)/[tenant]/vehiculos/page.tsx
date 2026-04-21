import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Car, Search } from "lucide-react";
import { NuevoVehiculoModal } from "./nuevo-vehiculo-modal";

interface Props {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function VehiculosPage({ params, searchParams }: Props) {
  const { tenant: tenantSlug } = await params;
  const { q } = await searchParams;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      tenantId: tenant.id,
      ...(q ? {
        OR: [
          { marca: { contains: q } },
          { modelo: { contains: q } },
          { placa: { contains: q } },
        ],
      } : {}),
    },
    include: {
      cliente: true,
      _count: { select: { ordenes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const clientes = await prisma.cliente.findMany({
    where: { tenantId: tenant.id, activo: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-sm text-gray-500 mt-1">{vehiculos.length} vehículos registrados</p>
        </div>
        <NuevoVehiculoModal tenantId={tenant.id} tenantSlug={tenantSlug} clientes={clientes} />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <form>
          <input name="q" defaultValue={q} placeholder="Buscar por marca, modelo, placa..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </form>
      </div>

      {vehiculos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Car className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No hay vehículos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Propietario</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Placa</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Color</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Km</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Visitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehiculos.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Car className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{v.marca} {v.modelo}</p>
                        <p className="text-xs text-gray-400">{v.anio}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/${tenantSlug}/clientes/${v.clienteId}`} className="text-sm text-gray-900 hover:text-indigo-600">
                      {v.cliente.nombre} {v.cliente.apellido}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{v.placa || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.color || "—"}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {v.kilometraje ? v.kilometraje.toLocaleString("es-MX") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{v._count.ordenes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
