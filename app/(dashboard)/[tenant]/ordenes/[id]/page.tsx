import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, User, Wrench, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, ESTADOS_ORDEN, PRIORIDADES } from "@/lib/utils";
import { OrdenActions } from "./actions";

interface Props {
  params: Promise<{ tenant: string; id: string }>;
}

export default async function OrdenDetailPage({ params }: Props) {
  const { tenant: tenantSlug, id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const orden = await prisma.ordenTrabajo.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      cliente: true,
      vehiculo: true,
      empleado: true,
      items: {
        include: { servicio: true, parte: true },
      },
      factura: true,
    },
  });

  if (!orden) notFound();

  const empleados = await prisma.empleado.findMany({
    where: { tenantId: tenant.id, activo: true },
  });

  const estadoInfo = ESTADOS_ORDEN[orden.estado] ?? { label: orden.estado, color: "bg-gray-100 text-gray-700" };
  const prioridadInfo = PRIORIDADES[orden.prioridad] ?? { label: orden.prioridad, color: "bg-gray-100 text-gray-600" };

  const ESTADOS_PIPELINE = [
    "RECIBIDO", "DIAGNOSTICO", "APROBADO", "EN_PROCESO", "EN_ESPERA", "LISTO", "ENTREGADO"
  ];
  const estadoActualIdx = ESTADOS_PIPELINE.indexOf(orden.estado);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${tenantSlug}/ordenes`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              OT-{String(orden.numero).padStart(4, "0")}
            </h1>
            <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${estadoInfo.color}`}>
              {estadoInfo.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadInfo.color}`}>
              {prioridadInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(orden.createdAt)}</p>
        </div>
      </div>

      {/* Pipeline */}
      {orden.estado !== "CANCELADO" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {ESTADOS_PIPELINE.map((e, i) => {
              const info = ESTADOS_ORDEN[e]!;
              const activo = e === orden.estado;
              const pasado = i < estadoActualIdx;
              return (
                <div key={e} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex flex-col items-center gap-1`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      activo ? "bg-indigo-600 text-white" : pasado ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {pasado ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs text-center ${activo ? "text-indigo-600 font-medium" : pasado ? "text-green-600" : "text-gray-400"}`}>
                      {info.label}
                    </span>
                  </div>
                  {i < ESTADOS_PIPELINE.length - 1 && (
                    <div className={`w-8 h-0.5 mb-4 ${i < estadoActualIdx ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader><CardTitle>Servicios y refacciones</CardTitle></CardHeader>
            <CardContent className="p-0">
              {orden.items.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">No hay items en esta orden</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs text-gray-500">Descripción</th>
                      <th className="text-center px-4 py-2.5 text-xs text-gray-500">Cantidad</th>
                      <th className="text-right px-4 py-2.5 text-xs text-gray-500">Precio unit.</th>
                      <th className="text-right px-4 py-2.5 text-xs text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orden.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.descripcion}</p>
                          <span className={`text-xs ${item.tipo === "SERVICIO" ? "text-blue-600" : item.tipo === "PARTE" ? "text-orange-600" : "text-gray-500"}`}>
                            {item.tipo === "SERVICIO" ? "Servicio" : item.tipo === "PARTE" ? "Refacción" : "Otro"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{Number(item.cantidad)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(Number(item.precioUnit))}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(item.subtotal))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-200 bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">Subtotal</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(Number(orden.subtotal))}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">IVA (16%)</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(Number(orden.impuesto))}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-bold text-gray-900">Total</td>
                      <td className="px-4 py-2 text-right font-bold text-lg text-indigo-600">{formatCurrency(Number(orden.total))}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Diagnóstico */}
          {(orden.descripcion || orden.diagnostico) && (
            <Card>
              <CardHeader><CardTitle>Descripción y diagnóstico</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {orden.descripcion && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Problema reportado</p>
                    <p className="text-sm text-gray-700">{orden.descripcion}</p>
                  </div>
                )}
                {orden.diagnostico && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Diagnóstico</p>
                    <p className="text-sm text-gray-700">{orden.diagnostico}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Acciones */}
          <OrdenActions
            ordenId={orden.id}
            estadoActual={orden.estado}
            tenantSlug={tenantSlug}
            empleadoId={orden.empleadoId || ""}
            empleados={empleados}
          />

          {/* Cliente */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/${tenantSlug}/clientes/${orden.clienteId}`} className="flex items-center gap-2 hover:text-indigo-600">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{orden.cliente.nombre} {orden.cliente.apellido}</span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4 text-gray-400" />
                {orden.cliente.telefono}
              </div>
              {orden.cliente.email && (
                <p className="text-sm text-gray-500 pl-6">{orden.cliente.email}</p>
              )}
            </CardContent>
          </Card>

          {/* Vehículo */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Vehículo</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {orden.vehiculo.marca} {orden.vehiculo.modelo} {orden.vehiculo.anio}
                </span>
              </div>
              {orden.vehiculo.placa && (
                <p className="text-sm text-gray-500 pl-6">Placa: <strong>{orden.vehiculo.placa}</strong></p>
              )}
              {orden.vehiculo.color && (
                <p className="text-sm text-gray-500 pl-6">Color: {orden.vehiculo.color}</p>
              )}
              {orden.kilometraje && (
                <p className="text-sm text-gray-500 pl-6">Km: {orden.kilometraje.toLocaleString("es-MX")}</p>
              )}
            </CardContent>
          </Card>

          {/* Mecánico */}
          {orden.empleado && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Mecánico asignado</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{orden.empleado.nombre} {orden.empleado.apellido}</span>
                </div>
                {orden.empleado.puesto && (
                  <p className="text-xs text-gray-400 pl-6 mt-0.5">{orden.empleado.puesto}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Promesa */}
          {orden.promesa && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Fecha de entrega prometida</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(orden.promesa)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
