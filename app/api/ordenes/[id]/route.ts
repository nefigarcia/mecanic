import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const orden = await prisma.ordenTrabajo.findUnique({ where: { id } });
    if (!orden) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId: orden.tenantId, usuarioId: session.user.id!, activo: true },
    });
    if (!acceso) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const data: any = {};
    if (body.estado) {
      data.estado = body.estado;
      if (body.estado === "ENTREGADO" || body.estado === "LISTO") {
        data.completadoAt = new Date();
      }
    }
    if (body.empleadoId !== undefined) data.empleadoId = body.empleadoId;
    if (body.diagnostico !== undefined) data.diagnostico = body.diagnostico;
    if (body.notas !== undefined) data.notas = body.notas;
    if (body.prioridad) data.prioridad = body.prioridad;
    if (body.promesa !== undefined) data.promesa = body.promesa ? new Date(body.promesa) : null;

    const actualizada = await prisma.ordenTrabajo.update({
      where: { id },
      data,
    });

    return NextResponse.json(actualizada);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
