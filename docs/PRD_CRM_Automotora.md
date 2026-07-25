# Product Requirements Document (PRD): CRM Integral para Automotoras

## 1. Visión y Resumen Ejecutivo

**La Idea Principal:**
> "Toda tu operación en un solo lugar. Un sistema integral que reemplaza las hojas de cálculo y los programas dispersos por una única plataforma."

**Visión del Producto:**
Crear el sistema operativo definitivo para automotoras y concesionarios. Una plataforma centralizada que automatice las tareas repetitivas (como el llenado de fichas o tasaciones), empodere a los equipos de ventas con inteligencia de mercado, y brinde una experiencia transparente y moderna tanto al comprador final como al dueño que deja su auto en consignación.

---

## 2. Perfiles de Usuario (User Personas)

Para que el CRM sea exitoso, debe resolver los dolores de los siguientes usuarios:

1. **El Gerente / Dueño de la Automotora:** Necesita visibilidad completa del negocio, control de inventario, rentabilidad y rendimiento del equipo de ventas.
2. **El Asesor Comercial (Vendedor):** Necesita herramientas rápidas para cerrar ventas, acceso rápido a la información de los autos, y no perder tiempo llenando planillas.
3. **El Equipo de Marketing:** Requiere datos segmentados para enviar campañas precisas sin depender del equipo de TI.
4. **El Consignatario (Cliente Externo):** La persona que deja su auto a la venta. Necesita tranquilidad, transparencia y actualizaciones de estado sin tener que llamar por teléfono.
5. **El Encargado de F&I (Finanzas y Seguros):** Gestiona las solicitudes de financiamiento con bancos y financieras (BCI, Santander, Forum, Tanner), estructura los negocios con las mejores condiciones crediticias, y administra los seguros asociados a cada venta.
6. **El Jefe de Taller / Service Advisor:** Responsable de la preparación de vehículos para la venta (PDI), la recepción de vehículos en taller, la gestión de órdenes de trabajo y la coordinación de los técnicos mecánicos.
7. **El Recepcionista / Agente BDC:** Primer punto de contacto con los clientes. Captura leads telefónicos y presenciales, califica prospectos, agenda citas y test drives, y asegura que ningún lead quede sin atender.
8. **El Comprador (Cliente Final):** La persona que busca comprar un vehículo. Necesita transparencia en la información, opciones de financiamiento claras, y una experiencia digital fluida desde la cotización hasta la entrega.
9. **El Administrador del Sistema:** Responsable de la configuración técnica del CRM, gestión de usuarios y roles, integraciones con servicios externos, y mantenimiento de la plataforma.

---

## 2.3 Matriz de Permisos (RBAC)

| Recurso / Acción | ADMIN | GERENTE | VENDEDOR | MARKETING | F&I | TALLER | BDC |
|---|---|---|---|---|---|---|---|
| **Usuarios** — Crear/Editar/Desactivar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard** — Ver métricas globales | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard** — Ver métricas propias | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Vehículos** — Crear/Editar ficha | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Vehículos** — Eliminar/Archivar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Vehículos** — Ver precio de compra/tasación | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Vehículos** — Ver precio de venta público | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Leads** — Ver todos | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Leads** — Ver propios | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Leads** — Reasignar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Leads** — Crear/Capturar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Clientes** — Ver todos | ✅ | ✅ | ❌ | ✅ (solo contacto) | ✅ (solo financiamiento) | ❌ | ✅ |
| **Clientes** — Ver propios | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Cotizaciones** — Crear/Enviar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Ventas** — Registrar cierre | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Ventas** — Anular | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Ventas** — Ver rentabilidad/margen | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Comisiones** — Configurar reglas | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Comisiones** — Ver propias | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Comisiones** — Aprobar/Pagar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tasaciones** — Solicitar | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Tasaciones** — Aprobar/Rechazar/Modificar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Financiamiento** — Gestionar solicitudes | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Financiamiento** — Comparar ofertas financieras | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Seguros** — Cotizar/Gestionar | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Órdenes de Trabajo** — Crear/Gestionar | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Órdenes de Trabajo** — Ver estado | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **PDI (Pre-Delivery)** — Gestionar checklist | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Presupuestos Taller** — Crear/Enviar | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Citas/Agenda** — Gestionar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Campañas Marketing** — CRUD completo | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Segmentos** — Crear/Editar | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Reportes** — Generar/Exportar | ✅ | ✅ | ❌ | ✅ (solo marketing) | ✅ (solo financiamiento) | ✅ (solo taller) | ❌ |
| **Consignación** — Gestionar contratos | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Servicios Complementarios** — Configurar | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Audit Log** — Consultar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configuración del sistema** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2.5 Glosario de Términos del Negocio

| Término | Definición |
|---|---|
| **Consignación** | Modalidad donde un particular deja su auto en la automotora para que lo vendan en su nombre, a cambio de una comisión. |
| **Tasación** | Proceso de valorar económicamente un vehículo usado, considerando su estado, kilometraje, año, y precios de mercado. |
| **Patente** | Placa de identificación del vehículo (equivalente a "matrícula" en otros países). En Chile, formato XXXX-00. |
| **VIN** | Vehicle Identification Number. Código alfanumérico de 17 caracteres único a nivel mundial que identifica un vehículo. |
| **Prenda** | Gravamen legal sobre un vehículo que impide su venta o transferencia hasta que se libere (generalmente asociado a un crédito). |
| **Pie** | Monto inicial que paga el comprador al adquirir un vehículo a crédito (equivalente a "enganche" en México o "entrada" en Argentina). |
| **Crédito Inteligente** | Tipo de financiamiento automotriz con cuotas bajas y un "valor futuro garantizado" (VFG) al final del plazo. |
| **Padrón** | Documento oficial que certifica la propiedad del vehículo y sus características técnicas. |
| **Revisión Técnica** | Inspección obligatoria periódica que certifica las condiciones mecánicas y de seguridad del vehículo. |
| **Permuta (Trade-in)** | Cuando el comprador entrega su auto usado como parte del pago de un vehículo nuevo o seminuevo. |
| **Lead** | Prospecto o potencial comprador que ha mostrado interés en un vehículo. |
| **NPS** | Net Promoter Score. Métrica de satisfacción del cliente en escala 1-10 que mide la probabilidad de recomendar el servicio. |
| **Liquidación** | Documento que detalla el desglose financiero de una venta de consignación: precio, comisión, gastos e impuestos. |
| **Seña / Reserva** | Pago parcial que realiza el comprador para asegurar un vehículo mientras completa la transacción. |

---

## 3. Requerimientos Funcionales (Core Features)

El sistema se divide en los siguientes grandes módulos (Epics):

### Epic 1: Adquisición, Tasación e Inventario
*Todo el ciclo desde que un auto es evaluado hasta que ingresa al salón de ventas.*

*   **Ficha Técnica Automatizada:**
    *   **Reconocimiento de Matrícula/Patente:** Al ingresar la patente, el sistema consulta bases de datos oficiales y autocompleta marca, modelo, año, motor, VIN y especificaciones técnicas.
    *   **Ahorro de tiempo:** Elimina el ingreso manual y los errores de tipeo.
*   **Tasación Instantánea:**
    *   **Motor de valoración:** Cruzamiento de datos del vehículo con precios de mercado en tiempo real.
    *   **Comparativa:** Muestra precios de publicación de modelos similares en portales de venta actuales.
    *   **Historial del vehículo:** Integración con reportes (tipo Autofact, Carfax) para saber si tiene multas, prendas o choques.
*   **Trazabilidad Completa de Vehículos:**
    *   Expediente digital único por auto.
    *   Registro de todos los estados: *En evaluación -> En taller/preparación -> En salón (Disponible) -> Reservado -> Vendido.*
    *   Almacenamiento de documentos asociados (contratos de compra, fotos, padrón, revisiones técnicas).

### Epic 2: Gestión Integral de Compra y Venta (Core CRM)
*El corazón de la operación comercial.*

*   **Embudo de Ventas (Pipeline):** Tablero visual (Kanban) con el estado de cada cliente potencial (Lead, Contactado, Visita Agendada, Negociación, Cierre).
*   **Gestión de Tareas y Recordatorios:** Alertas automáticas para que el vendedor haga seguimiento ("Llamar a Juan por el SUV").
*   **Generador de Cotizaciones:** Creación de PDFs dinámicos con la ficha del auto, fotos y opciones de financiamiento en 1 clic.

### Epic 3: Marketing Inteligente y Automatización
*Maximizar el uso de la base de datos de clientes.*

*   **Segmentación de Audiencia Avanzada:** Filtros como "Clientes buscando SUVs entre $10k-$15k", "Familias", "Personas que cotizaron hace 6 meses y no compraron".
*   **Detección de "Clientes Gemelos" (Lookalike):** Algoritmo que identifica clientes en la base de datos que tienen un perfil de compra similar al de un cliente que acaba de comprar, para ofrecerles vehículos similares.
*   **Campañas Automatizadas (Email / SMS / WhatsApp):**
    *   Envío de boletines semanales con nuevos ingresos ("Autos que te pueden interesar").
    *   Ofertas por tiempo limitado y seguimiento en tiempo real (Saber si el cliente abrió el correo o hizo clic en un auto).

### Epic 4: Portal y Notificaciones para Consignatarios
*Fidelización del proveedor de vehículos.*

*   **Notificaciones en Tiempo Real:** Alertas automáticas (WhatsApp o Email) cada vez que el auto tiene una novedad: "Tu auto ya está publicado", "Tu auto fue mostrado a 3 clientes esta semana", "¡Tenemos una oferta!".
*   **Portal de Transparencia (Opcional a futuro):** Un enlace web único donde el dueño puede ver las estadísticas de su auto en tiempo real (visitas en la web, ofertas recibidas).

---

## 4. Requerimientos No Funcionales y Técnicos

### 4.1 Integraciones a APIs de Terceros (Cruciales)
*   **Datos de Vehículos:** API del Registro Civil de Chile o Autofact para decodificar patentes y VINs.
*   **Tasación:** APIs o scraping ético de portales como Chileautos, MercadoLibre y Kavak para promediar precios de mercado.
*   **Comunicaciones:** WhatsApp Business API (para mensajes transaccionales y campañas), SendGrid o Resend (para campañas de email marketing).
*   **Pagos Online:** Webpay (Transbank) y MercadoPago para reservas con seña.
*   **Firma Electrónica:** Firma.cl o DocuSign para contratos de consignación digitales.

### 4.2 Stack Tecnológico Definitivo
| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Next.js (React) | SSR para catálogo público (SEO), SPA para CRM interno |
| Estilos | Tailwind CSS | Desarrollo rápido, Mobile-First, design system consistente |
| Estado global | Zustand | Ligero, simple, sin boilerplate |
| Backend | FastAPI (Python) | Alto rendimiento, tipado con Pydantic, documentación automática (OpenAPI) |
| Base de datos | PostgreSQL | Integridad transaccional, soporte JSON, Row-Level Security |
| Caché / Tiempo Real | Redis + WebSockets | Notificaciones instantáneas, caché de sesiones |
| Cola de tareas | Celery + Redis | Procesamiento asíncrono de campañas, notificaciones y reportes |
| Autenticación | Auth0 | MFA, SSO, RBAC integrado, cumplimiento normativo |
| Almacenamiento | Amazon S3 | Fotos de vehículos, PDFs, contratos digitales |
| Hosting (MVP) | Vercel (Frontend) + Render (Backend) + Supabase (DB) | Bajo costo inicial, escalabilidad gradual |
| CI/CD | GitHub Actions | Pipeline automatizado: tests → build → deploy |

### 4.3 Arquitectura
*   **SaaS Multi-Tenant:** Plataforma diseñada para servir a múltiples automotoras con aislamiento de datos por schema de PostgreSQL.
*   **Diseño Mobile-First con soporte offline básico:** PWA con Service Workers para cache de datos críticos (catálogo, fichas de clientes). Sincronización automática cuando se recupera la conexión.
*   **API-First:** Backend expone una API REST documentada con OpenAPI/Swagger. El frontend consume esta API exclusivamente.

### 4.4 Seguridad de la Información
*   Cifrado TLS 1.3 en tránsito y AES-256 en reposo.
*   Cifrado a nivel de columna para datos sensibles (RUT, documentos de identidad) con `pgcrypto`.
*   RBAC (Role-Based Access Control) con Row-Level Security en PostgreSQL.
*   MFA obligatorio para roles Gerente, Admin y F&I.
*   Cumplimiento de la Ley 19.628 de Protección de Datos Personales (Chile).

### 4.5 Rendimiento y SLAs
| Métrica | Objetivo |
|---|---|
| Tiempo de respuesta API (p95) | < 500ms |
| Tiempo de carga del dashboard | < 3 segundos |
| Uptime mensual | 99.5% (MVP) → 99.9% (producción) |
| Usuarios concurrentes (MVP) | 50 |
| Usuarios concurrentes (escala) | 500+ |
| RPO (Recovery Point Objective) | 5 minutos |
| RTO (Recovery Time Objective) | 2 horas |

### 4.6 Supuestos y Restricciones
*   Se asume operación inicial en Chile. Las integraciones (APIs de patentes, Webpay, Firma.cl) son específicas para este mercado.
*   El sistema NO incluye facturación electrónica (SII). Se integra con sistemas de facturación externos.
*   El sistema NO es un ERP completo. No gestiona contabilidad, nómina ni inventario de repuestos.
*   Se asume que cada automotora tiene entre 1-50 usuarios y hasta 500 vehículos en inventario simultáneo.

---

## 5. Fases de Desarrollo (Roadmap) con Mapeo de Casos de Uso

### Fase 1: MVP — "Ordenando la casa" (8-12 semanas)
*Objetivo: Reemplazar las hojas de cálculo. Gestión básica funcional.*

| Módulo | Casos de Uso | Descripción |
|---|---|---|
| Autenticación | CU 6.1, CU 6.2 | Login, MFA, gestión de usuarios y roles |
| Inventario | CU 2.1 (manual) | Ingreso de vehículos con ficha manual, estados y trazabilidad |
| Pipeline | CU 2.2, CU 2.7 | Kanban de ventas, cierre y registro formal de venta |
| Cotizaciones | CU 2.3 | Generación de cotización PDF/web con opciones de pago |
| Dashboard | CU 1.1 (básico) | Panel con métricas esenciales: stock, leads activos, ventas del mes |
| F&I (básico) | CU 6.1 | Recepción y seguimiento de solicitudes de financiamiento |
| BDC | CU 8.1 | Captura y calificación inicial de leads |

### Fase 2: Automatización y Experiencia del Cliente (6-8 semanas)
*Objetivo: Integrar APIs externas y mejorar la experiencia del comprador y consignatario.*

| Módulo | Casos de Uso | Descripción |
|---|---|---|
| Inventario inteligente | CU 2.1 (con API), CU 1.2 | Autocompletado por patente, tasación con aprobación |
| Gestión de leads | CU 1.3 | Reasignación de leads, alertas de inactividad |
| Test drives | CU 2.4 | Agenda, calendario, recordatorios automáticos |
| Catálogo público | CU 2.6, CU 3.1 | Catálogo móvil, cotización interactiva para el comprador |
| Reservas | CU 3.3 | Reserva online con pago de seña |
| Consignatario | CU 5.1 | Portal de transparencia con estado del auto |
| Taller | CU 7.1, CU 7.3 | Recepción de vehículos y checklist PDI |
| BDC avanzado | CU 8.2, CU 8.3 | Gestión de agenda y seguimiento de leads no contactados |
| F&I avanzado | CU 6.2 | Comparador de ofertas financieras |

### Fase 3: Operación Completa (6-8 semanas)
*Objetivo: Cubrir todo el ciclo de vida, desde la compra hasta el post-venta.*

| Módulo | Casos de Uso | Descripción |
|---|---|---|
| Comisiones | CU 1.4 | Cálculo automático, reportes exportables |
| Reportes | CU 1.5, CU 1.6 | Reportes de inventario, margen, proyección de compras |
| Post-venta | CU 2.5, CU 3.4, CU 3.5 | Seguimiento de trámites, encuestas NPS |
| Financiamiento | CU 3.6 | Simulador de crédito, solicitud de pre-aprobación |
| Consignación avanzada | CU 5.2, CU 5.3 | Firma digital, liquidación de ventas, historial de pagos |
| Taller avanzado | CU 7.2, CU 7.4 | Gestión completa de órdenes de trabajo y presupuestos |
| Seguros | CU 6.3 | Gestión de seguros asociados a ventas |

### Fase 4: Marketing y Escala (6-8 semanas)
*Objetivo: Maximizar el valor de la base de clientes y escalar el negocio.*

| Módulo | Casos de Uso | Descripción |
|---|---|---|
| Campañas | CU 4.1, CU 4.3 | Campañas multicanal, métricas de rendimiento |
| Segmentación | CU 4.2, CU 3.2 | Segmentos avanzados, "Clientes Gemelos" (Lookalike) |
| Onboarding multi-tenant | — | Panel de administración SaaS, billing, onboarding de nuevas automotoras |

---

## 6. Métricas de Éxito (KPIs) del Producto

| KPI | Baseline estimado | Meta MVP (3 meses) | Meta Escala (12 meses) | Método de medición |
|---|---|---|---|---|
| Tiempo de ingreso de vehículo | ~15 min (manual en planilla) | < 5 min | < 2 min (con API) | Timestamp entre creación y publicación del vehículo |
| Tasa de conversión de leads | ~5% (sin seguimiento formal) | 10% | 15% | Leads CERRADO_GANADO / Total Leads creados |
| Rotación de inventario (días promedio) | ~60 días | 45 días | 30 días | Promedio de (fecha_venta - fecha_ingreso) |
| NPS del Consignatario | Sin medir | 7/10 | 8.5/10 | Promedio de encuestas de consignatarios |
| Adopción del sistema (DAU) | 0 | 80% de vendedores usan el CRM diariamente | 95% | Usuarios únicos activos / Total usuarios |
| Tasa de respuesta a campañas | Sin medir | 20% apertura email | 30% apertura email | Métricas de SendGrid / WhatsApp |
