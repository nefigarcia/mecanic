"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Users, Car, Package,
  Calendar, FileText, BarChart3, Settings, Wrench, Users2,
  LogOut, ChevronDown
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  tenant: {
    slug: string;
    nombre: string;
    logo?: string | null;
    plan: string;
  };
  usuario: {
    nombre: string;
    email: string;
    imagen?: string | null;
  };
}

export function Sidebar({ tenant, usuario }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const base = `/${tenant.slug}`;

  const navItems = [
    { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/ordenes`, label: "Órdenes de trabajo", icon: ClipboardList },
    { href: `${base}/citas`, label: "Citas", icon: Calendar },
    { href: `${base}/clientes`, label: "Clientes", icon: Users },
    { href: `${base}/vehiculos`, label: "Vehículos", icon: Car },
    { href: `${base}/inventario`, label: "Inventario", icon: Package },
    { href: `${base}/facturas`, label: "Facturas", icon: FileText },
    { href: `${base}/empleados`, label: "Empleados", icon: Users2 },
    { href: `${base}/reportes`, label: "Reportes", icon: BarChart3 },
    { href: `${base}/configuracion`, label: "Configuración", icon: Settings },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 flex-shrink-0",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{tenant.nombre}</p>
            <p className="text-xs text-gray-400 capitalize">{tenant.plan.toLowerCase()}</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-400 hover:text-white"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed ? "-rotate-90" : "rotate-90")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">{usuario.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-2 text-sm text-gray-400 hover:text-white w-full px-2 py-1.5 rounded hover:bg-gray-800 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}
