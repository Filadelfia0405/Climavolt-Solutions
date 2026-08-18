import { useState, useEffect } from "react";
import { Home, Wrench, PlusCircle, Users, User, FileText, DollarSign, Calendar } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useSettings } from "../../contexts/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSettings();
  const [showNewMenu, setShowNewMenu] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showNewMenu) {
      // Auto-hide the menu after 5 seconds
      timeoutId = setTimeout(() => {
        setShowNewMenu(false);
      }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, [showNewMenu]);

  const NAV_ITEMS = [
    { icon: Home, label: t("home"), path: "/" },
    { icon: Wrench, label: t("equipment"), path: "/history" },
    { icon: PlusCircle, label: t("new"), isPrimary: true },
    { icon: Users, label: t("community"), path: "/comunidad" },
    { icon: User, label: t("profile"), path: "/perfil" },
  ];

  const NEW_ACTIONS = [
    { title: "Nueva Factura", icon: FileText, color: "text-yellow-500", bg: "bg-yellow-500/20", path: "/billing" },
    { title: "Nuevo Presupuesto", icon: DollarSign, color: "text-orange-500", bg: "bg-orange-500/20", path: "/presupuestos" },
    { title: "Nuevo Historial", icon: Wrench, color: "text-blue-500", bg: "bg-blue-500/20", path: "/history" },
    { title: "Nuevo Cliente", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/20", path: "/clients" },
    { title: "Nueva Cita", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/20", path: "/agenda" }
  ];

  const handleActionClick = (path: string) => {
    setShowNewMenu(false);
    navigate(path);
  };

  return (
    <>
      <AnimatePresence>
        {showNewMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowNewMenu(false)}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <div className="absolute bottom-28 left-0 right-0 flex justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 w-64 pointer-events-auto"
                onClick={e => e.stopPropagation()} // Prevent click inside from closing it
              >
                {NEW_ACTIONS.map((action, idx) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(action.path)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${action.bg} ${action.color}`}>
                        <ActionIcon size={20} />
                      </div>
                      <span className="text-white font-medium text-sm">{action.title}</span>
                    </button>
                  );
                })}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-center gap-2 md:gap-8 lg:gap-16 border-t border-slate-800 bg-slate-950/80 px-4 pb-2 backdrop-blur-md">
        <div className="flex w-full max-w-lg items-center justify-between">
          {NAV_ITEMS.map((item, index) => {
          const isActive = item.path ? (location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path))) : false;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <button
                key="primary"
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="group relative flex -translate-y-6 flex-col items-center justify-center gap-1"
              >
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-blue-600/20 transition-all group-hover:scale-105 group-active:scale-95",
                  showNewMenu ? "bg-slate-800 rotate-45" : "bg-blue-600"
                )}>
                  <Icon size={28} />
                </div>
                <span className="text-[10px] font-medium text-slate-300">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.path || index}
              to={item.path!}
              className={cn(
                "flex w-16 flex-col items-center justify-center gap-1 text-slate-400 transition-colors",
                isActive && "text-blue-500"
              )}
            >
              <Icon size={24} className={cn(isActive && "fill-blue-500/20")} />
              <span className={cn("text-[10px] font-medium", isActive && "text-blue-500")}>
                {item.label}
              </span>
            </Link>
          );
        })}
        </div>
      </nav>
    </>
  );
}
