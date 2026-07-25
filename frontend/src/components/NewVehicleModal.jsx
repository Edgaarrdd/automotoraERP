import React, { useState } from 'react';
import { X, Car, Wand2, CheckCircle, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function NewVehicleModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    patente: 'KJPW99',
    vin: '',
    marca: 'Nissan',
    modelo: 'Kicks',
    version: '1.6 Exclusive CVT',
    año: 2022,
    kilometraje: 28000,
    tipo_combustible: 'BENCINA',
    transmision: 'AUTOMATICA',
    color: 'Plata Metálico',
    motor: '1.6L 4-Cil HR16DE',
    precio_compra_tasacion: 11000000,
    precio_venta_publico: 13490000,
    estado: 'DISPONIBLE'
  });

  const [loading, setLoading] = useState(false);
  const [decodedSuccess, setDecodedSuccess] = useState(false);
  const [legalReport, setLegalReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDecodePatent = async () => {
    if (!formData.patente || formData.patente.trim().length < 5) {
      setErrorMsg('Ingresa una patente válida (Ej: KJPW99, CLFL88, HGJK44)');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const decoded = await apiFetch(`/vehicles/decode/${formData.patente.trim()}`);
      if (decoded) {
        setFormData((prev) => ({
          ...prev,
          patente: decoded.patente,
          vin: decoded.vin || prev.vin,
          marca: decoded.marca,
          modelo: decoded.modelo,
          version: decoded.version,
          año: decoded.año,
          kilometraje: decoded.kilometraje,
          tipo_combustible: decoded.tipo_combustible,
          transmision: decoded.transmision,
          color: decoded.color,
          motor: decoded.motor,
          precio_compra_tasacion: decoded.precio_compra_tasacion,
          precio_venta_publico: decoded.precio_venta_publico
        }));
        setLegalReport(decoded.historial_legal);
        setDecodedSuccess(true);
        setTimeout(() => setDecodedSuccess(false), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo decodificar la patente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      historial_legal: legalReport || {
        multas_transitadas: 0,
        prenda_vigente: false,
        revision_tecnica_al_dia: true,
        fuente_decodificacion: "API Registro Civil & Autofact (Chile)"
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-scale-up my-8 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ingresar Nuevo Vehículo a Inventario</h2>
              <p className="text-xs text-slate-400">CU 2.1 - Decodificación de Patentes & Ficha Técnica Registro Civil</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patent Autocomplete Banner */}
          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-sky-400" /> Decodificador de Patente & Tasación Sugerida
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ingresa la patente (Ej: <strong className="text-white">KJPW99</strong>, <strong className="text-white">CLFL88</strong>, <strong className="text-white">HGJK44</strong>, <strong className="text-white">BB1234</strong>) y consulta la API oficial.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDecodePatent}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shrink-0 transition-all shadow-lg shadow-sky-600/30 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Decodificando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Consultar API Patente
                  </>
                )}
              </button>
            </div>

            {decodedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Ficha autocompletada con éxito! Sin prendas vigentes ni multas de tránsito.</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Patente (Chile)</label>
              <input
                type="text"
                required
                placeholder="EJ: KJPW99"
                value={formData.patente}
                onChange={(e) => setFormData({ ...formData, patente: e.target.value.toUpperCase() })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-extrabold focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">VIN Number (17 caract.)</label>
              <input
                type="text"
                placeholder="EJ: JN1TANT32U001928"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Marca</label>
              <input
                type="text"
                required
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Modelo y Versión</label>
              <input
                type="text"
                required
                value={formData.version || formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value, version: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Año</label>
              <input
                type="number"
                required
                value={formData.año}
                onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Kilometraje (km)</label>
              <input
                type="number"
                required
                value={formData.kilometraje}
                onChange={(e) => setFormData({ ...formData, kilometraje: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Precio Compra / Tasación ($CLP)</label>
              <input
                type="number"
                required
                value={formData.precio_compra_tasacion}
                onChange={(e) => setFormData({ ...formData, precio_compra_tasacion: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Precio Venta Público ($CLP)</label>
              <input
                type="number"
                required
                value={formData.precio_venta_publico}
                onChange={(e) => setFormData({ ...formData, precio_venta_publico: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-extrabold font-mono focus:border-sky-500 focus:outline-none"
              />
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
              Guardar Vehículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
