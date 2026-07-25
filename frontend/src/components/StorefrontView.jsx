import React, { useState, useEffect } from 'react';
import { Globe, Search, Filter, Phone, MapPin, Sparkles, CheckCircle2, AlertCircle, X, Calculator, Send, ShieldCheck, Car } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function StorefrontView({ onClose }) {
  const [config, setConfig] = useState({
    nombre_empresa: 'Automotora Origen',
    subdominio: 'tenant_origen',
    slogan: 'Tu automotora de confianza en Chile',
    color_primario: '#0284c7',
    whatsapp_contacto: '+56912345678',
    direccion_fisica: 'Av. Vitacura 4560, Santiago',
    sitio_web_activo: true
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Lead form state
  const [leadForm, setLeadForm] = useState({
    nombre_completo: '',
    telefono: '',
    email: '',
    rut_dni: '',
    mensaje: ''
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState('');
  const [leadError, setLeadError] = useState('');

  // Finance Simulator state
  const [piePct, setPiePct] = useState(20);
  const [cuotas, setCuotas] = useState(36);

  useEffect(() => {
    fetchStorefrontData();
  }, []);

  const fetchStorefrontData = async () => {
    setLoading(true);
    try {
      // 1. Fetch public config
      const cfg = await apiFetch('/public/tenant_origen/config').catch(() => null);
      if (cfg) setConfig(cfg);

      // 2. Fetch public vehicles
      const vehs = await apiFetch('/public/tenant_origen/vehicles').catch(() => []);
      setVehicles(vehs || []);
    } catch (err) {
      console.warn("Storefront fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = !search || 
      v.marca.toLowerCase().includes(search.toLowerCase()) || 
      v.modelo.toLowerCase().includes(search.toLowerCase());
    const matchesMarca = !selectedMarca || v.marca.toLowerCase() === selectedMarca.toLowerCase();
    return matchesSearch && matchesMarca;
  });

  const marcasList = Array.from(new Set(vehicles.map(v => v.marca)));

  const handleOpenDetail = async (v) => {
    setSelectedVehicle(v);
    setLeadSuccess('');
    setLeadError('');
    // Fetch detail & increment view count
    try {
      const detail = await apiFetch(`/public/tenant_origen/vehicles/${v.id}`);
      setSelectedVehicle(detail);
    } catch (e) {
      console.warn("Detail fetch warning:", e.message);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadSuccess('');
    setLeadError('');
    try {
      const res = await apiFetch('/public/tenant_origen/leads', {
        method: 'POST',
        body: JSON.stringify({
          ...leadForm,
          id_vehiculo_interes: selectedVehicle?.id,
          tipo_consulta: 'COTIZACION'
        })
      });
      setLeadSuccess(res.message || '¡Formulario enviado con éxito!');
      setLeadForm({ nombre_completo: '', telefono: '', email: '', rut_dni: '', mensaje: '' });
    } catch (err) {
      setLeadError(err.message || 'Ocurrió un error al enviar el formulario');
    } finally {
      setSubmittingLead(false);
    }
  };

  // Loan calculator math
  const calculateCuota = (precio) => {
    const pie = (precio * piePct) / 100;
    const montoFinanciar = precio - pie;
    const tasa = 0.0145; // 1.45% mensual
    const cuota = (montoFinanciar * (tasa * Math.pow(1 + tasa, cuotas))) / (Math.pow(1 + tasa, cuotas) - 1);
    return Math.round(cuota);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl overflow-y-auto font-sans text-slate-100">
      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-50 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 animate-pulse text-sky-400" />
            Vista Previa de Portal Público (Cliente Final)
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition border border-slate-700"
        >
          <X className="w-4 h-4" />
          Cerrar Simulación
        </button>
      </div>

      {/* Dynamic Storefront Header */}
      <header className="border-b border-white/10 shadow-xl transition-colors" style={{ backgroundColor: config.color_primario }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white text-xl shadow-lg">
              {config.nombre_empresa.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{config.nombre_empresa}</h1>
              <p className="text-sm text-white/80 font-medium">{config.slogan}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-white/90">
            <span className="flex items-center gap-1.5 bg-black/20 px-3.5 py-2 rounded-xl backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-white" />
              {config.direccion_fisica}
            </span>
            <a
              href={`https://wa.me/${config.whatsapp_contacto.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4" />
              WhatsApp Salón
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-10 px-6 border-b border-slate-800/80 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-400/30 text-sky-300 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Catálogo Digital Verificado 2026
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Encuentra tu auto ideal en stock</h2>
          <p className="text-slate-400 text-sm">Vehículos seleccionados, decodificados y garantizados directamente por {config.nombre_empresa}.</p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por marca o modelo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
            >
              <option value="">Todas las Marcas</option>
              {marcasList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <Sparkles className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
            <p>Cargando inventario público en vivo...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-3">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No hay vehículos publicados que coincidan</h3>
            <p className="text-slate-400 text-sm">Prueba ajustando los filtros de búsqueda o marca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map(v => (
              <div key={v.id} className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden shadow-xl transition-all hover:-translate-y-1 group">
                {/* Vehicle Image */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={v.urls_fotos && v.urls_fotos[0] ? v.urls_fotos[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
                    alt={`${v.marca} ${v.modelo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {v.destacado_web && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-lg">
                      🔥 Destacado
                    </span>
                  )}
                  {v.precio_oferta_web && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-lg">
                      Oferta Web
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition">{v.marca} {v.modelo}</h3>
                    <p className="text-xs text-slate-400">{v.version || 'Edición Especial'} • {v.año}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <div><span className="text-slate-500">KM:</span> {v.kilometraje.toLocaleString()} km</div>
                    <div><span className="text-slate-500">Trans:</span> {v.transmision}</div>
                    <div><span className="text-slate-500">Motor:</span> {v.tipo_combustible}</div>
                    <div><span className="text-slate-500">Ref:</span> {v.patente_parcial}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {v.precio_oferta_web ? (
                        <div>
                          <span className="text-xs text-slate-500 line-through mr-1 font-mono">${v.precio_venta_publico.toLocaleString()}</span>
                          <span className="text-xl font-black text-rose-400 font-mono">${v.precio_oferta_web.toLocaleString()} CLP</span>
                        </div>
                      ) : (
                        <span className="text-xl font-black text-emerald-400 font-mono">${v.precio_venta_publico.toLocaleString()} CLP</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenDetail(v)}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-xl shadow-lg transition"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Vehicle Detail & Lead Capture Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header detail */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Ficha Oficial del Vehículo</span>
                <h3 className="text-2xl font-black text-white">{selectedVehicle.marca} {selectedVehicle.modelo} {selectedVehicle.año}</h3>
                <p className="text-xs text-slate-400">{selectedVehicle.version} • {selectedVehicle.kilometraje.toLocaleString()} KM • Ref: {selectedVehicle.patente_parcial}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400 font-mono">${(selectedVehicle.precio_oferta_web || selectedVehicle.precio_venta_publico).toLocaleString()} CLP</span>
                <p className="text-[11px] text-slate-500">Vistas en la web: {selectedVehicle.web_view_count || 1}</p>
              </div>
            </div>

            {/* Content Split: Image & Specs + Loan Sim + Lead Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Image & Specs */}
              <div className="space-y-4">
                <div className="h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                  <img
                    src={selectedVehicle.urls_fotos && selectedVehicle.urls_fotos[0] ? selectedVehicle.urls_fotos[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
                    alt={selectedVehicle.modelo}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Specs Box */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
                  <h4 className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Especificaciones Verificadas
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>• Combustible: {selectedVehicle.tipo_combustible}</div>
                    <div>• Transmisión: {selectedVehicle.transmision}</div>
                    <div>• Puertas: {selectedVehicle.num_puertas || 5}</div>
                    <div>• Asientos: {selectedVehicle.num_asientos || 5}</div>
                    <div>• Color: {selectedVehicle.color || 'No especificado'}</div>
                    <div>• Estado: {selectedVehicle.estado}</div>
                  </div>
                </div>

                {/* Loan Simulator */}
                <div className="bg-sky-950/20 border border-sky-500/20 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-sky-400" /> Simulador de Crédito Automotriz
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Pie Estimado ({piePct}%):</span>
                      <span className="font-mono text-white">${Math.round((selectedVehicle.precio_venta_publico * piePct) / 100).toLocaleString()} CLP</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={piePct}
                      onChange={(e) => setPiePct(Number(e.target.value))}
                      className="w-full accent-sky-500"
                    />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-300">Cuotas:</span>
                      <select
                        value={cuotas}
                        onChange={(e) => setCuotas(Number(e.target.value))}
                        className="bg-slate-950 text-white border border-slate-800 rounded-lg px-2 py-1 outline-none"
                      >
                        <option value={12}>12 Meses</option>
                        <option value={24}>24 Meses</option>
                        <option value={36}>36 Meses</option>
                        <option value={48}>48 Meses</option>
                        <option value={60}>60 Meses</option>
                      </select>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl text-center border border-slate-800 mt-2">
                      <span className="text-[11px] text-slate-400 block">Cuota mensual estimada:</span>
                      <span className="text-lg font-black text-sky-400 font-mono">${calculateCuota(selectedVehicle.precio_venta_publico).toLocaleString()} CLP/mes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Inbound Lead Capture Form */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-sky-400" /> Cotizar o Solicitar Información
                  </h4>
                  <p className="text-xs text-slate-400">Ingresa tus datos y un ejecutivo comercial de {config.nombre_empresa} se contactará contigo.</p>
                </div>

                {leadSuccess && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span>{leadSuccess}</span>
                  </div>
                )}

                {leadError && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{leadError}</span>
                  </div>
                )}

                <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={leadForm.nombre_completo}
                      onChange={(e) => setLeadForm({ ...leadForm, nombre_completo: e.target.value })}
                      placeholder="Ej. Matías Silva"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Teléfono *</label>
                      <input
                        type="text"
                        value={leadForm.telefono}
                        onChange={(e) => setLeadForm({ ...leadForm, telefono: e.target.value })}
                        placeholder="+56912345678"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Email *</label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="matias@ejemplo.cl"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Mensaje / Consulta (Opcional)</label>
                    <textarea
                      rows={3}
                      value={leadForm.mensaje}
                      onChange={(e) => setLeadForm({ ...leadForm, mensaje: e.target.value })}
                      placeholder="Me interesa agendar una prueba de manejo o solicitar evaluación de crédito..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition shadow-lg hover:shadow-sky-500/25 disabled:opacity-50"
                  >
                    {submittingLead ? 'Enviando Oportunidad...' : 'Enviar Consulta Comercial ➔'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
