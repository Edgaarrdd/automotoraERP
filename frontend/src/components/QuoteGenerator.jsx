import React, { useState } from 'react';
import { FileText, Calculator, ShieldCheck, Printer, CheckCircle, Car, MessageCircle, AlertTriangle } from 'lucide-react';

export default function QuoteGenerator({ vehicles, currentUser }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [customerName, setCustomerName] = useState('Juan Pablo Pérez');
  const [customerRut, setCustomerRut] = useState('16.482.193-K');
  const [customerPhone, setCustomerPhone] = useState('+56987654321');
  const [financingType, setFinancingType] = useState('CREDITO_CONVENCIONAL'); // CONTADO, CREDITO_INTELIGENTE, CREDITO_CONVENCIONAL
  const [pieAmount, setPieAmount] = useState(5000000);
  const [installments, setInstallments] = useState(36);
  const [interestRate, setInterestRate] = useState(1.45);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [insuranceCost, setInsuranceCost] = useState(38000);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const vehiclePrice = selectedVehicle ? selectedVehicle.precio_venta_publico : 18990000;
  const isAvailable = selectedVehicle ? selectedVehicle.estado === 'DISPONIBLE' : true;

  const formatCLP = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
  };

  // Calculations by method
  let montoFinanciar = Math.max(0, vehiclePrice - pieAmount);
  let vfgMonto = 0;

  if (financingType === 'CREDITO_INTELIGENTE') {
    vfgMonto = Math.round(vehiclePrice * 0.35); // 35% VFG (Valor Futuro Garantizado)
    montoFinanciar = Math.max(0, vehiclePrice - pieAmount - vfgMonto);
  } else if (financingType === 'CONTADO') {
    montoFinanciar = 0;
  }

  // Monthly installment formula
  const r = interestRate / 100.0;
  const n = installments;
  let cuotaBase = 0;
  if (financingType !== 'CONTADO') {
    if (r > 0 && n > 0 && montoFinanciar > 0) {
      cuotaBase = montoFinanciar * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else if (n > 0) {
      cuotaBase = montoFinanciar / n;
    }
  }

  const cuotaTotal = Math.round(cuotaBase + (includeInsurance && financingType !== 'CONTADO' ? insuranceCost : 0));

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola ${customerName}, adjunto la cotización de tu vehículo *${selectedVehicle?.marca} ${selectedVehicle?.modelo}* (${selectedVehicle?.patente}) en Automotora Las Condes.\n\n` +
      `• Precio Venta: ${formatCLP(vehiclePrice)}\n` +
      `• Modalidad: ${financingType.replace('_', ' ')}\n` +
      `• Pie Inicial: ${formatCLP(pieAmount)}\n` +
      (financingType !== 'CONTADO' ? `• Cuota Estimada: ${formatCLP(cuotaTotal)} / mes (${installments} cuotas)\n` : '') +
      `\n¿Cuándo te gustaría coordinar una prueba de manejo (Test Drive)?`
    );
    window.open(`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-400" /> Generador de Cotización Financiera (PDF / WhatsApp)
          </h2>
          <p className="text-xs text-slate-400">
            CU 2.3 - Cotizaciones multimodales (Contado, Crédito Inteligente con VFG y Crédito Convencional).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <MessageCircle className="w-4 h-4" /> Enviar WhatsApp
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-bold text-xs transition-all"
          >
            <Printer className="w-4 h-4" /> Imprimir PDF
          </button>
        </div>
      </div>

      {!isAvailable && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>¡Advertencia! El vehículo seleccionado está en estado <strong className="uppercase font-mono text-white">[{selectedVehicle?.estado}]</strong>. Se sugiere ofrecer alternativas similares de stock.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls Left */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calculator className="w-4 h-4 text-sky-400" /> Modalidad y Simulación
          </h3>

          <div className="space-y-3">
            {/* 3 Financing Tabs */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Método de Financiamiento</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'CONTADO', label: 'Contado' },
                  { id: 'CREDITO_CONVENCIONAL', label: 'Crédito Conv.' },
                  { id: 'CREDITO_INTELIGENTE', label: 'Crédito Intel.' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFinancingType(m.id)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                      financingType === m.id
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Seleccionar Vehículo</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} ({v.patente}) - {formatCLP(v.precio_venta_publico)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Cliente</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono WhatsApp</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {financingType !== 'CONTADO' && (
              <>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Pie Inicial ($CLP):</span>
                    <span className="text-sky-400 font-mono">{formatCLP(pieAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={vehiclePrice * 0.7}
                    step="500000"
                    value={pieAmount}
                    onChange={(e) => setPieAmount(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Plazo Cuotas</label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value={12}>12 Meses</option>
                      <option value={24}>24 Meses</option>
                      <option value={36}>36 Meses</option>
                      <option value={48}>48 Meses</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tasa Interés Mensual (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Printable PDF View Right */}
        <div className="lg:col-span-7 bg-white text-slate-900 p-8 rounded-3xl shadow-2xl space-y-6 print:m-0 print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">COTIZACIÓN DE VEHÍCULO</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">Automotora Las Condes SpA • Av. Apoquindo 4500</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-300">
                COT-2026-0891
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Fecha: 21 de Julio, 2026</p>
            </div>
          </div>

          {/* Client & Vehicle */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cliente</span>
              <div className="font-bold text-slate-800">{customerName}</div>
              <div className="text-slate-600">RUT: {customerRut}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vehículo</span>
              <div className="font-bold text-slate-800">
                {selectedVehicle?.marca} {selectedVehicle?.modelo} ({selectedVehicle?.año})
              </div>
              <div className="text-slate-600 font-mono">Patente: {selectedVehicle?.patente}</div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">CONCEPTO ({financingType.replace('_', ' ')})</th>
                  <th className="p-3 text-right">MONTO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                <tr>
                  <td className="p-3">Precio Venta Público del Vehículo</td>
                  <td className="p-3 text-right font-mono font-bold">{formatCLP(vehiclePrice)}</td>
                </tr>
                {financingType !== 'CONTADO' && (
                  <tr>
                    <td className="p-3 text-slate-600">(-) Pie Inicial Cancelado</td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-bold">-{formatCLP(pieAmount)}</td>
                  </tr>
                )}
                {financingType === 'CREDITO_INTELIGENTE' && (
                  <tr>
                    <td className="p-3 text-slate-600">(-) Valor Futuro Garantizado (VFG - Cuota 37)</td>
                    <td className="p-3 text-right font-mono text-indigo-600 font-bold">-{formatCLP(vfgMonto)}</td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-bold">
                  <td className="p-3">(=) Monto a Financiar en Cuotas</td>
                  <td className="p-3 text-right font-mono text-slate-900">{formatCLP(montoFinanciar)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Highlight */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 to-indigo-900 text-white flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs uppercase font-extrabold text-sky-300">
                {financingType === 'CONTADO' ? 'Pago Total al Contado' : 'Cuota Mensual Estimada'}
              </span>
              <div className="text-xs text-sky-100 mt-0.5">
                {financingType === 'CONTADO' ? 'Sin cuotas financieras' : `${installments} Cuotas fijas • Tasa ${interestRate}%`}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {financingType === 'CONTADO' ? formatCLP(vehiclePrice) : `${formatCLP(cuotaTotal)} / mes`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
