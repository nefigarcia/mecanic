import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Users2 } from "lucide-react";
import { NuevoEmpleadoModal } from "./nuevo-empleado-modal";

interface Props {
  params: Promise<{ tenant: string }>;
}

export default async function EmpleadosPage({ params }: Props) {
  const { tenant: tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const empleados = await prisma.empleado.findMany({
    where: { tenantId: tenant.id },
    include: {
      _count: { select: { ordenes: true, citas: true } },
    },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-sm text-gray-500 mt-1">{empleados.filter(e => e.activo).length} activos</p>
        </div>
        <NuevoEmpleadoModal tenantId={tenant.id} tenantSlug={tenantSlug} />
      </div>

      {empleados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users2 className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No hay empleados registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {empleados.map((emp) => (
            <div key={emp.id} className={`bg-white rounded-xl border p-5 ${!emp.activo ? "opacity-60 border-gray-100" : "border-gray-200 hover:shadow-md"} transition-all`}>
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: emp.color }}
                >
                  {emp.nombre.charAt(0)}{emp.apellido.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{emp.nombre} {emp.apellido}</p>
                  <p className="text-xs text-gray-500">{emp.puesto || "Sin puesto"}</p>
                  {emp.especialidad && <p className="text-xs text-indigo-600 mt-0.5">{emp.especialidad}</p>}
                </div>
                {!emp.activo && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactivo</span>
                )}
              </div>
              <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{emp._count.ordenes}</p>
                  <p className="text-xs text-gray-500">Órdenes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{emp._count.citas}</p>
                  <p className="text-xs text-gray-500">Citas</p>
                </div>
                {emp.email && (
                  <div className="flex-1 flex items-center justify-end">
                    <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
