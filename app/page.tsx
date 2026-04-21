import Link from "next/link";
import {
  Wrench, BarChart3, Users, ClipboardList, Calendar, Package,
  CheckCircle, ArrowRight, Star, Zap, Shield, Clock, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ClipboardList,
    titulo: "Órdenes de Trabajo",
    desc: "Crea y gestiona órdenes de trabajo desde el diagnóstico hasta la entrega. Nunca pierdas el control de ningún vehículo.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Users,
    titulo: "Gestión de Clientes",
    desc: "Historial completo de cada cliente y sus vehículos. Mantén una relación profesional y personalizada.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Calendar,
    titulo: "Agenda y Citas",
    desc: "Programa citas y asigna mecánicos fácilmente. Reduce los tiempos de espera y mejora la satisfacción.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Package,
    titulo: "Control de Inventario",
    desc: "Lleva el control de tus refacciones y partes. Alertas automáticas cuando el stock está bajo.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart3,
    titulo: "Reportes y Análisis",
    desc: "Visualiza el rendimiento de tu taller con reportes detallados. Toma decisiones basadas en datos reales.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Wrench,
    titulo: "Catálogo de Servicios",
    desc: "Crea tu catálogo de servicios y mano de obra. Genera presupuestos y facturas en segundos.",
    color: "bg-rose-50 text-rose-600",
  },
];

const planes = [
  {
    nombre: "Básico",
    precio: "499",
    desc: "Perfecto para talleres pequeños",
    features: [
      "Hasta 2 usuarios",
      "Órdenes de trabajo ilimitadas",
      "Gestión de clientes y vehículos",
      "Inventario básico",
      "Soporte por email",
    ],
    popular: false,
  },
  {
    nombre: "Profesional",
    precio: "999",
    desc: "Para talleres en crecimiento",
    features: [
      "Hasta 10 usuarios",
      "Todo lo del plan Básico",
      "Agenda y citas",
      "Reportes avanzados",
      "Facturación",
      "Soporte prioritario",
    ],
    popular: true,
  },
  {
    nombre: "Empresarial",
    precio: "1,999",
    desc: "Para talleres con múltiples sucursales",
    features: [
      "Usuarios ilimitados",
      "Todo lo del plan Profesional",
      "Múltiples sucursales",
      "API de integración",
      "Gerente de cuenta dedicado",
      "Soporte 24/7",
    ],
    popular: false,
  },
];

const testimonios = [
  {
    nombre: "Roberto Sánchez",
    taller: "Taller Sánchez Automotriz",
    ciudad: "Guadalajara, Jalisco",
    texto: "Desde que uso MecánicaPro organicé completamente mi taller. Las órdenes de trabajo y el control de inventario me ahorraron horas cada semana.",
    estrellas: 5,
  },
  {
    nombre: "María González",
    taller: "Auto Service González",
    ciudad: "Monterrey, N.L.",
    texto: "Mis clientes están muy contentos porque les damos seguimiento puntual. El sistema es fácil de usar y el soporte es excelente.",
    estrellas: 5,
  },
  {
    nombre: "Carlos Mendoza",
    taller: "Mecánica Mendoza e Hijos",
    ciudad: "CDMX",
    texto: "Los reportes me permiten ver qué servicios son más rentables. Aumenté mis ingresos 30% en 3 meses después de adoptar MecánicaPro.",
    estrellas: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">MecánicaPro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#caracteristicas" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Características</a>
              <a href="#precios" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Precios</a>
              <a href="#testimonios" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Testimonios</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/registro">
                <Button size="sm">Prueba gratis <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-sm text-indigo-700 font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            El sistema #1 para talleres mecánicos en México
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Gestiona tu taller<br />
            <span className="text-indigo-600">como un profesional</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Órdenes de trabajo, clientes, inventario, citas y reportes en una sola plataforma.
            Diseñado para talleres mecánicos en México.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" className="text-base px-8">
                Comenzar gratis 30 días
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8">
                Ver demostración
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">Sin tarjeta de crédito · Configura en minutos · Soporte en español</p>

          {/* Dashboard preview */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 mx-4 bg-gray-700 rounded h-5 flex items-center px-3">
                  <span className="text-gray-400 text-xs">mecanicapro.mx/mi-taller/dashboard</span>
                </div>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Órdenes activas", value: "24", color: "bg-blue-500" },
                    { label: "Listas hoy", value: "8", color: "bg-green-500" },
                    { label: "Clientes este mes", value: "67", color: "bg-purple-500" },
                    { label: "Ingresos hoy", value: "$12,400", color: "bg-indigo-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { num: "OT-0089", cliente: "Juan Pérez", vehiculo: "Toyota Corolla 2020", estado: "En proceso", color: "bg-yellow-100 text-yellow-800" },
                    { num: "OT-0090", cliente: "Ana López", vehiculo: "Nissan Sentra 2018", estado: "Listo", color: "bg-green-100 text-green-800" },
                    { num: "OT-0091", cliente: "Pedro García", vehiculo: "Volkswagen Jetta 2019", estado: "Recibido", color: "bg-gray-100 text-gray-800" },
                  ].map((orden, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-600">{orden.num}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orden.color}`}>{orden.estado}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{orden.cliente}</div>
                      <div className="text-xs text-gray-500">{orden.vehiculo}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-indigo-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "2,500+", label: "Talleres activos" },
              { num: "180,000+", label: "Órdenes procesadas" },
              { num: "95%", label: "Satisfacción de clientes" },
              { num: "30%", label: "Aumento promedio en ingresos" },
            ].map((stat, i) => (
              <div key={i} className="text-white">
                <div className="text-3xl font-bold">{stat.num}</div>
                <div className="text-indigo-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section id="caracteristicas" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesita tu taller
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Una plataforma completa diseñada específicamente para el mercado mexicano
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${f.color} mb-4`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir MecánicaPro?
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, titulo: "Configuración en minutos", desc: "Sin instalaciones complicadas. Accede desde cualquier dispositivo con internet." },
                  { icon: Shield, titulo: "Datos seguros", desc: "Tu información está protegida con encriptación de nivel bancario." },
                  { icon: Clock, titulo: "Ahorra hasta 5 horas por semana", desc: "Automatiza tareas administrativas y enfócate en lo que importa: tu negocio." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.titulo}</h4>
                      <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/registro" className="inline-flex mt-8">
                <Button size="lg">
                  Empezar ahora <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Órdenes creadas hoy", value: "12", trend: "+3", color: "border-l-4 border-blue-500" },
                { label: "Clientes atendidos", value: "89", trend: "+12%", color: "border-l-4 border-green-500" },
                { label: "Refacciones en stock", value: "234", trend: "5 bajas", color: "border-l-4 border-orange-500" },
                { label: "Ingresos del mes", value: "$142,800", trend: "+18%", color: "border-l-4 border-purple-500" },
              ].map((stat, i) => (
                <div key={i} className={`bg-white rounded-xl p-5 shadow-sm ${stat.color}`}>
                  <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-green-600 mt-1 font-medium">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Precios simples y transparentes</h2>
            <p className="text-lg text-gray-500">Sin cargos ocultos. Cancela cuando quieras.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {planes.map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-8 ${plan.popular ? "bg-indigo-600 text-white shadow-2xl scale-105" : "bg-white border border-gray-200"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    MÁS POPULAR
                  </div>
                )}
                <div className={`text-sm font-semibold mb-2 ${plan.popular ? "text-indigo-200" : "text-indigo-600"}`}>{plan.nombre}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-sm ${plan.popular ? "text-indigo-200" : "text-gray-500"}`}>$</span>
                  <span className="text-4xl font-bold">{plan.precio}</span>
                  <span className={`text-sm pb-1 ${plan.popular ? "text-indigo-200" : "text-gray-500"}`}>/mes</span>
                </div>
                <p className={`text-sm mb-6 ${plan.popular ? "text-indigo-200" : "text-gray-500"}`}>{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${plan.popular ? "text-indigo-200" : "text-green-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/registro">
                  <Button
                    className={`w-full ${plan.popular ? "bg-white text-indigo-600 hover:bg-indigo-50" : ""}`}
                    variant={plan.popular ? "secondary" : "default"}
                  >
                    Comenzar gratis
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonios.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.estrellas }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.texto}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.nombre}</div>
                  <div className="text-gray-500 text-xs">{t.taller} · {t.ciudad}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para transformar tu taller?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Únete a más de 2,500 talleres que ya usan MecánicaPro. 30 días gratis, sin compromisos.
          </p>
          <Link href="/registro">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 text-base px-10">
              Empezar ahora — Es gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-bold">MecánicaPro</span>
              </div>
              <p className="text-sm">El sistema de gestión más completo para talleres mecánicos en México.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#caracteristicas" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#testimonios" className="hover:text-white transition-colors">Casos de éxito</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white cursor-pointer transition-colors">Centro de ayuda</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Contacto</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">WhatsApp</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white cursor-pointer transition-colors">Privacidad</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Términos de uso</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-sm text-center">
            © 2026 MecánicaPro. Hecho con amor para los talleres de México.
          </div>
        </div>
      </footer>
    </div>
  );
}
