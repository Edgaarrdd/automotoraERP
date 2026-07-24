import React, { useState } from 'react';
import { PhoneCall, UserPlus, Phone, Mail, Car, CheckCircle, Flame, Snowflake, Zap, AlertCircle } from 'lucide-react';

export default function BDCSection({ bdcLeads, onSubmitBDC }) {
  const [formData, setFormData] = useState({
    nombre_prospecto: '',
    telefono: '',
    email: '',
    origen_contacto: 'LLAMADA_ENTRANTE',
    score_lead: 'CALIENTE',
    vehiculo_interes: 'Toyota RAV4 / SUV',
    notas: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [existingCustomerAlert, setExistingCustomerAlert] = useState(false);

  const handlePhoneChange = (val) => {
    setFormData({ ...formData, telefono: val });
    // CU 8.1: Check duplicate customer by phone
    const exists = bdcLeads.some((b) => b.telefono.replace(/\s+/g, '') === val.replace(/\s+/g, ''));
    setExistingCustomerAlert(exists && val.length > 6);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitBDC(formData);
    setSubmitted(true);
    setFormData({
      nombre_prospecto: '',
      telefono: '',
      email: '',
      origen_contacto: 'LLAMADA_ENTRANTE',
      score_lead: 'CALIENTE',
      vehiculo_interes: '',
      notas: ''
    });
    setExistingCustomerAlert(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <PhoneCall className="w-6 h-6 text-amber-400" /> BDC & Recepción de Leads
        </h2>
        <p className="text-xs text-slate-400">
          CU 8.1 - Captura rápida con Lead Scoring (Caliente/Tibio/Frío) y detección automática de clientes existentes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rapid Form Left */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4" data-tour="bdc-new-contact">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <UserPlus className="w-4 h-4 text-amber-400" /> Capturar Prospecto Rápido
          </h3>

          {submitted && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> ¡Lead BDC registrado y derivado a vendedor!
            </div>
          )}

          {existingCustomerAlert && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cliente existente detectado en BD (CU 8.1). La nueva consulta se asociará a su historial previo.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Completo Prospecto</label>
              <input
                type="text"
                required
                placeholder="EJ: Rodrigo Morales"
                value={formData.nombre_prospecto}
                onChange={(e) => setFormData({ ...formData, nombre_prospecto: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono Móvil</label>
                <input
                  type="text"
                  required
                  placeholder="+569 9876 5432"
                  value={formData.telefono}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Lead Scoring</label>
                <select
                  value={formData.score_lead}
                  onChange={(e) => setFormData({ ...formData, score_lead: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none"
                >
                  <option value="CALIENTE">🔥 Caliente (Compra Inmediata)</option>
                  <option value="TIBIO">⚡ Tibio (Interesado/Cotizando)</option>
                  <option value="FRIO">❄️ Frío (Consulta General)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Canal de Origen</label>
              <select
                value={formData.origen_contacto}
                onChange={(e) => setFormData({ ...formData, origen_contacto: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="LLAMADA_ENTRANTE">Llamada Telefónica</option>
                <option value="PRESENCIAL">Visita Salón</option>
                <option value="WHATSAPP">Mensaje WhatsApp</option>
                <option value="CHILEAUTOS">Chileautos Portal</option>
                <option value="MERCADOLIBRE">MercadoLibre Autos</option>
                <option value="INSTAGRAM">Instagram / Facebook</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Vehículo o Modelo de Interés</label>
              <input
                type="text"
                placeholder="EJ: Hyundai Tucson 2023 / SUV"
                value={formData.vehiculo_interes}
                onChange={(e) => setFormData({ ...formData, vehiculo_interes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Notas Rápidas del Prospecto</label>
              <textarea
                rows="2"
                placeholder="Comentarios adicionales del cliente..."
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 transition-all"
            >
              Registrar Lead en Sistema
            </button>
          </form>
        </div>

        {/* Recent BDC Captures Right */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4" data-tour="bdc-assign-seller">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Últimas Capturas BDC ({bdcLeads.length})</span>
            <span className="text-xs font-medium text-amber-400">Atención BDC Salón</span>
          </h3>

          <div className="space-y-3">
            {bdcLeads.map((b) => (
              <div key={b.id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{b.nombre_prospecto}</h4>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {b.origen_contacto}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {b.telefono}</span>
                  <span className="flex items-center gap-1"><Car className="w-3 h-3 text-sky-400" /> {b.vehiculo_interes || 'Interés General'}</span>
                </div>
                {b.notas && (
                  <p className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg italic">
                    "{b.notas}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
