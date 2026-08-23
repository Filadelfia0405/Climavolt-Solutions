import { ArrowLeft, FileText, Download, CheckCircle2, Clock } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

export function InvoiceHistory() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const currentTab = searchParams.get('status') || 'all'

  const fetchInvoices = async () => {
      if (!user) return
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('technician_id', user.id)
        .neq('status', 'estimate')
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
        .update({ status: 'paid' })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state without refetching
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv))
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert("Error al marcar como pagada")
    }
  }

  // Filter invoices based on tab
  const filteredInvoices = invoices.filter(invoice => {
    if (currentTab === 'pending') return invoice.status === 'pending'
    if (currentTab === 'paid') return invoice.status !== 'pending'
    return true
  })

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
            <h1 className="text-xl font-bold text-white">Historial de Facturas</h1>
            <p className="text-xs text-slate-400">Tus facturas y presupuestos emitidos</p>
          </div>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl">
          <button 
            onClick={() => setSearchParams({})}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${currentTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setSearchParams({ status: 'pending' })}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${currentTab === 'pending' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setSearchParams({ status: 'paid' })}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${currentTab === 'paid' ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Pagadas
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-slate-400 mt-10">Cargando facturas...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center mt-20 flex flex-col items-center">
          <FileText size={48} className="text-slate-600 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No hay facturas</h2>
          <p className="text-sm text-slate-400">Aún no has emitido ninguna factura o presupuesto.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedInvoices) as [string, any[]][]).map(([month, monthInvoices]) => {
            const totalPaid = monthInvoices
              .filter(invoice => invoice.status === 'paid')
              .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
            
            return (
            <div key={month}>
              <div className="flex items-center justify-between mb-3 ml-1">
                <h2 className="text-sm font-bold text-blue-400 uppercase">{month}</h2>
                {totalPaid > 0 && (
                  <span className="text-sm font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                    RD$ {totalPaid.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {monthInvoices.map((invoice: any) => (
                  <div 
                    key={invoice.id} 
                    onClick={() => navigate(`/billing/${invoice.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3 sm:mb-0">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${invoice.status === 'pending' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                        {invoice.status === 'pending' ? <Clock size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Factura Nº {invoice.invoice_number}</h4>
                        </div>
                        <p className="text-sm text-slate-300 font-medium truncate max-w-[200px]">{invoice.client_name || "Cliente sin nombre"}</p>
                        <p className="text-xs text-slate-500">{new Date(invoice.date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto">
                      <span className="text-base font-bold text-white">RD$ {invoice.total.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      <div className="flex gap-2">
                        {invoice.status === 'pending' && (
                          <button 
                            onClick={(e) => markAsPaid(e, invoice.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                            title="Marcar como pagada"
                          >
                            <CheckCircle2 size={14} /> Pagar
                          </button>
                        )}
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
            );
          })}
        </div>
      )}
    </div>
  )
}
