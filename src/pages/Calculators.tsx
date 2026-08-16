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

  // Conversion State
  const [btu, setBtu] = useState<string>("12000")
  const [psi, setPsi] = useState<string>("")
  const [celsius, setCelsius] = useState<string>("")
  const [fahrenheit, setFahrenheit] = useState<string>("")

  // Thermal Load State
  const [largo, setLargo] = useState<string>("")
  const [ancho, setAncho] = useState<string>("")
  const [altura, setAltura] = useState<string>("")
  const [ventanas, setVentanas] = useState<string>("")
  const [ventanaAncho, setVentanaAncho] = useState<string>("")
  const [ventanaAlto, setVentanaAlto] = useState<string>("")
  const [personas, setPersonas] = useState<string>("")
  const [equipos, setEquipos] = useState<string>("")
  
  // Iluminación
  const [bombillosLed, setBombillosLed] = useState<string>("")
  const [bombillosFluorescentes, setBombillosFluorescentes] = useState<string>("")
  const [bombillosIncandescentes, setBombillosIncandescentes] = useState<string>("")

  const [thermalResult, setThermalResult] = useState<number | null>(null)

  // Derived Conversions
  const btuNum = parseFloat(btu) || 0
  const tons = (btuNum / 12000).toFixed(2)
  const kw = (btuNum / 3412.14).toFixed(2)
  const frigs = (btuNum * 0.252).toFixed(0)

  const psiNum = parseFloat(psi) || 0
  const bar = psi ? (psiNum * 0.0689476).toFixed(2) : ""
  
  const cNum = parseFloat(celsius) || 0
  const fResult = celsius ? ((cNum * 9/5) + 32).toFixed(1) : ""
  
  const fNum = parseFloat(fahrenheit) || 0
  const cResult = fahrenheit ? ((fNum - 32) * 5/9).toFixed(1) : ""

  const calculateThermalLoad = () => {
    const l = parseFloat(largo) || 0;
    const w = parseFloat(ancho) || 0;
    const h = parseFloat(altura) || 0;
    const vCount = parseInt(ventanas) || 0;
    const vW = parseFloat(ventanaAncho) || 0;
    const vH = parseFloat(ventanaAlto) || 0;
    const p = parseInt(personas) || 0;
    const e = parseInt(equipos) || 0;
    
    const led = parseInt(bombillosLed) || 0;
    const fluor = parseInt(bombillosFluorescentes) || 0;
    const incan = parseInt(bombillosIncandescentes) || 0;

    if (l <= 0 || w <= 0 || h <= 0) {
      setThermalResult(null);
      return;
    }

    // Volumen en pies cúbicos
    const volume = l * w * h;
    const volumeBtu = volume * 5; // 5 BTU por pie cúbico para clima cálido

    // Área de ventanas en pies cuadrados
    const windowsArea = vW * vH * vCount;
    const windowsBtu = windowsArea * 80; // 80 BTU por pie cuadrado de ventana

    const personasBtu = p * 400; // 400 BTU por persona
    const equiposBtu = e * 600; // 600 BTU por equipo que genera calor
    
    const ledBtu = led * 34; // ~10W * 3.4
    const fluorBtu = fluor * 68; // ~20W * 3.4
    const incanBtu = incan * 200; // ~60W * 3.4

    const totalBtu = volumeBtu + windowsBtu + personasBtu + equiposBtu + ledBtu + fluorBtu + incanBtu;
    
    // Tamaños comerciales comunes en BTU
    const sizes = [9000, 12000, 18000, 24000, 36000, 48000, 60000];
    let recommended = sizes[sizes.length - 1];
    
    for (const size of sizes) {
      if (totalBtu <= size) {
        recommended = size;
        break;
      }
    }
    
    // Si excede 60000, recomendar el cálculo exacto redondeado hacia arriba
    setThermalResult(totalBtu > 60000 ? Math.ceil(totalBtu / 1000) * 1000 : recommended);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 py-2">
        <button onClick={() => navigate('/')} className="p-2 text-slate-300 hover:text-white">
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
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="h-10 text-right" 
                      value={btu} 
                      onChange={(e) => setBtu(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Toneladas (TR)</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value={btu ? tons : ""} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Kilovatios (kW)</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value={btu ? kw : ""} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Frigorías</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value={btu ? frigs : ""} />
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
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="h-10 text-right" 
                      value={psi}
                      onChange={(e) => setPsi(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Bar</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value={bar} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/80">
              <CardContent className="p-4 space-y-4">
                <h2 className="text-sm font-semibold text-slate-300">Temperatura</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Celsius (°C)</label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="h-10 text-right" 
                      value={celsius}
                      onChange={(e) => setCelsius(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Fahrenheit (°F)</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value={fResult} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-800 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Fahrenheit (°F)</label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="h-10 text-right" 
                      value={fahrenheit}
                      onChange={(e) => setFahrenheit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Celsius (°C)</label>
                    <Input type="number" placeholder="0" className="h-10 text-right bg-slate-800" readOnly value={cResult} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Card className="bg-slate-900/80 border-blue-900/30">
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-slate-400">Calcula la capacidad recomendada basada en medidas y factores térmicos.</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Largo (pies)</label>
                    <Input type="number" placeholder="Ej. 12" className="h-10" value={largo} onChange={(e) => setLargo(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Ancho (pies)</label>
                    <Input type="number" placeholder="Ej. 10" className="h-10" value={ancho} onChange={(e) => setAncho(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Altura (pies)</label>
                    <Input type="number" placeholder="Ej. 9" className="h-10" value={altura} onChange={(e) => setAltura(e.target.value)} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Ventanas (opcional)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Cantidad</label>
                      <Input type="number" placeholder="Ej. 2" className="h-10" value={ventanas} onChange={(e) => setVentanas(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Ancho (pies)</label>
                      <Input type="number" placeholder="Ej. 3" className="h-10" value={ventanaAncho} onChange={(e) => setVentanaAncho(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Alto (pies)</label>
                      <Input type="number" placeholder="Ej. 4" className="h-10" value={ventanaAlto} onChange={(e) => setVentanaAlto(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Iluminación</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">LED</label>
                      <Input type="number" placeholder="Cant." className="h-10" value={bombillosLed} onChange={(e) => setBombillosLed(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Fluorescentes</label>
                      <Input type="number" placeholder="Cant." className="h-10" value={bombillosFluorescentes} onChange={(e) => setBombillosFluorescentes(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Incandescentes</label>
                      <Input type="number" placeholder="Cant." className="h-10" value={bombillosIncandescentes} onChange={(e) => setBombillosIncandescentes(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Fuentes de calor adicionales</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Personas aprox.</label>
                      <Input type="number" placeholder="Ej. 2" className="h-10" value={personas} onChange={(e) => setPersonas(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400">Equipos de calor</label>
                      <Input type="number" placeholder="Ej. 1" className="h-10" value={equipos} onChange={(e) => setEquipos(e.target.value)} />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4" onClick={calculateThermalLoad}>Calcular Capacidad</Button>
              </CardContent>
            </Card>

            {/* Result */}
            {thermalResult !== null && (
              <div className="mt-2 mb-8 text-center bg-blue-900/20 border border-blue-900/50 rounded-xl p-4">
                 <p className="text-sm text-blue-200 mb-1">Capacidad recomendada</p>
                 <h3 className="text-3xl font-bold text-blue-500">{thermalResult.toLocaleString()} <span className="text-lg text-slate-300">BTU/h</span></h3>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
