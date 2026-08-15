import { ArrowLeft, FileText, Download, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

export function EstimateHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = async () => {
      if (!user) return
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('technician_id', user.id)
        .eq('status', 'estimate')
        .order('date', { ascending: false })
      
      if (data && !error) {
        setInvoices(data)
      }
      setLoading(false)
    }

  useEffect(() => {
    fetchInvoices()
  }, [user])

  const markAsPaid = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'pending' }) // Convertir a factura pendiente
        .eq('id', id)
      
      if (error) throw error
      alert("Convertido a factura exitosamente. Revisar en Facturas.")
      fetchInvoices()
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert("Error al convertir a factura")
    }
  }

  // Filter invoices based on tab
  const filteredInvoices = invoices

  // Group invoices by month
  const groupedInvoices = filteredInvoices.reduce((acc, invoice) => {
    const date = new Date(invoice.date);
    const monthYear = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    if (!acc[capitalizedMonthYear]) {
      acc[capitalizedMonthYear] = [];
    }
    acc[capitalizedMonthYear].push(invoice);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex h-full flex-col p-4 bg-[#0B1120] overflow-y-auto pb-24">
      <header className="mb-6 flex flex-col gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="rounded-full bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Historial de Presupuestos</h1>
            <p className="text-xs text-slate-400">Tus presupuestos emitidos</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-slate-400 mt-10">Cargando facturas...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center mt-20 flex flex-col items-center">
          <FileText size={48} className="text-slate-600 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No hay presupuestos</h2>
          <p className="text-sm text-slate-400">Aún no has emitido ningún presupuesto.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedInvoices) as [string, any[]][]).map(([month, monthInvoices]) => (
            <div key={month}>
              <h2 className="text-sm font-bold text-blue-400 mb-3 ml-1 uppercase">{month}</h2>
              <div className="flex flex-col gap-3">
                {monthInvoices.map((invoice: any) => (
                  <div 
                    key={invoice.id} 
                    onClick={() => navigate(`/presupuestos/${invoice.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3 sm:mb-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 bg-blue-500/20 text-blue-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Presupuesto Nº {invoice.invoice_number}</h4>
                        </div>
                        <p className="text-sm text-slate-300 font-medium truncate max-w-[200px]">{invoice.client_name || "Cliente sin nombre"}</p>
                        <p className="text-xs text-slate-500">{new Date(invoice.date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto">
                      <span className="text-base font-bold text-white">RD$ {invoice.total.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => markAsPaid(e, invoice.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                          title="Convertir a Factura"
                        >
                          <CheckCircle2 size={14} /> Facturar
                        </button>
                        <button 
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Ver y descargar"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
