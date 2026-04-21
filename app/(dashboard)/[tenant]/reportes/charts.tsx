"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, ESTADOS_ORDEN } from "@/lib/utils";

interface Props {
  dataMeses: { mes: string; ingresos: number }[];
  dataEstados: { estado: string; cantidad: number }[];
  topServicios: { nombre: string; cantidad: number }[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];

export function ReportesCharts({ dataMeses, dataEstados, topServicios }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ingresos por mes */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ingresos últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataMeses} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), "Ingresos"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="ingresos" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Órdenes por estado */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes por estado</CardTitle>
        </CardHeader>
        <CardContent>
          {dataEstados.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dataEstados}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="cantidad"
                  nameKey="estado"
                >
                  {dataEstados.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [val, ESTADOS_ORDEN[name as string]?.label ?? name]}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Legend formatter={(val) => ESTADOS_ORDEN[val]?.label ?? val} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios más solicitados</CardTitle>
        </CardHeader>
        <CardContent>
          {topServicios.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {topServicios.map((svc, i) => {
                const max = topServicios[0]?.cantidad ?? 1;
                const pct = (svc.cantidad / max) * 100;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate mr-2">{svc.nombre}</span>
                      <span className="font-semibold text-gray-900 flex-shrink-0">{svc.cantidad}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
