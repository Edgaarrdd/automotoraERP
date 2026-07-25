import React, { useState, useEffect } from 'react';
import { DollarSign, Award, TrendingUp, CheckCircle, Printer, Calendar, User, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function CommissionsSection({ currentUser }) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/commissions/summary');
      if (Array.isArray(data)) {
        setCommissions(data);
      }
    } catch (e) {
      console.warn('Fallback loading commissions:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (vendedorId, newStatus) => {
    try {
      await apiFetch(`/commissions/${vendedorId}/status?estado_nuevo=${newStatus}`, {
        method: 'PATCH'
      });
      setCommissions((prev) =>
        prev.map((c) => (c.vendedor_id === vendedorId ? { ...c, estado_liquidacion: newStatus } : c))
      );
    } catch (e) {
      console.warn('Fallback status update:', e.message);
    }
  };

  const formatCLP = (val) => {
    if (!val) return '$0';
    return `$${Math.round(val).toLocaleString('es-CL')}`;
  };

  const totalVentasMes = commissions.reduce((sum, c) => sum + (c.monto_total_ventas || 0), 0);
  const totalMargenMes = commissions.reduce((sum, c) => sum + (c.margen_bruto_total || 0), 0);
  const totalComisionesPagar = commissions.reduce((sum, c) => sum + (c.total_comision_pagar || 0), 0);
  const totalAutosVendidos = commissions.reduce((sum, c) => sum + (c.vehiculos_vendidos || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" /> Liquidación de Comisiones & Reporte de Ventas
          </h2>
          <p className="text-xs text-slate-400">
            CU 2.3 - Cálculo automático de comisiones base (1.5%), bonos F&I y aprobación de pago por Gerencia.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
        >
          <Printer className="w-4 h-4 text-amber-400" /> Imprimir Reporte Mensual
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Autos Vendidos (Mes)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalAutosVendidos}</span>
            <span className="text-xs font-bold text-emerald-400">unidades</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ventas Totales ($CLP)</span>
          <span className="text-2xl font-black text-sky-400">{formatCLP(totalVentasMes)}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Margen Bruto Generado</span>
          <span className="text-2xl font-black text-emerald-400">{formatCLP(totalMargenMes)}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Comisiones a Liquidar</span>
          <span className="text-2xl font-black text-amber-400">{formatCLP(totalComisionesPagar)}</span>
        </div>
      </div>

      {/* Sellers Commissions Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" /> Desglose Mensual por Asesor Comercial
          </h3>
          <span className="text-xs font-bold text-slate-400 font-mono">
            Período: Julio 2026
          </span>
        </div>

        <table className="w-full text-xs text-left text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="p-3">Asesor Commercial</th>
              <th className="p-3 text-center">Unidades</th>
              <th className="p-3 text-right">Monto Ventas ($CLP)</th>
              <th className="p-3 text-right">Comisión Base (1.5%)</th>
              <th className="p-3 text-center">Créditos F&I</th>
              <th className="p-3 text-right">Bono F&I ($50k)</th>
              <th className="p-3 text-right">Total a Liquidar</th>
              <th className="p-3 text-center">Estado Pago</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {commissions.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-slate-500">
                  No hay datos de comisiones calculadas para este mes.
                </td>
              </tr>
            ) : (
              commissions.map((item) => (
                <tr key={item.vendedor_id} className="hover:bg-slate-900/60 transition-all">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span>{item.nombre}</span>
                      <span className="text-[10px] text-slate-500 block font-normal">{item.email}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-white">{item.vehiculos_vendidos}</td>
                  <td className="p-3 text-right font-mono text-slate-200">{formatCLP(item.monto_total_ventas)}</td>
                  <td className="p-3 text-right font-mono text-sky-300 font-bold">{formatCLP(item.comision_base_monto)}</td>
                  <td className="p-3 text-center font-bold text-purple-300">{item.creditos_fi_colocados}</td>
                  <td className="p-3 text-right font-mono text-purple-300 font-bold">{formatCLP(item.bono_fi_monto)}</td>
                  <td className="p-3 text-right font-mono text-amber-400 font-black text-sm">{formatCLP(item.total_comision_pagar)}</td>
                  <td className="p-3 text-center">
                    {item.estado_liquidacion === 'PAGADA' && (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Pagada
                      </span>
                    )}
                    {item.estado_liquidacion === 'APROBADA' && (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        Aprobada
                      </span>
                    )}
                    {['PENDIENTE_REVISION', 'SIN_VENTAS'].includes(item.estado_liquidacion) && (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {item.estado_liquidacion === 'SIN_VENTAS' ? 'Sin Ventas' : 'Pendiente'}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {['ADMIN', 'GERENTE'].includes(currentUser?.rol) && item.vehiculos_vendidos > 0 && (
                      <div className="flex items-center justify-center gap-2">
                        {item.estado_liquidacion !== 'PAGADA' && (
                          <button
                            onClick={() => handleUpdateStatus(item.vendedor_id, 'PAGADA')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold transition-all"
                          >
                            Marcar Pagada
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
