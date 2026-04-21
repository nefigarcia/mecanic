import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { nombre, apellido, email, telefono, celular, direccion, ciudad, notas, tenantSlug } = body;

    if (!nombre || !apellido || !telefono || !tenantSlug) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });

    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId: tenant.id, usuarioId: session.user.id!, activo: true },
    });
    if (!acceso) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const cliente = await prisma.cliente.create({
      data: {
        tenantId: tenant.id,
        nombre,
        apellido,
        email: email || null,
        telefono,
        celular: celular || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        notas: notas || null,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
