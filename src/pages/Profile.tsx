import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeft, User, LogOut, Mail, Settings, Shield } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { motion } from "framer-motion"

export function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error("Error al cerrar sesión", error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">Mi Perfil</h1>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-slate-800 bg-slate-900/50 mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-8 border-b border-slate-800 bg-gradient-to-b from-blue-900/20 to-transparent">
              <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-900 shadow-xl mb-4 relative">
                <User size={40} className="text-slate-400" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                  <Shield size={12} className="text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Técnico</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Mail size={14} />
                {user?.email || "usuario@ejemplo.com"}
              </p>
            </div>

            <div className="p-4 flex flex-col gap-2">
              <button className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800 transition-colors text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <Settings size={18} />
                  </div>
                  <span className="font-medium text-sm">Configuración de la cuenta</span>
                </div>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-red-500/10 transition-colors text-red-400"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <LogOut size={18} />
                  </div>
                  <span className="font-medium text-sm">Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
