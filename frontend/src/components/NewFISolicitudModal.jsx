import React, { useState } from 'react';
import { X, BadgePercent, Landmark, DollarSign, User, Car } from 'lucide-react';

export default function NewFISolicitudModal({ onClose, onSubmit, vehicles = [] }) {
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    rut_dni: '15.982.341-2',
    telefono: '+56987654321',
    email: 'cliente@origen.cl',
    id_vehiculo: vehicles[0]?.id || '',
    entidad_financiera: 'Forum Servicios Financieros',
    monto_solicitado: vehicles[0] ? Math.round(vehicles[0].precio_venta_publico * 0.8) : 12000000,
    pie_porcentaje: 20,
    observaciones: 'Evaluación comercial de crédito automotriz'
  });

  const handleVehicleSelect = (vId) => {
    const v = vehicles.find((item) => item.id === vId);
    setFormData((prev) => ({
      ...prev,
      id_vehiculo: vId,
      monto_solicitado: v ? Math.round(v.precio_venta_publico * (1 - prev.pie_porcentaje / 100)) : prev.monto_solicitado
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 p-6 space-y-6 animate-scale-up my-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nueva Solicitud F&I (Crédito)</h2>
              <p className="text-xs text-slate-400">Ingresar carpeta crediticia a financiera</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Entidad Financiera</label>
            <select
              value={formData.entidad_financiera}
              onChange={(e) => setFormData({ ...formData, entidad_financiera: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Forum Servicios Financieros">Forum Servicios Financieros</option>
              <option value="BCI Automotriz">BCI Automotriz</option>
              <option value="Tanner Servicios Financieros">Tanner Servicios Financieros</option>
              <option value="Santander Consumer">Santander Consumer</option>
              <option value="Banco Falabella">Banco Falabella</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Completo Cliente</label>
              <input
                type="text"
                required
                placeholder="EJ: Manuel Fernández"
                value={formData.nombre_cliente}
                onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">RUT / DNI Cliente</label>
              <input
                type="text"
                required
                value={formData.rut_dni}
                onChange={(e) => setFormData({ ...formData, rut_dni: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {vehicles.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Vehículo a Financiar</label>
              <select
                value={formData.id_vehiculo}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">-- Seleccionar Vehículo --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} ({v.patente}) - ${v.precio_venta_publico.toLocaleString('es-CL')} CLP
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Pie Inicial (%)</label>
              <input
                type="number"
                min="0"
                max="80"
                value={formData.pie_porcentaje}
                onChange={(e) => setFormData({ ...formData, pie_porcentaje: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Monto Solicitado ($CLP)</label>
              <input
                type="number"
                required
                value={formData.monto_solicitado}
                onChange={(e) => setFormData({ ...formData, monto_solicitado: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-extrabold font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Observaciones</label>
            <textarea
              rows="2"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30"
            >
              Ingresar Solicitud F&I
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
