import { ArrowLeft, AlertTriangle, Calculator, BookOpen, DollarSign, ClipboardList, Users, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const ALL_TOOLS = [
  { icon: AlertTriangle, label: "Códigos de error", color: "bg-red-500/20 text-red-500", path: "/error-codes" },
  { icon: Calculator, label: "Calculadoras", color: "bg-green-500/20 text-green-500", path: "/calculators" },
  { icon: Users, label: "Registro de Clientes", color: "bg-indigo-500/20 text-indigo-500", path: "/clients" },
  { icon: FileText, label: "Facturación", color: "bg-yellow-500/20 text-yellow-500", path: "/billing" },
  { icon: BookOpen, label: "Manuales", color: "bg-blue-500/20 text-blue-500", path: "/manuals" },
  { icon: DollarSign, label: "Presupuestos", color: "bg-orange-500/20 text-orange-500", path: "/presupuestos" },
  { icon: FileText, label: "Hist. Presupuestos", color: "bg-amber-500/20 text-amber-500", path: "/estimate-history" },
  { icon: ClipboardList, label: "Historial de equipos", color: "bg-teal-500/20 text-teal-500", path: "/history" },
  { icon: AlertTriangle, label: "Pendientes", badge: "Cobros", color: "bg-red-500/20 text-red-500", path: "/invoice-history?status=pending" },
  { icon: DollarSign, label: "Pagadas", color: "bg-green-500/20 text-green-500", path: "/invoice-history?status=paid" },
]

export function Tools() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col p-4 bg-[#0B1120]">
      <header className="mb-6 flex items-center gap-3 pt-2">
        <button 
          onClick={() => navigate('/')}
          className="rounded-full bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Todas las herramientas</h1>
          <p className="text-xs text-slate-400">Accede al catálogo completo</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">
        {ALL_TOOLS.map((tool, index) => {
          const Icon = tool.icon
          return (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={index}
              onClick={() => navigate(tool.path)}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900/50 p-6 text-center transition-all hover:bg-slate-800 border border-slate-800/50"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tool.color} transition-transform group-hover:scale-110`}>
                <Icon size={28} />
              </div>
              <span className="text-sm font-medium leading-tight text-slate-300">
                {tool.label}
              </span>
              {tool.badge && (
                <span className="absolute right-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {tool.badge}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
