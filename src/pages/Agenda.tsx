import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar as CalendarIcon, Plus, MapPin, Clock, FileText, CheckCircle2, XCircle, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"
import { useSettings } from "../contexts/SettingsContext"

interface Appointment {
  id: string
  client_name: string
  service_type: string
  date: string
  time: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  address?: string
}

export function Agenda() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useSettings()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Form State
  const [clientName, setClientName] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })
      
      if (error) throw error
      setAppointments(data || [])
    } catch (err) {
      console.error("Error fetching appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !serviceType || !date || !time) return

    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('appointments')
        .insert({
          client_name: clientName,
          service_type: serviceType,
          date,
          time,
          address,
          notes,
          user_id: user?.id,
          status: 'pending'
        })
      
      if (error) throw error
      
      setShowModal(false)
      resetForm()
      fetchAppointments()
    } catch (err) {
      console.error("Error adding appointment:", err)
      alert("Error al guardar la cita.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setClientName("")
    setServiceType("")
    setDate("")
    setTime("")
    setAddress("")
    setNotes("")
  }

  const updateStatus = async (id: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      fetchAppointments()
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cita?")) return
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchAppointments()
    } catch (err) {
      console.error("Error deleting appointment:", err)
    }
  }

  // Agrupar citas por fecha
  const groupedAppointments = appointments.reduce((acc, appt) => {
    if (!acc[appt.date]) acc[appt.date] = []
    acc[appt.date].push(appt)
    return acc
  }, {} as Record<string, Appointment[]>)

  const sortedDates = Object.keys(groupedAppointments).sort()

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-green-500 bg-green-500/10 border-green-500/20'
    if (status === 'cancelled') return 'text-red-500 bg-red-500/10 border-red-500/20'
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  }

  const getStatusText = (status: string) => {
    if (status === 'completed') return 'Completada'
    if (status === 'cancelled') return 'Cancelada'
    return 'Pendiente'
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      <header className="flex items-center justify-between py-2 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white -ml-2 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">{t('agenda') || 'Agenda'}</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sortedDates.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-slate-300 mb-4 sticky top-0 bg-slate-950/80 backdrop-blur-md py-2 z-10 flex items-center gap-2">
                <CalendarIcon size={18} className="text-blue-500" />
                {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <div className="space-y-4">
                {groupedAppointments[date].map(appt => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={appt.id} 
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{appt.client_name}</h3>
                        <p className="text-blue-400 font-medium text-sm">{appt.service_type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(appt.status)}`}>
                        {getStatusText(appt.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {appt.time.substring(0, 5)}
                      </div>
                      {appt.address && (
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin size={14} className="shrink-0" />
                          <span className="truncate">{appt.address}</span>
                        </div>
                      )}
                      {appt.notes && (
                        <div className="flex items-start gap-2 col-span-2 text-slate-500">
                          <FileText size={14} className="shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{appt.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                      {appt.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(appt.id, 'completed')} className="p-2 text-green-500 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors">
                            <CheckCircle2 size={18} />
                          </button>
                          <button onClick={() => updateStatus(appt.id, 'cancelled')} className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteAppointment(appt.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors ml-auto">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
          <CalendarIcon size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No tienes citas agendadas.</p>
          <p className="text-sm text-slate-500">Toca el botón + para crear una nueva cita.</p>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-xl font-bold text-white mb-6">Agendar Servicio</h2>
              
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cliente</label>
                  <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:border-blue-500" placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Servicio</label>
                  <input type="text" required value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:border-blue-500" placeholder="Ej. Mantenimiento, Instalación" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Fecha</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:border-blue-500 [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Hora</label>
                    <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:border-blue-500 [color-scheme:dark]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Dirección (Opcional)</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:border-blue-500" placeholder="Dirección del servicio" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Notas (Opcional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:border-blue-500 min-h-[80px]" placeholder="Detalles adicionales..." />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors shadow-lg">
                    {isSubmitting ? "Guardando..." : "Agendar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
