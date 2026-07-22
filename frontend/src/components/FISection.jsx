import React from 'react';
import { BadgePercent, Landmark, CheckCircle, Clock, FileCheck, RefreshCw, Send } from 'lucide-react';

export default function FISection({ fiSolicitudes }) {
  const formatCLP = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
  };

  const timelineStages = ['BORRADOR', 'ENVIADA', 'EN_ESTUDIO', 'PRE_APROBADA', 'APROBADA'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BadgePercent className="w-6 h-6 text-emerald-400" /> Módulo F&I (Finanzas & Seguros)
          </h2>
          <p className="text-xs text-slate-400">
            CU 6.1 & CU 6.2 - Línea de tiempo de crédito, comparativa de ofertas bancarias y reenvío a financieras.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fiSolicitudes.map((sol) => (
          <div key={sol.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" /> {sol.entidad_financiera}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                  sol.estado === 'APROBADA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {sol.estado}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400">Monto Solicitado:</div>
                <div className="text-2xl font-extrabold text-white font-mono">{formatCLP(sol.monto_solicitado)}</div>
                <div className="text-xs text-slate-400">Pie del cliente: <strong className="text-slate-200">{sol.pie_porcentaje}%</strong></div>
              </div>

              {/* Status Timeline Bar */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Línea de Tiempo Crédito (CU 6.1)</span>
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 pt-1">
                  {timelineStages.map((st, i) => {
                    const isDone = timelineStages.indexOf(sol.estado) >= i;
                    return (
                      <div key={st} className="flex flex-col items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${isDone ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-700'}`} />
                        <span className={isDone ? 'text-emerald-400 font-extrabold' : ''}>{st.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {sol.observaciones && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  "{sol.observaciones}"
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" /> Reenviar a otra Financiera
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
