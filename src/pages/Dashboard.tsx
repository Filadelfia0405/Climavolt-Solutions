import { Bell, AlertTriangle, Calculator, ClipboardList, Users, FileText, DollarSign } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useNotifications } from "../hooks/useNotifications"
import { logoBase64 } from "../assets/logoBase64"

const QUICK_TOOLS = [
  { icon: AlertTriangle, label: "Códigos de error", color: "bg-red-500/20 text-red-500", path: "/error-codes" },
  { icon: Calculator, label: "Calculadoras", color: "bg-green-500/20 text-green-500", path: "/calculators" },
  { icon: FileText, label: "Facturación", color: "bg-yellow-500/20 text-yellow-500", path: "/billing" },
  { icon: Users, label: "Clientes", color: "bg-indigo-500/20 text-indigo-500", path: "/clients" },
  { icon: DollarSign, label: "Presupuestos", color: "bg-orange-500/20 text-orange-500", path: "/presupuestos" },
  { icon: ClipboardList, label: "Hist. Facturas", color: "bg-teal-500/20 text-teal-500", path: "/invoice-history" },
]

const RECENT_ACCESS = [
  { 
    id: 1, 
    model: "Midea Inverter 12K", 
    desc: "Último diagnóstico: Error E4", 
    date: "20 May 2025" 
  },
  { 
    id: 2, 
    model: "LG Dual Inverter 18K", 
    desc: "Mantenimiento completo", 
    date: "18 May 2025" 
  },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white rounded-xl px-3 py-2 shadow-lg shadow-white/5">
            <img 
              src={logoBase64} 
              alt="ClimaVolt" 
              className="h-6 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
        <button 
          onClick={() => navigate('/notificaciones')}
          className="relative rounded-full p-2 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-red-500 animate-pulse" />
          )}
        </button>
      </header>

      {/* Main Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden border-blue-900/50 bg-[#0f192d]">
          <CardContent className="relative flex p-6 min-h-[180px]">
            {/* Contenido de texto (Z-index superior para estar encima si hay superposición) */}
            <div className="relative z-20 flex w-2/3 flex-col justify-center pr-4">
              <h2 className="mb-2 text-xl font-bold text-white tracking-tight leading-tight">Diagnóstico inteligente</h2>
              <p className="mb-4 text-sm text-slate-300 leading-snug">
                Resuelve fallas más rápido con ayuda de IA
              </p>
              <div>
                <Button onClick={() => navigate('/diagnostico')} className="bg-blue-600 hover:bg-blue-700 h-10 px-5 text-sm font-semibold shadow-md">
                  Iniciar diagnóstico
                </Button>
              </div>
            </div>
            
            {/* Imagen a la derecha */}
            <div className="absolute inset-y-0 right-[-10%] w-[55%] z-10 pointer-events-none flex items-center">
              {/* Degradado para transición suave entre texto e imagen */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f192d] via-transparent to-transparent z-10" />
              
              <img 
                src="/condenser.png" 
                alt="Condensadora" 
                className="w-full h-[140%] object-cover object-left-center opacity-90 drop-shadow-2xl"
                style={{ objectPosition: 'left center' }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tools */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Herramientas rápidas</h3>
          <button onClick={() => navigate('/tools')} className="text-sm text-blue-500 hover:underline">Ver todo</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_TOOLS.map((tool, index) => {
            const Icon = tool.icon
            return (
              <button
                key={index}
                onClick={() => navigate(tool.path)}
                className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-900/50 p-4 text-center transition-colors hover:bg-slate-800 border border-slate-800/50"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tool.color} transition-transform group-hover:scale-110`}>
                  <Icon size={24} />
                </div>
                <span className="text-[11px] font-medium leading-tight text-slate-300">
                  {tool.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Access */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Accesos recientes</h3>
          <button onClick={() => navigate('/history')} className="text-sm text-blue-500 hover:underline">Ver todo</button>
        </div>
        <div className="flex flex-col gap-3">
          {RECENT_ACCESS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-800/50 bg-slate-900/50 p-4 hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                   <div className="h-6 w-8 border border-slate-600 rounded-sm flex items-center justify-center relative">
                      <div className="w-4 h-4 rounded-full border border-slate-500" />
                   </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.model}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-500">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
