import { useState, useEffect } from "react"
import { ArrowLeft, Search, AlertTriangle, ChevronRight, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card } from "../components/ui/card"
import { supabase } from "../lib/supabase"

interface ErrorCode {
  id: string
  code: string
  brand: string
  description: string
}

export function ErrorCodes() {
  const navigate = useNavigate()
  const [searchCode, setSearchCode] = useState("")
  const [searchBrand, setSearchBrand] = useState("")
  const [activeSearch, setActiveSearch] = useState({ code: "", brand: "" })
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchErrorCodes() {
      try {
        const { data, error } = await supabase
          .from("error_codes")
          .select("id, code, brand, description")
        
        if (error) throw error
        setErrorCodes(data || [])
      } catch (error) {
        console.error("Error fetching error codes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchErrorCodes()
  }, [])

  const filteredCodes = errorCodes.filter(
    (err) => 
      err.code.toLowerCase().includes(activeSearch.code.toLowerCase()) && 
      err.brand.toLowerCase().includes(activeSearch.brand.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 py-2">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">Códigos de Error</h1>
      </header>

      {/* Search Bars */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Error del equipo (ej. E1, F2)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Marca de equipo (ej. Lennox, Carrier)..."
            value={searchBrand}
            onChange={(e) => setSearchBrand(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={() => setActiveSearch({ code: searchCode, brand: searchBrand })}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/20"
        >
          <Search size={18} />
          Buscar error
        </button>
      </div>

      {/* List */}
      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredCodes.length > 0 ? (
          filteredCodes.map((item) => (
            <Card key={item.id} className="bg-slate-900/50 hover:bg-slate-800/80 transition-colors border-slate-800/80 cursor-pointer overflow-hidden">
               <div className="flex items-center p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{item.code}</h3>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                        {item.brand}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                  </div>
                  <ChevronRight className="text-slate-600" size={20} />
               </div>
            </Card>
          ))
        ) : (
          <div className="mt-10 text-center text-slate-500">
             No se encontraron códigos de error.
          </div>
        )}
      </div>
    </div>
  )
}
