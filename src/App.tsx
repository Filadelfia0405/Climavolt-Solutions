import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"
import { Layout } from "./components/layout/Layout"
import { Login } from "./pages/Login"

import { Dashboard } from "./pages/Dashboard"
import { DiagnosticInput } from "./pages/DiagnosticInput"
import { DiagnosticResult } from "./pages/DiagnosticResult"
import { Calculators } from "./pages/Calculators"
import { ErrorCodes } from "./pages/ErrorCodes"
import { History } from "./pages/History"
import { Clients } from "./pages/Clients"
import { Tools } from "./pages/Tools"
import { Billing } from "./pages/Billing"
import { InvoiceHistory } from "./pages/InvoiceHistory"
import { Estimates } from "./pages/Estimates"
import { EstimateHistory } from "./pages/EstimateHistory"
import { Notifications } from "./pages/Notifications"
import { Profile } from "./pages/Profile"
import { New } from "./pages/New"
import { Community } from "./pages/Community"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/diagnostico" element={<DiagnosticInput />} />
              <Route path="/diagnostico/resultado" element={<DiagnosticResult />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/error-codes" element={<ErrorCodes />} />
              <Route path="/history" element={<History />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/:id" element={<Billing />} />
              <Route path="/invoice-history" element={<InvoiceHistory />} />
              <Route path="/presupuestos" element={<Estimates />} />
              <Route path="/presupuestos/:id" element={<Estimates />} />
              <Route path="/estimate-history" element={<EstimateHistory />} />
              <Route path="/notificaciones" element={<Notifications />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/nuevo" element={<New />} />
              <Route path="/comunidad" element={<Community />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
