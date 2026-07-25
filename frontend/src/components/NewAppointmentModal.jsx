import React, { useState } from 'react';
import { X, Calendar, Clock, User, Car, Tag } from 'lucide-react';

export default function NewAppointmentModal({ onClose, onSubmit, vehicles = [] }) {
  const [formData, setFormData] = useState({
    titulo: 'Test Drive Suzuki Swift - Cliente Nuevo',
    tipo: 'TEST_DRIVE',
    fecha_inicio: new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16),
    fecha_fin: new Date(Date.now() + 3600000 * 3).toISOString().slice(0, 16),
    id_vehiculo: vehicles[0]?.id || '',
    notas: 'Cliente solicita prueba de ruta en autopista.'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 p-6 space-y-6 animate-scale-up my-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Agendar Cita / Test Drive</h2>
              <p className="text-xs text-slate-400">CU 2.2 - Agendamiento en agenda comercial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Título / Motivo Cita</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Cita</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-purple-300 font-bold focus:border-purple-500 focus:outline-none"
              >
                <option value="TEST_DRIVE">🚗 Test Drive / Prueba Manejo</option>
                <option value="ENTREGA_VEHICULO">🔑 Entrega de Vehículo</option>
                <option value="REUNION_NEGOCIACION">💼 Reunión de Negociación</option>
                <option value="TALLER_PDI">🔧 Preparación Taller / PDI</option>
              </select>
            </div>

            {vehicles.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Vehículo Asignado</label>
                <select
                  value={formData.id_vehiculo}
                  onChange={(e) => setFormData({ ...formData, id_vehiculo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">-- Ninguno / General --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} ({v.patente})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Fecha y Hora Inicio</label>
              <input
                type="datetime-local"
                required
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Fecha y Hora Término</label>
              <input
                type="datetime-local"
                required
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Notas / Observaciones</label>
            <textarea
              rows="2"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30"
            >
              Agendar Cita en Calendario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
