import React, { useState, useEffect } from 'react';
import { Globe, Palette, Phone, MapPin, Save, Eye, CheckCircle2, AlertCircle, Sparkles, Image, RefreshCw, Layout, Server, ShieldCheck, Link2 } from 'lucide-react';
import { apiFetch } from '../services/api';

const THEMES = [
  { id: 'dark_luxury', name: 'Dark Luxury', color: '#0284c7', bg: 'bg-slate-950', text: 'text-white', border: 'border-sky-500/30', desc: 'Oscuro elegante y moderno' },
  { id: 'clean_light', name: 'Clean Light', color: '#2563eb', bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-blue-500/30', desc: 'Claro minimalista corporativo' },
  { id: 'sport_red', name: 'Sport Red', color: '#dc2626', bg: 'bg-zinc-950', text: 'text-white', border: 'border-red-500/30', desc: 'Deportivo de alto impacto' },
  { id: 'ocean_blue', name: 'Ocean Blue', color: '#0d9488', bg: 'bg-cyan-950', text: 'text-cyan-50', border: 'border-teal-500/30', desc: 'Azul teal premium' },
  { id: 'electric_green', name: 'Electric Green', color: '#16a34a', bg: 'bg-neutral-950', text: 'text-emerald-50', border: 'border-emerald-500/30', desc: 'Verde ecológico e innovador' },
];

export default function CMSSection({ onOpenStorefrontPreview }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [cmsConfig, setCmsConfig] = useState({
    sitio_web_activo: true,
    slogan: 'Tu automotora de confianza en Chile',
    color_primario: '#0284c7',
    tema_diseno: 'dark_luxury',
    dominio_personalizado: '',
    estado_dns: 'PENDIENTE',
    logo_url: '',
    banner_url: '',
    whatsapp_contacto: '+56912345678',
    direccion_fisica: 'Av. Vitacura 4560, Santiago'
  });

  useEffect(() => {
    fetchCMSConfig();
  }, []);

  const fetchCMSConfig = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/cms/config');
      setCmsConfig({
        sitio_web_activo: data.sitio_web_activo ?? true,
        slogan: data.slogan || 'Tu automotora de confianza en Chile',
        color_primario: data.color_primario || '#0284c7',
        tema_diseno: data.tema_diseno || 'dark_luxury',
        dominio_personalizado: data.dominio_personalizado || '',
        estado_dns: data.estado_dns || 'PENDIENTE',
        logo_url: data.logo_url || '',
        banner_url: data.banner_url || '',
        whatsapp_contacto: data.whatsapp_contacto || '+56912345678',
        direccion_fisica: data.direccion_fisica || 'Av. Vitacura 4560, Santiago'
      });
    } catch (err) {
      console.warn("Using default CMS state:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = (themeId, defaultColor) => {
    setCmsConfig((prev) => ({
      ...prev,
      tema_diseno: themeId,
      color_primario: defaultColor
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const updated = await apiFetch('/cms/config', {
        method: 'PATCH',
        body: JSON.stringify(cmsConfig)
      });
      setCmsConfig(updated);
      setSuccessMessage('¡Configuración CMS y publicación web guardadas exitosamente!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-sky-400" />
        <span>Cargando datos del CMS Storefront...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900/40 via-slate-900 to-indigo-950/50 p-6 rounded-2xl border border-sky-500/20 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-400/30 rounded-xl">
              <Globe className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Mi Sitio Web (CMS Storefront & Dominio)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  Multi-Tenant
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Personaliza temas visuales, colores de marca, dominio propio y publica el portal comercial hacia internet.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onOpenStorefrontPreview}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 rounded-xl transition-all shadow-lg hover:shadow-sky-500/20 font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            Ver Portal Público (Vista Previa)
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            
            {/* Status Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <div>
                <h4 className="font-semibold text-white text-sm">Publicación del Sitio Web a Internet</h4>
                <p className="text-xs text-slate-400">Si está activo, tus clientes podrán ver el catálogo y cotizar en línea.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cmsConfig.sitio_web_activo}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, sitio_web_activo: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {/* Visual Themes Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-sky-400" />
                Selección de Tema Visual del Sitio Web
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {THEMES.map((th) => {
                  const isSelected = cmsConfig.tema_diseno === th.id;
                  return (
                    <button
                      type="button"
                      key={th.id}
                      onClick={() => handleSelectTheme(th.id, th.color)}
                      className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: th.color }}></span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-white">{th.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{th.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Domain Section */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Configuración de Dominio y DNS
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Subdominio Asignado (Gratuito)
                  </label>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono">
                    <Link2 className="w-3.5 h-3.5 mr-2 text-sky-400" />
                    tenant_origen.automotoraerp.cl
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Dominio Propio Personalizado (Ej: mi-automotora.cl)
                  </label>
                  <input
                    type="text"
                    value={cmsConfig.dominio_personalizado}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, dominio_personalizado: e.target.value })}
                    placeholder="www.miautomotora.cl"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-sky-500 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300">Registro CNAME DNS:</span>
                  <code className="bg-slate-950 px-2 py-0.5 rounded text-sky-300 font-mono">cname.automotoraerp.cl</code>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cmsConfig.dominio_personalizado ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {cmsConfig.dominio_personalizado ? 'DNS Conectado / HTTPS Activo' : 'Subdominio Estándar'}
                </span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Slogan Comercial
                </label>
                <input
                  type="text"
                  value={cmsConfig.slogan}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, slogan: e.target.value })}
                  placeholder="Tu automotora de confianza en Chile"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Color Primario de Marca
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={cmsConfig.color_primario}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, color_primario: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
                  />
                  <input
                    type="text"
                    value={cmsConfig.color_primario}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, color_primario: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp de Contacto Directo
                </label>
                <input
                  type="text"
                  value={cmsConfig.whatsapp_contacto}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, whatsapp_contacto: e.target.value })}
                  placeholder="+56912345678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Dirección Física Salón
                </label>
                <input
                  type="text"
                  value={cmsConfig.direccion_fisica}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, direccion_fisica: e.target.value })}
                  placeholder="Av. Vitacura 4560, Santiago"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-purple-400" />
                  Logo URL (Opcional)
                </label>
                <input
                  type="text"
                  value={cmsConfig.logo_url}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-indigo-400" />
                  Banner Hero URL (Opcional)
                </label>
                <input
                  type="text"
                  value={cmsConfig.banner_url}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, banner_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-sky-500/25 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios y Publicar'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-400" />
            Previsualización Header Público
          </h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Storefront Mini Header */}
            <div className="p-4 border-b border-slate-800 transition-colors" style={{ backgroundColor: cmsConfig.color_primario }}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                    AO
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">Automotora Origen</h4>
                    <p className="text-[11px] opacity-80 leading-tight">{cmsConfig.slogan}</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  WhatsApp
                </div>
              </div>
            </div>

            {/* Storefront Mini Hero */}
            <div className="p-6 bg-slate-950 text-center space-y-3">
              <span className="text-xs text-sky-400 uppercase tracking-widest font-semibold">Catálogo Online</span>
              <h5 className="text-lg font-bold text-white">Encuentra tu próximo auto hoy</h5>
              <p className="text-xs text-slate-400">{cmsConfig.direccion_fisica}</p>
              {cmsConfig.dominio_personalizado && (
                <p className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 py-1 rounded-lg border border-emerald-500/20">
                  🌐 Dominio: https://{cmsConfig.dominio_personalizado}
                </p>
              )}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onOpenStorefrontPreview}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
                >
                  Abrir Simulador de Portal Completo ➔
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-sky-950/30 border border-sky-500/20 rounded-xl text-xs text-sky-300 space-y-2">
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Sincronización Automática ERP <span className="text-sky-400">&lt;-&gt;</span> Storefront
            </p>
            <p className="text-slate-400">
              Todos los vehículos que marques como <strong className="text-slate-200">Publicado Web (🌐)</strong> en el inventario se actualizarán en vivo en esta plantilla pública.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
