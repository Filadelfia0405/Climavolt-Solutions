import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, X } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"

export function DiagnosticInput() {
  const navigate = useNavigate()
  const [code, setCode] = useState("P6")

  const handleContinue = () => {
    if (!code.trim()) return;
    navigate("/diagnostico/resultado", { state: { code } });
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 py-2">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Diagnóstico inteligente</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mt-6 flex flex-col gap-8"
      >
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="w-1/2 bg-blue-600" />
          </div>
          <p className="text-right text-xs font-medium text-slate-400">Paso 3 de 6</p>
        </div>

        {/* Question */}
        <div>
          <h2 className="mb-2 text-2xl font-bold leading-tight text-white">
            ¿Qué código de error aparece en el equipo?
          </h2>
          <p className="text-sm text-slate-400">Ejemplo: E4, P6, F1, etc.</p>
        </div>

        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 p-4 text-xl font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
            placeholder="Escriba aquí"
          />
          {code && (
            <button
              onClick={() => setCode("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-700 p-1 text-slate-300 hover:bg-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button className="text-left text-sm font-medium text-blue-500 hover:underline">
          No aparece código de error
        </button>

        <Button onClick={handleContinue} className="mt-2" size="lg">
          Continuar
        </Button>

        {/* Selected Equipment */}
        <div className="mt-auto pt-8">
          <h3 className="mb-3 text-sm font-medium text-slate-400">Equipo seleccionado</h3>
          <Card className="bg-slate-900/80">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                    {/* AC Icon placeholder */}
                    <div className="h-6 w-8 border border-slate-500 rounded-sm flex items-center justify-center relative">
                      <div className="w-4 h-4 rounded-full border border-slate-400" />
                   </div>
                 </div>
                 <div>
                   <h4 className="font-semibold text-white">Midea Inverter 12,000 BTU</h4>
                   <p className="text-xs text-green-400">R410A</p>
                   <p className="text-xs text-slate-400">Pared / Split</p>
                 </div>
              </div>
              <button className="text-sm font-medium text-blue-500 hover:underline">
                Cambiar
              </button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
