import React from 'react';
import { logoBase64 } from '../assets/logoBase64';
import { useSettings } from '../contexts/SettingsContext';

interface InvoicePrintProps {
  formData: any;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  documentType?: "FACTURA" | "PRESUPUESTO";
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ formData, items, subtotal, tax, total, documentType = "FACTURA" }) => {
  const { logoUrl } = useSettings();

  return (
    <div 
      id="printable-invoice" 
      className="bg-white text-black p-8"
      style={{ width: '210mm', minHeight: '297mm', position: 'fixed', left: 0, top: 0, zIndex: -1000 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 -mt-6">
            <img src={logoUrl || logoBase64} alt="ClimaVolt Solutions" className="w-80 h-auto object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} />
          </div>
          <p className="text-sm text-gray-600">Servicios de Climatización y Electricidad</p>
          <p className="text-sm text-gray-600">Tel: (829) 123-4567</p>
          <p className="text-sm text-gray-600">Email: info@climavolt.com</p>
        </div>
        
        <div className="text-right">
          <h1 className="text-3xl font-bold text-blue-600 mb-2 uppercase">{documentType}</h1>
          <div className="flex justify-end gap-4 text-sm mb-1">
            <span className="font-bold text-gray-700">Nº de {documentType === 'FACTURA' ? 'Factura' : 'Presupuesto'}:</span>
            <span className="text-gray-900">{formData.invoiceNumber}</span>
          </div>
          <div className="flex justify-end gap-4 text-sm">
            <span className="font-bold text-gray-700">Fecha:</span>
            <span className="text-gray-900">{new Date(formData.date).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>

      {/* Client & Equipment Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-bold text-blue-600 border-b border-gray-300 pb-1 mb-3">Facturar A</h2>
          <p className="text-sm text-gray-800 font-bold">{formData.clientName || 'Cliente General'}</p>
          {formData.rnc && <p className="text-sm text-gray-600">RNC/Cédula: {formData.rnc}</p>}
          {formData.address && <p className="text-sm text-gray-600">Dirección: {formData.address}</p>}
          {formData.phone && <p className="text-sm text-gray-600">Tel: {formData.phone}</p>}
          {formData.email && <p className="text-sm text-gray-600">Email: {formData.email}</p>}
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-blue-600 border-b border-gray-300 pb-1 mb-3">Detalles del Equipo</h2>
          {formData.equipmentType && <p className="text-sm text-gray-600"><span className="font-semibold">Equipo:</span> {formData.equipmentType}</p>}
          {formData.brand && <p className="text-sm text-gray-600"><span className="font-semibold">Marca/Modelo:</span> {formData.brand} {formData.model}</p>}
          {formData.capacity && <p className="text-sm text-gray-600"><span className="font-semibold">Capacidad:</span> {formData.capacity}</p>}
          {formData.serial && <p className="text-sm text-gray-600"><span className="font-semibold">Serie:</span> {formData.serial}</p>}
        </div>
      </div>

      {/* Services Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-600 border-b border-gray-300 pb-1 mb-3">Servicios Realizados</h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          {formData.services.preventive && <span>✓ Mantenimiento Preventivo</span>}
          {formData.services.corrective && <span>✓ Mantenimiento Correctivo</span>}
          {formData.services.installation && <span>✓ Instalación</span>}
          {formData.services.uninstallation && <span>✓ Desinstalación</span>}
          {formData.services.flush && <span>✓ Barrido del Sistema</span>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-left border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white text-sm">
            <th className="py-2 px-4 font-semibold">Descripción</th>
            <th className="py-2 px-4 font-semibold text-center">Cant.</th>
            <th className="py-2 px-4 font-semibold text-right">Precio Unit.</th>
            <th className="py-2 px-4 font-semibold text-right">Desc.</th>
            <th className="py-2 px-4 font-semibold text-right">Total</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {items.map((item, idx) => {
            const rowTotal = item.quantity * item.unitPrice;
            const discountAmount = rowTotal * ((item.discountPercentage || 0) / 100);
            const finalTotal = rowTotal - discountAmount;
            return (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-3 px-4">{item.description || 'Servicio General'}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right">RD$ {item.unitPrice.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">{item.discountPercentage ? `${item.discountPercentage}%` : '-'}</td>
                <td className="py-3 px-4 text-right">RD$ {finalTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2">
          {(() => {
            const grossSubtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
            const totalDiscount = grossSubtotal - subtotal;
            return (
              <>
                <div className="flex justify-between py-2 text-sm text-gray-700 border-b border-gray-200">
                  <span>Subtotal:</span>
                  <span>RD$ {grossSubtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between py-2 text-sm text-red-600 border-b border-gray-200">
                    <span>Descuento Aplicado:</span>
                    <span>- RD$ {totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm text-gray-700 border-b border-gray-200">
                  <span>ITBIS (18%):</span>
                  <span>RD$ {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 text-lg font-bold text-blue-600">
                  <span>TOTAL:</span>
                  <span>RD$ {total.toFixed(2)}</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-sm text-gray-600">
        {formData.nextMaintenanceDate && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
            <span className="font-bold">📅 Próximo Mantenimiento Sugerido:</span>
            <span>{new Date(formData.nextMaintenanceDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        )}
        {formData.observations && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-1">Observaciones:</h3>
            <p className="bg-gray-50 p-3 border border-gray-200 rounded">{formData.observations}</p>
          </div>
        )}
        <div className="flex justify-between items-end border-t-2 border-blue-600 pt-6">
          <div>
            <p><span className="font-bold">Método de Pago:</span> {formData.paymentMethod}</p>
            <p className="mt-2 font-bold">¡Gracias por preferir nuestros servicios!</p>
          </div>
          <div className="text-center w-48">
            <div className="border-t border-gray-400 mb-2 mt-8"></div>
            <p>Firma Autorizada</p>
          </div>
        </div>
      </div>
    </div>
  );
};
