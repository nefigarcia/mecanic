import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList, Users, DollarSign, Calendar,
  TrendingUp, Clock, AlertTriangle, ChevronRight, Car
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, ESTADOS_ORDEN } from "@/lib/utils";

interface Props {
  params: Promise<{ tenant: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { tenant: tenantSlug } = await params;
  const session = await auth();

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) notFound();

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const [
    ordenesActivas,
    ordenesHoy,
    clientesMes,
    ingresosMes,
    ingresosHoy,
    ordenesPendientes,
    stockBajo,
    citasHoy,
    ordenesRecientes,
  ] = await Promise.all([
    prisma.ordenTrabajo.count({
      where: {
        tenantId: tenant.id,
        estado: { in: ["RECIBIDO", "DIAGNOSTICO", "APROBADO", "EN_PROCESO", "EN_ESPERA"] },
      },
    }),
    prisma.ordenTrabajo.count({
      where: {
        tenantId: tenant.id,
        estado: "LISTO",
        updatedAt: { gte: inicioHoy },
      },
    }),
    prisma.cliente.count({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: inicioMes },
      },
    }),
    prisma.factura.aggregate({
      where: {
        tenantId: tenant.id,
        estado: "PAGADA",
        pagadoAt: { gte: inicioMes },
      },
      _sum: { total: true },
    }),
    prisma.factura.aggregate({
      where: {
        tenantId: tenant.id,
        estado: "PAGADA",
        pagadoAt: { gte: inicioHoy },
      },
      _sum: { total: true },
    }),
    prisma.ordenTrabajo.count({
      where: {
        tenantId: tenant.id,
        estado: "LISTO",
      },
    }),
    prisma.parte.count({
      where: {
        tenantId: tenant.id,
        activo: true,
        stock: { lte: prisma.parte.fields.stockMinimo },
      },
    }).catch(() => 0),
    prisma.cita.count({
      where: {
        tenantId: tenant.id,
        inicio: { gte: inicioHoy, lt: new Date(inicioHoy.getTime() + 86400000) },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
    }),
    prisma.ordenTrabajo.findMany({
      where: { tenantId: tenant.id },
      include: {
        cliente: true,
        vehiculo: true,
        empleado: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const stats = [
    {
      label: "Órdenes activas",
      value: ordenesActivas,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: `/${tenantSlug}/ordenes`,
    },
    {
      label: "Listas para entrega",
      value: ordenesPendientes,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      href: `/${tenantSlug}/ordenes?estado=LISTO`,
    },
    {
      label: "Clientes nuevos este mes",
      value: clientesMes,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: `/${tenantSlug}/clientes`,
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(Number(ingresosMes._sum.total ?? 0)),
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: `/${tenantSlug}/reportes`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenido, {(session?.user as any)?.name?.split(" ")[0] ?? ""}
            {" "}·{" "}
            {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(hoy)}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${tenantSlug}/ordenes/nueva`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            Nueva orden
          </Link>
          <Link
            href={`/${tenantSlug}/citas/nueva`}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Nueva cita
          </Link>
        </div>
      </div>

      {/* Alertas */}
      {(stockBajo > 0 || ordenesPendientes > 0) && (
        <div className="flex gap-3 flex-wrap">
          {ordenesPendientes > 0 && (
            <Link href={`/${tenantSlug}/ordenes?estado=LISTO`}
              className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
              <Clock className="h-4 w-4" />
              {ordenesPendientes} {ordenesPendientes === 1 ? "orden lista" : "órdenes listas"} para entrega
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
          {stockBajo > 0 && (
            <Link href={`/${tenantSlug}/inventario?filtro=bajo`}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors">
              <AlertTriangle className="h-4 w-4" />
              {stockBajo} {stockBajo === 1 ? "producto con stock bajo" : "productos con stock bajo"}
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
          {citasHoy > 0 && (
            <Link href={`/${tenantSlug}/citas`}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              <Calendar className="h-4 w-4" />
              {citasHoy} {citasHoy === 1 ? "cita" : "citas"} pendientes hoy
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Órdenes recientes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Órdenes recientes</CardTitle>
              <Link href={`/${tenantSlug}/ordenes`} className="text-sm text-indigo-600 hover:underline">
                Ver todas
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {ordenesRecientes.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay órdenes aún</p>
                    <Link href={`/${tenantSlug}/ordenes/nueva`} className="text-indigo-600 text-sm hover:underline mt-1 inline-block">
                      Crear primera orden
                    </Link>
                  </div>
                ) : (
                  ordenesRecientes.map((orden) => {
                    const estadoInfo = ESTADOS_ORDEN[orden.estado] ?? { label: orden.estado, color: "bg-gray-100 text-gray-700" };
                    return (
                      <Link
                        key={orden.id}
                        href={`/${tenantSlug}/ordenes/${orden.id}`}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Car className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-500">
                              OT-{String(orden.numero).padStart(4, "0")}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoInfo.color}`}>
                              {estadoInfo.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {orden.cliente.nombre} {orden.cliente.apellido}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {orden.vehiculo.marca} {orden.vehiculo.modelo} {orden.vehiculo.anio}
                            {orden.empleado && ` · ${orden.empleado.nombre}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(Number(orden.total))}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(orden.createdAt)}</p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen rápido */}
        <div className="space-y-4">
          {/* Hoy */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de hoy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Órdenes completadas</span>
                <span className="font-semibold">{ordenesHoy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Citas agendadas</span>
                <span className="font-semibold">{citasHoy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ingresos del día</span>
                <span className="font-semibold text-green-600">{formatCurrency(Number(ingresosHoy._sum.total ?? 0))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Accesos rápidos */}
          <Card>
            <CardHeader>
              <CardTitle>Accesos rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Nueva orden de trabajo", href: `/${tenantSlug}/ordenes/nueva`, icon: ClipboardList },
                { label: "Agendar cita", href: `/${tenantSlug}/citas/nueva`, icon: Calendar },
                { label: "Nuevo cliente", href: `/${tenantSlug}/clientes/nuevo`, icon: Users },
                { label: "Ver inventario", href: `/${tenantSlug}/inventario`, icon: Car },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <item.icon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">{item.label}</span>
                  <ChevronRight className="h-3 w-3 text-gray-300 ml-auto group-hover:text-gray-500" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
