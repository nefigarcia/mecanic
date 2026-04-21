import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, Plus, Phone, Mail, MapPin, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency, ESTADOS_ORDEN } from "@/lib/utils";

interface Props {
  params: Promise<{ tenant: string; id: string }>;
}

export default async function ClienteDetailPage({ params }: Props) {
  const { tenant: tenantSlug, id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const cliente = await prisma.cliente.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      vehiculos: true,
      ordenes: {
        include: { vehiculo: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!cliente) notFound();

  const totalGastado = await prisma.factura.aggregate({
    where: { clienteId: cliente.id, tenantId: tenant.id, estado: "PAGADA" },
    _sum: { total: true },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${tenantSlug}/clientes`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
            {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cliente.nombre} {cliente.apellido}</h1>
            <p className="text-sm text-gray-500">Cliente desde {formatDate(cliente.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{cliente.vehiculos.length}</p>
            <p className="text-xs text-gray-500 mt-1">Vehículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{cliente.ordenes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Visitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(Number(totalGastado._sum.total ?? 0))}</p>
            <p className="text-xs text-gray-500 mt-1">Total gastado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {/* Info */}
          <Card>
            <CardHeader><CardTitle>Información de contacto</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{cliente.telefono}</span>
              </div>
              {cliente.celular && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{cliente.celular} (cel)</span>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{cliente.email}</span>
                </div>
              )}
              {(cliente.direccion || cliente.ciudad) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{[cliente.direccion, cliente.ciudad].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {cliente.notas && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 mb-1">Notas</p>
                  <p className="text-sm text-gray-600">{cliente.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehículos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vehículos</CardTitle>
              <Link href={`/${tenantSlug}/vehiculos/nuevo?clienteId=${cliente.id}`} className="text-indigo-600 hover:text-indigo-700">
                <Plus className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {cliente.vehiculos.length === 0 ? (
                <p className="text-sm text-gray-400">Sin vehículos registrados</p>
              ) : (
                cliente.vehiculos.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <Car className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{v.marca} {v.modelo} {v.anio}</p>
                      <p className="text-xs text-gray-400">
                        {[v.color, v.placa ? `Placa: ${v.placa}` : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historial */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historial de órdenes</CardTitle>
              <Link
                href={`/${tenantSlug}/ordenes/nueva?clienteId=${cliente.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="h-4 w-4" /> Nueva orden
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {cliente.ordenes.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">No hay órdenes</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cliente.ordenes.map((orden) => {
                    const estadoInfo = ESTADOS_ORDEN[orden.estado] ?? { label: orden.estado, color: "bg-gray-100 text-gray-700" };
                    return (
                      <Link
                        key={orden.id}
                        href={`/${tenantSlug}/ordenes/${orden.id}`}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                      >
                        <ClipboardList className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-600">
                              OT-{String(orden.numero).padStart(4, "0")}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${estadoInfo.color}`}>{estadoInfo.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {orden.vehiculo.marca} {orden.vehiculo.modelo} {orden.vehiculo.anio}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(Number(orden.total))}</p>
                          <p className="text-xs text-gray-400">{formatDate(orden.createdAt)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
