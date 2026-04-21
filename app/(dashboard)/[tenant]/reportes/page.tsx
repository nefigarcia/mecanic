import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ReportesCharts } from "./charts";

interface Props {
  params: Promise<{ tenant: string }>;
}

export default async function ReportesPage({ params }: Props) {
  const { tenant: tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const ahora = new Date();
  const inicio6Meses = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);

  // Ingresos por mes (últimos 6 meses)
  const facturas = await prisma.factura.findMany({
    where: {
      tenantId: tenant.id,
      estado: "PAGADA",
      pagadoAt: { gte: inicio6Meses },
    },
    select: { total: true, pagadoAt: true },
  });

  const ingresosPorMes: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    ingresosPorMes[key] = 0;
  }
  facturas.forEach((f) => {
    if (f.pagadoAt) {
      const key = `${f.pagadoAt.getFullYear()}-${String(f.pagadoAt.getMonth() + 1).padStart(2, "0")}`;
      if (ingresosPorMes[key] !== undefined) {
        ingresosPorMes[key] += Number(f.total);
      }
    }
  });

  const dataMeses = Object.entries(ingresosPorMes).map(([key, val]) => {
    const [year, month] = key.split("-");
    const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
    return {
      mes: new Intl.DateTimeFormat("es-MX", { month: "short" }).format(fecha),
      ingresos: val,
    };
  });

  // Órdenes por estado
  const ordenesEstado = await prisma.ordenTrabajo.groupBy({
    by: ["estado"],
    where: { tenantId: tenant.id },
    _count: true,
  });

  const dataEstados = ordenesEstado.map((e) => ({
    estado: e.estado,
    cantidad: e._count,
  }));

  // Servicios más vendidos
  const topServicios = await prisma.itemOrden.groupBy({
    by: ["descripcion"],
    where: {
      tipo: "SERVICIO",
      orden: { tenantId: tenant.id },
    },
    _count: true,
    orderBy: { _count: { descripcion: "desc" } },
    take: 5,
  });

  // Stats generales
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const [
    totalOrdenesTotal,
    ordenesMes,
    clientesTotal,
    ingresosTotales,
    ingresosMes,
    ticketPromedio,
  ] = await Promise.all([
    prisma.ordenTrabajo.count({ where: { tenantId: tenant.id } }),
    prisma.ordenTrabajo.count({ where: { tenantId: tenant.id, createdAt: { gte: inicioMes } } }),
    prisma.cliente.count({ where: { tenantId: tenant.id } }),
    prisma.factura.aggregate({
      where: { tenantId: tenant.id, estado: "PAGADA" },
      _sum: { total: true },
    }),
    prisma.factura.aggregate({
      where: { tenantId: tenant.id, estado: "PAGADA", pagadoAt: { gte: inicioMes } },
      _sum: { total: true },
    }),
    prisma.factura.aggregate({
      where: { tenantId: tenant.id, estado: "PAGADA" },
      _avg: { total: true },
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y análisis</h1>
        <p className="text-sm text-gray-500 mt-1">Visión general del rendimiento de tu taller</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Órdenes totales", value: totalOrdenesTotal.toString(), sub: `+${ordenesMes} este mes` },
          { label: "Clientes registrados", value: clientesTotal.toString(), sub: "Total histórico" },
          { label: "Ingresos totales", value: formatCurrency(Number(ingresosTotales._sum.total ?? 0)), sub: formatCurrency(Number(ingresosMes._sum.total ?? 0)) + " este mes" },
          { label: "Ticket promedio", value: formatCurrency(Number(ticketPromedio._avg.total ?? 0)), sub: "Por factura pagada" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-green-600 mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportesCharts
        dataMeses={dataMeses}
        dataEstados={dataEstados}
        topServicios={topServicios.map((s) => ({ nombre: s.descripcion, cantidad: s._count }))}
      />
    </div>
  );
}
