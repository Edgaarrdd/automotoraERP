// Configuración de los Pasos de Onboarding Guiado por Rol
// CRM Automotora ERP - Version Alpha 0.0.1 (Basado en DOCUMENTACION_ONBOARDING_ROLES.md)

export const ONBOARDING_STEPS = {
  ADMIN: [
    {
      id: 'admin-1',
      target: '[data-tour="user-selector"]',
      tab: 'security',
      title: 'Simulador de Roles',
      content: 'Permite cambiar instantáneamente entre perfiles para validar la visibilidad y permisos del sistema.',
      placement: 'bottom'
    },
    {
      id: 'admin-2',
      target: '[data-tour="tenant-badge"]',
      tab: 'security',
      title: 'Aislamiento Multi-Tenant',
      content: 'Garantiza la separación estricta de esquemas de datos por sucursal u organización (tenant_origen).',
      placement: 'right'
    },
    {
      id: 'admin-3',
      target: '[data-tour="nav-security"]',
      tab: 'security',
      title: 'Módulo de Seguridad RBAC',
      content: 'Gestiona los permisos por rol, administra usuarios y consulta la matriz de control de accesos (Alpha 0.0.1).',
      placement: 'right'
    },
    {
      id: 'admin-4',
      target: '[data-tour="rbac-matrix"]',
      tab: 'security',
      subTab: 'roles',
      title: 'Matriz de Permisos',
      content: 'Opciones para conceder o revocar permisos específicos (Crear, Editar, Eliminar, Ver) por cada módulo del ERP.',
      placement: 'top'
    },
    {
      id: 'admin-5',
      target: '[data-tour="audit-log"]',
      tab: 'security',
      subTab: 'users',
      title: 'Gestión de Cuentas & Usuarios',
      content: 'Traza de eventos en tiempo real, administración de usuarios y verificación de claves bcrypt.',
      placement: 'top'
    },
    {
      id: 'admin-6',
      target: '[data-tour="sys-settings"]',
      tab: 'security',
      title: 'Configuración General',
      content: 'Parámetros globales del sistema, integraciones API y marcas soportadas.',
      placement: 'bottom'
    }
  ],
  GERENTE: [
    {
      id: 'gerente-1',
      target: '[data-tour="dash-metrics"]',
      tab: 'dashboard',
      title: 'Métricas Globales Sucursal',
      content: 'Monitorea el volumen de ventas total, valor del inventario en stock y leads en proceso de todo el equipo de ejecutivos.',
      placement: 'bottom'
    },
    {
      id: 'gerente-2',
      target: '[data-tour="dash-sales-chart"]',
      tab: 'dashboard',
      title: 'Rendimiento Comercial',
      content: 'Analiza la proyección de cierres y compara la tasa de conversión por asesor en tiempo real.',
      placement: 'top'
    },
    {
      id: 'gerente-3',
      target: '[data-tour="nav-inventory"]',
      tab: 'dashboard',
      title: 'Control de Stock y Precios',
      content: 'Revisa días en stock por unidad, costos y ajusta precios de venta al público según la estrategia de la sucursal.',
      placement: 'right'
    },
    {
      id: 'gerente-4',
      target: '[data-tour="inventory-add-btn"]',
      tab: 'inventory',
      title: '+ Ingresar Vehículo',
      content: 'Carga nuevas unidades recibidas de fábrica o retomas con VIN, fotos y características técnicas.',
      placement: 'bottom'
    },
    {
      id: 'gerente-5',
      target: '[data-tour="nav-kanban"]',
      tab: 'inventory',
      title: 'Supervisión de Pipeline',
      content: 'Observa el flujo de trabajo de todos los vendedores, identifica cuellos de botella y reasigna prospectos estancados.',
      placement: 'right'
    },
    {
      id: 'gerente-6',
      target: '[data-tour="nav-fi"]',
      tab: 'kanban',
      title: 'Monitoreo de Créditos F&I',
      content: 'Evalúa el estado de las aprobaciones bancarias de la sucursal y la penetración de financiamiento.',
      placement: 'right'
    },
    {
      id: 'gerente-7',
      target: '[data-tour="nav-security"]',
      tab: 'fi',
      title: 'Auditoría y Permisos',
      content: 'Visualiza el registro de auditoría del sistema para validar cambios de estado y accesos del personal.',
      placement: 'right'
    }
  ],
  VENDEDOR: [
    {
      id: 'vendedor-1',
      target: '[data-tour="nav-dashboard"]',
      tab: 'dashboard',
      title: 'Tu Panel Principal',
      content: 'Visualiza tus métricas del mes: vehículos vendidos, leads activos y tasa de conversión personalizada.',
      placement: 'right'
    },
    {
      id: 'vendedor-2',
      target: '[data-tour="nav-kanban"]',
      tab: 'dashboard',
      title: 'Pipeline de Ventas',
      content: 'Arrastra y gestiona tus prospectos (Leads) a través de cada etapa del embudo comercial desde Nuevo hasta Cierre.',
      placement: 'right'
    },
    {
      id: 'vendedor-3',
      target: '[data-tour="kanban-new-lead"]',
      tab: 'kanban',
      title: '+ Registrar Nuevo Lead',
      content: 'Haz clic aquí para ingresar rápidamente a un cliente interesado indicando modelo deseado, presupuesto y origen.',
      placement: 'bottom'
    },
    {
      id: 'vendedor-4',
      target: '[data-tour="nav-inventory"]',
      tab: 'kanban',
      title: 'Stock de Vehículos',
      content: 'Consulta los autos disponibles en tiempo real, filtra por marca, año o precio y revisa las fichas técnicas.',
      placement: 'right'
    },
    {
      id: 'vendedor-5',
      target: '[data-tour="inventory-reserve-btn"]',
      tab: 'inventory',
      title: 'Reservar Unidad',
      content: 'Permite bloquear un vehículo para tu cliente mientras formalizas el pago del pie o la aprobación del crédito.',
      placement: 'bottom'
    },
    {
      id: 'vendedor-6',
      target: '[data-tour="nav-quotes"]',
      tab: 'inventory',
      title: 'Generador de Cotizaciones',
      content: 'Crea simulaciones de compra detallando modelo, accesorios, valor de retoma y cuotas para enviar al cliente por WhatsApp o email.',
      placement: 'right'
    },
    {
      id: 'vendedor-7',
      target: '[data-tour="nav-fi"]',
      tab: 'quotes',
      title: 'Solicitud F&I',
      content: 'Envía la información financiera de tu cliente al departamento de Crédito y Seguros para su evaluación.',
      placement: 'right'
    }
  ],
  F_AND_I: [
    {
      id: 'fi-1',
      target: '[data-tour="nav-fi"]',
      tab: 'fi',
      title: 'Panel Financiero F&I',
      content: 'Centro de control de solicitudes de crédito automotriz recibidas desde la fuerza de ventas.',
      placement: 'right'
    },
    {
      id: 'fi-2',
      target: '[data-tour="fi-pending-table"]',
      tab: 'fi',
      title: 'Solicitudes Pendientes',
      content: 'Revisa carpetas de clientes con antecedentes comerciales listos para enviar a financieras o bancos.',
      placement: 'top'
    },
    {
      id: 'fi-3',
      target: '[data-tour="fi-approval-actions"]',
      tab: 'fi',
      title: 'Aprobar / Rechazar Crédito',
      content: 'Actualiza el dictamen de las entidades financieras y adjunta cartas de aprobación con sus condiciones.',
      placement: 'top'
    },
    {
      id: 'fi-4',
      target: '[data-tour="nav-inventory"]',
      tab: 'fi',
      title: 'Consulta de Garantías y Valor',
      content: 'Verifica los valores comerciales y equipamiento de las unidades para el cálculo del pie mínimo y seguro.',
      placement: 'right'
    },
    {
      id: 'fi-5',
      target: '[data-tour="fi-insurance-calc"]',
      tab: 'fi',
      title: 'Cotizador de Seguros',
      content: 'Agrega pólizas de seguro automotriz y accesorios financiados al paquete final del cliente.',
      placement: 'top'
    }
  ],
  BDC: [
    {
      id: 'bdc-1',
      target: '[data-tour="nav-bdc"]',
      tab: 'bdc',
      title: 'Recepción & BDC',
      content: 'Panel para registrar contactos telefónicos, consultas de sitio web y visitas presenciales al showroom.',
      placement: 'right'
    },
    {
      id: 'bdc-2',
      target: '[data-tour="bdc-new-contact"]',
      tab: 'bdc',
      title: '+ Registrar Contacto',
      content: 'Ingresa los datos del prospecto, origen de la consulta (Web, Portal, Llamada) y modelo de interés.',
      placement: 'bottom'
    },
    {
      id: 'bdc-3',
      target: '[data-tour="bdc-assign-seller"]',
      tab: 'bdc',
      title: 'Asignación de Asesor',
      content: 'Asigna el prospecto al vendedor en turno o según disponibilidad en la sucursal.',
      placement: 'top'
    },
    {
      id: 'bdc-4',
      target: '[data-tour="nav-inventory"]',
      tab: 'bdc',
      title: 'Disponibilidad Rápida',
      content: 'Responde consultas inmediatas de clientes sobre disponibilidad de color, versión o stock inmediato.',
      placement: 'right'
    },
    {
      id: 'bdc-5',
      target: '[data-tour="nav-kanban"]',
      tab: 'bdc',
      title: 'Seguimiento de Asignados',
      content: 'Verifica si el vendedor contactó al lead dentro del tiempo SLA establecido.',
      placement: 'right'
    }
  ],
  MARKETING: [
    {
      id: 'mkt-1',
      target: '[data-tour="nav-dashboard"]',
      tab: 'dashboard',
      title: 'Resumen Operativo',
      content: 'Visualización general del movimiento de inventario y conversión comercial.',
      placement: 'right'
    },
    {
      id: 'mkt-2',
      target: '[data-tour="nav-inventory"]',
      tab: 'inventory',
      title: 'Inventario y Fotografías',
      content: 'Extrae fotografías y especificaciones técnicas para campañas de marketing en redes y portales.',
      placement: 'right'
    }
  ],
  TALLER: [
    {
      id: 'taller-1',
      target: '[data-tour="nav-dashboard"]',
      tab: 'dashboard',
      title: 'Resumen Operativo',
      content: 'Visualización general del movimiento de inventario y unidades ingresadas.',
      placement: 'right'
    },
    {
      id: 'taller-2',
      target: '[data-tour="nav-inventory"]',
      tab: 'inventory',
      title: 'Inventario y Servicios',
      content: 'Actualiza el estado de preparación, inspección pre-entrega (PDI) y detalles mecánicos de los vehículos.',
      placement: 'right'
    }
  ]
};
