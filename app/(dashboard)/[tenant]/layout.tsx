import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({ children, params }: Props) {
  const { tenant: tenantSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      usuarios: {
        where: { usuarioId: session.user.id, activo: true },
      },
    },
  });

  if (!tenant) notFound();
  if (tenant.usuarios.length === 0) redirect("/login");

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id! },
  });

  if (!usuario) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        tenant={{
          slug: tenant.slug,
          nombre: tenant.nombre,
          logo: tenant.logo,
          plan: tenant.plan,
        }}
        usuario={{
          nombre: usuario.nombre,
          email: usuario.email,
          imagen: usuario.imagen,
        }}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
