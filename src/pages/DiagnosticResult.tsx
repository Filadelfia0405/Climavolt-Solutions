import { ArrowLeft, MessageCircle, ChevronRight, Activity, Zap, Cpu, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"

export function DiagnosticResult() {
  const navigate = useNavigate()

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 py-2">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Resultado del diagnóstico</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mt-6 flex flex-col gap-6"
      >
        {/* Most Probable Cause */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Causa más probable</h2>
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-slate-900/80">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex items-baseline gap-1 text-green-500">
                <span className="text-3xl font-bold">78</span>
                <span className="text-sm font-medium">%</span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-white">Falla de comunicación entre unidades</h3>
                <p className="mb-3 text-xs text-slate-400">Problema en cableado de comunicación o en tarjeta de control.</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[78%] bg-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Other Causes */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Otras posibles causas</h2>
          <Card className="bg-slate-900/50">
            <div className="flex flex-col divide-y divide-slate-800/50">
              <button className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-blue-400">15%</span>
                  <span className="text-sm font-medium text-slate-300">Tarjeta electrónica exterior dañada</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <button className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-blue-400">7%</span>
                  <span className="text-sm font-medium text-slate-300">Módulo IPM defectuoso</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>
          </Card>
        </div>

        {/* Recommended Steps */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Pasos recomendados</h2>
          <Card className="bg-slate-900/50">
            <div className="flex flex-col divide-y divide-slate-800/50">
              <div className="flex items-center gap-4 p-4">
                <Activity size={20} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-300">Verificar cableado de comunicación entre unidades.</span>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Zap size={20} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-300">Medir voltaje entre 1 y 2 (aprox. 5V DC).</span>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Cpu size={20} className="text-green-500 shrink-0" />
                <span className="text-sm text-slate-300">Revisar tarjeta electrónica exterior.</span>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Settings size={20} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-300">Si todo está correcto, reemplazar tarjeta de control.</span>
              </div>
            </div>
          </Card>
        </div>

        <Button size="lg" className="mt-2 w-full">
          Ver guía completa
        </Button>
      </motion.div>

      {/* Floating Action Button for Chat */}
      <button className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all">
        <MessageCircle size={28} />
      </button>
    </div>
  )
}
