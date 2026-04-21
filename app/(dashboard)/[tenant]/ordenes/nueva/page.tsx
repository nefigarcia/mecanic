import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NuevaOrdenForm } from "./form";

interface Props {
  params: Promise<{ tenant: string }>;
}

export default async function NuevaOrdenPage({ params }: Props) {
  const { tenant: tenantSlug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) notFound();

  const [clientes, empleados, servicios, partes] = await Promise.all([
    prisma.cliente.findMany({
      where: { tenantId: tenant.id, activo: true },
      include: { vehiculos: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.empleado.findMany({
      where: { tenantId: tenant.id, activo: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.servicio.findMany({
      where: { tenantId: tenant.id, activo: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.parte.findMany({
      where: { tenantId: tenant.id, activo: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  // Serializar Decimal a number antes de pasar a Client Component
  const serviciosSerialized = servicios.map((s) => ({
    ...s,
    precio: Number(s.precio),
  }));

  const partesSerialized = partes.map((p) => ({
    ...p,
    precio: Number(p.precio),
    costo: Number(p.costo),
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva orden de trabajo</h1>
        <p className="text-sm text-gray-500 mt-1">Crea una nueva orden para un vehículo</p>
      </div>
      <NuevaOrdenForm
        tenantSlug={tenantSlug}
        tenantId={tenant.id}
        clientes={clientes}
        empleados={empleados}
        servicios={serviciosSerialized}
        partes={partesSerialized}
      />
    </div>
  );
}
