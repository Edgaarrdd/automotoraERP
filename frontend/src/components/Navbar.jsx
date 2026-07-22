import React from 'react';
import { Car, ShieldCheck, UserCheck, LogOut, Search, Bell } from 'lucide-react';

export default function Navbar({ currentUser, onSwitchUser, onLogout }) {
  const demoUsers = [
    { label: 'Admin', email: 'admin@automotoralascondes.cl', role: 'ADMIN', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { label: 'Gerente', email: 'gerente@automotoralascondes.cl', role: 'GERENTE', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { label: 'Vendedor 1', email: 'vendedor1@automotoralascondes.cl', role: 'VENDEDOR', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { label: 'F&I Asesor', email: 'fi@automotoralascondes.cl', role: 'F_AND_I', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { label: 'BDC Recepción', email: 'bdc@automotoralascondes.cl', role: 'BDC', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg text-white tracking-tight">Automotora ERP</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Las Condes
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">CRM & Sistema Operativo Integral</p>
        </div>
      </div>

      {/* Demo Switcher Quick Roles */}
      <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-sky-400" /> Simular Rol:
        </span>
        {demoUsers.map((u) => (
          <button
            key={u.email}
            onClick={() => onSwitchUser(u.email)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
              currentUser?.email === u.email
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20 font-bold scale-105'
                : `${u.color} hover:opacity-80`
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200">{currentUser.nombre}</div>
              <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                {currentUser.rol}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-sky-400 ring-2 ring-sky-500/20">
              {currentUser.nombre ? currentUser.nombre.charAt(0) : 'U'}
            </div>
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
