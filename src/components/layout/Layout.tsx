import { Outlet } from "react-router-dom"
import { BottomNavigation } from "./BottomNavigation"

export function Layout() {
  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 sm:pb-0">
      {/* Sidebar for desktop could go here later */}
      <main className="mx-auto max-w-md w-full min-h-screen relative shadow-2xl shadow-blue-900/5 sm:border-x sm:border-slate-800">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}
