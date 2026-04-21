import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tenantId, clienteId, marca, modelo, anio, color, placa, vin, kilometraje } = body;

    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId, usuarioId: session.user.id!, activo: true },
    });
    if (!acceso) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const vehiculo = await prisma.vehiculo.create({
      data: {
        tenantId,
        clienteId,
        marca,
        modelo,
        anio: parseInt(anio),
        color: color || null,
        placa: placa || null,
        vin: vin || null,
        kilometraje: kilometraje || null,
      },
    });

    return NextResponse.json(vehiculo);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
