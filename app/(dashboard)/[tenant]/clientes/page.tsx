import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Users, Phone, Mail, Car } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function ClientesPage({ params, searchParams }: Props) {
  const { tenant: tenantSlug } = await params;
  const { q } = await searchParams;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const clientes = await prisma.cliente.findMany({
    where: {
      tenantId: tenant.id,
      activo: true,
      ...(q ? {
        OR: [
          { nombre: { contains: q } },
          { apellido: { contains: q } },
          { telefono: { contains: q } },
          { email: { contains: q } },
        ],
      } : {}),
    },
    include: {
      _count: { select: { vehiculos: true, ordenes: true } },
    },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <Link
          href={`/${tenantSlug}/clientes/nuevo`}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, teléfono, email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No hay clientes aún</p>
          <Link href={`/${tenantSlug}/clientes/nuevo`} className="inline-flex items-center gap-2 mt-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientes.map((cliente) => (
            <Link
              key={cliente.id}
              href={`/${tenantSlug}/clientes/${cliente.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                </div>
                <span className="text-xs text-gray-400">{formatDate(cliente.createdAt)}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{cliente.nombre} {cliente.apellido}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  {cliente.telefono}
                </div>
                {cliente.email && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    {cliente.email}
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Car className="h-3.5 w-3.5" />
                  {cliente._count.vehiculos} vehículo{cliente._count.vehiculos !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{cliente._count.ordenes}</span> órdenes
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
