import React, { useState } from 'react';
import { Search, Plus, Filter, Car, Tag, ShieldAlert, Eye, CheckCircle2 } from 'lucide-react';

export default function Inventory({ vehicles, onSelectVehicle, onOpenNewVehicleModal, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const formatCLP = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
  };

  // RBAC permission check: Vendedor/BDC/Taller cannot view purchase/valuation price according to PRD 2.3
  const canViewPurchasePrice = ['ADMIN', 'GERENTE', 'F_AND_I'].includes(currentUser?.rol);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.patente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-sky-400" /> Inventario de Vehículos
          </h2>
          <p className="text-xs text-slate-400">
            Ficha técnica digital, trazabilidad de estados y precios de venta.
          </p>
        </div>

        {['ADMIN', 'GERENTE', 'VENDEDOR', 'TALLER'].includes(currentUser?.rol) && (
          <button
            onClick={onOpenNewVehicleModal}
            data-tour="inventory-add-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Ingresar Nuevo Vehículo
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'DISPONIBLE', 'RESERVADO', 'VENDIDO', 'EVALUACION', 'PREPARACION'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                statusFilter === st
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos los autos' : st}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Patente, Marca, Modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Grid of Vehicle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            onClick={() => onSelectVehicle(v)}
            className="glass-card glass-card-hover rounded-2xl overflow-hidden cursor-pointer group border border-slate-800 flex flex-col justify-between"
          >
            {/* Vehicle Image Banner */}
            <div className="relative h-48 bg-slate-800 overflow-hidden">
              <img
                src={v.urls_fotos && v.urls_fotos[0] ? v.urls_fotos[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'}
                alt={v.modelo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900/90 text-white border border-slate-700 shadow-md">
                  {v.patente}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg shadow-md ${
                  v.estado === 'DISPONIBLE' ? 'bg-emerald-500 text-white' :
                  v.estado === 'RESERVADO' ? 'bg-amber-500 text-white' :
                  v.estado === 'VENDIDO' ? 'bg-blue-600 text-white' :
                  'bg-slate-700 text-slate-200'
                }`}>
                  {v.estado}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white group-hover:text-sky-400 transition-colors">
                  {v.marca} {v.modelo}
                </h3>
                <p className="text-xs text-slate-400">{v.version || 'Edición Estándar'}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-3">
                  <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] text-slate-500 block">Año / Km</span>
                    <strong className="text-white">{v.año}</strong> • {v.kilometraje.toLocaleString()} km
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] text-slate-500 block">Motor / Trans</span>
                    <strong className="text-white">{v.tipo_combustible}</strong> • {v.transmision}
                  </div>
                </div>
              </div>

              {/* Price Tag & Legal Status */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Precio Venta Público</span>
                  <div className="text-lg font-extrabold text-emerald-400">
                    {formatCLP(v.precio_venta_publico)}
                  </div>
                  {canViewPurchasePrice && v.precio_compra_tasacion > 0 && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Tasación: {formatCLP(v.precio_compra_tasacion)}
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-slate-800 text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-all" data-tour="inventory-reserve-btn">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
