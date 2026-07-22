# CRM Integral para Automotoras (ERP Automotriz Multi-Tenant)

> Sistema operativo integral para automotoras y concesionarios que automatiza el inventario, decodificación de patentes, pipeline Kanban de ventas, cotizaciones financieras y módulo F&I.

---

## 🚀 Módulos Implementados en Fase 1 (MVP)

1. **Dashboard Operativo y KPIs en Tiempo Real:** Stock total, disponibles en salón, leas activos, ventas del mes en $CLP y tasa de conversión.
2. **Inventario de Vehículos con Ficha Técnica Digital:** Ficha completa de vehículos, fotos, datos de motor/transmisión, consulta por patente (API / simulación), historial legal (multas/prendas) y matriz RBAC de precios.
3. **Pipeline Kanban Comercial de Ventas:** Tablero Kanban interactivo con 6 etapas (`NUEVO`, `CONTACTADO`, `TEST_DRIVE_AGENDADO`, `NEGOCIACION`, `RESERVADO`, `CERRADO_GANADO`) y registro de motivo de pérdida.
4. **Generador de Cotizaciones Financieras:** Calculadora de crédito automotriz en tiempo real con pie %, cuotas (12 a 60 meses), tasa de interés, seguro automotriz opcional y formato imprimible para PDF.
5. **F&I (Finanzas & Seguros):** Seguimiento de solicitudes de crédito con financieras (Forum, BCI, Tanner, Santander).
6. **BDC & Recepción:** Formulario de captura rápida de prospectos telefónicos y presenciales por recepcionistas.
7. **Control de Acceso RBAC & Multi-Tenant:** Selector de roles en tiempo real (`ADMIN`, `GERENTE`, `VENDEDOR`, `F_AND_I`, `BDC`).

---

## 🛠️ Stack Tecnológico

- **Backend:** Python 3.14 + FastAPI + SQLAlchemy ORM + SQLite / PostgreSQL + Pytest + JWT Auth.
- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons + Design System Glassmorphic Mobile-First.

---

## 💻 Instrucciones para Ejecutar Localmente

### 1. Backend (FastAPI)
```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual e instalar dependencias
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Ejecutar servidor FastAPI
uvicorn app.main:app --reload --port 8000
```
- La documentación interactiva OpenAPI/Swagger estará disponible en: `http://localhost:8000/docs`
- La base de datos SQLite `automotora_crm.db` se creará y poblará automáticamente con datos semilla al iniciar.

### 2. Pruebas Automatizadas Backend
```bash
python -m pytest tests/test_api.py
```

### 3. Frontend (React + Vite)
```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```
- La aplicación web estará disponible en `http://localhost:3000`

---

## 📜 Credenciales de Usuarios Demo (Simulación de Roles)

| Rol | Email | Contraseña |
|---|---|---|
| **Admin** | `admin@automotoralascondes.cl` | `Admin123!` |
| **Gerente** | `gerente@automotoralascondes.cl` | `Gerente123!` |
| **Vendedor** | `vendedor1@automotoralascondes.cl` | `Vendedor123!` |
| **F&I Asesor** | `fi@automotoralascondes.cl` | `Fi123!` |
| **BDC Recepción** | `bdc@automotoralascondes.cl` | `Bdc123!` |
