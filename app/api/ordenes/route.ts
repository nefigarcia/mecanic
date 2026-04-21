import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tenantId, clienteId, vehiculoId, empleadoId, prioridad, descripcion, notas, promesa, kilometraje, items } = body;

    if (!tenantId || !clienteId || !vehiculoId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar acceso al tenant
    const acceso = await prisma.tenantUsuario.findFirst({
      where: { tenantId, usuarioId: session.user.id!, activo: true },
    });
    if (!acceso) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    // Obtener siguiente número de orden
    const ultimaOrden = await prisma.ordenTrabajo.findFirst({
      where: { tenantId },
      orderBy: { numero: "desc" },
    });
    const numero = (ultimaOrden?.numero ?? 0) + 1;

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) => sum + item.cantidad * item.precioUnit, 0);
    const impuesto = subtotal * 0.16;
    const total = subtotal + impuesto;

    const orden = await prisma.ordenTrabajo.create({
      data: {
        tenantId,
        clienteId,
        vehiculoId,
        empleadoId: empleadoId || null,
        numero,
        prioridad: prioridad || "NORMAL",
        descripcion: descripcion || null,
        notas: notas || null,
        promesa: promesa ? new Date(promesa) : null,
        kilometraje: kilometraje || null,
        subtotal,
        impuesto,
        total,
        items: {
          create: items.map((item: any) => ({
            tipo: item.tipo,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnit: item.precioUnit,
            descuento: 0,
            subtotal: item.cantidad * item.precioUnit,
            servicioId: item.servicioId || null,
            parteId: item.parteId || null,
          })),
        },
      },
    });

    // Actualizar kilometraje del vehículo
    if (kilometraje) {
      await prisma.vehiculo.update({
        where: { id: vehiculoId },
        data: { kilometraje: parseInt(kilometraje) },
      });
    }

    return NextResponse.json(orden);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
