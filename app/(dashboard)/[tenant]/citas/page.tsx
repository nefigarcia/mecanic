import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { formatDateTime, ESTADOS_CITA } from "@/lib/utils";
import { NuevaCitaModal } from "./nueva-cita-modal";

interface Props {
  params: Promise<{ tenant: string }>;
}

export default async function CitasPage({ params }: Props) {
  const { tenant: tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const citas = await prisma.cita.findMany({
    where: {
      tenantId: tenant.id,
      inicio: { gte: hoy },
    },
    include: {
      cliente: true,
      vehiculo: true,
      empleado: true,
    },
    orderBy: { inicio: "asc" },
  });

  const [clientes, empleados] = await Promise.all([
    prisma.cliente.findMany({
      where: { tenantId: tenant.id, activo: true },
      include: { vehiculos: true },
    }),
    prisma.empleado.findMany({ where: { tenantId: tenant.id, activo: true } }),
  ]);

  // Agrupar por día
  const citasPorDia: Record<string, typeof citas> = {};
  citas.forEach((cita) => {
    const dia = cita.inicio.toISOString().split("T")[0];
    if (!citasPorDia[dia]) citasPorDia[dia] = [];
    citasPorDia[dia].push(cita);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas y agenda</h1>
          <p className="text-sm text-gray-500 mt-1">{citas.length} citas próximas</p>
        </div>
        <NuevaCitaModal tenantId={tenant.id} tenantSlug={tenantSlug} clientes={clientes} empleados={empleados} />
      </div>

      {citas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No hay citas próximas</p>
          <p className="text-gray-400 text-sm mt-1">Agenda la primera cita</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(citasPorDia).map(([dia, citasDelDia]) => {
            const fecha = new Date(dia + "T12:00:00");
            const esHoy = dia === new Date().toISOString().split("T")[0];
            return (
              <div key={dia}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-sm font-semibold ${esHoy ? "text-indigo-600" : "text-gray-700"}`}>
                    {esHoy ? "Hoy — " : ""}
                    {new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(fecha)}
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{citasDelDia.length} citas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {citasDelDia.map((cita) => {
                    const estadoInfo = ESTADOS_CITA[cita.estado] ?? { label: cita.estado, color: "bg-gray-100 text-gray-700" };
                    const hora = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(cita.inicio);
                    const horaFin = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(cita.fin);
                    return (
                      <div key={cita.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-sm font-bold text-gray-900">{hora}</span>
                            <span className="text-xs text-gray-400 ml-1">— {horaFin}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoInfo.color}`}>
                            {estadoInfo.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{cita.titulo}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cita.cliente.nombre} {cita.cliente.apellido} · {cita.vehiculo.marca} {cita.vehiculo.modelo}
                        </p>
                        {cita.empleado && (
                          <p className="text-xs text-indigo-600 mt-1">
                            {cita.empleado.nombre} {cita.empleado.apellido}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
