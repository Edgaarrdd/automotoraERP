import React from 'react';
import { LayoutDashboard, Car, GitCommit, Calendar, FileText, BadgePercent, PhoneCall, ShieldCheck, BookOpen, Layers } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser }) {
  const role = currentUser?.rol || 'ADMIN';

  // RBAC Permission visibility logic based on PRD Section 2.3
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'MARKETING', 'F_AND_I', 'TALLER', 'BDC'] },
    { id: 'inventory', label: 'Inventario Autos', icon: Car, roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'MARKETING', 'F_AND_I', 'TALLER', 'BDC'] },
    { id: 'kanban', label: 'Pipeline Ventas', icon: GitCommit, roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'BDC'] },
    { id: 'calendar', label: 'Agenda & Citas', icon: Calendar, roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'BDC', 'TALLER'] },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText, roles: ['ADMIN', 'GERENTE', 'VENDEDOR'] },
    { id: 'fi', label: 'F&I Financiamiento', icon: BadgePercent, roles: ['ADMIN', 'GERENTE', 'F_AND_I', 'VENDEDOR'] },
    { id: 'bdc', label: 'BDC & Recepción', icon: PhoneCall, roles: ['ADMIN', 'GERENTE', 'BDC', 'VENDEDOR'] },
    { id: 'security', label: 'Seguridad & Roles', icon: ShieldCheck, roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'MARKETING', 'F_AND_I', 'TALLER', 'BDC'], badge: 'Alpha 0.0.1' },
    { id: 'docs', label: 'Documentación Devs', icon: BookOpen, roles: ['ADMIN', 'GERENTE', 'VENDEDOR', 'MARKETING', 'F_AND_I', 'TALLER', 'BDC'], badge: 'Docs' },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-full lg:w-64 glass-panel border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Módulos Principales
          </h2>
          <nav className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  data-tour={`nav-${item.id}`}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-lg shadow-sky-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System info widget */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50" data-tour="tenant-badge">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <Layers className="w-4 h-4" /> Multi-Tenant Active
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Schema aislado: <span className="font-mono text-slate-300">tenant_origen</span>
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-medium text-center">
        CRM Automotora v0.0.1 (Alpha)
      </div>
    </aside>
  );
}
