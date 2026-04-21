import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tenants = (session.user as any).tenants;

  if (!tenants || tenants.length === 0) {
    redirect("/registro");
  }

  const primerTenant = tenants[0].tenant;
  redirect(`/${primerTenant.slug}/dashboard`);
}
