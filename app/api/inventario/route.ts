import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tenantId, nombre, sku, marca, precio, costo, stock, stockMinimo, unidad } = body;

    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId, usuarioId: session.user.id!, activo: true },
    });
    if (!acceso) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const parte = await prisma.parte.create({
      data: {
        tenantId,
        nombre,
        sku: sku || null,
        marca: marca || null,
        precio,
        costo,
        stock: stock ?? 0,
        stockMinimo: stockMinimo ?? 5,
        unidad: unidad || "pza",
      },
    });

    return NextResponse.json(parte);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
