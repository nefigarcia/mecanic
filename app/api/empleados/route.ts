import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tenantId, nombre, apellido, email, telefono, puesto, especialidad } = body;

    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId, usuarioId: session.user.id!, activo: true },
    });
    if (!acceso) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const colores = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
    const count = await prisma.empleado.count({ where: { tenantId } });
    const color = colores[count % colores.length];

    const empleado = await prisma.empleado.create({
      data: {
        tenantId,
        nombre,
        apellido,
        email: email || null,
        telefono: telefono || null,
        puesto: puesto || null,
        especialidad: especialidad || null,
        color,
      },
    });

    return NextResponse.json(empleado);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
