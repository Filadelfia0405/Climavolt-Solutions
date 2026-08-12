import { Home, Wrench, PlusCircle, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: Wrench, label: "Equipos", path: "/equipos" },
  { icon: PlusCircle, label: "Nuevo", path: "/nuevo", isPrimary: true },
  { icon: Users, label: "Comunidad", path: "/comunidad" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t border-slate-800 bg-slate-950/80 px-4 pb-2 backdrop-blur-md sm:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
        const Icon = item.icon;

        if (item.isPrimary) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex -translate-y-6 flex-col items-center justify-center gap-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105 group-active:scale-95">
                <Icon size={28} />
              </div>
              <span className="text-[10px] font-medium text-slate-300">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
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
    </nav>
  );
}
