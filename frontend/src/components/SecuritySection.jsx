import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

export default function SecuritySection({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('tester');

  // State for Credentials Tester
  const [testEmail, setTestEmail] = useState('admin@origen.cl');
  const [testPassword, setTestPassword] = useState('Admin123!');
  const [credResult, setCredResult] = useState(null);
  const [loadingCred, setLoadingCred] = useState(false);

  // State for Role Tester
  const [selectedRole, setSelectedRole] = useState('VENDEDOR');
  const [selectedAction, setSelectedAction] = useState('CREAR_USUARIO');
  const [roleResult, setRoleResult] = useState(null);
  const [loadingRole, setLoadingRole] = useState(false);

  // State for Users List (Admin only)
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  
  // State for New User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRol, setNewRol] = useState('VENDEDOR');
  const [newTelefono, setNewTelefono] = useState('');
  const [createUserMsg, setCreateUserMsg] = useState({ type: '', text: '' });

  const isAdmin = currentUser?.rol === 'ADMIN';

  // Load users if admin and viewing directory tab
  useEffect(() => {
    if (activeSubTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeSubTab, isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const data = await apiFetch('/security/users');
      setUsersList(data);
    } catch (err) {
      setUsersError(err.message || 'Error al cargar la lista de usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleTestCredentials = async (e) => {
    e.preventDefault();
    setLoadingCred(true);
    setCredResult(null);
    try {
      const res = await apiFetch('/security/test-credentials', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword })
      });
      setCredResult(res);
    } catch (err) {
      setCredResult({
        valid: false,
        email: testEmail,
        message: err.message || 'Error al probar credenciales'
      });
    } finally {
      setLoadingCred(false);
    }
  };

  const handleTestRole = async (e) => {
    e.preventDefault();
    setLoadingRole(true);
    setRoleResult(null);
    try {
      const res = await apiFetch('/security/test-role', {
        method: 'POST',
        body: JSON.stringify({ role: selectedRole, action: selectedAction })
      });
      setRoleResult(res);
    } catch (err) {
      setRoleResult({
        role: selectedRole,
        action: selectedAction,
        authorized: false,
        reason: err.message || 'Error al verificar permisos'
      });
    } finally {
      setLoadingRole(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserMsg({ type: '', text: '' });
    try {
      await apiFetch('/security/create-user', {
        method: 'POST',
        body: JSON.stringify({
          nombre: newNombre,
          email: newEmail,
          password: newPassword,
          rol: newRol,
          telefono: newTelefono
        })
      });
      setCreateUserMsg({ type: 'success', text: '¡Usuario creado exitosamente con hash bcrypt!' });
      setNewNombre('');
      setNewEmail('');
      setNewPassword('');
      fetchUsers();
      setTimeout(() => setShowAddUserModal(false), 1500);
    } catch (err) {
      setCreateUserMsg({ type: 'error', text: err.message || 'Error al crear usuario' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Módulo Alpha 0.0.1
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                Estado BD: Limpio
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Módulo de Seguridad, Autenticación y Roles</h1>
            <p className="text-slate-400 text-sm mt-1">
              Pruebas de contraseñas bcrypt, tokens JWT, verificación de roles (RBAC) y hoja de ruta para seguridad empresarial.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Dominio: <span className="text-sky-400">@origen.cl</span></span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-800 pt-4">
          <button
            onClick={() => setActiveSubTab('tester')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === 'tester'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            🔑 Probador de Credenciales & JWT
          </button>
          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === 'roles'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            🛡️ Matriz de Roles (RBAC)
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeSubTab === 'users'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            👥 Gestión de Cuentas {isAdmin ? '(Admin)' : '🔒 (Exclusivo Admin)'}
          </button>
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === 'roadmap'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            🚀 Autenticación Robusta Futura
          </button>
        </div>
      </div>

      {/* SubTab 1: Credential & JWT Tester */}
      {activeSubTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-1">Verificación de Credenciales en BD</h2>
            <p className="text-slate-400 text-xs mb-6">
              Prueba una combinación de correo y contraseña contra la función de hashing <code className="text-sky-400">bcrypt</code> en SQLite.
            </p>

            <form onSubmit={handleTestCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                <select
                  value={testEmail}
                  onChange={(e) => {
                    setTestEmail(e.target.value);
                    if (e.target.value.startsWith('admin')) setTestPassword('Admin123!');
                    else if (e.target.value.startsWith('gerente')) setTestPassword('Gerente123!');
                    else if (e.target.value.startsWith('vendedor')) setTestPassword('Vendedor123!');
                    else if (e.target.value.startsWith('fi')) setTestPassword('Fi123!');
                    else if (e.target.value.startsWith('bdc')) setTestPassword('Bdc123!');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="admin@origen.cl">admin@origen.cl (Administrador)</option>
                  <option value="gerente@origen.cl">gerente@origen.cl (Gerente Comercial)</option>
                  <option value="vendedor1@origen.cl">vendedor1@origen.cl (Vendedor 1)</option>
                  <option value="vendedor2@origen.cl">vendedor2@origen.cl (Vendedora 2)</option>
                  <option value="fi@origen.cl">fi@origen.cl (Ejecutivo F&I)</option>
                  <option value="bdc@origen.cl">bdc@origen.cl (Agente BDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
                <input
                  type="text"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="Ingrese la clave"
                />
              </div>

              <button
                type="submit"
                disabled={loadingCred}
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
              >
                {loadingCred ? 'Verificando Hash...' : '⚡ Probar Validación bcrypt'}
              </button>
            </form>
          </div>

          {/* Result Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Resultado de la Prueba</h2>
              {credResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    credResult.valid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-base mb-1">
                      <span>{credResult.valid ? '✅ AUTENTICACIÓN EXITOSA' : '❌ CREDENCIALES INVÁLIDAS'}</span>
                    </div>
                    <p className="text-sm opacity-90">{credResult.message}</p>
                  </div>

                  {credResult.valid && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Usuario Validado:</span>
                        <span className="text-white font-semibold">{credResult.nombre}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Rol de Usuario:</span>
                        <span className="text-sky-400 font-bold">{credResult.rol}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Algoritmo de Hashing:</span>
                        <span className="text-purple-400 font-bold">bcrypt (salted)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tipo de Token JWT:</span>
                        <span className="text-amber-400 font-bold">Bearer HS256 (24 Horas)</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  Selecciona una cuenta y presiona "Probar Validación bcrypt" para ver los resultados.
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400">
              💡 <strong className="text-slate-300">Seguridad Alpha 0.0.1:</strong> Las contraseñas se almacenan mediante <code className="text-sky-400">bcrypt</code> con salt aleatorio de 12 rondas. Ninguna contraseña en plano se guarda en la base de datos.
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Role Matrix (RBAC) */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-2">Simulador de Permisos y Roles (RBAC)</h2>
            <p className="text-slate-400 text-xs mb-6">
              Verifica si un rol posee autorización para ejecutar acciones críticas en el sistema o si el backend retornará <code className="text-rose-400">HTTP 403 Forbidden</code>.
            </p>

            <form onSubmit={handleTestRole} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rol a Evaluar</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="ADMIN">ADMINISTRADOR (ADMIN)</option>
                  <option value="GERENTE">GERENTE COMERCIAL (GERENTE)</option>
                  <option value="VENDEDOR">ASESOR COMERCIAL (VENDEDOR)</option>
                  <option value="F_AND_I">EJECUTIVO F&I (F_AND_I)</option>
                  <option value="BDC">AGENTE BDC (BDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Acción del Sistema</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="GESTION_USUARIOS">Gestión de Cuentas y Usuarios</option>
                  <option value="CREAR_USUARIO">Crear Nuevos Usuarios</option>
                  <option value="VER_REPORTES_GERENCIALES">Ver Reportes Gerenciales & KPIs</option>
                  <option value="CREAR_VEHICULO">Ingresar Nuevo Vehículo al Inventario</option>
                  <option value="APROBAR_FI">Aprobar Solicitud de Crédito F&I</option>
                  <option value="GESTION_BDC">Gestionar Prospectos BDC</option>
                  <option value="CREAR_COTIZACION">Generar Cotización y Simulación</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loadingRole}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white font-medium py-2 text-sm rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {loadingRole ? 'Evaluando...' : '🛡️ Evaluar Permiso'}
                </button>
              </div>
            </form>

            {roleResult && (
              <div className={`p-4 rounded-xl border ${
                roleResult.authorized
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <span>{roleResult.authorized ? '🟢 ACCESO PERMITIDO (200 OK)' : '🔴 ACCESO DENEGADO (403 FORBIDDEN)'}</span>
                </div>
                <p className="text-xs text-slate-200">{roleResult.reason}</p>
              </div>
            )}
          </div>

          {/* Table of Roles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-300">Matriz Resumen de Facultades por Rol</h3>
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rol</th>
                  <th className="py-2.5 px-3">Gestión Cuentas</th>
                  <th className="py-2.5 px-3">Reportes KPIs</th>
                  <th className="py-2.5 px-3">Stock Vehículos</th>
                  <th className="py-2.5 px-3">Cotizaciones</th>
                  <th className="py-2.5 px-3">Aprobación F&I</th>
                  <th className="py-2.5 px-3">Módulo BDC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-3 font-bold text-sky-400">ADMIN</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✅ Total</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-indigo-400">GERENTE</td>
                  <td className="py-3 px-3 text-rose-400 font-bold">❌ Restringido</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-amber-400">VENDEDOR</td>
                  <td className="py-3 px-3 text-rose-400 font-bold">❌ Restringido</td>
                  <td className="py-3 px-3 text-slate-500">Solo Personal</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Lectura</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-slate-500">Lectura</td>
                  <td className="py-3 px-3 text-slate-500">Derivados</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-emerald-400">F_AND_I</td>
                  <td className="py-3 px-3 text-rose-400 font-bold">❌ Restringido</td>
                  <td className="py-3 px-3 text-slate-500">Solo F&I</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Lectura</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Sí</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✅ Exclusivo</td>
                  <td className="py-3 px-3 text-slate-500">No</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-purple-400">BDC</td>
                  <td className="py-3 px-3 text-rose-400 font-bold">❌ Restringido</td>
                  <td className="py-3 px-3 text-slate-500">No</td>
                  <td className="py-3 px-3 text-emerald-400">✅ Lectura</td>
                  <td className="py-3 px-3 text-slate-500">No</td>
                  <td className="py-3 px-3 text-slate-500">No</td>
                  <td className="py-3 px-3 text-purple-400 font-bold">✅ Exclusivo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Users Directory (ADMIN ONLY) */}
      {activeSubTab === 'users' && (
        <div>
          {!isAdmin ? (
            /* Restricted Access Warning */
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-2xl space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                🔒
              </div>
              <h2 className="text-xl font-bold text-white">Acceso Restringido - Gestión de Cuentas</h2>
              <p className="text-slate-300 text-sm">
                El módulo de gestión de cuentas y creación de usuarios está <strong className="text-amber-400">reservado exclusivamente para el Administrador del Sistema</strong> (<code className="text-sky-400">admin@origen.cl</code>).
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 inline-block text-xs text-slate-400">
                Tu usuario actual es <strong className="text-white">{currentUser?.nombre}</strong> con el rol <span className="px-2 py-0.5 bg-slate-800 text-sky-400 rounded-md font-mono">{currentUser?.rol}</span>.
              </div>
            </div>
          ) : (
            /* Admin view for user management */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">Directorio de Usuarios de Sistema en BD</h2>
                  <p className="text-slate-400 text-xs">Cuentas activas en la base de datos con contraseñas encriptadas en bcrypt.</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
                >
                  ➕ Crear Nuevo Usuario
                </button>
              </div>

              {usersError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
                  {usersError}
                </div>
              )}

              {loadingUsers ? (
                <div className="py-12 text-center text-slate-500 text-sm">Cargando usuarios de la BD...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-3 px-3">Nombre</th>
                        <th className="py-3 px-3">Correo (@origen.cl)</th>
                        <th className="py-3 px-3">Rol</th>
                        <th className="py-3 px-3">Teléfono</th>
                        <th className="py-3 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-semibold text-white">{u.nombre}</td>
                          <td className="py-3 px-3 font-mono text-sky-400">{u.email}</td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-mono font-bold">
                              {u.rol}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{u.telefono || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-semibold">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SubTab 4: Roadmap to Robust Enterprise Auth */}
      {activeSubTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-2">Hoja de Ruta: Evolución a Autenticación Robusta</h2>
            <p className="text-slate-400 text-xs mb-6">
              Estrategia técnica para escalar de la arquitectura Alpha 0.0.1 (BD + JWT básico) hacia un estándar de seguridad de nivel Enterprise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-center text-xl text-sky-400">
                  🌐
                </div>
                <h3 className="text-sm font-bold text-white">1. OAuth2 / OIDC Providers</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Integración de autenticación federada SSO con proveedores como Keycloak, Auth0, Microsoft Entra ID y Google Workspace.
                </p>
                <span className="inline-block px-2.5 py-0.5 bg-sky-500/10 text-sky-400 rounded-md text-[10px] font-mono">Próxima Fase</span>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center text-xl text-purple-400">
                  📲
                </div>
                <h3 className="text-sm font-bold text-white">2. Autenticación Multifactor (MFA)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verificación en dos pasos vía TOTP (Google Authenticator / Authy) y tokens de respaldo de un solo uso para roles gerenciales.
                </p>
                <span className="inline-block px-2.5 py-0.5 bg-purple-500/10 text-purple-400 rounded-md text-[10px] font-mono">En Planificación</span>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-xl text-emerald-400">
                  🔄
                </div>
                <h3 className="text-sm font-bold text-white">3. Refresh Tokens & HttpOnly Cookies</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Rotación de tokens de refresco seguros almacenados en cookies estrictas HttpOnly SameSite para evitar exposición a XSS.
                </p>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-mono">Fase 2</span>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-xl text-amber-400">
                  ⏱️
                </div>
                <h3 className="text-sm font-bold text-white">4. Rate Limiting & Anti Fuerza Bruta</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Protección de endpoints de login con límites de velocidad (slowapi / Redis) y bloqueo temporal de IPs ante reintentos fallidos.
                </p>
                <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-md text-[10px] font-mono">Fase 2</span>
              </div>

              {/* Card 5 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-xl text-rose-400">
                  📜
                </div>
                <h3 className="text-sm font-bold text-white">5. Audit Logs & Revocación</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Registro de auditoría inmutable de inicios de sesión, cambios de clave y revocación inmediata de sesiones activas.
                </p>
                <span className="inline-block px-2.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-md text-[10px] font-mono">Fase 3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal for Admin */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Crear Nuevo Usuario</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {createUserMsg.text && (
              <div className={`p-3 mb-4 rounded-xl text-xs ${
                createUserMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {createUserMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                  placeholder="Ej. Pedro Soto"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico (@origen.cl)</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                  placeholder="usuario@origen.cl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Rol Asignado</label>
                  <select
                    value={newRol}
                    onChange={(e) => setNewRol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="ADMIN">ADMINISTRADOR</option>
                    <option value="GERENTE">GERENTE</option>
                    <option value="VENDEDOR">VENDEDOR</option>
                    <option value="F_AND_I">F&I</option>
                    <option value="BDC">BDC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                    placeholder="+569..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-400 text-white py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-sky-500/20"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
