import React, { useState } from 'react';
import { X, Car, Wand2, Check } from 'lucide-react';

export default function NewVehicleModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    patente: '',
    vin: '',
    marca: 'Nissan',
    modelo: 'Kicks',
    version: '1.6 Exclusive CVT',
    año: 2022,
    kilometraje: 28000,
    tipo_combustible: 'BENCINA',
    transmision: 'AUTOMATICA',
    color: 'Plata',
    precio_compra_tasacion: 11000000,
    precio_venta_publico: 13490000,
    estado: 'DISPONIBLE'
  });

  const [autofilled, setAutofilled] = useState(false);

  const handleAutocompletePatent = () => {
    if (!formData.patente) {
      setFormData((prev) => ({ ...prev, patente: 'KJPW99' }));
    }
    setAutofilled(true);
    setTimeout(() => setAutofilled(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
              <p className="text-xs text-slate-400">CU 2.1 - Ingreso de ficha técnica manual / API Patente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patent Autocomplete Banner */}
          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-sky-400" /> Consulta de Patente Registro Civil / Autofact
              </span>
              <p className="text-[11px] text-slate-400">
                Al ingresar la patente, el sistema autocompleta marca, modelo, motor y VIN.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutocompletePatent}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition-all"
            >
              {autofilled ? '¡Datos Autocompletados!' : 'Simular API Patente'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Patente (Formato Chile)</label>
              <input
                type="text"
                required
                placeholder="EJ: KJPW99"
                value={formData.patente}
                onChange={(e) => setFormData({ ...formData, patente: e.target.value.toUpperCase() })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold focus:border-sky-500 focus:outline-none"
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
              <label className="text-xs font-bold text-slate-300 block mb-1">Modelo</label>
              <input
                type="text"
                required
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
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
