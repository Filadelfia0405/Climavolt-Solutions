import { useState } from "react"
import { ArrowLeft, ThermometerSun, RefreshCcw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { cn } from "../lib/utils"

export function Calculators() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"conversion" | "carga">("conversion")

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 py-2">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Calculadoras HVAC</h1>
      </header>

      {/* Tabs */}
      <div className="mt-6 flex rounded-xl bg-slate-900/50 p-1">
        <button
          onClick={() => setActiveTab("conversion")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
            activeTab === "conversion" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <RefreshCcw size={16} />
          Conversión
        </button>
        <button
          onClick={() => setActiveTab("carga")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
            activeTab === "carga" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <ThermometerSun size={16} />
          Carga Térmica
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-6 flex flex-col gap-4"
      >
        {activeTab === "conversion" ? (
          <div className="flex flex-col gap-4">
            <Card className="bg-slate-900/80">
              <CardContent className="p-4 space-y-4">
                <h2 className="text-sm font-semibold text-slate-300">Potencia de Enfriamiento</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">BTU/h</label>
                    <Input type="number" placeholder="0" className="h-10 text-right" defaultValue="12000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Toneladas (TR)</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value="1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Kilovatios (kW)</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value="3.51" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Frigorías</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value="3024" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80">
              <CardContent className="p-4 space-y-4">
                <h2 className="text-sm font-semibold text-slate-300">Presión</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">PSI</label>
                    <Input type="number" placeholder="0" className="h-10 text-right" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Bar</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Card className="bg-slate-900/80 border-blue-900/30">
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-slate-400">Calcula la capacidad recomendada para un espacio cerrado estándar.</p>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Largo (metros)</label>
                  <Input type="number" placeholder="Ej. 4" className="h-10" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Ancho (metros)</label>
                  <Input type="number" placeholder="Ej. 3" className="h-10" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Personas aprox.</label>
                    <Input type="number" placeholder="Ej. 2" className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Equipos que generan calor</label>
                    <Input type="number" placeholder="Ej. 1" className="h-10" />
                  </div>
                </div>

                <Button className="w-full mt-2">Calcular Capacidad</Button>
              </CardContent>
            </Card>

            {/* Simulated Result */}
            <div className="mt-2 text-center">
               <p className="text-sm text-slate-400 mb-1">Capacidad recomendada</p>
               <h3 className="text-3xl font-bold text-blue-500">9,000 <span className="text-lg text-slate-300">BTU/h</span></h3>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
