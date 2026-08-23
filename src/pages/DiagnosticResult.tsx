import { useState, useEffect } from "react"
import { ArrowLeft, MessageCircle, ChevronRight, Activity, Zap, Cpu, Settings, Loader2, AlertTriangle, X, BookOpen } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface DiagnosticData {
  mostProbableCause: {
    title: string;
    description: string;
    probability: number;
  };
  otherCauses: {
    title: string;
    probability: number;
  }[];
  recommendedSteps: string[];
}

interface GuideSection {
  title: string;
  content: string;
}

export function DiagnosticResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const code = location.state?.code || "Desconocido"
  
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null)

  const [showGuideModal, setShowGuideModal] = useState(false)
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false)
  const [guideData, setGuideData] = useState<GuideSection[] | null>(null)

  const getGeminiModel = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("No se encontró la API Key de Gemini.");

    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!modelsRes.ok) throw new Error("Error verificando los modelos de Gemini.");
    
    const modelsData = await modelsRes.json();
    const validModels = (modelsData.models || []).filter((m: any) => 
      m.supportedGenerationMethods?.includes("generateContent") && 
      m.name.includes("gemini") &&
      !m.name.includes("vision") &&
      !m.name.includes("2.5")
    );

    validModels.sort((a: any, b: any) => b.name.localeCompare(a.name));
    const validModel = validModels[0];
    if (!validModel) throw new Error("No se encontró ningún modelo compatible.");

    const modelName = validModel.name.replace("models/", "");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });
  };

  useEffect(() => {
    const fetchDiagnostic = async () => {
      try {
        const model = await getGeminiModel();
        const prompt = `Eres un técnico experto en HVAC (aire acondicionado). Diagnostica el código de error: "${code}".
Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "mostProbableCause": { "title": "...", "description": "...", "probability": 78 },
  "otherCauses": [ { "title": "...", "probability": 15 }, { "title": "...", "probability": 7 } ],
  "recommendedSteps": [ "Paso 1...", "Paso 2..." ]
}
Asegúrate de que las probabilidades sumen 100 y de que los pasos sean claros y técnicos.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        setDiagnostic(JSON.parse(cleanText) as DiagnosticData);
      } catch (err: any) {
        console.error("Gemini API Error:", err);
        setErrorMsg(err.message || "Ocurrió un error al consultar a la IA.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchDiagnostic();
  }, [code]);

  const handleShowGuide = async () => {
    setShowGuideModal(true);
    if (guideData) return;

    setIsGeneratingGuide(true);
    try {
      const model = await getGeminiModel();
      const prompt = `Eres un técnico experto en HVAC. Proporciona una guía completa de reparación detallada para el código de error "${code}". 
Responde ÚNICAMENTE con un arreglo (array) JSON válido que contenga pasos detallados de solución, con esta estructura exacta:
[
  { "title": "Paso 1: Verificación inicial", "content": "Detalle técnico de qué medir y cómo proceder..." },
  { "title": "Paso 2: ...", "content": "..." }
]
Sé muy profesional, técnico y detallado en el campo del aire acondicionado.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      setGuideData(JSON.parse(cleanText) as GuideSection[]);
    } catch (err: any) {
      console.error("Gemini Guide Error:", err);
      // Fallback in case it fails
      setGuideData([
        { title: "Error", content: "No se pudo generar la guía completa en este momento. Inténtalo de nuevo más tarde." }
      ]);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 py-2">
        <button onClick={() => navigate('/')} className="p-2 text-slate-300 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">
          {isAnalyzing ? "Analizando con IA..." : `Resultado: ${code}`}
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 mt-20"
          >
            <Loader2 size={48} className="animate-spin text-blue-500 mb-6" />
            <h2 className="text-xl font-semibold text-white mb-2 text-center">
              Evaluando código {code}
            </h2>
            <p className="text-slate-400 text-center max-w-xs text-sm animate-pulse">
              La IA está consultando manuales técnicos y casos similares para encontrar la mejor solución...
            </p>
          </motion.div>
        ) : errorMsg ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center flex-1 mt-20 text-center"
          >
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Error de diagnóstico</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">{errorMsg}</p>
            <Button onClick={() => navigate(-1)} variant="outline">Volver a intentar</Button>
          </motion.div>
        ) : diagnostic ? (
          <motion.div
            key="result"
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
                    <span className="text-3xl font-bold">{diagnostic.mostProbableCause.probability}</span>
                    <span className="text-sm font-medium">%</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-white">{diagnostic.mostProbableCause.title}</h3>
                    <p className="mb-3 text-xs text-slate-400">{diagnostic.mostProbableCause.description}</p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${diagnostic.mostProbableCause.probability}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Other Causes */}
            {diagnostic.otherCauses.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-slate-300">Otras posibles causas</h2>
                <Card className="bg-slate-900/50">
                  <div className="flex flex-col divide-y divide-slate-800/50">
                    {diagnostic.otherCauses.map((cause, idx) => (
                      <button key={idx} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-default">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-blue-400">{cause.probability}%</span>
                          <span className="text-sm font-medium text-slate-300 text-left">{cause.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Recommended Steps */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-300">Pasos recomendados</h2>
              <Card className="bg-slate-900/50">
                <div className="flex flex-col divide-y divide-slate-800/50">
                  {diagnostic.recommendedSteps.map((step, idx) => {
                    const Icon = idx === 0 ? Activity : idx === 1 ? Zap : idx === 2 ? Cpu : Settings;
                    const iconColor = idx === 2 ? "text-green-500" : "text-slate-400";
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4">
                        <Icon size={20} className={`${iconColor} shrink-0`} />
                        <span className="text-sm text-slate-300">{step}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            <Button size="lg" className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={handleShowGuide}>
              <BookOpen size={18} className="mr-2" />
              Ver guía completa
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Guía Completa: {code}</h3>
                </div>
                <button 
                  onClick={() => setShowGuideModal(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                {isGeneratingGuide ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                    <p className="text-slate-300 font-medium">Redactando guía detallada...</p>
                    <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">La IA está estructurando los pasos técnicos para la solución del error {code}.</p>
                  </div>
                ) : guideData ? (
                  <div className="space-y-6">
                    {guideData.map((section, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-blue-400 font-bold mb-2">{section.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Chat */}
      <button className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all">
        <MessageCircle size={28} />
      </button>
    </div>
  )
}
