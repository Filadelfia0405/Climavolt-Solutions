import { ArrowLeft, Bell, AlertTriangle, Calendar, Wrench } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useNotifications } from "../hooks/useNotifications"
import { Card, CardContent } from "../components/ui/card"

export function Notifications() {
  const navigate = useNavigate()
  const { notifications, loading } = useNotifications()

  return (
    <div className="flex h-full flex-col p-4 bg-[#0B1120] overflow-y-auto pb-24">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="rounded-full bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell size={20} className="text-blue-500" />
              Notificaciones
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
              <Bell size={32} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Todo al día</h3>
            <p className="text-slate-400 text-sm max-w-[250px]">
              No tienes mantenimientos programados para los próximos 5 días.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            {notifications.map((notif, index) => {
              const isOverdue = notif.days_remaining < 0;
              const isToday = notif.days_remaining === 0;
              
              let statusColor = "text-yellow-500";
              let bgStatusColor = "bg-yellow-500/20";
              let statusText = `En ${notif.days_remaining} días`;

              if (isOverdue) {
                statusColor = "text-red-500";
                bgStatusColor = "bg-red-500/20";
                statusText = `Vencido hace ${Math.abs(notif.days_remaining)} días`;
              } else if (isToday) {
                statusColor = "text-orange-500";
                bgStatusColor = "bg-orange-500/20";
                statusText = "Vence hoy";
              }

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-slate-800 bg-slate-900 overflow-hidden cursor-pointer hover:border-slate-700 transition-colors" onClick={() => navigate(`/billing/${notif.id}`)}>
                    <CardContent className="p-4 flex gap-4">
                      <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgStatusColor} ${statusColor}`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-white text-base leading-tight">
                            Mantenimiento Programado
                          </h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgStatusColor} ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 font-medium mb-2">
                          Cliente: {notif.client_name}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Wrench size={14} className="text-slate-500" />
                            <span>{notif.equipment_type} {notif.brand}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-500" />
                            <span>{new Date(notif.next_maintenance_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
