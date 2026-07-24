import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import VehicleModal from './components/VehicleModal';
import NewVehicleModal from './components/NewVehicleModal';
import PipelineKanban from './components/PipelineKanban';
import QuoteGenerator from './components/QuoteGenerator';
import FISection from './components/FISection';
import BDCSection from './components/BDCSection';
import SecuritySection from './components/SecuritySection';
import OnboardingTour from './components/OnboardingTour';
import { apiFetch, getCurrentUserData, setCurrentUserData } from './services/api';

const DEFAULT_USERS = {
  'admin@origen.cl': { id: 'u1', nombre: 'Carlos Mendoza (Admin)', email: 'admin@origen.cl', rol: 'ADMIN', tenant_id: 'tenant_origen' },
  'gerente@origen.cl': { id: 'u2', nombre: 'Roberto Gómez (Gerente)', email: 'gerente@origen.cl', rol: 'GERENTE', tenant_id: 'tenant_origen' },
  'vendedor1@origen.cl': { id: 'u3', nombre: 'Matías Silva (Asesor)', email: 'vendedor1@origen.cl', rol: 'VENDEDOR', tenant_id: 'tenant_origen' },
  'vendedor2@origen.cl': { id: 'u4', nombre: 'Camila Torres (Asesora)', email: 'vendedor2@origen.cl', rol: 'VENDEDOR', tenant_id: 'tenant_origen' },
  'fi@origen.cl': { id: 'u5', nombre: 'Felipe Reyes (Ejecutivo F&I)', email: 'fi@origen.cl', rol: 'F_AND_I', tenant_id: 'tenant_origen' },
  'bdc@origen.cl': { id: 'u6', nombre: 'Valentina Morales (Agente BDC)', email: 'bdc@origen.cl', rol: 'BDC', tenant_id: 'tenant_origen' },
  'marketing@origen.cl': { id: 'u7', nombre: 'Gonzalo Paz (Marketing)', email: 'marketing@origen.cl', rol: 'MARKETING', tenant_id: 'tenant_origen' },
  'taller@origen.cl': { id: 'u8', nombre: 'Hugo Navarro (Jefe Taller)', email: 'taller@origen.cl', rol: 'TALLER', tenant_id: 'tenant_origen' }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUserData() || DEFAULT_USERS['admin@origen.cl']);
  const [activeTab, setActiveTab] = useState('security'); // Pestaña principal al iniciar Alpha 0.0.1
  const [activeSubTab, setActiveSubTab] = useState('tester');
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Arreglos vacíos iniciales limpios sin datos mock para Alpha 0.0.1
  const [vehicles, setVehicles] = useState([]);
  const [leads, setLeads] = useState([]);
  const [fiSolicitudes, setFiSolicitudes] = useState([]);
  const [bdcLeads, setBdcLeads] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);

  // Intentar cargar datos reales desde el backend si existen
  useEffect(() => {
    apiFetch('/vehicles/')
      .then((data) => {
        if (data && Array.isArray(data)) setVehicles(data);
      })
      .catch(() => {});
  }, []);

  // Auto-launch tour on initial load or role switch if not completed
  useEffect(() => {
    const roleKey = `onboarding_completed_${currentUser?.rol || 'ADMIN'}`;
    const hasCompleted = localStorage.getItem(roleKey);
    if (!hasCompleted) {
      const timer = setTimeout(() => setIsTourOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.rol]);

  const handleStartTour = () => {
    setIsTourOpen(true);
  };

  const handleCompleteTour = () => {
    const roleKey = `onboarding_completed_${currentUser?.rol || 'ADMIN'}`;
    localStorage.setItem(roleKey, 'true');
    setIsTourOpen(false);
  };

  const handleSwitchUser = (email) => {
    const u = DEFAULT_USERS[email] || DEFAULT_USERS['admin@origen.cl'];
    setCurrentUser(u);
    setCurrentUserData(u);
    const roleKey = `onboarding_completed_${u.rol}`;
    if (!localStorage.getItem(roleKey)) {
      setTimeout(() => setIsTourOpen(true), 400);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('automotora_token');
    localStorage.removeItem('automotora_user');
    setCurrentUser(DEFAULT_USERS['admin@origen.cl']);
  };

  const handleUpdateVehicleStatus = (vehicleId, newStatus) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, estado: newStatus } : v))
    );
  };

  const handleCreateVehicle = (vehicleData) => {
    const newVehicle = {
      ...vehicleData,
      id: `v_${Date.now()}`,
      urls_fotos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800']
    };
    setVehicles([newVehicle, ...vehicles]);
    setIsNewVehicleModalOpen(false);
  };

  const handleUpdateLeadStage = (leadId, newStage, lossReason = '') => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, estado_embudo: newStage, motivo_perdida: lossReason }
          : l
      )
    );
  };

  const handleCreateBDCLead = (bdcData) => {
    const newBDC = { ...bdcData, id: `b_${Date.now()}` };
    setBdcLeads([newBDC, ...bdcLeads]);
  };

  // Cálculo dinámico de métricas reales
  const totalStock = vehicles.length;
  const disponibles = vehicles.filter((v) => v.estado === 'DISPONIBLE').length;
  const reservados = vehicles.filter((v) => v.estado === 'RESERVADO').length;
  const vendidos = vehicles.filter((v) => v.estado === 'VENDIDO').length;
  const activeLeadsCount = leads.filter(
    (l) => !['CERRADO_GANADO', 'CERRADO_PERDIDO'].includes(l.estado_embudo)
  ).length;
  const ventasMonto = vehicles
    .filter((v) => v.estado === 'VENDIDO')
    .reduce((sum, item) => sum + (item.precio_venta_publico || 0), 0);

  const metrics = {
    total_vehiculos_stock: totalStock,
    vehiculos_disponibles: disponibles,
    vehiculos_reservados: reservados,
    vehiculos_vendidos_mes: vendidos,
    total_leads_activos: activeLeadsCount,
    monto_cotizado_mes: 0,
    ventas_totales_monto_mes: ventasMonto,
    tasa_conversion_pct: 0.0
  };

  const handleQuickAction = (action) => {
    if (action === 'new-vehicle') setIsNewVehicleModalOpen(true);
    else if (action === 'new-quote') setActiveTab('quotes');
    else if (action === 'view-inventory') setActiveTab('inventory');
    else if (action === 'view-kanban') setActiveTab('kanban');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onStartTour={handleStartTour}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 lg:p-6 gap-6">
        {/* Sidebar Left */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />

        {/* Content Area Right */}
        <main className="flex-1 min-w-0">
          {activeTab === 'security' && (
            <SecuritySection
              currentUser={currentUser}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              metrics={metrics}
              vehicles={vehicles}
              leads={leads}
              onQuickAction={handleQuickAction}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              vehicles={vehicles}
              onSelectVehicle={(v) => setSelectedVehicle(v)}
              onOpenNewVehicleModal={() => setIsNewVehicleModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'kanban' && (
            <PipelineKanban
              leads={leads}
              onUpdateStage={handleUpdateLeadStage}
              onOpenNewLeadModal={() => {}}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'quotes' && (
            <QuoteGenerator vehicles={vehicles} currentUser={currentUser} />
          )}

          {activeTab === 'fi' && <FISection fiSolicitudes={fiSolicitudes} />}

          {activeTab === 'bdc' && (
            <BDCSection bdcLeads={bdcLeads} onSubmitBDC={handleCreateBDCLead} />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onUpdateStatus={handleUpdateVehicleStatus}
          currentUser={currentUser}
        />
      )}

      {isNewVehicleModalOpen && (
        <NewVehicleModal
          onClose={() => setIsNewVehicleModalOpen(false)}
          onSubmit={handleCreateVehicle}
        />
      )}

      {/* Onboarding Tour Component */}
      <OnboardingTour
        role={currentUser?.rol || 'ADMIN'}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={handleCompleteTour}
      />
    </div>
  );
}
