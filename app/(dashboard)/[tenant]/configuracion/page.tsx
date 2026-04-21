import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ConfiguracionForm } from "./form";

interface Props {
  params: Promise<{ tenant: string }>;
}

export default async function ConfiguracionPage({ params }: Props) {
  const { tenant: tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const servicios = await prisma.servicio.findMany({
    where: { tenantId: tenant.id },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Personaliza tu taller</p>
      </div>
      <ConfiguracionForm tenant={tenant} />

      {/* Servicios */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Catálogo de servicios</h2>
        <div className="space-y-2">
          {servicios.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{svc.nombre}</p>
                {svc.descripcion && <p className="text-xs text-gray-400">{svc.descripcion}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${Number(svc.precio).toFixed(2)}</p>
                {svc.duracion && <p className="text-xs text-gray-400">{svc.duracion} min</p>}
              </div>
            </div>
          ))}
          {servicios.length === 0 && (
            <p className="text-sm text-gray-400">No hay servicios configurados</p>
          )}
        </div>
      </div>
    </div>
  );
}
