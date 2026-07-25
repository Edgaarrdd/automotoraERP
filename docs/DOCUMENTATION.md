# 📚 CRM Automotora ERP — Documentación Técnica & Funcional

Bienvenido a la documentación oficial del sistema **CRM Automotora ERP** (Versión Alpha 0.0.1 a Beta 0.1.0). Este documento describe la arquitectura del sistema, la referencia de API REST, la matriz de seguridad por roles (RBAC), los modelos de base de datos y la guía de inicio rápido para desarrolladores y colaboradores.

---

## 📑 Tabla de Contenidos
1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Matriz de Seguridad & Roles RBAC](#2-matriz-de-seguridad--roles-rbac)
3. [Modelos de Base de Datos (ORM)](#3-modelos-de-base-de-datos-orm)
4. [Referencia de API REST (Backend FastAPI)](#4-referencia-de-api-rest-backend-fastapi)
5. [Módulos del Frontend (React + Tailwind CSS)](#5-módulos-del-frontend-react--tailwind-css)
6. [Guía de Desarrollo, Despliegue y Tests](#6-guía-de-desarrollo-despliegue-y-tests)

---

## 1. Arquitectura del Sistema

El sistema utiliza una arquitectura desvinculada (Decoupled SPA + REST API) con soporte **Multi-Tenant** y persistencia en **SQLite/PostgreSQL**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                   FRONTEND (React 18 + Vite)                │
 │  - UI Glassmorphism con Tailwind CSS                        │
 │  - Onboarding Tour Interactivo por Rol                      │
 │  - Cotizador PDF / Imprimible (@media print)                 │
 └──────────────────────────────┬──────────────────────────────┘
                                │ JWT Authentication & REST JSON
 ┌──────────────────────────────▼──────────────────────────────┐
 │                   BACKEND (FastAPI / Python 3.14)           │
 │  - OAuth2 con Password Hash (Bcrypt) & Tokens JWT           │
 │  - Control de Acceso Basado en Roles (RBAC)                 │
 │  - Motor de Decodificación de Patentes / VIN (Chile)        │
 │  - ORM SQLAlchemy 2.0 con Pydantic V2 Schemas               │
 └──────────────────────────────┬──────────────────────────────┘
                                │ SQLAlchemy ORM
 ┌──────────────────────────────▼──────────────────────────────┐
 │                 BASE DE DATOS (SQLite / PostgreSQL)          │
 │  - Tablas isoladas con `tenant_id`                          │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Matriz de Seguridad & Roles RBAC

El sistema define 8 roles clave para garantizar la segregación de funciones:

| Módulo / Función | ADMIN | GERENTE | VENDEDOR | BDC | F&I | MARKETING | TALLER |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard & Métricas** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gestión Inventario Autos** | ✅ | ✅ | ✅ (Lectura) | ✅ (Lectura) | ✅ (Lectura) | ✅ (Lectura) | ✅ |
| **Pipeline Kanban Ventas** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Agenda & Test Drives** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Cotizador & Generador PDF** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Módulo F&I Financiamiento**| ✅ | ✅ | ✅ (Crear) | ❌ | ✅ (Gestión) | ❌ | ❌ |
| **BDC & Recepción Prospectos**| ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Seguridad & Asignación Roles**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Modelos de Base de Datos (ORM)

Los modelos principales definidos en `backend/app/models.py`:

- **`Tenant`**: Entidad multi-empresa (`id`, `nombre_empresa`, `subdominio`, `plan`, `max_usuarios`, `max_vehiculos`).
- **`User`**: Usuarios y colaboradores (`id`, `tenant_id`, `nombre`, `email`, `password_hash`, `rol`, `activo`).
- **`Customer`**: Clientes y consignatarios (`id`, `nombre_completo`, `rut_dni`, `telefono`, `email`, `tipo`, `origen`).
- **`Vehicle`**: Inventario de vehículos (`id`, `patente`, `vin`, `marca`, `modelo`, `versión`, `año`, `kilometraje`, `tipo_combustible`, `transmision`, `precio_compra_tasacion`, `precio_venta_publico`, `estado`).
- **`LeadOpportunity`**: Pipeline de ventas (`id`, `id_cliente`, `id_vehiculo_interes`, `id_vendedor_asignado`, `estado_embudo`, `score_lead`, `monto_estimado`, `motivo_perdida`).
- **`Quote`**: Cotizaciones emitidas (`id`, `id_lead`, `id_cliente`, `id_vehiculo`, `id_vendedor`, `tipo_financiamiento`, `precio_vehiculo`, `pie_monto`, `monto_financiar`, `cantidad_cuotas`, `valor_cuota_estimado`, `vfg_monto`).
- **`FISolicitud`**: Solicitudes de financiamiento F&I (`id`, `id_cliente`, `id_vehiculo`, `entidad_financiera`, `monto_solicitado`, `pie_porcentaje`, `estado`).
- **`BDCLead`**: Lead de recepción / llamadas (`id`, `nombre_prospecto`, `telefono`, `email`, `origen_contacto`, `score_lead`, `vehiculo_interes`, `estado`).
- **`Appointment`**: Agenda de citas y test drives (`id`, `titulo`, `tipo`, `fecha_inicio`, `fecha_fin`, `id_vendedor`, `id_vehiculo`, `estado`).

---

## 4. Referencia de API REST (Backend FastAPI)

### 🔑 Autenticación (`/api/auth`)
- `POST /api/auth/login`: Autenticación con email/password. Retorna JWT Bearer token y perfil del usuario.
- `GET /api/auth/me`: Retorna los datos del usuario autenticado.

### 🚗 Inventario de Vehículos (`/api/vehicles`)
- `GET /api/vehicles/`: Lista de vehículos con filtros opcionales (`estado`, `search`, `marca`).
- `GET /api/vehicles/{id}`: Obtener detalle de un vehículo.
- `POST /api/vehicles/`: Crear un vehículo en inventario (Roles: ADMIN, GERENTE, VENDEDOR, TALLER).
- `PATCH /api/vehicles/{id}/status`: Actualizar estado (`DISPONIBLE`, `RESERVADO`, `VENDIDO`, `EVALUACION`).
- `GET /api/vehicles/decode/{patente}`: **Decodificador de Patentes Registro Civil / Autofact**. Retorna marca, modelo, VIN, año, tasación sugerida e historial legal.

### 💼 Pipeline de Leads (`/api/leads`)
- `GET /api/leads/`: Obtener pipeline Kanban.
- `POST /api/leads/`: Registrar nueva oportunidad de venta.
- `POST /api/leads/customers`: Registrar o actualizar ficha de cliente.
- `PATCH /api/leads/{id}/stage`: Mover lead de etapa (`NUEVO` ➔ `CONTACTADO` ➔ `TEST_DRIVE_AGENDADO` ➔ `NEGOCIACION` ➔ `RESERVADO` ➔ `CERRADO_GANADO` / `CERRADO_PERDIDO`).

### 📄 Cotizaciones & Imprimible PDF (`/api/quotes`)
- `GET /api/quotes/`: Listar cotizaciones.
- `POST /api/quotes/`: Crear nueva cotización financiera.
- `GET /api/quotes/{quote_id}/pdf-html`: Renderiza el documento imprimible HTML/PDF oficial de la cotización.

### 📅 Agenda & Test Drives (`/api/appointments`)
- `GET /api/appointments/`: Citas comerciales y pruebas de manejo filtradas por rol/vendedor.
- `POST /api/appointments/`: Agendar cita.
- `PATCH /api/appointments/{id}/status`: Marcar cita como `COMPLETADA` o `CANCELADA`.
- `DELETE /api/appointments/{id}`: Eliminar registro de cita.

### 🏦 F&I Financiamiento (`/api/fi`)
- `GET /api/fi/`: Solicitudes a financieras (Forum, Tanner, EuroCapital, Santader Consumer, Autofin).
- `POST /api/fi/`: Crear solicitud F&I.

### 📞 BDC & Recepción (`/api/bdc`)
- `GET /api/bdc/`: Oportunidades captadas en recepción / llamadas entrantes / portales.
- `POST /api/bdc/`: Crear lead BDC.

### 👁️ Portal del Consignatario (`/api/consignments`)
- `GET /api/consignments/`: Listar vehículos consignados con métricas de visibilidad y datos del dueño.
- `GET /api/consignments/{vehicle_id}/summary`: Informe detallado de transparencia (comisión automotora 3%, liquidación neta al dueño, cotizaciones emitidas, test drives e historial).

### 🏆 Liquidación de Comisiones & Reportes (`/api/commissions`)
- `GET /api/commissions/summary`: Resumen acumulado mensual por vendedor (ventas totales, margen bruto, comisión base 1.5%, bono crédito F&I $50.000 y total a liquidar).
- `PATCH /api/commissions/{vendedor_id}/status`: Aprobar o actualizar el estado de pago de liquidación de sueldo comercial.

---

## 5. Módulos del Frontend (React + Tailwind CSS)

1. **Dashboard:** Métricas comerciales en tiempo real, accesos rápidos y estado del stock.
2. **Inventario Autos:** Catálogo visual con tarjetas glassmorphic, modal de detalle, cambio de estado y decodificador de patentes.
3. **Pipeline Ventas (Kanban):** Tablero arrastrable por etapas de conversión con modal de motivo de pérdida.
4. **Portal del Consignatario:** Ficha de transparencia comercial, desglose de liquidación neta al dueño y línea de tiempo del vehículo.
5. **Comisiones Ventas:** Módulo de liquidación de sueldos comerciales con cálculo de comisión base (1.5%), bonos F&I y aprobación de pago.
6. **Agenda & Test Drives:** Calendario de citas por tipo (Test Drive, Entrega Auto, Negociación, PDI) y estado.
7. **Cotizador PDF:** Simulador financiero dinámico con pie %, cuotas, Tasa de Interés, VFG Crédito Inteligente e impresión limpia `@media print`.
8. **F&I Financiamiento:** Módulo de gestión de solicitudes a entidades crediticias.
9. **BDC & Recepción:** Captura rápida de prospectos y asignación a vendedores.
10. **Seguridad & Roles:** Matriz interactiva RBAC y cambiador rápido de usuario para testing.
11. **Onboarding Tour:** Tour interactivo guiado por cada rol usando `driver.js`.
12. **Portal de Documentación (`DocsSection`):** Interfaz para consultar la documentación directamente desde la aplicación.
13. **CMS Storefront ("Mi Sitio Web"):** Módulo administrativo para configurar y gestionar el sitio web público de la automotora (branding, publicación de vehículos, analíticas web).

---

## 7. Documentación del Módulo CMS Storefront

El módulo CMS Storefront es un producto complementario que permite a cada automotora crear su propio sitio web público de catálogo de vehículos, conectado en tiempo real al ERP.

- **Casos de Uso (16 CU):** Ver `CASOS_USO_CMS_STOREFRONT.md` — Define los 16 casos de uso del módulo (CU 9.1 a CU 9.16).
- **Documentación Técnica:** Ver `DOCUMENTACION_TECNICA_CMS_STOREFRONT.md` — Arquitectura híbrida, modelo de datos, endpoints API, seguridad y roadmap.

---

## 6. Guía de Desarrollo, Despliegue y Tests

### Requisitos Previos
- Python 3.10+
- Node.js 18+

### Iniciar Backend (FastAPI)
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
- Documentación Swagger interactiva: `http://localhost:8000/docs`

### Ejecutar Pruebas Automatizadas (Pytest)
```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests/test_api.py
```

### Iniciar Frontend (Vite + React)
```bash
cd frontend
npm run dev
```
- Aplicación disponible en: `http://localhost:5173`
