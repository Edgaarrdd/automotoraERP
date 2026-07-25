import React, { useState, useEffect } from 'react';
import { Eye, DollarSign, FileText, CheckCircle2, Clock, Car, User, Share2, ShieldCheck, TrendingUp, Printer } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function ConsignorPortalSection({ vehicles = [] }) {
  const [consignments, setConsignments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConsignments();
  }, []);

  const fetchConsignments = async () => {
    try {
      const data = await apiFetch('/consignments/');
      if (Array.isArray(data) && data.length > 0) {
        setConsignments(data);
        setSelectedId(data[0].id);
        fetchSummary(data[0].id);
      }
    } catch (e) {
      console.warn('Fallback loading consignments:', e.message);
    }
  };

  const fetchSummary = async (vId) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/consignments/${vId}/summary`);
      if (data) {
        setSummary(data);
      }
    } catch (e) {
      console.warn('Fallback loading summary:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (vId) => {
    setSelectedId(vId);
    fetchSummary(vId);
  };

  const formatCLP = (val) => {
    if (!val) return '$0';
    return `$${Math.round(val).toLocaleString('es-CL')}`;
  };

  const selectedItem = consignments.find((c) => c.id === selectedId) || consignments[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-sky-400" /> Portal de Transparencia del Consignatario
          </h2>
          <p className="text-xs text-slate-400">
            CU 2.4 - Estado en tiempo real, actividad comercial y liquidación transparente para vehículos en consignación.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
        >
          <Printer className="w-4 h-4 text-sky-400" /> Imprimir Certificado Consignación
        </button>
      </div>

      {/* Vehicle Selector */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Car className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300">Seleccionar Auto Consignado:</span>
          <select
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500 w-full sm:w-64"
          >
            {consignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.marca} {item.modelo} ({item.patente})
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Dueño/Consignatario:</span>
            <span className="text-xs font-extrabold text-sky-300 bg-sky-500/10 px-3 py-1 rounded-xl border border-sky-500/20">
              {selectedItem.consignatario?.nombre_completo} ({selectedItem.consignatario?.rut_dni})
            </span>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transparency Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Header & Status Badge */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-mono">
                    PATENTE: {selectedItem.patente}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {selectedItem.marca} {selectedItem.modelo} ({selectedItem.año})
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedItem.kilometraje?.toLocaleString('es-CL')} km • Color {selectedItem.color || 'Gris'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Estado Comercial</span>
                  <span className="inline-block mt-1 text-xs font-black uppercase px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ● {selectedItem.estado}
                  </span>
                </div>
              </div>

              {/* Activity Counters Grid */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                  <FileText className="w-5 h-5 text-sky-400 mx-auto" />
                  <span className="text-xl font-black text-white block">
                    {summary?.actividad?.cotizaciones || selectedItem.metricas_transparencia?.cotizaciones_emitidas || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block">Cotizaciones Emitidas</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                  <Car className="w-5 h-5 text-purple-400 mx-auto" />
                  <span className="text-xl font-black text-white block">
                    {summary?.actividad?.test_drives || selectedItem.metricas_transparencia?.test_drives_realizados || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block">Test Drives Realizados</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                  <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto" />
                  <span className="text-xl font-black text-white block">
                    {summary?.actividad?.prospectos_interesados || selectedItem.metricas_transparencia?.prospectos_interesados || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block">Leads Interesados</span>
                </div>
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" /> Avance del Proceso de Venta
              </h4>

              <div className="space-y-3">
                {(summary?.linea_tiempo_estado || [
                  { etapa: "Recepción & Firma Contrato", completada: true },
                  { etapa: "Inspección Técnica & PDI Taller", completada: true },
                  { etapa: "Publicado en Portales (Chileautos / MercadoLibre)", completada: true },
                  { etapa: "Pruebas de Manejo & Negociación Activa", completada: false },
                  { etapa: "Vendido & Transferencia al Consignatario", completada: false }
                ]).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      step.completada
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {step.completada ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${step.completada ? 'text-white' : 'text-slate-500'}`}>
                      {step.etapa}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Payout Summary Column */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">Liquidación Consignatario</h4>
                  <p className="text-xs text-slate-400">Desglose transparente de comisión</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Precio Venta Público Sugerido:</span>
                  <span className="font-mono font-bold text-white">{formatCLP(selectedItem.precio_venta_publico)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Comisión Automotora ({selectedItem.comision_porcentaje}%):</span>
                  <span className="font-mono font-bold text-amber-400">-{formatCLP(selectedItem.monto_comision_estimado)}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-emerald-400">Liquidación NETA al Dueño:</span>
                  <span className="font-mono font-black text-xl text-emerald-400">
                    {formatCLP(selectedItem.liquidacion_estimada_dueno)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 space-y-2">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" /> Garantía de Transparencia
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Las transferencias de fondos al consignatario se efectúan dentro de las 24 horas hábiles posteriores al cierre de la venta y firma de transferencia legal en notaría.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono text-center pt-4 border-t border-slate-800">
              Contrato de Consignación #CONSIG-2026-0042
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
