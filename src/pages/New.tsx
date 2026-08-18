import { useNavigate } from "react-router-dom"
import { ArrowLeft, FileText, DollarSign, Users, Wrench, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../components/ui/card"

export function New() {
  const navigate = useNavigate()

  const ACTIONS = [
    {
      title: "Nueva Factura",
      description: "Crear y enviar una factura de servicio",
      icon: FileText,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-500/20",
      textLight: "text-yellow-500",
      path: "/billing"
    },
    {
      title: "Nuevo Presupuesto",
      description: "Generar una cotización para un cliente",
      icon: DollarSign,
      color: "bg-orange-500",
      bgLight: "bg-orange-500/20",
      textLight: "text-orange-500",
      path: "/presupuestos"
    },
    {
      title: "Nuevo Historial",
      description: "Registrar servicio o mantenimiento de equipo",
      icon: Wrench,
      color: "bg-blue-500",
      bgLight: "bg-blue-500/20",
      textLight: "text-blue-500",
      path: "/history"
    },
    {
      title: "Nuevo Cliente",
      description: "Registrar datos de un cliente nuevo",
      icon: Users,
      color: "bg-indigo-500",
      bgLight: "bg-indigo-500/20",
      textLight: "text-indigo-500",
      path: "/clients"
    },
    {
      title: "Nueva Cita",
      description: "Agendar un servicio en tu calendario",
      icon: Calendar,
      color: "bg-purple-500",
      bgLight: "bg-purple-500/20",
      textLight: "text-purple-500",
      path: "/agenda"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 py-2 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white -ml-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Crear Nuevo</h1>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                onClick={() => navigate(action.path)}
                className="cursor-pointer border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${action.bgLight} ${action.textLight}`}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{action.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
