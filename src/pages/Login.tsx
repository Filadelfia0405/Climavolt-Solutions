import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Zap } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { motion } from "framer-motion"

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      try {
        await login(email, password)
        navigate("/")
      } catch (error: any) {
        alert(error.message || "Error al iniciar sesión")
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <Zap size={32} className="text-white" fill="currentColor" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            Clima<span className="text-blue-500">Volt</span>
          </h1>
          <p className="text-slate-400">La plataforma inteligente para técnicos HVAC/R</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="email">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tecnico@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="password">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full text-base" size="lg">
                Iniciar Sesión
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              ¿No tienes una cuenta?{" "}
              <button className="font-semibold text-blue-500 hover:underline">
                Regístrate
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
