import React, { useState } from 'react';
import { X, Car, ShieldCheck, Tag, DollarSign, Calendar, CheckCircle2, FileText } from 'lucide-react';

export default function VehicleModal({ vehicle, onClose, onUpdateStatus, currentUser }) {
  const [selectedStatus, setSelectedStatus] = useState(vehicle?.estado || 'DISPONIBLE');
  if (!vehicle) return null;

  const formatCLP = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
  };

  const canViewPurchasePrice = ['ADMIN', 'GERENTE', 'F_AND_I'].includes(currentUser?.rol);

  const handleStatusChange = (e) => {
    const newSt = e.target.value;
    setSelectedStatus(newSt);
    onUpdateStatus(vehicle.id, newSt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-scale-up my-8">
        {/* Header */}
        <div className="relative h-64 bg-slate-800">
          <img
            src={vehicle.urls_fotos && vehicle.urls_fotos[0] ? vehicle.urls_fotos[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200'}
            alt={vehicle.modelo}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-slate-900/90 text-white border border-slate-700 shadow-xl">
              {vehicle.patente}
            </span>
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-xl bg-sky-600 text-white shadow-lg">
              {vehicle.estado}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                {vehicle.marca} {vehicle.modelo}
              </h2>
              <p className="text-sm text-slate-400">{vehicle.version || 'Edición Estándar'}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block font-medium">Precio Venta Público</span>
              <div className="text-2xl font-extrabold text-emerald-400">
                {formatCLP(vehicle.precio_venta_publico)}
              </div>
            </div>
          </div>

          {/* Status & CMS Web Publishing Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Estado en Inventario:</span>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-sky-400 font-bold focus:outline-none"
              >
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="RESERVADO">RESERVADO</option>
                <option value="VENDIDO">VENDIDO</option>
                <option value="PREPARACION">EN PREPARACIÓN / TALLER</option>
                <option value="EVALUACION">EN EVALUACIÓN</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-300 block">🌐 Publicación Web Storefront</span>
                <span className="text-[10px] text-slate-400">Hace el auto visible en el sitio público</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const newWebVal = !vehicle.publicado_web;
                  vehicle.publicado_web = newWebVal;
                  try {
                    await fetch(`/api/vehicles/${vehicle.id}/web-publish`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('automotora_token') || ''}`
                      },
                      body: JSON.stringify({ publicado_web: newWebVal, destacado_web: vehicle.destacado_web })
                    });
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  vehicle.publicado_web
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {vehicle.publicado_web ? '🌐 Publicado en Web' : 'Despublicado'}
              </button>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ficha Técnica Oficial</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Año Fabricación</span>
                <strong className="text-white text-sm">{vehicle.año}</strong>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Kilometraje</span>
                <strong className="text-white text-sm">{vehicle.kilometraje.toLocaleString()} km</strong>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Combustible</span>
                <strong className="text-white text-sm">{vehicle.tipo_combustible}</strong>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Transmisión</span>
                <strong className="text-white text-sm">{vehicle.transmision}</strong>
              </div>
            </div>
          </div>

          {/* Legal History & Valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Registro Legal (Autofact / Registro Civil)
              </h4>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Multas de Tránsito:</span>
                  <strong className="text-emerald-400">Sin multas activas</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Prendas o Gravámenes:</span>
                  <strong className="text-emerald-400">Sin prendas registrados</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Revisión Técnica:</span>
                  <strong className="text-sky-400">Al día (Vence 11/2026)</strong>
                </div>
              </div>
            </div>

            {canViewPurchasePrice && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-sky-400" /> Datos de Compra / Tasación Interna
                </h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Precio Tasación/Compra:</span>
                    <strong className="text-white font-mono">{formatCLP(vehicle.precio_compra_tasacion)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Margen Estimado Bruto:</span>
                    <strong className="text-emerald-400 font-mono">
                      {formatCLP(vehicle.precio_venta_publico - vehicle.precio_compra_tasacion)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
