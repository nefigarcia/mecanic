import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateSlug } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombreTaller, ciudad, telefono, nombre, email, password } = body;

    if (!nombreTaller || !nombre || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);

    let slug = generateSlug(nombreTaller);
    const slugExiste = await prisma.tenant.findUnique({ where: { slug } });
    if (slugExiste) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre,
          email,
          password: hash,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          slug,
          nombre: nombreTaller,
          ciudad: ciudad || null,
          telefono: telefono || null,
        },
      });

      await tx.tenantUsuario.create({
        data: {
          tenantId: tenant.id,
          usuarioId: usuario.id,
          rol: "ADMINISTRADOR",
        },
      });

      // Seed default categories and services
      const catServicio = await tx.categoria.create({
        data: { tenantId: tenant.id, nombre: "Mantenimiento", tipo: "SERVICIO" },
      });

      await tx.servicio.createMany({
        data: [
          { tenantId: tenant.id, categoriaId: catServicio.id, nombre: "Cambio de aceite y filtro", precio: 350, duracion: 30 },
          { tenantId: tenant.id, categoriaId: catServicio.id, nombre: "Revisión de frenos", precio: 150, duracion: 45 },
          { tenantId: tenant.id, categoriaId: catServicio.id, nombre: "Afinación menor", precio: 800, duracion: 90 },
          { tenantId: tenant.id, categoriaId: catServicio.id, nombre: "Afinación mayor", precio: 1500, duracion: 180 },
        ],
      });

      const catParte = await tx.categoria.create({
        data: { tenantId: tenant.id, nombre: "Aceites y filtros", tipo: "PARTE" },
      });

      await tx.parte.createMany({
        data: [
          { tenantId: tenant.id, categoriaId: catParte.id, nombre: "Aceite Motor 5W30 1L", sku: "ACE-5W30-1L", precio: 85, costo: 55, stock: 20, stockMinimo: 5 },
          { tenantId: tenant.id, categoriaId: catParte.id, nombre: "Filtro de aceite universal", sku: "FIL-ACE-001", precio: 95, costo: 60, stock: 15, stockMinimo: 5 },
          { tenantId: tenant.id, categoriaId: catParte.id, nombre: "Filtro de aire", sku: "FIL-AIR-001", precio: 120, costo: 75, stock: 10, stockMinimo: 3 },
        ],
      });

      return { usuario, tenant };
    });

    return NextResponse.json({
      message: "Taller creado exitosamente",
      slug: result.tenant.slug,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
