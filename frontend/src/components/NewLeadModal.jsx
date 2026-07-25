import React, { useState } from 'react';
import { X, GitCommit, UserPlus, Car, DollarSign, Flame, Zap, Snowflake } from 'lucide-react';

export default function NewLeadModal({ onClose, onSubmit, vehicles = [] }) {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '+569',
    email: '',
    id_vehiculo_interes: vehicles[0]?.id || '',
    monto_estimado: vehicles[0]?.precio_venta_publico || 15990000,
    score_lead: 'CALIENTE'
  });

  const handleVehicleSelect = (vId) => {
    const v = vehicles.find((item) => item.id === vId);
    setFormData((prev) => ({
      ...prev,
      id_vehiculo_interes: vId,
      monto_estimado: v ? v.precio_venta_publico : prev.monto_estimado
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
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Crear Nueva Oportunidad / Lead</h2>
              <p className="text-xs text-slate-400">Ingreso directo al Pipeline Kanban comercial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Completo del Cliente</label>
            <input
              type="text"
              required
              placeholder="EJ: Gabriel Arriagada"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono Móvil</label>
              <input
                type="text"
                required
                placeholder="+569 8877 6655"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="cliente@ejemplo.cl"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {vehicles.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Vehículo de Interés (Stock)</label>
              <select
                value={formData.id_vehiculo_interes}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="">-- Seleccionar de Inventario --</option>
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
              <label className="text-xs font-bold text-slate-300 block mb-1">Monto Estimado Negocio ($CLP)</label>
              <input
                type="number"
                required
                value={formData.monto_estimado}
                onChange={(e) => setFormData({ ...formData, monto_estimado: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-extrabold font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Lead Scoring</label>
              <select
                value={formData.score_lead}
                onChange={(e) => setFormData({ ...formData, score_lead: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:border-sky-500 focus:outline-none"
              >
                <option value="CALIENTE">🔥 Caliente (Alta Prioridad)</option>
                <option value="TIBIO">⚡ Tibio (Evaluación)</option>
                <option value="FRIO">❄️ Frío (Inicial)</option>
              </select>
            </div>
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
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-lg shadow-sky-600/30"
            >
              Crear Oportunidad Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
