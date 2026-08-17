import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, Plus, ExternalLink, Book, Filter, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"

interface Manual {
  id: string
  title: string
  brand: string
  category: string
  url: string
  user_id: string
}

export function Manuals() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [manuals, setManuals] = useState<Manual[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("Todas")
  const [showAddModal, setShowAddModal] = useState(false)
  
  // New manual form
  const [newTitle, setNewTitle] = useState("")
  const [newBrand, setNewBrand] = useState("")
  const [newCategory, setNewCategory] = useState("General")
  const [newUrl, setNewUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ["Mantenimiento", "Instalación", "Códigos de Error", "Piezas", "General"]

  useEffect(() => {
    fetchManuals()
  }, [])

  const fetchManuals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        // Table might not exist yet, so we just set empty
        console.error("Error fetching manuals:", error)
        setManuals([])
      } else {
        setManuals(data || [])
      }
    } catch (err) {
      console.error("Unexpected error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newBrand || !newUrl) return

    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('manuals')
        .insert({
          title: newTitle,
          brand: newBrand,
          category: newCategory,
          url: newUrl,
          user_id: user?.id
        })
      
      if (error) throw error
      
      // Reset form and fetch again
      setShowAddModal(false)
      setNewTitle("")
      setNewBrand("")
      setNewCategory("General")
      setNewUrl("")
      fetchManuals()
    } catch (err) {
      console.error("Error adding manual:", err)
      alert("Error al agregar el manual. Verifica que la tabla en Supabase exista.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Derived state
  const brands = ["Todas", ...Array.from(new Set(manuals.map(m => m.brand)))]
  
  const filteredManuals = manuals.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = selectedBrand === "Todas" || m.brand === selectedBrand
    return matchesSearch && matchesBrand
  })

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white -ml-2 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">Manuales Técnicos</h1>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-4"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Buscar manuales, marcas o códigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter size={16} className="text-slate-500 min-w-4" />
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedBrand === brand 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Manuals List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando manuales...</p>
          </div>
        ) : filteredManuals.length > 0 ? (
          filteredManuals.map((manual, idx) => (
            <motion.div 
              key={manual.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                    <Book size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 line-clamp-2">{manual.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">{manual.brand}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">{manual.category}</span>
                    </div>
                  </div>
                </div>
                <a 
                  href={manual.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors shrink-0"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800/50 border-dashed">
            <Book size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No se encontraron manuales.</p>
            <p className="text-sm text-slate-500">Intenta con otra búsqueda o agrega uno nuevo.</p>
          </div>
        )}
      </motion.div>

      {/* Add Manual Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6">Agregar Manual</h2>
              
              <form onSubmit={handleAddManual} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Título del Manual</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej. Manual de Servicio Daikin"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Marca</label>
                    <input
                      type="text"
                      required
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder="Ej. Daikin"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Enlace (URL) del PDF o página</label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://ejemplo.com/manual.pdf"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors mt-6 shadow-lg shadow-blue-600/20"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Manual"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
