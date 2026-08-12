import { useState, useEffect } from "react"
import { ArrowLeft, Search, Calendar, MapPin, User, Plus, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card } from "../components/ui/card"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"

interface HistoryRecord {
  id: string
  maintenance_type: string
  status: string
  date: string
  equipments: {
    customer_name: string
    address: string
    model: string
  }
}

export function History() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("history")
          .select(`
            id,
            maintenance_type,
            status,
            date,
            equipments (
              customer_name,
              address,
              model
            )
          `)
          .eq("technician_id", user.id)
          .order("date", { ascending: false })
        
        if (error) throw error
        setHistoryData(data as unknown as HistoryRecord[] || [])
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  const filteredHistory = historyData.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      item.equipments?.customer_name?.toLowerCase().includes(term) ||
      item.equipments?.model?.toLowerCase().includes(term) ||
      item.equipments?.address?.toLowerCase().includes(term) ||
      item.maintenance_type.toLowerCase().includes(term)
    )
  })

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">Historial de Equipos</h1>
        </div>
        <button className="flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
          <Plus size={14} />
          Nuevo
        </button>
      </header>

      {/* Search Bar */}
      <div className="mt-4 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Buscar cliente, equipo o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* List */}
      <div className="mt-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <Card key={item.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors overflow-hidden">
               <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-semibold text-white text-base">{item.equipments?.model}</h3>
                       <p className="text-xs text-blue-400 font-medium">{item.maintenance_type}</p>
                     </div>
                     <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${item.status === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                       {item.status}
                     </span>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                     <div className="flex items-center gap-2 text-slate-400 text-xs">
                       <User size={14} />
                       <span>{item.equipments?.customer_name}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-400 text-xs">
                       <MapPin size={14} />
                       <span className="truncate">{item.equipments?.address}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-400 text-xs">
                       <Calendar size={14} />
                       <span>{new Date(item.date).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>
            </Card>
          ))
        ) : (
          <div className="mt-10 text-center text-slate-500">
            No se encontraron registros de historial.
          </div>
        )}
      </div>
    </div>
  )
}
