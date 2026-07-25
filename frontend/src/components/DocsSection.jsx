import React, { useState } from 'react';
import { BookOpen, Code, ShieldCheck, Database, Server, Layers, CheckCircle, Terminal, Cpu, FileText } from 'lucide-react';

export default function DocsSection() {
  const [activeSection, setActiveSection] = useState('arch');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-400" /> Portal de Documentación Oficial
          </h2>
          <p className="text-xs text-slate-400">
            Documentación técnica, especificación de API REST, matriz de seguridad RBAC y guía para desarrolladores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
            v0.1.0 Beta Ready
          </span>
        </div>
      </div>

      {/* Tabs / Sub-Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveSection('arch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSection === 'arch'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" /> Arquitectura & Multi-Tenant
        </button>

        <button
          onClick={() => setActiveSection('api')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSection === 'api'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code className="w-4 h-4" /> Referencia API REST
        </button>

        <button
          onClick={() => setActiveSection('rbac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSection === 'rbac'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Matriz Roles RBAC
        </button>

        <button
          onClick={() => setActiveSection('db')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSection === 'db'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> Modelos ORM
        </button>

        <button
          onClick={() => setActiveSection('guides')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSection === 'guides'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" /> Guía Devs & Tests
        </button>
      </div>

      {/* Content Section: Architecture */}
      {activeSection === 'arch' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-sky-400" /> Arquitectura Global del Sistema
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              El sistema CRM Automotora ERP está diseñado como una aplicación web desacoplada de alto rendimiento. Combina un cliente SPA moderno desarrollado en React con Vite y Tailwind CSS en el Frontend, y una API REST robusta construida con FastAPI en Python en el Backend.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold text-sky-400 block uppercase">1. Frontend Single-Page</span>
                <p className="text-[11px] text-slate-400">
                  React 18 + Tailwind CSS. Interfaz Glassmorphism responsiva con soporte de recorridos guiados (Driver.js) y Cotizaciones imprimibles PDF en tiempo real.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold text-emerald-400 block uppercase">2. Backend REST API</span>
                <p className="text-[11px] text-slate-400">
                  FastAPI + Python 3.14. Autenticación OAuth2 JWT, decodificación de patentes Registro Civil/Autofact y esquemas Pydantic V2 con validación de tipos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold text-purple-400 block uppercase">3. Aislamiento Multi-Tenant</span>
                <p className="text-[11px] text-slate-400">
                  SQLAlchemy ORM. Cada registro (`Vehicle`, `Lead`, `Quote`, `Appointment`) posee aislamiento estricto mediante la columna `tenant_id`.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section: API REST Reference */}
      {activeSection === 'api' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-sky-400" /> Catálogo Principales Endpoints REST
              </h3>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
              >
                Abrir Swagger UI Interactive ↗
              </a>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold">POST</span>
                  <span className="text-slate-200">/api/auth/login</span>
                </div>
                <span className="text-slate-500 text-[11px]">Inicia sesión y genera Token JWT Bearer</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-extrabold">GET</span>
                  <span className="text-slate-200">/api/vehicles/decode/&#123;patente&#125;</span>
                </div>
                <span className="text-slate-500 text-[11px]">Decodifica patente, VIN, tasación y multas</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-extrabold">GET</span>
                  <span className="text-slate-200">/api/quotes/&#123;quote_id&#125;/pdf-html</span>
                </div>
                <span className="text-slate-500 text-[11px]">Renderiza cotización imprimible oficial en HTML</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold">POST</span>
                  <span className="text-slate-200">/api/appointments/</span>
                </div>
                <span className="text-slate-500 text-[11px]">Agenda Test Drive o cita comercial en calendario</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold">PATCH</span>
                  <span className="text-slate-200">/api/leads/&#123;id&#125;/stage</span>
                </div>
                <span className="text-slate-500 text-[11px]">Avanza etapa de lead en embudo Kanban</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-extrabold">GET</span>
                  <span className="text-slate-200">/api/consignments/</span>
                </div>
                <span className="text-slate-500 text-[11px]">Listar autos consignados y liquidación neta al dueño</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold">GET</span>
                  <span className="text-slate-200">/api/commissions/summary</span>
                </div>
                <span className="text-slate-500 text-[11px]">Cálculo de comisiones base (1.5%) y bonos F&I por vendedor</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section: RBAC Roles */}
      {activeSection === 'rbac' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 overflow-x-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" /> Matriz de Accesos por Rol (RBAC)
            </h3>

            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-2.5">Módulo / Vista</th>
                  <th className="p-2.5 text-center">ADMIN</th>
                  <th className="p-2.5 text-center">GERENTE</th>
                  <th className="p-2.5 text-center">VENDEDOR</th>
                  <th className="p-2.5 text-center">BDC</th>
                  <th className="p-2.5 text-center">F&I</th>
                  <th className="p-2.5 text-center">MARKETING</th>
                  <th className="p-2.5 text-center">TALLER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="p-2.5 font-bold text-white">Inventario (Crear/Editar)</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-slate-500">Lectura</td>
                  <td className="p-2.5 text-center text-slate-500">Lectura</td>
                  <td className="p-2.5 text-center text-slate-500">Lectura</td>
                  <td className="p-2.5 text-center text-slate-500">Lectura</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Pipeline Kanban Ventas</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Cotizador & Impresión PDF</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Agenda Citas & Test Drives</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                  <td className="p-2.5 text-center text-red-500">❌</td>
                  <td className="p-2.5 text-center text-emerald-400">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Section: ORM Data Models */}
      {activeSection === 'db' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" /> Esquema de Tablas & Relaciones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-sky-300 font-bold block border-b border-slate-800 pb-1">vehiculos</span>
                <p className="text-slate-400">id, tenant_id, patente (INDEX), vin, marca, modelo, año, kilometraje, tipo_combustible, transmision, precio_compra_tasacion, precio_venta_publico, estado</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-sky-300 font-bold block border-b border-slate-800 pb-1">leads_oportunidades</span>
                <p className="text-slate-400">id, tenant_id, id_cliente (FK), id_vehiculo_interes (FK), id_vendedor_asignado (FK), estado_embudo, score_lead, monto_estimado, motivo_perdida</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-sky-300 font-bold block border-b border-slate-800 pb-1">cotizaciones</span>
                <p className="text-slate-400">id, tenant_id, id_lead (FK), id_cliente (FK), id_vehiculo (FK), tipo_financiamiento, pie_monto, monto_financiar, cuotas, valor_cuota, vfg_monto</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-sky-300 font-bold block border-b border-slate-800 pb-1">citas_agenda</span>
                <p className="text-slate-400">id, tenant_id, titulo, tipo (TEST_DRIVE, ENTREGA, REUNION), fecha_inicio, fecha_fin, id_vendedor (FK), id_vehiculo (FK), estado</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section: Dev Guides */}
      {activeSection === 'guides' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" /> Comandos de Ejecución y Pruebas
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block">1. Iniciar Servidor Backend FastAPI</span>
                <code className="text-slate-300 block bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
                </code>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-purple-400 font-bold block">2. Ejecutar Suite Completa de Tests (Pytest)</span>
                <code className="text-slate-300 block bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  cd backend && .\venv\Scripts\python.exe -m pytest tests/test_api.py
                </code>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-sky-400 font-bold block">3. Iniciar Servidor Frontend (Vite React)</span>
                <code className="text-slate-300 block bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  cd frontend && npm run dev
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
