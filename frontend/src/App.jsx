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
import { apiFetch, getCurrentUserData, setCurrentUserData } from './services/api';

const DEFAULT_USERS = {
  'admin@automotoralascondes.cl': { id: 'u1', nombre: 'Carlos Mendoza (Admin)', email: 'admin@automotoralascondes.cl', rol: 'ADMIN', tenant_id: 'tenant1' },
  'gerente@automotoralascondes.cl': { id: 'u2', nombre: 'Roberto Gómez (Gerente)', email: 'gerente@automotoralascondes.cl', rol: 'GERENTE', tenant_id: 'tenant1' },
  'vendedor1@automotoralascondes.cl': { id: 'u3', nombre: 'Matías Silva (Asesor)', email: 'vendedor1@automotoralascondes.cl', rol: 'VENDEDOR', tenant_id: 'tenant1' },
  'fi@automotoralascondes.cl': { id: 'u4', nombre: 'Felipe Reyes (Ejecutivo F&I)', email: 'fi@automotoralascondes.cl', rol: 'F_AND_I', tenant_id: 'tenant1' },
  'bdc@automotoralascondes.cl': { id: 'u5', nombre: 'Valentina Morales (Agente BDC)', email: 'bdc@automotoralascondes.cl', rol: 'BDC', tenant_id: 'tenant1' },
};

const INITIAL_VEHICLES = [
  {
    id: 'v1',
    patente: 'PXYZ88',
    vin: 'CL9RAV4X202200981',
    marca: 'Toyota',
    modelo: 'RAV4',
    version: '2.0 VX Automatico 4x2',
    año: 2022,
    kilometraje: 32000,
    tipo_combustible: 'BENCINA',
    transmision: 'AUTOMATICA',
    precio_compra_tasacion: 16500000,
    precio_venta_publico: 18990000,
    estado: 'DISPONIBLE',
    urls_fotos: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800']
  },
  {
    id: 'v2',
    patente: 'RSTV33',
    vin: 'KMHTC20230004512',
    marca: 'Hyundai',
    modelo: 'Tucson',
    version: '2.0 CRDi Limited 4x4',
    año: 2023,
    kilometraje: 18500,
    tipo_combustible: 'DIESEL',
    transmision: 'AUTOMATICA',
    precio_compra_tasacion: 19000000,
    precio_venta_publico: 21490000,
    estado: 'RESERVADO',
    urls_fotos: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800']
  },
  {
    id: 'v3',
    patente: 'KGTR45',
    vin: 'JMZCX52023007891',
    marca: 'Mazda',
    modelo: 'CX-5',
    version: '2.5 GT AWD',
    año: 2023,
    kilometraje: 15000,
    tipo_combustible: 'BENCINA',
    transmision: 'AUTOMATICA',
    precio_compra_tasacion: 20000000,
    precio_venta_publico: 22990000,
    estado: 'VENDIDO',
    urls_fotos: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800']
  },
  {
    id: 'v4',
    patente: 'ABCD12',
    vin: '3GNCJ20210088990',
    marca: 'Chevrolet',
    modelo: 'Tracker',
    version: '1.2 Turbo LTZ',
    año: 2021,
    kilometraje: 45000,
    tipo_combustible: 'BENCINA',
    transmision: 'MANUAL',
    precio_compra_tasacion: 10500000,
    precio_venta_publico: 12490000,
    estado: 'DISPONIBLE',
    urls_fotos: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800']
  }
];

const INITIAL_LEADS = [
  {
    id: 'l1',
    estado_embudo: 'NEGOCIACION',
    monto_estimado: 18990000,
    customer: { nombre_completo: 'Juan Pablo Pérez', telefono: '+569 8765 4321', email: 'jperez@gmail.com' },
    vehicle: INITIAL_VEHICLES[0]
  },
  {
    id: 'l2',
    estado_embudo: 'RESERVADO',
    monto_estimado: 21490000,
    customer: { nombre_completo: 'María Josefa Fernández', telefono: '+569 7654 3210', email: 'mj.fernandez@outlook.cl' },
    vehicle: INITIAL_VEHICLES[1]
  },
  {
    id: 'l3',
    estado_embudo: 'CERRADO_GANADO',
    monto_estimado: 22990000,
    customer: { nombre_completo: 'Juan Pablo Pérez', telefono: '+569 8765 4321', email: 'jperez@gmail.com' },
    vehicle: INITIAL_VEHICLES[2]
  }
];

const INITIAL_FI = [
  {
    id: 'fi1',
    entidad_financiera: 'Forum Servicios Financieros',
    monto_solicitado: 15000000,
    pie_porcentaje: 30.0,
    estado: 'APROBADA',
    observaciones: 'Crédito pre-aprobado. Liquidaciones verficadas correctamente.'
  },
  {
    id: 'fi2',
    entidad_financiera: 'BCI Automotriz',
    monto_solicitado: 12000000,
    pie_porcentaje: 20.0,
    estado: 'EN_EVALUACION',
    observaciones: 'En revisión de antecedentes comerciales Dicom.'
  }
];

const INITIAL_BDC = [
  {
    id: 'b1',
    nombre_prospecto: 'Andrés Sepúlveda',
    telefono: '+569 1234 5678',
    origen_contacto: 'LLAMADA_ENTRANTE',
    vehiculo_interes: 'Toyota RAV4',
    notas: 'Preguntó por pie mínimo y retoma de vehículo usado en parte de pago.'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUserData() || DEFAULT_USERS['gerente@automotoralascondes.cl']);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [fiSolicitudes, setFiSolicitudes] = useState(INITIAL_FI);
  const [bdcLeads, setBdcLeads] = useState(INITIAL_BDC);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);

  // Try loading real API backend metrics if server is running
  useEffect(() => {
    apiFetch('/vehicles/')
      .then((data) => {
        if (data && data.length > 0) setVehicles(data);
      })
      .catch(() => {});
  }, []);

  const handleSwitchUser = (email) => {
    const u = DEFAULT_USERS[email] || DEFAULT_USERS['vendedor1@automotoralascondes.cl'];
    setCurrentUser(u);
    setCurrentUserData(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('automotora_token');
    localStorage.removeItem('automotora_user');
    setCurrentUser(DEFAULT_USERS['vendedor1@automotoralascondes.cl']);
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

  // Metrics calculation
  const totalStock = vehicles.length;
  const disponibles = vehicles.filter((v) => v.estado === 'DISPONIBLE').length;
  const reservados = vehicles.filter((v) => v.estado === 'RESERVADO').length;
  const vendidos = vehicles.filter((v) => v.estado === 'VENDIDO').length;
  const activeLeadsCount = leads.filter(
    (l) => !['CERRADO_GANADO', 'CERRADO_PERDIDO'].includes(l.estado_embudo)
  ).length;
  const ventasMonto = vehicles
    .filter((v) => v.estado === 'VENDIDO')
    .reduce((sum, item) => sum + item.precio_venta_publico, 0);

  const metrics = {
    total_vehiculos_stock: totalStock,
    vehiculos_disponibles: disponibles,
    vehiculos_reservados: reservados,
    vehiculos_vendidos_mes: vendidos,
    total_leads_activos: activeLeadsCount,
    monto_cotizado_mes: 40480000,
    ventas_totales_monto_mes: ventasMonto,
    tasa_conversion_pct: 33.3
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
    </div>
  );
}
