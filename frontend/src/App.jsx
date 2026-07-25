import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import VehicleModal from './components/VehicleModal';
import NewVehicleModal from './components/NewVehicleModal';
import NewLeadModal from './components/NewLeadModal';
import NewFISolicitudModal from './components/NewFISolicitudModal';
import NewAppointmentModal from './components/NewAppointmentModal';
import PipelineKanban from './components/PipelineKanban';
import CalendarSection from './components/CalendarSection';
import ConsignorPortalSection from './components/ConsignorPortalSection';
import CommissionsSection from './components/CommissionsSection';
import QuoteGenerator from './components/QuoteGenerator';
import FISection from './components/FISection';
import BDCSection from './components/BDCSection';
import SecuritySection from './components/SecuritySection';
import DocsSection from './components/DocsSection';
import CMSSection from './components/CMSSection';
import StorefrontView from './components/StorefrontView';
import OnboardingTour from './components/OnboardingTour';
import { apiFetch, getCurrentUserData, setCurrentUserData, setAuthToken } from './services/api';

const DEFAULT_USERS = {
  'admin@origen.cl': { id: 'u1', nombre: 'Carlos Mendoza (Admin)', email: 'admin@origen.cl', rol: 'ADMIN', tenant_id: 'tenant_origen', password: 'Admin123!' },
  'gerente@origen.cl': { id: 'u2', nombre: 'Roberto Gómez (Gerente)', email: 'gerente@origen.cl', rol: 'GERENTE', tenant_id: 'tenant_origen', password: 'Gerente123!' },
  'vendedor1@origen.cl': { id: 'u3', nombre: 'Matías Silva (Asesor)', email: 'vendedor1@origen.cl', rol: 'VENDEDOR', tenant_id: 'tenant_origen', password: 'Vendedor123!' },
  'vendedor2@origen.cl': { id: 'u4', nombre: 'Camila Torres (Asesora)', email: 'vendedor2@origen.cl', rol: 'VENDEDOR', tenant_id: 'tenant_origen', password: 'Vendedor123!' },
  'fi@origen.cl': { id: 'u5', nombre: 'Felipe Reyes (Ejecutivo F&I)', email: 'fi@origen.cl', rol: 'F_AND_I', tenant_id: 'tenant_origen', password: 'Fi123!' },
  'bdc@origen.cl': { id: 'u6', nombre: 'Valentina Morales (Agente BDC)', email: 'bdc@origen.cl', rol: 'BDC', tenant_id: 'tenant_origen', password: 'Bdc123!' },
  'marketing@origen.cl': { id: 'u7', nombre: 'Gonzalo Paz (Marketing)', email: 'marketing@origen.cl', rol: 'MARKETING', tenant_id: 'tenant_origen', password: 'Admin123!' },
  'taller@origen.cl': { id: 'u8', nombre: 'Hugo Navarro (Jefe Taller)', email: 'taller@origen.cl', rol: 'TALLER', tenant_id: 'tenant_origen', password: 'Admin123!' }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUserData() || DEFAULT_USERS['admin@origen.cl']);
  const [activeTab, setActiveTab] = useState('security');
  const [activeSubTab, setActiveSubTab] = useState('tester');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isStorefrontPreviewOpen, setIsStorefrontPreviewOpen] = useState(false);

  // States initialized cleanly for Alpha 0.0.1 / Beta 0.1.0
  const [vehicles, setVehicles] = useState([]);
  const [leads, setLeads] = useState([]);
  const [fiSolicitudes, setFiSolicitudes] = useState([]);
  const [bdcLeads, setBdcLeads] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isNewFISolicitudModalOpen, setIsNewFISolicitudModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

  // Function to ensure active user JWT authentication token with backend API
  const ensureUserToken = async (userObj) => {
    const pwd = userObj.password || 'Admin123!';
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: userObj.email, password: pwd })
      });
      if (data && data.access_token) {
        setAuthToken(data.access_token);
        return true;
      }
    } catch (e) {
      console.warn('Backend login token fetch warning:', e.message);
    }
    return false;
  };

  // Load all entities from backend API
  const refreshAllData = async () => {
    try {
      const [vData, lData, fiData, bdcData, appData, mData] = await Promise.allSettled([
        apiFetch('/vehicles/'),
        apiFetch('/leads/'),
        apiFetch('/fi/'),
        apiFetch('/bdc/'),
        apiFetch('/appointments/'),
        apiFetch('/dashboard/metrics')
      ]);

      if (vData.status === 'fulfilled' && Array.isArray(vData.value)) setVehicles(vData.value);
      if (lData.status === 'fulfilled' && Array.isArray(lData.value)) setLeads(lData.value);
      if (fiData.status === 'fulfilled' && Array.isArray(fiData.value)) setFiSolicitudes(fiData.value);
      if (bdcData.status === 'fulfilled' && Array.isArray(bdcData.value)) setBdcLeads(bdcData.value);
      if (appData.status === 'fulfilled' && Array.isArray(appData.value)) setAppointments(appData.value);
      if (mData.status === 'fulfilled' && mData.value) setMetrics(mData.value);
    } catch (err) {
      console.warn('Error refreshing data from API:', err.message);
    }
  };

  // Authenticate and load data on user/role change
  useEffect(() => {
    ensureUserToken(currentUser).then(() => {
      refreshAllData();
    });
  }, [currentUser?.email]);

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

  const handleSwitchUser = async (email) => {
    const u = DEFAULT_USERS[email] || DEFAULT_USERS['admin@origen.cl'];
    setCurrentUser(u);
    setCurrentUserData(u);
    await ensureUserToken(u);
    refreshAllData();
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

  // --- Handlers for API Persisted Actions ---

  const handleCreateVehicle = async (vehicleData) => {
    try {
      const created = await apiFetch('/vehicles/', {
        method: 'POST',
        body: JSON.stringify(vehicleData)
      });
      if (created) {
        setVehicles((prev) => [created, ...prev]);
      }
    } catch (e) {
      const newVehicle = {
        ...vehicleData,
        id: `v_${Date.now()}`,
        urls_fotos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800']
      };
      setVehicles((prev) => [newVehicle, ...prev]);
    }
    setIsNewVehicleModalOpen(false);
    refreshAllData();
  };

  const handleUpdateVehicleStatus = async (vehicleId, newStatus) => {
    try {
      await apiFetch(`/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: newStatus })
      });
    } catch (e) {
      console.warn('Fallback status update local:', e.message);
    }
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, estado: newStatus } : v))
    );
    refreshAllData();
  };

  const handleCreateLead = async (leadData) => {
    try {
      let customerId = null;
      try {
        const custRes = await apiFetch('/leads/customers', {
          method: 'POST',
          body: JSON.stringify({
            nombre_completo: leadData.nombre_completo,
            telefono: leadData.telefono,
            email: leadData.email,
            tipo: 'COMPRADOR',
            origen: 'KANBAN_DIRECT'
          })
        });
        if (custRes && custRes.id) customerId = custRes.id;
      } catch (custErr) {
        console.warn('Customer auto-create warning:', custErr.message);
      }

      const leadPayload = {
        id_cliente: customerId,
        id_vehiculo_interes: leadData.id_vehiculo_interes || null,
        id_vendedor_asignado: currentUser.id,
        estado_embudo: 'NUEVO',
        score_lead: leadData.score_lead || 'CALIENTE',
        monto_estimado: leadData.monto_estimado || 0
      };

      const created = await apiFetch('/leads/', {
        method: 'POST',
        body: JSON.stringify(leadPayload)
      });

      if (created) {
        setLeads((prev) => [created, ...prev]);
      }
    } catch (e) {
      const newLead = {
        id: `l_${Date.now()}`,
        customer: { nombre_completo: leadData.nombre_completo, telefono: leadData.telefono },
        estado_embudo: 'NUEVO',
        score_lead: leadData.score_lead || 'CALIENTE',
        monto_estimado: leadData.monto_estimado
      };
      setLeads((prev) => [newLead, ...prev]);
    }
    setIsNewLeadModalOpen(false);
    refreshAllData();
  };

  const handleUpdateLeadStage = async (leadId, newStage, lossReason = '') => {
    try {
      await apiFetch(`/leads/${leadId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ estado_embudo: newStage, motivo_perdida: lossReason })
      });
    } catch (e) {
      console.warn('Fallback lead stage update:', e.message);
    }
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, estado_embudo: newStage, motivo_perdida: lossReason }
          : l
      )
    );
    refreshAllData();
  };

  const handleCreateBDCLead = async (bdcData) => {
    try {
      const created = await apiFetch('/bdc/', {
        method: 'POST',
        body: JSON.stringify(bdcData)
      });
      if (created) {
        setBdcLeads((prev) => [created, ...prev]);
      }
    } catch (e) {
      const newBDC = { ...bdcData, id: `b_${Date.now()}` };
      setBdcLeads((prev) => [newBDC, ...prev]);
    }
    refreshAllData();
  };

  const handleCreateFISolicitud = async (fiData) => {
    try {
      const created = await apiFetch('/fi/', {
        method: 'POST',
        body: JSON.stringify({
          entidad_financiera: fiData.entidad_financiera,
          monto_solicitado: fiData.monto_solicitado,
          pie_porcentaje: fiData.pie_porcentaje,
          id_vehiculo: fiData.id_vehiculo || null,
          observaciones: fiData.observaciones
        })
      });
      if (created) {
        setFiSolicitudes((prev) => [created, ...prev]);
      }
    } catch (e) {
      const newSol = { ...fiData, id: `f_${Date.now()}`, estado: 'EN_ESTUDIO' };
      setFiSolicitudes((prev) => [newSol, ...prev]);
    }
    setIsNewFISolicitudModalOpen(false);
    refreshAllData();
  };

  const handleCreateQuote = async (quoteData) => {
    try {
      await apiFetch('/quotes/', {
        method: 'POST',
        body: JSON.stringify(quoteData)
      });
    } catch (e) {
      console.warn('Quote creation API fallback:', e.message);
    }
    refreshAllData();
  };

  const handleCreateAppointment = async (appData) => {
    try {
      const created = await apiFetch('/appointments/', {
        method: 'POST',
        body: JSON.stringify(appData)
      });
      if (created) {
        setAppointments((prev) => [created, ...prev]);
      }
    } catch (e) {
      const newApp = { ...appData, id: `a_${Date.now()}`, estado: 'AGENDADA' };
      setAppointments((prev) => [newApp, ...prev]);
    }
    setIsNewAppointmentModalOpen(false);
    refreshAllData();
  };

  const handleUpdateAppointmentStatus = async (appId, newStatus) => {
    try {
      await apiFetch(`/appointments/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: newStatus })
      });
    } catch (e) {
      console.warn('Appointment status fallback:', e.message);
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, estado: newStatus } : a))
    );
    refreshAllData();
  };

  const handleDeleteAppointment = async (appId) => {
    try {
      await apiFetch(`/appointments/${appId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Appointment delete fallback:', e.message);
    }
    setAppointments((prev) => prev.filter((a) => a.id !== appId));
    refreshAllData();
  };

  // Cálculo dinámico de métricas para el Dashboard
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

  const calculatedMetrics = metrics || {
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
              metrics={calculatedMetrics}
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
              onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'consignments' && (
            <ConsignorPortalSection vehicles={vehicles} />
          )}

          {activeTab === 'commissions' && (
            <CommissionsSection currentUser={currentUser} />
          )}

          {activeTab === 'calendar' && (
            <CalendarSection
              appointments={appointments}
              vehicles={vehicles}
              onOpenNewAppointmentModal={() => setIsNewAppointmentModalOpen(true)}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {activeTab === 'quotes' && (
            <QuoteGenerator
              vehicles={vehicles}
              currentUser={currentUser}
              onSubmitQuote={handleCreateQuote}
            />
          )}

          {activeTab === 'fi' && (
            <FISection
              fiSolicitudes={fiSolicitudes}
              onOpenNewFISolicitudModal={() => setIsNewFISolicitudModalOpen(true)}
            />
          )}

          {activeTab === 'bdc' && (
            <BDCSection bdcLeads={bdcLeads} onSubmitBDC={handleCreateBDCLead} />
          )}

          {activeTab === 'cms' && (
            <CMSSection onOpenStorefrontPreview={() => setIsStorefrontPreviewOpen(true)} />
          )}

          {activeTab === 'docs' && <DocsSection />}
        </main>
      </div>

      {/* Public Storefront Preview Modal */}
      {isStorefrontPreviewOpen && (
        <StorefrontView onClose={() => setIsStorefrontPreviewOpen(false)} />
      )}

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

      {isNewLeadModalOpen && (
        <NewLeadModal
          vehicles={vehicles}
          onClose={() => setIsNewLeadModalOpen(false)}
          onSubmit={handleCreateLead}
        />
      )}

      {isNewFISolicitudModalOpen && (
        <NewFISolicitudModal
          vehicles={vehicles}
          onClose={() => setIsNewFISolicitudModalOpen(false)}
          onSubmit={handleCreateFISolicitud}
        />
      )}

      {isNewAppointmentModalOpen && (
        <NewAppointmentModal
          vehicles={vehicles}
          onClose={() => setIsNewAppointmentModalOpen(false)}
          onSubmit={handleCreateAppointment}
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

