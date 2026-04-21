import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tenantId, clienteId, vehiculoId, empleadoId, titulo, descripcion, inicio, fin } = body;

    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId, usuarioId: session.user.id!, activo: true },
    });
    if (!acceso) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const cita = await prisma.cita.create({
      data: {
        tenantId,
        clienteId,
        vehiculoId,
        empleadoId: empleadoId || null,
        titulo,
        descripcion: descripcion || null,
        inicio: new Date(inicio),
        fin: new Date(fin),
      },
    });

    return NextResponse.json(cita);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
