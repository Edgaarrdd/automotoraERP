# Documentación del Sistema de Onboarding Guiado (Popups / Tooltips por Rol)
**CRM Automotora ERP** - Version Alpha 0.0.1

---

## 1. Resumen Ejecutivo y Propósito

El sistema de **Onboarding Guiado** tiene como objetivo acelerar la adopción de los distintos roles de usuario dentro del CRM Automotora. Mediante pequeños **popups flotantes (tooltips/callouts)** posicionados estratégicamente sobre las opciones y botones disponibles en la interfaz, cada usuario recibe una explicación breve, clara y contextualizada sobre las funciones que puede ejecutar según su perfil de permisos.

> [!NOTE]
> Esta documentación define la estructura, secuencias y textos para cada rol. Se deja **abierta a revisión y retroalimentación** antes de iniciar su implementación técnica en la interfaz.

---

## 2. Estructura General del Onboarding

### 2.1 Componentes Visuales del Popup
Cada paso del Onboarding constará de un popup modal compacto posicionado sobre el elemento objetivo (`target`), con los siguientes elementos:
* **Indicador de Paso**: Ejemplo `Paso 2 de 5`.
* **Título**: Breve encabezado de la funcionalidad (máx. 4 palabras).
* **Descripción**: Explicación concisa del valor u operación de la opción (20 - 40 palabras).
* **Flecha / Indicador de Posición**: Apunta directamente a la opción/botón resaltado.
* **Controles de Navegación**:
  * Botón `Anterior`
  * Botón `Siguiente` / `Entendido`
  * Botón `Omitir Tour` / `X`

### 2.2 Gatilladores del Tour (Triggers)
1. **Primer Inicio de Sesión**: Se activa automáticamente al ingresar por primera vez con un rol determinado.
2. **Reinicio Manual**: Accesible desde el botón de ayuda (`?`) o selector de usuario en el Navbar.
3. **Cambio de Rol**: Si el usuario cambia de rol (en el ambiente de pruebas o producción), el tour correspondiente a ese rol se inicializa.

---

## 3. Guía de Onboarding Dividida por Rol

---

### 3.1 Rol: VENDEDOR (Asesor Comercial)
**Enfoque**: Captura de leads, seguimiento de cotizaciones, agendamiento de test drives y avance del embudo de ventas.

| Paso | Opciones Ubicación | Elemento Objetivo (Target) | Título Popup | Descripción en Popup |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Sidebar | `[data-tour="nav-dashboard"]` | **Tu Panel Principal** | Visualiza tus métricas del mes: vehículos vendidos, leads activos y tasa de conversión personalizada. |
| **2** | Sidebar | `[data-tour="nav-kanban"]` | **Pipeline de Ventas** | Arrastra y gestiona tus prospectos (Leads) a través de cada etapa del embudo comercial desde *Nuevo* hasta *Cierre*. |
| **3** | Pipeline Kanban | `[data-tour="kanban-new-lead"]` | **+ Registrar Nuevo Lead** | Haz clic aquí para ingresar rápidamente a un cliente interesado indicando modelo deseado, presupuesto y origen. |
| **4** | Sidebar | `[data-tour="nav-inventory"]` | **Stock de Vehículos** | Consulta los autos disponibles en tiempo real, filtra por marca, año o precio y revisa las fichas técnicas. |
| **5** | Inventario | `[data-tour="inventory-reserve-btn"]` | **Reservar Unidad** | Permite bloquear un vehículo para tu cliente mientras formalizas el pago del pie o la aprobación del crédito. |
| **6** | Sidebar | `[data-tour="nav-quotes"]` | **Generador de Cotizaciones** | Crea simulaciones de compra detallando modelo, accesorios, valor de retoma y cuotas para enviar al cliente por WhatsApp o email. |
| **7** | Sidebar | `[data-tour="nav-fi"]` | **Solicitud F&I** | Envía la información financiera de tu cliente al departamento de Crédito y Seguros para su evaluación. |

---

### 3.2 Rol: GERENTE (Gerente de Ventas / Sucursal)
**Enfoque**: Monitoreo de KPIs del equipo, supervisión del stock, aprobación de cotizaciones y flujo financiero de la sucursal.

| Paso | Opciones Ubicación | Elemento Objetivo (Target) | Título Popup | Descripción en Popup |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Dashboard | `[data-tour="dash-metrics"]` | **Métricas Globales Sucursal** | Monitorea el volumen de ventas total, valor del inventario en stock y leads en proceso de todo el equipo de ejecutivos. |
| **2** | Dashboard | `[data-tour="dash-sales-chart"]` | **Rendimiento Comercial** | Analiza la proyección de cierres y compara la tasa de conversión por asesor en tiempo real. |
| **3** | Sidebar | `[data-tour="nav-inventory"]` | **Control de Stock y Precios** | Revisa días en stock por unidad, costos y ajusta precios de venta al público según la estrategia de la sucursal. |
| **4** | Inventario | `[data-tour="inventory-add-btn"]` | **+ Ingresar Vehículo** | Carga nuevas unidades recibidas de fábrica o retomas con VIN, fotos y características técnicas. |
| **5** | Sidebar | `[data-tour="nav-kanban"]` | **Supervisión de Pipeline** | Observa el flujo de trabajo de todos los vendedores, identifica cuellos de botella y reasigna prospectos estancados. |
| **6** | Sidebar | `[data-tour="nav-fi"]` | **Monitoreo de Créditos F&I** | Evalúa el estado de las aprobaciones bancarias de la sucursal y la penetración de financiamiento. |
| **7** | Sidebar | `[data-tour="nav-security"]` | **Auditoría y Permisos** | Visualiza el registro de auditoría del sistema para validar cambios de estado y accesos del personal. |

---

### 3.3 Rol: ADMIN (Administrador del Sistema / Superuser)
**Enfoque**: Configuración global, seguridad RBAC, gestión multi-tenant y administración de cuentas de usuario.

| Paso | Opciones Ubicación | Elemento Objetivo (Target) | Título Popup | Descripción en Popup |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Navbar | `[data-tour="user-selector"]` | **Simulador de Roles** | Permite cambiar instantáneamente entre perfiles para validar la visibilidad y permisos del sistema. |
| **2** | Sidebar | `[data-tour="tenant-badge"]` | **Aislamiento Multi-Tenant** | Garantiza la separación estricta de esquemas de datos por sucursal u organización (`tenant_origen`). |
| **3** | Sidebar | `[data-tour="nav-security"]` | **Módulo de Seguridad RBAC** | Gestiona los permisos por rol, administra usuarios y consulta la matriz de control de accesos (Alpha 0.0.1). |
| **4** | Seguridad | `[data-tour="rbac-matrix"]` | **Matriz de Permisos** | Opciones para conceder o revocar permisos específicos (Crear, Editar, Eliminar, Ver) por cada módulo del ERP. |
| **5** | Seguridad | `[data-tour="audit-log"]` | **Registro de Auditoría** | Traza de eventos en tiempo real: inicios de sesión, cambios de precio, eliminación de datos e IP de origen. |
| **6** | Navbar | `[data-tour="sys-settings"]` | **Configuración General** | Parámetros globales del sistema, integraciones API y marcas soportadas. |

---

### 3.4 Rol: F_AND_I (Ejecutivo de Financiamiento y Seguros)
**Enfoque**: Gestión de carpetas crediticias, evaluación de riesgos, simulación de tasas y venta de intangibles (seguros, garantías).

| Paso | Opciones Ubicación | Elemento Objetivo (Target) | Título Popup | Descripción en Popup |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Sidebar | `[data-tour="nav-fi"]` | **Panel Financiero F&I** | Centro de control de solicitudes de crédito automotriz recibidas desde la fuerza de ventas. |
| **2** | Módulo F&I | `[data-tour="fi-pending-table"]` | **Solicitudes Pendientes** | Revisa carpetas de clientes con antecedentes comerciales listos para enviar a financieras o bancos. |
| **3** | Módulo F&I | `[data-tour="fi-approval-actions"]` | **Aprobar / Rechazar Crédito** | Actualiza el dictamen de las entidades financieras y adjunta cartas de aprobación con sus condiciones. |
| **4** | Sidebar | `[data-tour="nav-inventory"]` | **Consulta de Garantías y Valor** | Verifica los valores comerciales y equipamiento de las unidades para el cálculo del pie mínimo y seguro. |
| **5** | Módulo F&I | `[data-tour="fi-insurance-calc"]` | **Cotizador de Seguros** | Agrega pólizas de seguro automotriz y accesorios financiados al paquete final del cliente. |

---

### 3.5 Rol: BDC (Business Development Center / Recepción)
**Enfoque**: Primer contacto con clientes, recepción de llamadas, gestión de prospectos digitales y derivación oportuna.

| Paso | Opciones Ubicación | Elemento Objetivo (Target) | Título Popup | Descripción en Popup |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Sidebar | `[data-tour="nav-bdc"]` | **Recepción & BDC** | Panel para registrar contactos telefónicos, consultas de sitio web y visitas presenciales al showroom. |
| **2** | Módulo BDC | `[data-tour="bdc-new-contact"]` | **+ Registrar Contacto** | Ingresa los datos del prospecto, origen de la consulta (Web, Portal, Llamada) y modelo de interés. |
| **3** | Módulo BDC | `[data-tour="bdc-assign-seller"]` | **Asignación de Asesor** | Asigna el prospecto al vendedor en turno o según disponibilidad en la sucursal. |
| **4** | Sidebar | `[data-tour="nav-inventory"]` | **Disponibilidad Rápida** | Responde consultas inmediatas de clientes sobre disponibilidad de color, versión o stock inmediato. |
| **5** | Sidebar | `[data-tour="nav-kanban"]` | **Seguimiento de Asignados** | Verifica si el vendedor contactó al lead dentro del tiempo SLA establecido. |

---

### 3.6 Roles Operativos: MARKETING y TALLER
**Enfoque**: Consulta de stock, preparación de unidades y seguimiento de campañas.

| Paso | Opciones Ubicación | Elemento Objetivo (Target) | Título Popup | Descripción en Popup |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Sidebar | `[data-tour="nav-dashboard"]` | **Resumen Operativo** | Visualización general del movimiento de inventario. |
| **2** | Sidebar | `[data-tour="nav-inventory"]` | **Inventario y Estados** | *Marketing*: Extrae fotografías y specs para campañas. <br>*Taller*: Actualiza estado de preparación, inspección pre-entrega y detalles mecánicos. |

---

## 4. Especificaciones de Diseño para la Interfaz (UI/UX)

```
       +---------------------------------------------+
       | Paso 2 de 5                       [ X ]     |
       |                                             |
       |  Pipeline de Ventas                         |
       |  Arrastra y gestiona tus prospectos a       |
       |  través del embudo comercial.               |
       |                                             |
       |  [Anterior]                 [Siguiente >]   |
       +---------------------------------------------+
                             \/ (Flecha apuntando al botón)
              [ Button: Pipeline Ventas ]
```

* **Estilo Visual**: Panel translúcido (*glassmorphic dark theme*) consistente con la interfaz (`bg-slate-900/95`, `border-sky-500/40`, `shadow-2xl shadow-sky-500/20`).
* **Resaltado de Elemento (Backdrop Overlay)**: Oscurecimiento leve del fondo con un halo brillante (`ring-2 ring-sky-400 animate-pulse`) alrededor del botón u opción enfocada.
* **Superposición z-index**: `z-50` para asegurar que el popup quede sobre modales o tablas.
* **Animaciones**: Transición suave fade/bounce al cambiar de paso (`transition-all duration-300`).

---

## 5. Próximos Pasos Recomendados

1. **Revisión y Ajuste de Textos**: Confirmar si los términos comerciales y de flujo coinciden con la terminología operativa deseada.
2. **Identificadores `data-tour`**: Agregar atributos `data-tour="..."` en los componentes de la aplicación (`Sidebar.jsx`, `Navbar.jsx`, `Inventory.jsx`, etc.).
3. **Componente Reutilizable `<OnboardingTour />`**: Crear la lógica de estado y navegación en React utilizando los datos expuestos en esta documentación.

---
*Documentación inicial generada para CRM Automotora ERP. Abierta a comentarios y modificaciones.*
