import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export const ESTADOS_ORDEN: Record<string, { label: string; color: string }> = {
  RECIBIDO: { label: "Recibido", color: "bg-gray-100 text-gray-800" },
  DIAGNOSTICO: { label: "Diagnóstico", color: "bg-blue-100 text-blue-800" },
  APROBADO: { label: "Aprobado", color: "bg-purple-100 text-purple-800" },
  EN_PROCESO: { label: "En proceso", color: "bg-yellow-100 text-yellow-800" },
  EN_ESPERA: { label: "En espera", color: "bg-orange-100 text-orange-800" },
  LISTO: { label: "Listo", color: "bg-green-100 text-green-800" },
  ENTREGADO: { label: "Entregado", color: "bg-teal-100 text-teal-800" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export const PRIORIDADES: Record<string, { label: string; color: string }> = {
  BAJA: { label: "Baja", color: "bg-gray-100 text-gray-600" },
  NORMAL: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  ALTA: { label: "Alta", color: "bg-orange-100 text-orange-700" },
  URGENTE: { label: "Urgente", color: "bg-red-100 text-red-700" },
};

export const ESTADOS_CITA: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMADA: { label: "Confirmada", color: "bg-blue-100 text-blue-800" },
  EN_PROCESO: { label: "En proceso", color: "bg-purple-100 text-purple-800" },
  COMPLETADA: { label: "Completada", color: "bg-green-100 text-green-800" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  NO_SHOW: { label: "No se presentó", color: "bg-gray-100 text-gray-800" },
};

export const ESTADOS_FACTURA: Record<string, { label: string; color: string }> = {
  BORRADOR: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  PAGADA: { label: "Pagada", color: "bg-green-100 text-green-800" },
  VENCIDA: { label: "Vencida", color: "bg-red-100 text-red-800" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

export function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
