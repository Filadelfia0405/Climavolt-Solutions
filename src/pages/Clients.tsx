import { useState, useEffect } from "react"
import { Users, Phone, Mail, UserPlus, ArrowLeft, Loader2, Search, Edit2, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"

type Client = {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  created_at: string
}

export function Clients() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClientId, setEditingClientId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  })

  useEffect(() => {
    fetchClients()
  }, [user])

  async function fetchClients() {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('technician_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !formData.name) return

    setIsSubmitting(true)
    try {
      if (editingClientId) {
        const { data, error } = await supabase
          .from('clients')
          .update({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address
          })
          .eq('id', editingClientId)
          .select()

        if (error) throw error

        if (data) {
          setClients(clients.map(c => c.id === editingClientId ? data[0] : c))
        }
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([
            { 
              technician_id: user.id,
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
              address: formData.address
            }
          ])
          .select()

        if (error) throw error

        if (data) {
          setClients([data[0], ...clients])
        }
      }

      setFormData({ name: "", phone: "", email: "", address: "" })
      setShowForm(false)
      setEditingClientId(null)
    } catch (error) {
      console.error('Error saving client:', error)
      alert("Error al guardar cliente. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (client: Client) => {
    setFormData({
      name: client.name,
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || ""
    })
    setEditingClientId(client.id)
    setShowForm(true)
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex h-full flex-col p-4 bg-[#0B1120]">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="rounded-full bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Directorio de Clientes</h1>
            <p className="text-xs text-slate-400">Gestiona tus contactos</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            if (!showForm) {
              setFormData({ name: "", phone: "", email: "", address: "" })
              setEditingClientId(null)
            }
            setShowForm(!showForm)
          }} 
          className="bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0 rounded-xl"
        >
          <UserPlus size={20} />
        </Button>
      </header>

      {/* Agregar Cliente Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <Card className="border-blue-900/50 bg-[#0f192d]">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingClientId ? "Editar Cliente" : "Nuevo Cliente"}
              </h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Correo electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Opcional"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <Button type="button" onClick={() => {
                    setShowForm(false)
                    setEditingClientId(null)
                  }} className="flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
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

      {/* Buscador */}
      <div className="relative mb-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-2xl border border-slate-700 bg-slate-800/50 p-4 pl-12 text-sm text-white placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Buscar cliente por nombre o contacto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Clientes */}
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6 border border-dashed border-slate-700 rounded-2xl bg-slate-800/30">
            <Users className="w-12 h-12 text-slate-500 mb-3" />
            <p className="text-slate-300 font-medium mb-1">No se encontraron clientes</p>
            <p className="text-xs text-slate-500">
              {searchTerm ? "Intenta con otra búsqueda" : "Agrega tu primer cliente pulsando el botón +"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredClients.map((client) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={client.id}
              >
                <Card className="border-slate-800 bg-[#121b2f] hover:bg-slate-800 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/30 text-blue-400 font-bold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{client.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {client.phone && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Phone size={12} />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Mail size={12} />
                              {client.email}
                            </div>
                          )}
                        </div>
                        {client.address && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin size={12} />
                            <span className="truncate max-w-[200px]">{client.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditClick(client)}
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
