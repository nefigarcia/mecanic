import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;

    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId: id, usuarioId: session.user.id!, activo: true, rol: { in: ["ADMINISTRADOR", "GERENTE"] } },
    });
    if (!acceso) return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

    const body = await req.json();
    const { nombre, email, telefono, direccion, ciudad, estado, codigoPostal, rfc } = body;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        nombre: nombre || undefined,
        email: email || null,
        telefono: telefono || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        estado: estado || null,
        codigoPostal: codigoPostal || null,
        rfc: rfc || null,
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
