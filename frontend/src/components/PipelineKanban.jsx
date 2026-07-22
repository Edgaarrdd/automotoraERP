import React, { useState } from 'react';
import { GitCommit, User, Car, DollarSign, Plus, ArrowRight, CheckCircle, XCircle, Flame, Snowflake, Zap, Calendar, RefreshCw } from 'lucide-react';

export default function PipelineKanban({ leads, onUpdateStage, onOpenNewLeadModal, currentUser }) {
  const [lossModalLead, setLossModalLead] = useState(null);
  const [lossReason, setLossReason] = useState('');
  
  // CU 2.2 Test Drive appointment modal
  const [testDriveModalLead, setTestDriveModalLead] = useState(null);
  const [testDriveDate, setTestDriveDate] = useState('');

  // CU 2.7 Sale Closure modal
  const [closeSaleModalLead, setCloseSaleModalLead] = useState(null);
  const [saleForm, setSaleForm] = useState({
    precio_final: 18990000,
    metodo_pago: 'CREDITO',
    pie_monto: 5000000,
    tiene_tradein: false,
    tradein_marca: '',
    tradein_modelo: '',
    tradein_tasacion: 0
  });

  const formatCLP = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
  };

  const columns = [
    { id: 'NUEVO', title: 'Nuevo Lead', color: 'border-sky-500 text-sky-400 bg-sky-500/10' },
    { id: 'CONTACTADO', title: 'Contactado', color: 'border-blue-500 text-blue-400 bg-blue-500/10' },
    { id: 'TEST_DRIVE_AGENDADO', title: 'Test Drive / Cita', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
    { id: 'NEGOCIACION', title: 'Negociación', color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
    { id: 'RESERVADO', title: 'Reservado con Seña', color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10' },
    { id: 'CERRADO_GANADO', title: 'Cerrado Ganado 🏆', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
  ];

  const handleStageAdvance = (lead, currentStage) => {
    if (currentStage === 'CONTACTADO') {
      // Mandate date entry for Test Drive (CU 2.2)
      setTestDriveModalLead(lead);
      setTestDriveDate(new Date().toISOString().slice(0, 16));
      return;
    }

    if (currentStage === 'RESERVADO') {
      // Require sale closure details (CU 2.7)
      setCloseSaleModalLead(lead);
      setSaleForm({
        precio_final: lead.monto_estimado || 18990000,
        metodo_pago: 'CREDITO',
        pie_monto: 5000000,
        tiene_tradein: false,
        tradein_marca: '',
        tradein_modelo: '',
        tradein_tasacion: 0
      });
      return;
    }

    const stageOrder = ['NUEVO', 'CONTACTADO', 'TEST_DRIVE_AGENDADO', 'NEGOCIACION', 'RESERVADO', 'CERRADO_GANADO'];
    const idx = stageOrder.indexOf(currentStage);
    if (idx !== -1 && idx < stageOrder.length - 1) {
      onUpdateStage(lead.id, stageOrder[idx + 1]);
    }
  };

  const submitTestDrive = (e) => {
    e.preventDefault();
    if (testDriveModalLead) {
      onUpdateStage(testDriveModalLead.id, 'TEST_DRIVE_AGENDADO');
      setTestDriveModalLead(null);
    }
  };

  const submitCloseSale = (e) => {
    e.preventDefault();
    if (closeSaleModalLead) {
      onUpdateStage(closeSaleModalLead.id, 'CERRADO_GANADO');
      setCloseSaleModalLead(null);
    }
  };

  const handleStageLoss = (lead) => {
    setLossModalLead(lead);
    setLossReason('');
  };

  const submitLoss = (e) => {
    e.preventDefault();
    if (lossModalLead) {
      onUpdateStage(lossModalLead.id, 'CERRADO_PERDIDO', lossReason || 'Precio / No financiado');
      setLossModalLead(null);
    }
  };

  const getScoreBadge = (score = 'TIBIO') => {
    if (score === 'CALIENTE') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><Flame className="w-3 h-3 text-red-500" /> Caliente</span>;
    if (score === 'FRIO') return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><Snowflake className="w-3 h-3 text-blue-400" /> Frío</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Tibio</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <GitCommit className="w-6 h-6 text-sky-400" /> Pipeline Comercial de Ventas
          </h2>
          <p className="text-xs text-slate-400">
            Kanban interactivo con Lead Scoring, agendamiento de Test Drive (CU 2.2) y Cierre con Permuta (CU 2.7).
          </p>
        </div>

        <button
          onClick={onOpenNewLeadModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Crear Oportunidad Lead
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.estado_embudo === col.id);
          const colTotalMonto = colLeads.reduce((sum, item) => sum + (item.monto_estimado || 0), 0);

          return (
            <div
              key={col.id}
              className="w-80 shrink-0 glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
            >
              {/* Column Header */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg border ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-400">
                  Total: <span className="text-white">{formatCLP(colTotalMonto)}</span>
                </div>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colLeads.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-600 font-medium italic border border-dashed border-slate-800 rounded-xl">
                    Sin leads en esta etapa
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="glass-card glass-card-hover p-4 rounded-xl border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">
                            {lead.customer ? lead.customer.nombre_completo : 'Cliente Particular'}
                          </h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-sky-400" />
                            {lead.customer ? lead.customer.telefono : '+569 1122 3344'}
                          </p>
                        </div>
                        {getScoreBadge(lead.score_lead || 'CALIENTE')}
                      </div>

                      {/* Vehicle associated */}
                      {lead.vehicle && (
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2">
                          <Car className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-200">{lead.vehicle.marca} {lead.vehicle.modelo}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{lead.vehicle.patente}</div>
                          </div>
                        </div>
                      )}

                      {/* Monto & Vendor Badge */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <span className="font-extrabold text-emerald-400 font-mono">
                          {formatCLP(lead.monto_estimado)}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Asesor Comercial
                        </span>
                      </div>

                      {/* Transition Action Buttons */}
                      {col.id !== 'CERRADO_GANADO' && (
                        <div className="flex items-center justify-between pt-1 gap-2">
                          <button
                            onClick={() => handleStageLoss(lead)}
                            className="text-[10px] font-bold text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Perder
                          </button>
                          <button
                            onClick={() => handleStageAdvance(lead, col.id)}
                            className="text-[10px] font-bold text-sky-400 hover:bg-sky-500/10 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            {col.id === 'RESERVADO' ? 'Cerrar Venta 🏆' : 'Avanzar'} <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CU 2.2 Test Drive Modal */}
      {testDriveModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-4 animate-scale-up">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Agendar Cita / Test Drive (CU 2.2)
            </h3>
            <p className="text-xs text-slate-400">
              Para avanzar esta tarjeta a "Test Drive Agendado", debes especificar fecha y hora de la cita.
            </p>

            <form onSubmit={submitTestDrive} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Fecha y Hora de la Cita</label>
                <input
                  type="datetime-local"
                  required
                  value={testDriveDate}
                  onChange={(e) => setTestDriveDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestDriveModalLead(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Agendar y Avanzar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CU 2.7 Close Sale & Trade-In Modal */}
      {closeSaleModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-slate-800 space-y-4 animate-scale-up my-8">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> Registro y Cierre Formal de Venta (CU 2.7)
            </h3>
            <p className="text-xs text-slate-400">
              Completa los datos de la transacción, método de pago y auto en permuta (trade-in) si aplica.
            </p>

            <form onSubmit={submitCloseSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Precio Final Cierre ($CLP)</label>
                  <input
                    type="number"
                    required
                    value={saleForm.precio_final}
                    onChange={(e) => setSaleForm({ ...saleForm, precio_final: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-extrabold font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Método de Pago</label>
                  <select
                    value={saleForm.metodo_pago}
                    onChange={(e) => setSaleForm({ ...saleForm, metodo_pago: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="CONTADO">Contado Total</option>
                    <option value="CREDITO">Crédito Automotriz</option>
                    <option value="MIXTO">Mixto (Contado + Crédito)</option>
                  </select>
                </div>
              </div>

              {/* Trade-In Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4" /> ¿Incluye Auto en Permuta / Retoma (Trade-In)?
                  </span>
                  <input
                    type="checkbox"
                    checked={saleForm.tiene_tradein}
                    onChange={(e) => setSaleForm({ ...saleForm, tiene_tradein: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </div>

                {saleForm.tiene_tradein && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Marca Auto Usado</label>
                      <input
                        type="text"
                        placeholder="EJ: Suzuki"
                        value={saleForm.tradein_marca}
                        onChange={(e) => setSaleForm({ ...saleForm, tradein_marca: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Modelo</label>
                      <input
                        type="text"
                        placeholder="EJ: Swift 2020"
                        value={saleForm.tradein_modelo}
                        onChange={(e) => setSaleForm({ ...saleForm, tradein_modelo: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Valor Tasación Retoma</label>
                      <input
                        type="number"
                        placeholder="6500000"
                        value={saleForm.tradein_tasacion}
                        onChange={(e) => setSaleForm({ ...saleForm, tradein_tasacion: parseFloat(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseSaleModalLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30"
                >
                  Registrar Cierre de Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loss Reason Modal */}
      {lossModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-4 animate-scale-up">
            <h3 className="text-lg font-bold text-white">Marcar Lead como Perdido</h3>
            <p className="text-xs text-slate-400">Indica el motivo de pérdida para la métrica de análisis comercial.</p>

            <form onSubmit={submitLoss} className="space-y-4">
              <select
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="PRECIO_ALTO">Precio demasiado alto</option>
                <option value="RECHAZO_CREDITO">Rechazo de crédito financiero</option>
                <option value="COMPRO_COMPETENCIA">Compró en otra automotora</option>
                <option value="DESISTIO">Desistió de la compra</option>
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLossModalLead(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Confirmar Pérdida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
