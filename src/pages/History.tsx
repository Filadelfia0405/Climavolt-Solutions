import { useState, useEffect } from "react"
import { ArrowLeft, Search, Calendar, MapPin, User, Plus, Loader2, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"

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
  
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientsData, setClientsData] = useState<{name: string, address: string}[]>([])
  
  const [formData, setFormData] = useState({
    model: "",
    customer_name: "",
    address: "",
    maintenance_type: "Mantenimiento Preventivo",
    status: "Completado",
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchHistory()
    fetchClients()
  }, [user])

  async function fetchClients() {
    if (!user) return
    try {
      const { data } = await supabase
        .from("clients")
        .select("name, address")
        .eq("technician_id", user.id)
      
      if (data) {
        setClientsData(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  async function fetchHistory() {
    if (!user) return
    setIsLoading(true)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      // 1. Insert into equipments first
      const { data: equipData, error: equipError } = await supabase
        .from("equipments")
        .insert([{
          technician_id: user.id,
          model: formData.model,
          customer_name: formData.customer_name,
          address: formData.address
        }])
        .select()

      if (equipError) throw equipError
      
      const equipmentId = equipData?.[0]?.id
      if (!equipmentId) throw new Error("No se pudo crear el equipo")

      // 2. Insert into history
      const { error: historyError } = await supabase
        .from("history")
        .insert([{
          technician_id: user.id,
          equipment_id: equipmentId,
          maintenance_type: formData.maintenance_type,
          status: formData.status,
          date: formData.date
        }])

      if (historyError) throw historyError

      // Refrescar lista
      fetchHistory()
      setShowForm(false)
      setFormData({
        model: "",
        customer_name: "",
        address: "",
        maintenance_type: "Mantenimiento Preventivo",
        status: "Completado",
        date: new Date().toISOString().split('T')[0]
      })

    } catch (error) {
      console.error("Error saving history:", error)
      alert("Hubo un error al guardar el registro. Es posible que las tablas no existan o falten permisos.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const foundClient = clientsData.find(c => c.name === name);
    if (foundClient) {
      setFormData(prev => ({ 
        ...prev, 
        customer_name: name,
        address: foundClient.address || prev.address
      }));
    }
  }

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
          <button onClick={() => navigate('/')} className="p-2 text-slate-300 hover:text-white -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">Historial de Equipos</h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cerrar" : "Nuevo"}
        </button>
      </header>
      
      {/* Formulario */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 16 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="overflow-hidden"
        >
          <Card className="border-blue-900/50 bg-[#0f192d]">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Nuevo Registro</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Modelo del Equipo *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Ej. Lennox 12K BTU"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-400">Nombre del Cliente *</label>
                    <select 
                      className="bg-blue-800 text-white text-xs px-2 py-1 rounded border border-blue-700 outline-none max-w-[150px]"
                      onChange={handleCustomerSelect}
                      value=""
                    >
                      <option value="" disabled>Seleccionar cliente existente...</option>
                      {clientsData.map((client, idx) => (
                        <option key={idx} value={client.name}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Ej. Av. Winston Churchill #123"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Tipo de Trabajo</label>
                    <select
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                      className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option>Mantenimiento Preventivo</option>
                      <option>Mantenimiento Correctivo</option>
                      <option>Instalación</option>
                      <option>Revisión Técnica</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option>Completado</option>
                      <option>Pendiente</option>
                      <option>En Progreso</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <Button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
