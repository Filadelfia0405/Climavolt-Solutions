import { ArrowLeft, Save, Plus, Trash2, Printer, MessageCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { InvoicePrint } from "../components/InvoicePrint"
import { supabase } from "../lib/supabase"

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function Billing() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [applyItbis, setApplyItbis] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    invoiceNumber: "0001",
    date: new Date().toISOString().split('T')[0],
    
    // Client
    clientName: "",
    address: "",
    phone: "",
    email: "",
    rnc: "",
    
    // Services
    services: {
      preventive: false,
      corrective: false,
      installation: false,
      uninstallation: false,
      flush: false
    },
    
    // Equipment
    equipmentType: "",
    brand: "",
    model: "",
    capacity: "",
    serial: "",
    location: "",
    
    // Others
    observations: "",
    paymentMethod: "Efectivo",
    status: "pending",
    maintenancePeriod: "0",
    nextMaintenanceDate: ""
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ])

  useEffect(() => {
    async function fetchInvoiceData() {
      if (!user) return
      
      if (id) {
        // Edit existing invoice
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', id)
          .eq('technician_id', user.id)
          .single()
          
        if (data && !error) {
          setFormData({
            invoiceNumber: data.invoice_number,
            date: data.date,
            clientName: data.client_name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            rnc: data.rnc,
            services: data.services,
            equipmentType: data.equipment_type,
            brand: data.brand,
            model: data.model,
            capacity: data.capacity,
            serial: data.serial,
            location: data.location,
            observations: data.observations,
            paymentMethod: data.payment_method,
            status: data.status || "paid",
            maintenancePeriod: "0",
            nextMaintenanceDate: data.next_maintenance_date || ""
          })
          setItems(data.items || [])
          setApplyItbis(data.tax > 0)
        }
      } else {
        // New invoice: Get last invoice number
        const { data, error } = await supabase
          .from('invoices')
          .select('invoice_number')
          .eq('technician_id', user.id)
          .order('invoice_number', { ascending: false })
          .limit(1)
          .single()
          
        if (data && !error && data.invoice_number) {
          // Parse the number, increment, and pad with zeros
          const lastNum = parseInt(data.invoice_number.replace(/\D/g, ''), 10)
          if (!isNaN(lastNum)) {
            const nextNumStr = (lastNum + 1).toString().padStart(4, '0')
            setFormData(prev => ({ ...prev, invoiceNumber: nextNumStr }))
          }
        }
      }
    }
    
    fetchInvoiceData()
  }, [user, id])

  useEffect(() => {
    async function fetchClients() {
      if (!user) return
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('technician_id', user.id)
      
      if (data && !error) {
        setClients(data)
      }
    }
    fetchClients()
  }, [user])

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value
    if (!clientId) return
    
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.name || "",
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
      }))
    }
  }


  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
  const tax = applyItbis ? subtotal * 0.18 : 0
  const total = subtotal + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceChange = (service: keyof typeof formData.services) => {
    setFormData(prev => {
      const newServices = {
        ...prev.services,
        [service]: !prev.services[service]
      };
      
      // If maintenance is unchecked, clear the maintenance date
      if (service === 'preventive' || service === 'corrective') {
        if (!newServices.preventive && !newServices.corrective) {
           return { ...prev, services: newServices, maintenancePeriod: "0", nextMaintenanceDate: "" };
        }
      }
      
      return { ...prev, services: newServices };
    })
  }

  const handleMaintenancePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    let nextDate = "";
    
    if (period !== "0") {
      const date = new Date(formData.date);
      date.setMonth(date.getMonth() + parseInt(period));
      nextDate = date.toISOString().split('T')[0];
    }
    
    setFormData(prev => ({
      ...prev,
      maintenancePeriod: period,
      nextMaintenanceDate: nextDate
    }));
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const invoiceData = {
        technician_id: user.id,
        invoice_number: formData.invoiceNumber,
        date: formData.date,
        client_name: formData.clientName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        rnc: formData.rnc,
        services: formData.services,
        equipment_type: formData.equipmentType,
        brand: formData.brand,
        model: formData.model,
        capacity: formData.capacity,
        serial: formData.serial,
        location: formData.location,
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: total,
        observations: formData.observations,
        payment_method: formData.paymentMethod,
        status: formData.status,
        next_maintenance_date: formData.nextMaintenanceDate || null
      };

      if (id) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', id);
        
        if (error) throw error
        alert("Factura actualizada correctamente")
      } else {
        const { error } = await supabase
          .from('invoices')
          .insert(invoiceData);
          
        if (error) throw error
        alert("Factura guardada correctamente")
      }
      navigate('/tools')
    } catch (error) {
      console.error("Error al guardar:", error)
      alert("Error al guardar la factura")
    } finally {
      setLoading(false)
    }
  }
  const generatePDF = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) throw new Error("Element not found");
    
    // Convert DOM to Image
    const dataUrl = await toPng(element, { 
      quality: 0.95, 
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        position: 'relative',
        left: '0',
        top: '0',
      }
    });
    
    // Create PDF and add image
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
    
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  }

  const handleShareWhatsApp = async () => {
    setLoading(true)
    try {
      const pdf = await generatePDF();
      const filename = `Factura_ClimaVolt_${formData.invoiceNumber}.pdf`;
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      // Try Web Share API first (Mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
          text: 'Adjunto factura/presupuesto de ClimaVolt Solutions.',
        });
      } else {
        // Fallback for Desktop: Download and open WA Web
        pdf.save(filename);
        alert("El PDF se ha descargado a tu computadora. Serás redirigido a WhatsApp Web para que puedas adjuntarlo manualmente.");
        window.open(`https://api.whatsapp.com/send?text=Adjunto%20factura%2Fpresupuesto%20de%20ClimaVolt%20Solutions.`, '_blank');
      }
    } catch (error) {
      console.error("Error compartiendo:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    setLoading(true)
    try {
      const pdf = await generatePDF();
      pdf.save(`Factura_ClimaVolt_${formData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error al imprimir:", error);
      alert("Error al generar el documento.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col p-4 bg-[#0B1120] overflow-y-auto pb-24">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/tools')}
            className="rounded-full bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Factura / Presupuesto</h1>
          </div>
        </div>
        <div className="flex gap-2">
           <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
            title="Descargar PDF"
          >
            <Printer size={16} />
          </button>
           <button
            onClick={handleShareWhatsApp}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            title="Compartir por WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            <span className="hidden sm:inline">{loading ? '...' : 'Guardar'}</span>
          </button>
        </div>
      </header>

      <div id="invoice-content" className="max-w-4xl mx-auto w-full bg-slate-900 rounded-xl p-4 md:p-6 space-y-6">
        
        {/* Info Factura */}
        <div className="flex flex-col md:flex-row gap-4 justify-between border-b border-slate-800 pb-4">
          <div className="flex-1 flex gap-4">
             <div>
                <label className="block text-xs text-slate-400 mb-1">Nº</label>
                <input 
                  type="text" 
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-red-500 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
             </div>
             <div>
                <label className="block text-xs text-slate-400 mb-1">FECHA</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
             </div>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div>
          <div className="flex items-center justify-between bg-blue-900 rounded-t-lg px-3 py-1">
            <h2 className="text-white font-bold text-sm">DATOS DEL CLIENTE</h2>
            <select 
              className="bg-blue-800 text-white text-xs px-2 py-1 rounded border border-blue-700 outline-none"
              onChange={handleClientSelect}
              defaultValue=""
            >
              <option value="" disabled>Seleccionar cliente existente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="border border-blue-900/50 rounded-b-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
             <div className="md:col-span-2">
               <label className="block text-xs text-slate-400 mb-1">Nombre / Empresa:</label>
               <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
             </div>
             <div className="md:col-span-2">
               <label className="block text-xs text-slate-400 mb-1">Dirección:</label>
               <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
             </div>
             <div>
               <label className="block text-xs text-slate-400 mb-1">Teléfono:</label>
               <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
             </div>
             <div>
               <label className="block text-xs text-slate-400 mb-1">Email:</label>
               <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
             </div>
             <div>
               <label className="block text-xs text-slate-400 mb-1">RNC / Cédula:</label>
               <input type="text" name="rnc" value={formData.rnc} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
             </div>
          </div>
        </div>

        {/* Servicios */}
        <div>
           <div className="w-full md:w-48 bg-blue-600 text-white font-bold py-1 px-3 rounded-t-lg text-sm text-center">SERVICIOS</div>
           <div className="border border-blue-900/50 rounded-b-lg rounded-tr-lg p-4 flex flex-wrap gap-4 md:justify-between justify-center">
              {[
                { key: 'preventive', label: 'MANTENIMIENTO PREVENTIVO' },
                { key: 'corrective', label: 'MANTENIMIENTO CORRECTIVO' },
                { key: 'installation', label: 'INSTALACIÓN' },
                { key: 'uninstallation', label: 'DESINSTALACIÓN' },
                { key: 'flush', label: 'FLUYE' },
              ].map((service) => (
                <label key={service.key} className="flex flex-col items-center cursor-pointer max-w-[120px] text-center gap-2">
                  <div className="flex items-center gap-2 mb-1 w-full justify-center">
                    <input 
                      type="checkbox" 
                      checked={formData.services[service.key as keyof typeof formData.services]} 
                      onChange={() => handleServiceChange(service.key as keyof typeof formData.services)}
                      className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <span className="text-[10px] md:text-xs text-blue-400 font-bold leading-tight">{service.label}</span>
                </label>
              ))}
           </div>
           
           {(formData.services.preventive || formData.services.corrective) && (
             <div className="border border-blue-900/50 border-t-0 rounded-b-lg p-4 bg-slate-800/30 flex items-center justify-between gap-4 flex-wrap">
               <div className="flex-1 min-w-[200px]">
                 <label className="block text-xs font-bold text-slate-300 mb-1">PROGRAMAR PRÓXIMO MANTENIMIENTO</label>
                 <select 
                   value={formData.maintenancePeriod}
                   onChange={handleMaintenancePeriodChange}
                   className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                 >
                   <option value="0">No programar</option>
                   <option value="3">En 3 meses</option>
                   <option value="4">En 4 meses</option>
                   <option value="6">En 6 meses</option>
                 </select>
               </div>
               
               {formData.nextMaintenanceDate && (
                 <div className="flex-1 min-w-[200px]">
                   <label className="block text-xs font-bold text-slate-300 mb-1">FECHA PRÓXIMO MANTENIMIENTO</label>
                   <div className="w-full rounded-lg bg-blue-900/40 border border-blue-500/50 p-2 text-sm text-blue-300 font-bold">
                     {new Date(formData.nextMaintenanceDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                   </div>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Items Table */}
        <div className="overflow-hidden rounded-lg border border-blue-900/50">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-blue-900 text-xs text-white">
              <tr>
                <th className="px-4 py-2 font-bold w-1/2 md:w-3/5">DESCRIPCIÓN DEL SERVICIO / TRABAJOS REALIZADOS</th>
                <th className="px-2 py-2 font-bold text-center w-16">CANT.</th>
                <th className="px-2 py-2 font-bold text-right w-24 md:w-32">PRECIO UNIT.</th>
                <th className="px-4 py-2 font-bold text-right w-24 md:w-32">TOTAL</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-800 last:border-0 bg-slate-800/50">
                  <td className="px-2 py-1">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent text-sm text-white px-2 py-1 focus:outline-none focus:border-b focus:border-blue-500" 
                      placeholder="Descripción..."
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input 
                      type="number" 
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm text-center text-white px-1 py-1 focus:outline-none focus:border-b focus:border-blue-500 appearance-none" 
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input 
                      type="number" 
                      value={item.unitPrice || ''}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm text-right text-white px-1 py-1 focus:outline-none focus:border-b focus:border-blue-500 appearance-none" 
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-white">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                  <td className="pr-2 text-right">
                    <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                       <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-slate-800/30 px-4 py-2 flex items-center justify-between border-t border-slate-800">
             <button onClick={addItem} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
               <Plus size={14} /> Agregar línea
             </button>
          </div>
        </div>

        {/* Totals & Equipment & Misc Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Detalles del Equipo */}
            <div>
              <h2 className="bg-blue-900 text-white font-bold py-1 px-3 rounded-t-lg text-sm">DETALLES DEL EQUIPO</h2>
              <div className="border border-blue-900/50 rounded-b-lg p-4 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Tipo de Equipo:</label>
                  <input type="text" name="equipmentType" value={formData.equipmentType} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Marca:</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Modelo:</label>
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Capacidad (BTU):</label>
                  <input type="text" name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Serie:</label>
                  <input type="text" name="serial" value={formData.serial} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Ubicación:</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-700 text-sm text-white px-1 py-1 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <h2 className="bg-blue-900 text-white font-bold py-1 px-3 rounded-t-lg text-sm">OBSERVACIONES</h2>
              <div className="border border-blue-900/50 rounded-b-lg p-2">
                 <textarea 
                   name="observations"
                   value={formData.observations}
                   onChange={handleInputChange}
                   rows={3} 
                   className="w-full bg-transparent text-sm text-white px-2 py-1 focus:outline-none resize-none"
                   style={{
                     backgroundImage: 'linear-gradient(transparent, transparent 29px, #334155 30px)',
                     backgroundSize: '100% 30px',
                     lineHeight: '30px'
                   }}
                 ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 flex flex-col">
            
            {/* Totals */}
            <div className="rounded-lg overflow-hidden border border-blue-900/50 bg-slate-800/50">
               <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700">
                 <span className="text-sm font-semibold text-slate-300">SUBTOTAL</span>
                 <span className="text-sm font-bold text-white">RD$ {subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700">
                 <div className="flex items-center gap-2">
                   <input 
                     type="checkbox" 
                     checked={applyItbis} 
                     onChange={(e) => setApplyItbis(e.target.checked)}
                     className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                   />
                   <span className="text-sm font-semibold text-slate-300">ITBIS (18%)</span>
                 </div>
                 <span className="text-sm font-bold text-white">RD$ {tax.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center px-4 py-4 bg-blue-600">
                 <span className="text-base font-bold text-white">TOTAL GENERAL</span>
                 <span className="text-lg font-bold text-white">RD$ {total.toFixed(2)}</span>
               </div>
            </div>

            {/* Metodos de pago */}
            <div>
              <h2 className="bg-blue-900 text-white font-bold py-1 px-3 rounded-t-lg text-sm uppercase">MÉTODOS DE PAGO</h2>
              <div className="border border-blue-900/50 rounded-b-lg p-4 flex gap-4 justify-around">
                 {['Efectivo', 'Transferencia', 'Tarjeta', 'Otros'].map((method) => (
                    <label key={method} className="flex flex-col items-center cursor-pointer gap-2">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={method} 
                        checked={formData.paymentMethod === method}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500"
                      />
                      <span className="text-[10px] md:text-xs text-slate-300 font-semibold">{method.toUpperCase()}</span>
                    </label>
                 ))}
              </div>
            </div>

            {/* Estado de Factura */}
            <div>
              <h2 className="bg-slate-700 text-white font-bold py-1 px-3 rounded-t-lg text-sm uppercase mt-4">ESTADO DE COBRO</h2>
              <div className="border border-slate-700 rounded-b-lg p-4 bg-slate-800/30">
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-xl bg-slate-900 border border-slate-600 p-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">Pendiente de pago</option>
                  <option value="paid">Pagada</option>
                </select>
              </div>
            </div>
            
            {/* Firmas (Visual) */}
            <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
               <div className="border border-slate-700 rounded-lg p-3 text-center opacity-70">
                 <div className="border-b border-slate-600 h-10 mb-2"></div>
                 <span className="text-xs text-slate-400 font-semibold uppercase">Firma Técnico / Responsable</span>
               </div>
               <div className="border border-slate-700 rounded-lg p-3 text-center opacity-70">
                 <div className="border-b border-slate-600 h-10 mb-2"></div>
                 <span className="text-xs text-slate-400 font-semibold uppercase">Firma Cliente</span>
               </div>
            </div>

          </div>
        </div>
      </div>

      <InvoicePrint 
        formData={formData} 
        items={items} 
        subtotal={subtotal} 
        tax={tax} 
        total={total} 
      />
    </div>
  )
}
