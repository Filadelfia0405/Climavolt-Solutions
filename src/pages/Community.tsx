import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, MessageSquare, ThumbsUp, Share2, Search, Plus } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { motion } from "framer-motion"

interface Post {
  id: number
  author: string
  avatar: string
  time: string
  content: string
  likes: number
  comments: number
  tags: string[]
}

const POSTS: Post[] = [
  {
    id: 1,
    author: "Carlos Técnico",
    avatar: "CT",
    time: "Hace 2 horas",
    content: "Compañeros, ¿alguien ha tenido problemas con la tarjeta inverter de un LG Dual Inverter 18K? Me marca error CH38 pero las presiones están normales.",
    likes: 12,
    comments: 5,
    tags: ["LG", "Inverter", "Error CH38"]
  },
  {
    id: 2,
    author: "Mantenimiento Pro",
    avatar: "MP",
    time: "Hace 5 horas",
    content: "Hoy realicé un mantenimiento profundo a un equipo de 5 toneladas. Recuerden siempre verificar los capacitores del fan exterior, estaban a punto de fallar por el calor de estos días.",
    likes: 24,
    comments: 2,
    tags: ["Mantenimiento", "Tip"]
  },
  {
    id: 3,
    author: "Refrigeración Express",
    avatar: "RE",
    time: "Ayer",
    content: "¿Qué marca de gas refrigerante R-410A están recomendando actualmente? He notado variaciones de calidad en los cilindros genéricos.",
    likes: 8,
    comments: 14,
    tags: ["R-410A", "Refrigerante"]
  }
]

export function Community() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">Comunidad</h1>
        </div>
        <button className="flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
          <Plus size={14} />
          Crear Post
        </button>
      </header>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Buscar consultas, marcas o errores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Categories/Tags */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {["Todos", "Dudas", "Tips", "Herramientas", "Repuestos"].map((tag, idx) => (
          <button 
            key={idx}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border ${
              idx === 0 
                ? "bg-blue-600 border-blue-600 text-white" 
                : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col gap-4">
        {POSTS.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
              <CardContent className="p-4">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-800">
                    {post.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{post.author}</h3>
                    <p className="text-[10px] text-slate-400">{post.time}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-3 border-t border-slate-800/50 text-slate-400">
                  <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <ThumbsUp size={16} />
                    <span className="text-xs font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <MessageSquare size={16} />
                    <span className="text-xs font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors ml-auto">
                    <Share2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
