import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSettings } from "../contexts/SettingsContext"
import { ArrowLeft, User, LogOut, Mail, Settings, Shield, Image as ImageIcon, Globe, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { motion } from "framer-motion"
import { useRef, useState } from "react"
import { supabase } from "../lib/supabase"

export function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { language, setLanguage, setLogoUrl, t } = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [showSettings, setShowSettings] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error("Error al cerrar sesión", error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setLogoUrl(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      try {
        await supabase.auth.updateUser({
          data: { avatar_url: base64String }
        })
      } catch (error) {
        console.error("Error updating avatar:", error)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-300 hover:text-white -ml-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white">{t('my_profile')}</h1>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-slate-800 bg-slate-900/50 mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-8 border-b border-slate-800 bg-gradient-to-b from-blue-900/20 to-transparent">
              <div 
                className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-900 shadow-xl mb-4 relative cursor-pointer group"
                onClick={() => avatarInputRef.current?.click()}
              >
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-400 group-hover:text-white transition-colors" />
                )}
                
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <ImageIcon size={20} className="text-white" />
                </div>

                <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 border-2 border-slate-900 rounded-full flex items-center justify-center z-10">
                  <Shield size={12} className="text-white" />
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={avatarInputRef} 
                  onChange={handleAvatarUpload} 
                />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Técnico</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Mail size={14} />
                {user?.email || "usuario@ejemplo.com"}
              </p>
            </div>

            <div className="p-4 flex flex-col gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800 transition-colors text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <Settings size={18} />
                  </div>
                  <span className="font-medium text-sm">{t('settings')}</span>
                </div>
                {showSettings ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
              </button>

              {showSettings && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="flex flex-col gap-2 pl-4 pr-2 border-l-2 border-slate-800 ml-4 mb-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <ImageIcon size={16} />
                      </div>
                      <span className="font-medium text-xs text-slate-300">{t('upload_logo')}</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors"
                    >
                      Subir
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Globe size={16} />
                      </div>
                      <span className="font-medium text-xs text-slate-300">{t('language')}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setLanguage('es')}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'es' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        ES
                      </button>
                      <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        EN
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <button 
                onClick={handleLogout}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-red-500/10 transition-colors text-red-400"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <LogOut size={18} />
                  </div>
                  <span className="font-medium text-sm">{t('logout')}</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Plans Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-slate-400 mb-3 px-1 uppercase tracking-wider">Planes de Suscripción</h3>
        <div className="flex flex-col gap-4">
          
          {/* Plan Gratis */}
          <Card className="border-slate-800 bg-slate-900/50 relative overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Plan Gratis</h4>
                <p className="text-slate-400 text-xs">Funciones básicas para empezar</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-xs line-through">US$ 0.00</span>
                <p className="text-blue-500 font-bold text-lg">Actual</p>
              </div>
            </CardContent>
          </Card>

          {/* Plan Pro */}
          <Card className="border-blue-500/50 bg-gradient-to-br from-blue-900/40 to-slate-900/80 relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 right-0 bg-blue-600 text-[10px] font-bold px-3 py-1 text-white rounded-bl-lg uppercase tracking-wider">
              Recomendado
            </div>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-bold text-lg">Plan Pro</h4>
                  <Shield size={16} className="text-blue-400" />
                </div>
                <p className="text-slate-300 text-xs mb-2">Todo ilimitado + IA y Soporte</p>
                <div className="flex flex-col gap-1.5 mt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Historial de equipos ilimitado</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Registro de clientes ilimitado</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Diagnósticos con Inteligencia Artificial</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Generador de presupuestos y facturas en PDF</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Historial de presupuestos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Gestión de facturas (Pagadas / Pendientes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Acceso a códigos de error exclusivos</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t border-slate-800/50 bg-black/20">
              <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold shadow-lg shadow-blue-500/20">
                Mejorar a Pro - US$ 9.99/mes
              </button>
            </div>
          </Card>
          
        </div>
      </motion.div>
    </div>
  )
}
