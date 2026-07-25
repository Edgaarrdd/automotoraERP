import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, Car, CheckCircle, XCircle, Filter, Tag, User } from 'lucide-react';

export default function CalendarSection({ appointments = [], vehicles = [], onOpenNewAppointmentModal, onUpdateStatus, onDeleteAppointment }) {
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredAppointments = appointments.filter((app) => {
    if (filterType !== 'ALL' && app.tipo !== filterType) return false;
    if (filterStatus !== 'ALL' && app.estado !== filterStatus) return false;
    return true;
  });

  const getTypeBadge = (tipo) => {
    switch (tipo) {
      case 'TEST_DRIVE':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">🚗 Test Drive</span>;
      case 'ENTREGA_VEHICULO':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🔑 Entrega Auto</span>;
      case 'REUNION_NEGOCIACION':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">💼 Negociación</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">🔧 PDI Taller</span>;
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'COMPLETADA':
        return <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completada</span>;
      case 'CANCELADA':
        return <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Cancelada</span>;
      default:
        return <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Agendada</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-400" /> Agenda Comercial & Test Drives
          </h2>
          <p className="text-xs text-slate-400">
            CU 2.2 - Calendario de pruebas de manejo, citas de entrega y reuniones con clientes.
          </p>
        </div>

        <button
          onClick={onOpenNewAppointmentModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> + Agendar Cita / Test Drive
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300">Filtrar Citas:</span>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="TEST_DRIVE">🚗 Test Drives</option>
            <option value="ENTREGA_VEHICULO">🔑 Entregas de Auto</option>
            <option value="REUNION_NEGOCIACION">💼 Negociaciones</option>
            <option value="TALLER_PDI">🔧 PDI Taller</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="AGENDADA">Agendadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono font-bold">
          Total Citas: <span className="text-purple-400">{filteredAppointments.length}</span>
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel rounded-3xl border border-dashed border-slate-800 space-y-3">
            <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No hay citas registradas en la agenda</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Utiliza el botón "+ Agendar Cita" para programar pruebas de manejo o reuniones comerciales.
            </p>
          </div>
        ) : (
          filteredAppointments.map((app) => {
            const v = vehicles.find((item) => item.id === app.id_vehiculo);
            return (
              <div
                key={app.id}
                className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getTypeBadge(app.tipo)}
                    {getStatusBadge(app.estado)}
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-snug">{app.titulo}</h3>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-purple-300 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatDate(app.fecha_inicio)}</span>
                    </div>

                    {v && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Car className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{v.marca} {v.modelo} ({v.patente})</span>
                      </div>
                    )}

                    {app.notas && (
                      <p className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 italic">
                        "{app.notas}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  {app.estado === 'AGENDADA' && (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <button
                        onClick={() => onUpdateStatus(app.id, 'COMPLETADA')}
                        className="flex items-center gap-1 text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg font-bold transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Completar
                      </button>

                      <button
                        onClick={() => onUpdateStatus(app.id, 'CANCELADA')}
                        className="flex items-center gap-1 text-red-400 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg font-bold transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    </div>
                  )}

                  {app.estado !== 'AGENDADA' && (
                    <button
                      onClick={() => onDeleteAppointment(app.id)}
                      className="text-slate-500 hover:text-red-400 text-[11px] font-bold"
                    >
                      Eliminar Registro
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
