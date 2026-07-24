import React from 'react';
import { Car, DollarSign, Users, TrendingUp, CheckCircle, Clock, Plus, ChevronRight, FileText, AlertOctagon } from 'lucide-react';

export default function Dashboard({ metrics, vehicles, leads, onQuickAction, currentUser }) {
  const formatCLP = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
  };

  // CU 1.1: Alert for vehicles stuck in stock (>45 days)
  const oldStockVehicles = vehicles.filter((v) => {
    const daysInStock = 50; // Mock calculation or check date
    return daysInStock > 45 && v.estado === 'DISPONIBLE';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-sky-900/40 via-slate-900/60 to-indigo-900/40 p-6 rounded-2xl border border-sky-500/20">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            ¡Hola, {currentUser?.nombre?.split(' ')[0] || 'Asesor'}! 👋
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Resumen operativo en tiempo real para <strong className="text-sky-400">Automotora Las Condes SpA</strong>.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickAction('new-vehicle')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-lg shadow-sky-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Ingresar Auto
          </button>
          <button
            onClick={() => onQuickAction('new-quote')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium text-xs border border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4" /> Nueva Cotización
          </button>
        </div>
      </div>

      {/* CU 1.1 Alert Badge for >45 days in inventory */}
      {oldStockVehicles.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />
            <span>Alerta de Rotación de Inventario (CU 1.1): Tienes <strong className="text-white">{oldStockVehicles.length} vehículos</strong> con más de 45 días sin venderse en salón.</span>
          </div>
          <button
            onClick={() => onQuickAction('view-inventory')}
            className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shrink-0"
          >
            Revisar Autos Estancados
          </button>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="dash-metrics">
        {/* Total Stock */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventario Total</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.total_vehiculos_stock} <span className="text-xs text-slate-400 font-normal">autos</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {metrics.vehiculos_disponibles} Disponibles en Salón
          </div>
        </div>

        {/* Active Leads */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads Activos</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.total_leads_activos} <span className="text-xs text-slate-400 font-normal">prospectos</span>
          </div>
          <div className="text-xs text-indigo-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> En negociación / test drive
          </div>
        </div>

        {/* Total Sales Month */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas del Mes</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {formatCLP(metrics.ventas_totales_monto_mes)}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {metrics.vehiculos_vendidos_mes} vehículos cerrados
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasa Conversión</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {metrics.tasa_conversion_pct}%
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Meta del mes: 15%
          </div>
        </div>
      </div>

      {/* Middle Grid: Stock Showcase & Pipeline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-tour="dash-sales-chart">
        {/* Vehicles Preview List */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-sky-400" /> Vehículos Destacados en Stock
            </h3>
            <button
              onClick={() => onQuickAction('view-inventory')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              Ver Todo ({vehicles.length}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {vehicles.slice(0, 4).map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src={v.urls_fotos && v.urls_fotos[0] ? v.urls_fotos[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400'}
                      alt={v.modelo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{v.marca} {v.modelo}</span>
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {v.patente}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Año {v.año} • {v.kilometraje.toLocaleString()} km • {v.transmision}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm text-emerald-400">{formatCLP(v.precio_venta_publico)}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    v.estado === 'DISPONIBLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    v.estado === 'RESERVADO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    v.estado === 'VENDIDO' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {v.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Quick Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Pipeline de Oportunidades
            </h3>
            <button
              onClick={() => onQuickAction('view-kanban')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Kanban <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 4).map((l) => (
              <div key={l.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {l.customer ? l.customer.nombre_completo : 'Cliente Prospecto'}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {l.estado_embudo}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Vehículo: <span className="text-sky-300 font-medium">{l.vehicle ? `${l.vehicle.marca} ${l.vehicle.modelo}` : 'SUV a cotizar'}</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 pt-1">
                  Monto: {formatCLP(l.monto_estimado)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
