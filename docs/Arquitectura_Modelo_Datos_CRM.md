# Arquitectura y Modelo de Datos: CRM Automotora

Este documento detalla las decisiones técnicas, el stack tecnológico recomendado y el modelo de datos completo (diagrama Entidad-Relación lógico) necesario para soportar la totalidad de los casos de uso y el PRD del CRM.

---

## 1. Stack Tecnológico Sugerido

### Frontend (Aplicación Web & Móvil)
*   **Framework Core:** Next.js (React). Permite excelente rendimiento (SEO para el catálogo público y velocidad para el CRM interno).
*   **Estilos:** Tailwind CSS para un diseño moderno y adaptable a pantallas de celulares (Mobile-First, crucial para vendedores en terreno).
*   **Estado Global:** Zustand.

### Backend y Base de Datos
*   **Entorno:** Python (FastAPI). Framework de alto rendimiento, tipado y con generación automática de documentación OpenAPI.
*   **Base de Datos Principal:** PostgreSQL. Al ser relacional, es ideal para mantener la integridad transaccional entre clientes, autos, cotizaciones y ventas.
*   **Caché / Tiempo Real:** Redis y WebSockets (Socket.io) para habilitar las alertas y notificaciones instantáneas.
*   **Cola de Tareas (Task Queue):** Celery (con Redis como broker) para procesamiento asíncrono de campañas de marketing, envío de notificaciones y reportes programados.

### Infraestructura y Despliegue
*   **Hosting:** AWS o Google Cloud Platform. (Para el MVP, servicios manejados como Vercel para el Frontend, Render para el Backend FastAPI y Supabase para la Base de Datos).
*   **Almacenamiento de Archivos:** Amazon S3 o similar, para guardar las fotografías de los vehículos, PDFs de cotizaciones, contratos digitales y documentos de trámites.
*   **CDN:** CloudFront o Cloudflare para servir imágenes y assets del catálogo público con baja latencia.

### Testing y Calidad de Software
*Dado que los datos son el activo más crítico del negocio, todas las capas deben estar cubiertas por pruebas automatizadas.*

*   **Pruebas Unitarias y de Integración (Backend):**
    *   *Pytest* — Framework principal para tests unitarios de servicios, endpoints y middlewares.
    *   *Cobertura mínima:* 85% en lógica de negocio (cálculo de comisiones, tasaciones, validaciones de datos).
*   **Pruebas de Base de Datos:**
    *   *TestContainers* — Levanta contenedores PostgreSQL efímeros para pruebas de integración reales contra la BD sin datos de producción.
    *   *Factory Boy* — Generación de datos de prueba (fixtures) para escenarios complejos (ej: un lead con 3 cotizaciones, 2 test drives y una venta).
*   **Pruebas de API (Contratos):**
    *   *HTTPX + Pytest* — Tests automatizados de endpoints FastAPI que validan schemas de request/response.
    *   *Schemathesis* o *OAS Diff* — Pruebas de contrato contra la especificación OpenAPI para detectar breaking changes.
*   **Pruebas de Frontend:**
    *   *Cypress* o *Playwright* — Tests E2E que simulan el flujo completo del vendedor (ingresar patente → generar cotización → enviar por WhatsApp).
    *   *React Testing Library* — Tests de componentes con foco en comportamiento del usuario, no en implementación.
*   **Pruebas de Carga y Estrés:**
    *   *k6 (Grafana)* — Simulación de 500+ vendedores consultando el dashboard simultáneamente, y pruebas de resistencia al motor de "Clientes Gemelos" cuando se insertan 10,000 autos de golpe.
*   **CI/CD (Integración Continua):**
    *   *GitHub Actions* o *GitLab CI* — Pipeline que ejecuta tests unitarios → tests de integración → análisis de seguridad → build → deploy.

### Ciberseguridad y Protección de Datos
*Los datos financieros, documentos de identidad y contratos digitales son el activo más sensible. Las siguientes medidas son obligatorias, no opcionales.*

*   **Cifrado de Datos:**
    *   *En tránsito:* TLS 1.3 obligatorio en todas las comunicaciones (Frontend ↔ Backend, Backend ↔ APIs externas).
    *   *En reposo:* Cifrado AES-256 a nivel de disco en PostgreSQL (cloud-managed encryption en AWS RDS / Supabase).
    *   *A nivel de columna:* Datos sensibles (RUT/DNI, documentos de identidad) cifrados con `pgcrypto` (PostgreSQL) o mediante *AWS KMS / Vault* con claves rotadas cada 90 días.
*   **Autenticación y Control de Acceso:**
    *   *Auth0* — Proveedor de identidad con soporte para MFA (Autenticación Multifactor) obligatorio para Gerentes y Marketing.
    *   *RBAC (Role-Based Access Control)* — Middleware que verifica `rol` del usuario en cada request. Un vendedor NO puede ver la rentabilidad neta ni los datos de clientes de otros vendedores.
    *   *Atributos de Seguridad por Fila (Row-Level Security - RLS):* PostgreSQL RLS activado para que un vendedor solo vea sus propios `Leads_Oportunidades` y `Clientes` asignados, incluso si consulta directamente la BD.
*   **Protección contra Ataques Comunes:**
    *   *Rate Limiting:* Middleware (slowapi) que limita a 100 requests/minuto por IP en endpoints públicos (catálogo, login) y 1000 req/min en APIs internas.
    *   *OWASP Top 10:* Validación estricta de inputs (Pydantic), protección contra SQL Injection (ORM Parameterized Queries con SQLAlchemy), XSS (DOMPurify), CSRF (tokens síncronos).
    *   *WAF (Web Application Firewall):* AWS WAF o Cloudflare WAF para bloquear patrones maliciosos antes de que lleguen al backend.
*   **Gestión de Secretos y Variables de Entorno:**
    *   *HashiCorp Vault* o *AWS Secrets Manager* — Almacenamiento centralizado de API keys (Twilio, SendGrid, Autofact), claves de cifrado y credenciales de BD. Jamás en el código fuente o en variables de entorno del servidor.
*   **Auditoría y Trazabilidad de Acceso a Datos:**
    *   *Tabla de Auditoría (Audit Log):* Trigger en PostgreSQL que registra cada operación `INSERT`, `UPDATE`, `DELETE` sobre tablas sensibles (`Clientes`, `Vehículos`, `Contratos_Consignacion`) en una tabla `audit_log` inmutable, con timestamp, usuario, acción y valores antiguos/nuevos.
    *   *Ejemplo:* Si un vendedor accede al perfil de un cliente que no es suyo, queda registrado.
*   **Backup y Disaster Recovery:**
    *   *Backups automáticos:* Snapshots diarios de PostgreSQL + WAL streaming continuo (Point-In-Time Recovery) con retención de 30 días.
    *   *Backups cifrados:* Los backups se almacenan en bucket S3 cifrado con una clave KMS separada, en una región diferente a la base de datos principal.
    *   *DRP (Disaster Recovery Plan):* RPO (Recovery Point Objective) de 5 minutos, RTO (Recovery Time Objective) de 2 horas. Réplica en espera (read replica) en otra zona de disponibilidad.
*   **Cumplimiento Normativo y Privacidad:**
    *   *Ley de Protección de Datos Personales (Ley 19.628 en Chile, LGPD en Brasil, GDPR si aplica):* El sistema debe permitir la exportación y eliminación completa de los datos de un cliente (derecho de olvido) en menos de 72 horas.
    *   *Consentimiento explícito:* Checkbox obligatorio al crear un cliente para autorizar el almacenamiento y uso de datos con fines comerciales. Registro en `audit_log` del momento y IP del consentimiento.
    *   *Anonimización de datos:* Para reportes históricos y dashboard, los datos de clientes deben ser anonimizados (hash irreversible del nombre y RUT) después de 2 años de inactividad.
*   **Monitoreo de Seguridad:**
    *   *SIEM (Security Information and Event Management):* Integración con *Datadog / Grafana Loki* para correlacionar logs de acceso, intentos de autenticación fallidos (>5 en 10 minutos → alerta) y accesos fuera del horario laboral.
    *   *Vulnerability Scanning:* Escaneo semanal automatizado con *Snyk* (dependencias) y *Trivy* (contenedores). Escaneo mensual de penetración (pentest) manual.

---

## 1.5 Arquitectura Multi-Tenant

*El sistema está diseñado como SaaS multi-tenant para servir a múltiples automotoras.*

### Estrategia de Aislamiento
*   **Nivel de Base de Datos:** Schema-per-tenant en PostgreSQL. Cada automotora opera en un schema aislado (`tenant_automotora_xyz`), garantizando separación total de datos.
*   **Identificación de Tenant:** Cada request incluye el `tenant_id` extraído del subdominio (ej: `miautomotora.crmauto.cl`) o del JWT token.
*   **Middleware de Tenant:** Todas las queries se ejecutan automáticamente contra el schema del tenant activo. No es posible acceder a datos de otro tenant por error.

### Modelo de Datos Compartido vs. Aislado
| Capa | Estrategia | Justificación |
|---|---|---|
| Usuarios y Auth | Compartida (schema `public`) | Un usuario puede pertenecer a múltiples tenants |
| Datos de negocio | Aislada (schema por tenant) | Privacidad total entre automotoras |
| Configuración del sistema | Compartida | Plantillas, catálogo base de marcas/modelos |

### Entidad Adicional: `Tenants` (schema `public`)
*   `id` (UUID, Primary Key)
*   `nombre_empresa` (String)
*   `subdominio` (String, Unique) — *Ej: "miautomotora"*
*   `logo_url` (String, Nullable)
*   `datos_fiscales` (JSON: `{"rut_empresa": "...", "razon_social": "...", "direccion_fiscal": "...", "giro": "..."}`)
*   `plan` (Enum: "FREE_TRIAL", "BASICO", "PROFESIONAL", "ENTERPRISE")
*   `max_usuarios` (Integer)
*   `max_vehiculos` (Integer)
*   `activo` (Boolean, default: true)
*   `fecha_creacion` (Timestamp)
*   `fecha_expiracion_plan` (Timestamp, Nullable)

---

## 2. Integraciones de Terceros (APIs)

*   **Identificación Vehicular:** API del Registro Civil (si aplica al país) o servicios como Autofact / Carfax para obtener datos técnicos e historial legal a partir de la patente y el VIN.
*   **Comunicaciones:**
    *   *WhatsApp Business API:* Para enviar cotizaciones, notificaciones de campañas y alertas a consignatarios.
    *   *SendGrid / Resend / Mailchimp:* Para campañas de email marketing automáticas.
*   **Tasación de Mercado:** Integración mediante Web Scraping ético o APIs privadas de portales locales (Ej. MercadoLibre, Chileautos) para obtener la media de precios.
*   **Pagos Online:** Webpay, MercadoPago o Stripe para reservas con seña y pagos de servicios.
*   **Firma Electrónica:** DocuSign, Firma.cl o LexSign para contratos de consignación digitales.
*   **Financiamiento:** APIs de entidades financieras o simuladores de crédito automotriz.

---

## 3. Modelo de Datos (Diagrama Lógico Entidad-Relación)

### 3.1 Entidades Principales del Core

#### Entidad: `Usuarios` (Users)
Representa a los empleados de la automotora.
*   `id` (UUID, Primary Key)
*   `nombre` (String)
*   `email` (String, Unique)
*   `password_hash` (String)
*   `telefono` (String)
*   `rol` (Enum: "GERENTE", "VENDEDOR", "MARKETING", "ADMIN", "F_AND_I", "TALLER", "BDC")
*   `id_jefe_directo` (Foreign Key -> `Usuarios.id`, Nullable) — *Auto-referencia para jerarquía*
*   `activo` (Boolean, default: true)
*   `fecha_creacion` (Timestamp)
*   `ultimo_acceso` (Timestamp)
*   `configuracion_comision` (JSON: `{"porcentaje_margen": 3, "bono_meta_mensual": 200, "autos_para_bono": 5}`)

#### Entidad: `Clientes` (Customers / Leads)
Representa a los compradores, consignatarios o ambos.
*   `id` (UUID, Primary Key)
*   `nombre_completo` (String)
*   `rut_dni` (String, Unique, Nullable)
*   `telefono` (String)
*   `email` (String)
*   `direccion` (String, Nullable)
*   `tipo` (Enum: "COMPRADOR", "CONSIGNATARIO", "AMBOS")
*   `origen` (Enum: "WEB", "REFERIDO", "LLAMADA", "CAMPAÑA", "PRESENCIAL")
*   `id_vendedor_asignado` (Foreign Key -> `Usuarios.id`, Nullable)
*   `preferencias_compra` (JSON: `{"tipo_vehiculo": "SUV", "marcas_interes": ["Toyota","Honda"], "presupuesto_max": 15000, "anio_min": 2018}`)
*   `fecha_captacion` (Timestamp)
*   `fecha_ultima_interaccion` (Timestamp)
*   `activo` (Boolean, default: true)
*   `suscripto_marketing` (Boolean, default: true)
*   `notas_internas` (Text, Nullable)

#### Entidad: `Vehículos` (Vehicles)
El inventario de la automotora.
*   `id` (UUID, Primary Key)
*   `patente` (String, Unique)
*   `vin` (String, Unique)
*   `marca` (String)
*   `modelo` (String)
*   `version` (String, Nullable)
*   `año` (Integer)
*   `kilometraje` (Integer)
*   `tipo_combustible` (Enum: "BENCINA", "DIESEL", "ELECTRICO", "HIBRIDO", "GLP")
*   `transmision` (Enum: "MANUAL", "AUTOMATICA", "CVT")
*   `color` (String, Nullable)
*   `motor` (String, Nullable)
*   `num_puertas` (Integer, Nullable)
*   `num_asientos` (Integer, Nullable)
*   `precio_compra_tasacion` (Decimal)
*   `precio_venta_publico` (Decimal)
*   `precio_minimo_venta` (Decimal, Nullable) — *Precio mínimo autorizado por gerente*
*   `estado` (Enum: "EVALUACION", "PREPARACION", "DISPONIBLE", "RESERVADO", "VENDIDO", "ENTREGADO")
*   `id_consignatario` (Foreign Key -> `Clientes.id`, Nullable)
*   `fecha_ingreso` (Timestamp)
*   `fecha_venta` (Timestamp, Nullable)
*   `id_vendedor_vendio` (Foreign Key -> `Usuarios.id`, Nullable)
*   `urls_fotos` (Array de Strings) — *Hasta 20 fotos*
*   `urls_documentos` (Array de Strings) — *Padrón, RT, certificados*
*   `historial_legal` (JSON: `{"multas": false, "prendas": false, "robo": false, "choques_graves": false}`)

---

### 3.2 Entidades del Pipeline Comercial y Seguimiento

#### Entidad: `Leads_Oportunidades` (Pipeline)
Registra la intención de compra de un cliente por un vehículo (tarjeta del Kanban).
*   `id` (UUID, Primary Key)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `id_vehiculo_interes` (Foreign Key -> `Vehiculos.id`, Nullable)
*   `id_vendedor_asignado` (Foreign Key -> `Usuarios.id`)
*   `estado_embudo` (Enum: "NUEVO", "CONTACTADO", "TEST_DRIVE_AGENDADO", "NEGOCIACION", "RESERVADO", "CERRADO_GANADO", "CERRADO_PERDIDO")
*   `motivo_perdida` (String, Nullable) — *Obligatorio si estado = CERRADO_PERDIDO*
*   `fecha_creacion` (Timestamp)
*   `fecha_ultima_interaccion` (Timestamp)
*   `fecha_cierre` (Timestamp, Nullable)
*   `ultimo_recordatorio_enviado` (Timestamp, Nullable)

#### Entidad: `Historial_Vehículo` (Vehicle_History)
Trazabilidad completa de todo lo que le ocurre al auto.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `accion` (String: Ej. "Ingreso a taller", "Cambio de precio", "Reservado por Juan Pérez")
*   `descripcion` (Text, Nullable)
*   `fecha` (Timestamp)
*   `id_usuario_responsable` (Foreign Key -> `Usuarios.id`, Nullable)

#### Entidad: `Historial_Interacciones` (Interaction_Log)
Registro cronológico de todas las comunicaciones con clientes.
*   `id` (UUID, Primary Key)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `id_lead` (Foreign Key -> `Leads_Oportunidades.id`, Nullable)
*   `id_usuario` (Foreign Key -> `Usuarios.id`, Nullable)
*   `tipo` (Enum: "LLAMADA", "EMAIL", "WHATSAPP", "VISITA", "TEST_DRIVE", "COTIZACION_ENVIADA")
*   `direccion` (Enum: "ENTRANTE", "SALIENTE", "AUTOMATICA")
*   `detalle` (JSON: `{"duracion_seg": 120, "resumen": "Cliente interesado en financiamiento", "archivo_url": "..."}`)
*   `fecha` (Timestamp)

#### Entidad: `Cotizaciones` (Quotations)
PDFs o enlaces dinámicos generados para clientes.
*   `id` (UUID, Primary Key)
*   `id_lead` (Foreign Key -> `Leads_Oportunidades.id`)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_vendedor` (Foreign Key -> `Usuarios.id`)
*   `precio_vehiculo` (Decimal)
*   `servicios_incluidos` (JSON: `[{"nombre": "Garantía 12 meses", "precio": 350000}, ...]`)
*   `total` (Decimal)
*   `opciones_financiamiento` (JSON: `[{"tipo": "CONTADO", "total": ...}, {"tipo": "CREDITO_INTELIGENTE", "pie": ..., "cuotas": ..., "valor_cuota": ...}, ...]`)
*   `url_pdf` (String, Nullable)
*   `url_publica` (String, Unique) — *Enlace compartible*
*   `fecha_creacion` (Timestamp)
*   `fecha_expiracion` (Timestamp) — *La cotización expira a los 7 días*

---

### 3.3 Entidades de Servicios y Post-Venta

#### Entidad: `Servicios_Complementarios` (Services_Catalog)
Catálogo configurable por gerente de servicios adicionales.
*   `id` (UUID, Primary Key)
*   `nombre` (String)
*   `descripcion` (Text, Nullable)
*   `costo` (Decimal) — *Lo que paga la automotora*
*   `precio_venta` (Decimal) — *Lo que paga el cliente*
*   `activo` (Boolean, default: true)
*   `icono` (String, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Cotizacion_Servicios` (Quotation_Services)
Relación muchos-a-muchos entre cotizaciones y servicios.
*   `id` (UUID, Primary Key)
*   `id_cotizacion` (Foreign Key -> `Cotizaciones.id`)
*   `id_servicio` (Foreign Key -> `Servicios_Complementarios.id`)
*   `precio_aplicado` (Decimal)

#### Entidad: `Test_Drives` (Test_Drive_Schedule)
Agenda de pruebas de manejo.
*   `id` (UUID, Primary Key)
*   `id_lead` (Foreign Key -> `Leads_Oportunidades.id`)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_vendedor` (Foreign Key -> `Usuarios.id`)
*   `fecha_hora_inicio` (Timestamp)
*   `fecha_hora_fin` (Timestamp)
*   `estado` (Enum: "PROGRAMADO", "CONFIRMADO", "REALIZADO", "NO_SE_PRESENTO", "CANCELADO")
*   `notas_vendedor` (Text, Nullable)
*   `recordatorio_enviado` (Boolean, default: false)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Tramites_PostVenta` (Post_Sale_Processes)
Seguimiento de trámites después de la venta.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `etapa_actual` (Enum: "DOC_RECIBIDA", "TRANSFERENCIA_EN_CURSO", "TRANSFERENCIA_COMPLETADA", "PATENTE_LISTA", "ENTREGADO")
*   `fecha_estimada_termino` (Date, Nullable)
*   `alerta_demorado` (Boolean, default: false)
*   `documentos_asociados` (Array de Strings)
*   `notas_internas` (Text, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Encuestas_Satisfaccion` (Satisfaction_Surveys)
Encuestas NPS y feedback post-venta.
*   `id` (UUID, Primary Key)
*   `id_venta` (Foreign Key -> `Ventas.id`) — *La venta asociada*
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `nps_score` (Integer, 1-10)
*   `comentario` (Text, Nullable)
*   `url_fotos_reclamo` (Array de Strings, Nullable)
*   `fecha_envio` (Timestamp)
*   `fecha_respuesta` (Timestamp, Nullable)
*   `respondida` (Boolean, default: false)

---

### 3.4 Entidades de Financiamiento

#### Entidad: `Solicitudes_Financiamiento` (Financing_Requests)
Solicitudes de crédito generadas por compradores.
*   `id` (UUID, Primary Key)
*   `id_cotizacion` (Foreign Key -> `Cotizaciones.id`)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `tipo_financiamiento` (Enum: "CREDITO_INTELIGENTE", "CREDITO_CONVENCIONAL", "LEASING")
*   `monto_pie` (Decimal)
*   `monto_financiar` (Decimal)
*   `plazo_meses` (Integer)
*   `valor_cuota_estimado` (Decimal)
*   `ingreso_mensual_cliente` (Decimal, Nullable)
*   `estado` (Enum: "BORRADOR", "ENVIADA", "EN_ESTUDIO", "PRE_APROBADA", "APROBADA", "RECHAZADA")
*   `id_institucion_financiera` (String, Nullable) — *Banco o financiera*
*   `id_encargado_fi` (Foreign Key -> `Usuarios.id`, Nullable) — *Encargado de F&I que gestiona la solicitud*
*   `documentacion_completa` (Boolean, default: false)
*   `documentos_pendientes` (JSON, Nullable) — *Ej: ["Liquidación de sueldo", "Certificado de antigüedad"]*
*   `fecha_creacion` (Timestamp)

---

### 3.5 Entidades de Marketing

#### Entidad: `Segmentos_Audiencia` (Audience_Segments)
Segmentos guardados y reutilizables para campañas.
*   `id` (UUID, Primary Key)
*   `nombre` (String)
*   `descripcion` (Text, Nullable)
*   `filtros_config` (JSON: `{"tipo_cliente": ["COMPRADOR"], "marca_interes": ["Toyota"], "presupuesto_min": 5000, "presupuesto_max": 20000, "comprado_antes": false, "dias_ultima_interaccion": 90, "fecha_cumpleanios": true}`)
*   `tamano_estimado` (Integer, Nullable)
*   `id_creador` (Foreign Key -> `Usuarios.id`)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Campanas_Marketing` (Marketing_Campaigns)
Campañas multicanal (email, SMS, WhatsApp).
*   `id` (UUID, Primary Key)
*   `nombre` (String)
*   `canal` (Enum: "EMAIL", "SMS", "WHATSAPP")
*   `id_segmento` (Foreign Key -> `Segmentos_Audiencia.id`)
*   `asunto` (String, Nullable)
*   `contenido_plantilla` (Text) — *Template con variables como {{nombre_cliente}}*
*   `programada_para` (Timestamp, Nullable) — *Null = envío inmediato*
*   `fecha_envio` (Timestamp, Nullable)
*   `estado` (Enum: "BORRADOR", "PROGRAMADA", "ENVIANDO", "ENVIADA", "CANCELADA")
*   `id_creador` (Foreign Key -> `Usuarios.id`)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Metricas_Campana` (Campaign_Metrics)
Métricas de rendimiento por campaña.
*   `id` (UUID, Primary Key)
*   `id_campana` (Foreign Key -> `Campanas_Marketing.id`)
*   `total_enviados` (Integer)
*   `total_entregados` (Integer)
*   `total_abiertos` (Integer)
*   `total_clics` (Integer)
*   `total_bajas` (Integer)
*   `total_conversiones` (Integer) — *Ventas atribuidas a esta campaña*
*   `ingreso_generado` (Decimal, Nullable)
*   `fecha_actualizacion` (Timestamp)

#### Entidad: `Eventos_Campana` (Campaign_Events)
Registro granular de cada acción de un destinatario.
*   `id` (UUID, Primary Key)
*   `id_campana` (Foreign Key -> `Campanas_Marketing.id`)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `evento` (Enum: "ENVIADO", "ENTREGADO", "ABIERTO", "CLIC", "BAJA", "CONVERSION")
*   `url_clic` (String, Nullable)
*   `fecha` (Timestamp)

---

### 3.6 Entidades de Consignación y Pagos

#### Entidad: `Contratos_Consignacion` (Consignment_Contracts)
Contratos digitales firmados con consignatarios.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_consignatario` (Foreign Key -> `Clientes.id`)
*   `id_vendedor` (Foreign Key -> `Usuarios.id`)
*   `precio_minimo_acordado` (Decimal)
*   `comision_automotora` (Decimal) — *Porcentaje o monto fijo*
*   `plazo_dias` (Integer) — *Ej: 60 días*
*   `fecha_inicio` (Date)
*   `fecha_termino` (Date, Nullable)
*   `estado` (Enum: "BORRADOR", "PENDIENTE_FIRMA", "FIRMADO", "VIGENTE", "VENCIDO", "TERMINADO_ANTICIPADO", "LIQUIDADO")
*   `url_contrato_firmado` (String, Nullable)
*   `metodo_firma` (String, Nullable) — *Ej: "DocuSign", "Firma.cl"*
*   `fecha_firma` (Timestamp, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Liquidaciones_Venta` (Sale_Settlements)
Liquidación detallada cuando un vehículo en consignación se vende.
*   `id` (UUID, Primary Key)
*   `id_contrato` (Foreign Key -> `Contratos_Consignacion.id`)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_consignatario` (Foreign Key -> `Clientes.id`)
*   `precio_venta_final` (Decimal)
*   `comision_automotora` (Decimal)
*   `gastos_administrativos` (Decimal)
*   `impuestos_aplicados` (Decimal)
*   `monto_neto_consignatario` (Decimal)
*   `estado_pago` (Enum: "PENDIENTE", "EN_PROCESO", "PAGADO")
*   `fecha_pago` (Timestamp, Nullable)
*   `url_comprobante_pago` (String, Nullable)
*   `url_pdf_liquidacion` (String, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Historial_Pagos_Consignatario` (Consignor_Payment_History)
Historial completo de pagos realizados a consignatarios.
*   `id` (UUID, Primary Key)
*   `id_liquidacion` (Foreign Key -> `Liquidaciones_Venta.id`)
*   `id_consignatario` (Foreign Key -> `Clientes.id`)
*   `monto` (Decimal)
*   `metodo_pago` (String: "TRANSFERENCIA", "CHEQUE", "EFECTIVO")
*   `fecha_pago` (Timestamp)
*   `comprobante_url` (String, Nullable)
*   `notas` (Text, Nullable)

---

### 3.6b Entidades de Transacciones y Valoración

#### Entidad: `Ventas` (Sales)
Registro formal de cada transacción de venta completada.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_comprador` (Foreign Key -> `Clientes.id`)
*   `id_vendedor` (Foreign Key -> `Usuarios.id`)
*   `id_lead` (Foreign Key -> `Leads_Oportunidades.id`, Nullable)
*   `id_cotizacion` (Foreign Key -> `Cotizaciones.id`, Nullable)
*   `id_financiamiento` (Foreign Key -> `Solicitudes_Financiamiento.id`, Nullable)
*   `precio_venta_final` (Decimal)
*   `metodo_pago` (Enum: "CONTADO", "CREDITO", "MIXTO")
*   `monto_pie` (Decimal, Nullable)
*   `descuento_aplicado` (Decimal, default: 0)
*   `id_vehiculo_permuta` (Foreign Key -> `Vehiculos.id`, Nullable) — *Trade-in: auto entregado como parte de pago*
*   `valor_permuta` (Decimal, Nullable)
*   `estado` (Enum: "PENDIENTE", "COMPLETADA", "ANULADA")
*   `url_contrato_compraventa` (String, Nullable)
*   `notas` (Text, Nullable)
*   `fecha_venta` (Timestamp)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Reservas` (Reservations)
Registro de reservas de vehículos con seña/depósito.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `id_lead` (Foreign Key -> `Leads_Oportunidades.id`, Nullable)
*   `id_vendedor` (Foreign Key -> `Usuarios.id`)
*   `monto_sena` (Decimal)
*   `metodo_pago` (String: "TRANSFERENCIA", "WEBPAY", "MERCADOPAGO", "EFECTIVO")
*   `id_transaccion_pago` (String, Nullable) — *ID del pago en la pasarela*
*   `estado` (Enum: "ACTIVA", "EXPIRADA", "CONVERTIDA_VENTA", "CANCELADA", "REEMBOLSADA")
*   `fecha_expiracion` (Timestamp)
*   `notas` (Text, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Tasaciones` (Appraisals)
Historial de tasaciones realizadas sobre vehículos.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_vendedor_solicita` (Foreign Key -> `Usuarios.id`)
*   `id_gerente_aprueba` (Foreign Key -> `Usuarios.id`, Nullable)
*   `precio_sugerido_sistema` (Decimal, Nullable) — *Calculado por el motor de tasación*
*   `datos_mercado` (JSON: `{"fuentes": [{"portal": "Chileautos", "precio_promedio": 12500000, "cantidad_publicaciones": 15}], "fecha_consulta": "..."}`) — *Datos comparativos usados*
*   `precio_propuesto_vendedor` (Decimal)
*   `precio_aprobado` (Decimal, Nullable)
*   `estado` (Enum: "PENDIENTE", "APROBADA", "RECHAZADA", "MODIFICADA")
*   `motivo_modificacion` (Text, Nullable)
*   `fecha_creacion` (Timestamp)
*   `fecha_aprobacion` (Timestamp, Nullable)

---

### 3.7 Entidades Transversales

#### Entidad: `Comisiones_Venta` (Sales_Commissions)
Cálculo y registro de comisiones generadas por cada venta.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_vendedor` (Foreign Key -> `Usuarios.id`)
*   `id_aprobador` (Foreign Key -> `Usuarios.id`, Nullable) — *Gerente que aprobó*
*   `margen_venta` (Decimal) — *Precio venta - precio compra*
*   `porcentaje_comision` (Decimal)
*   `monto_comision` (Decimal)
*   `bono_aplicado` (Decimal, default: 0)
*   `estado` (Enum: "CALCULADA", "PENDIENTE_APROBACION", "APROBADA", "PAGADA")
*   `fecha_pago` (Timestamp, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Notificaciones` (Notifications)
Cola y registro de notificaciones enviadas a todos los actores.
*   `id` (UUID, Primary Key)
*   `id_usuario_destinatario` (Foreign Key -> `Usuarios.id`, Nullable)
*   `id_cliente_destinatario` (Foreign Key -> `Clientes.id`, Nullable)
*   `canal` (Enum: "IN_APP", "EMAIL", "WHATSAPP", "SMS")
*   `titulo` (String)
*   `cuerpo` (Text)
*   `referencia_tipo` (String, Nullable) — *Ej: "VEHICULO", "LEAD", "CONTRATO"*
*   `referencia_id` (UUID, Nullable)
*   `leida` (Boolean, default: false)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Documentos_Adjuntos` (Attached_Documents)
Repositorio unificado de documentos del sistema.
*   `id` (UUID, Primary Key)
*   `entidad_tipo` (String) — *Ej: "VEHICULO", "CONTRATO", "LIQUIDACION", "CLIENTE"*
*   `entidad_id` (UUID)
*   `nombre_archivo` (String)
*   `tipo_archivo` (String) — *MIME type*
*   `url_almacenamiento` (String) — *URL en S3*
*   `tamano_bytes` (Integer)
*   `fecha_subida` (Timestamp)
*   `id_usuario_subio` (Foreign Key -> `Usuarios.id`)

#### Entidad: `Audit_Log` (Audit Trail)
Registro inmutable de todas las operaciones sobre datos sensibles.
*   `id` (UUID, Primary Key)
*   `tabla_afectada` (String) — *Ej: "Clientes", "Vehiculos", "Contratos_Consignacion"*
*   `id_registro` (UUID)
*   `accion` (Enum: "INSERT", "UPDATE", "DELETE")
*   `datos_anteriores` (JSONB, Nullable)
*   `datos_nuevos` (JSONB, Nullable)
*   `id_usuario` (Foreign Key -> `Usuarios.id`, Nullable)
*   `ip_origen` (String, Nullable)
*   `user_agent` (String, Nullable)
*   `fecha` (Timestamp)

---

### 3.8 Entidades de Taller y Órdenes de Trabajo

#### Entidad: `Ordenes_Trabajo` (Work_Orders)
Órdenes de trabajo del taller para preparación y reparación de vehículos.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_jefe_taller` (Foreign Key -> `Usuarios.id`) — *Quién creó la OT*
*   `id_tecnico_asignado` (Foreign Key -> `Usuarios.id`, Nullable) — *Técnico responsable*
*   `tipo` (Enum: "PREPARACION", "REPARACION", "PDI", "MANTENIMIENTO", "GARANTIA")
*   `descripcion` (Text)
*   `trabajos_detalle` (JSON: `[{"item": "Cambio de aceite", "repuestos": [{"nombre": "Aceite 5W30", "costo": 25000}], "mano_obra_horas": 0.5, "costo_mano_obra": 15000}]`)
*   `costo_repuestos_total` (Decimal, default: 0)
*   `costo_mano_obra_total` (Decimal, default: 0)
*   `costo_total` (Decimal, default: 0)
*   `estado` (Enum: "ABIERTA", "EN_PROGRESO", "EN_REVISION", "COMPLETADA", "CANCELADA")
*   `prioridad` (Enum: "BAJA", "MEDIA", "ALTA", "URGENTE")
*   `fecha_estimada_entrega` (Date, Nullable)
*   `fecha_inicio_real` (Timestamp, Nullable)
*   `fecha_completada` (Timestamp, Nullable)
*   `notas_internas` (Text, Nullable)
*   `requiere_aprobacion_costo` (Boolean, default: false)
*   `id_aprobador_costo` (Foreign Key -> `Usuarios.id`, Nullable)
*   `aprobado` (Boolean, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Checklist_Inspeccion` (Inspection_Checklists)
Checklists de inspección de ingreso y PDI.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_orden_trabajo` (Foreign Key -> `Ordenes_Trabajo.id`, Nullable)
*   `tipo` (Enum: "INGRESO", "PDI", "INSPECCION_GENERAL")
*   `id_inspector` (Foreign Key -> `Usuarios.id`) — *Quien realizó la inspección*
*   `items` (JSON: `[{"categoria": "Motor", "item": "Nivel de aceite", "estado": "BUENO", "observacion": null, "foto_url": null}, {"categoria": "Carrocería", "item": "Pintura lateral derecho", "estado": "MALO", "observacion": "Rayón de 15cm", "foto_url": "https://..."}]`)
*   `resultado_general` (Enum: "APROBADO", "APROBADO_CON_OBSERVACIONES", "RECHAZADO")
*   `costo_estimado_reparaciones` (Decimal, Nullable)
*   `fotos_generales` (Array de Strings)
*   `firmado_por_cliente` (Boolean, default: false) — *Para PDI de entrega*
*   `fecha_inspeccion` (Timestamp)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Presupuestos_Taller` (Workshop_Budgets)
Presupuestos de reparación enviados al gerente para aprobación.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_checklist` (Foreign Key -> `Checklist_Inspeccion.id`, Nullable)
*   `id_jefe_taller` (Foreign Key -> `Usuarios.id`)
*   `id_aprobador` (Foreign Key -> `Usuarios.id`, Nullable)
*   `items` (JSON: `[{"trabajo": "Reparar rayón lateral", "repuestos": [...], "mano_obra": 2, "subtotal": 85000}]`)
*   `costo_total_repuestos` (Decimal)
*   `costo_total_mano_obra` (Decimal)
*   `total` (Decimal)
*   `estado` (Enum: "PENDIENTE", "APROBADO", "RECHAZADO", "MODIFICADO")
*   `motivo_rechazo` (Text, Nullable)
*   `fecha_aprobacion` (Timestamp, Nullable)
*   `fecha_creacion` (Timestamp)

---

### 3.9 Entidades de Seguros y Ofertas Financieras

#### Entidad: `Seguros_Vehiculo` (Vehicle_Insurance)
Pólizas de seguros gestionados por F&I.
*   `id` (UUID, Primary Key)
*   `id_vehiculo` (Foreign Key -> `Vehiculos.id`)
*   `id_cliente` (Foreign Key -> `Clientes.id`)
*   `id_venta` (Foreign Key -> `Ventas.id`, Nullable)
*   `id_encargado_fi` (Foreign Key -> `Usuarios.id`)
*   `tipo_seguro` (Enum: "DESGRAVAMEN", "TODO_RIESGO", "SOAP", "GARANTIA_EXTENDIDA")
*   `compania_aseguradora` (String)
*   `numero_poliza` (String, Nullable)
*   `prima_mensual` (Decimal, Nullable)
*   `prima_total` (Decimal)
*   `cobertura_detalle` (JSON: `{"deducible": 500000, "cobertura_maxima": 15000000, "vigencia_meses": 12}`)
*   `estado` (Enum: "COTIZADO", "CONTRATADO", "VIGENTE", "VENCIDO", "CANCELADO")
*   `fecha_inicio` (Date, Nullable)
*   `fecha_vencimiento` (Date, Nullable)
*   `comision_automotora` (Decimal, Nullable)
*   `url_poliza` (String, Nullable)
*   `fecha_creacion` (Timestamp)

#### Entidad: `Ofertas_Financieras` (Financial_Offers)
Ofertas de financiamiento recibidas de distintas instituciones para comparación.
*   `id` (UUID, Primary Key)
*   `id_solicitud` (Foreign Key -> `Solicitudes_Financiamiento.id`)
*   `institucion_financiera` (String)
*   `tasa_interes_mensual` (Decimal)
*   `tasa_interes_anual` (Decimal)
*   `cae` (Decimal) — *Carga Anual Equivalente*
*   `valor_cuota` (Decimal)
*   `plazo_meses` (Integer)
*   `monto_total_pagar` (Decimal)
*   `requisitos` (JSON: `["Antigüedad laboral > 1 año", "Renta líquida > 3x cuota"]`)
*   `estado` (Enum: "RECIBIDA", "PRESENTADA_CLIENTE", "ACEPTADA", "RECHAZADA", "VENCIDA")
*   `seleccionada` (Boolean, default: false) — *True si el cliente eligió esta oferta*
*   `fecha_recepcion` (Timestamp)
*   `fecha_vencimiento` (Date, Nullable)
*   `fecha_creacion` (Timestamp)

---

## 4. Diagrama de Relaciones Clave

```
Usuarios (1) ──< (N) Leads_Oportunidades >── (N) Clientes
Usuarios (1) ──< (N) Test_Drives >── (N) Clientes
Usuarios (1) ──< (N) Comisiones_Venta
Usuarios (1) ──< (N) Campanas_Marketing

Clientes (1) ──< (N) Vehiculos (como consignatario)
Clientes (1) ──< (N) Solicitudes_Financiamiento
Clientes (1) ──< (N) Contratos_Consignacion
Clientes (1) ──< (N) Encuestas_Satisfaccion
Clientes (1) ──< (N) Historial_Interacciones

Vehiculos (1) ──< (N) Historial_Vehiculo
Vehiculos (1) ──< (N) Cotizaciones
Vehiculos (1) ──< (N) Tramites_PostVenta
Vehiculos (1) ──< (N) Contratos_Consignacion
Vehiculos (1) ──< (N) Liquidaciones_Venta
Vehiculos (1) ──< (N) Comisiones_Venta

Leads_Oportunidades (1) ──< (N) Cotizaciones
Leads_Oportunidades (1) ──< (N) Test_Drives
Leads_Oportunidades (1) ──< (N) Historial_Interacciones

Cotizaciones (1) ──< (N) Cotizacion_Servicios >── (N) Servicios_Complementarios
Cotizaciones (1) ──< (N) Solicitudes_Financiamiento

Campanas_Marketing (1) ──< (N) Metricas_Campana
Campanas_Marketing (1) ──< (N) Eventos_Campana
Segmentos_Audiencia (1) ──< (N) Campanas_Marketing

Contratos_Consignacion (1) ──< (N) Liquidaciones_Venta
Liquidaciones_Venta (1) ──< (N) Historial_Pagos_Consignatario

Ventas (1) ──< (N) Comisiones_Venta
Ventas (1) ──< (N) Tramites_PostVenta
Ventas (1) ──< (N) Encuestas_Satisfaccion
Ventas (1) ──< (1) Liquidaciones_Venta
Vehiculos (1) ──< (N) Reservas
Vehiculos (1) ──< (N) Tasaciones

Vehiculos (1) ──< (N) Ordenes_Trabajo
Vehiculos (1) ──< (N) Checklist_Inspeccion
Vehiculos (1) ──< (N) Presupuestos_Taller
Vehiculos (1) ──< (N) Seguros_Vehiculo

Ordenes_Trabajo (1) ──< (N) Checklist_Inspeccion
Solicitudes_Financiamiento (1) ──< (N) Ofertas_Financieras

Usuarios (1) ──< (N) Ordenes_Trabajo (como jefe_taller)
Usuarios (1) ──< (N) Seguros_Vehiculo (como encargado_fi)
```

---

## 5. Flujo de Datos Clave

### 5.1 Detección de "Cliente Gemelo" (Lookalike)
1. **Gatillador:** Se inserta un nuevo registro en `Vehículos` con estado "DISPONIBLE".
2. **Worker asíncrono:** El sistema ejecuta una consulta sobre `Clientes` filtrando por `preferencias_compra` (marca, modelo, tipo, presupuesto) y `suscripto_marketing = true`.
3. **Inserción en campaña:** Se crean registros en `Eventos_Campana` para cada cliente coincidente (evento = "ENVIADO").
4. **Ejecución:** El task queue llama a la API de SendGrid/WhatsApp para enviar la notificación.
5. **Registro:** Se actualiza `Metricas_Campana` y se crea una interacción en `Historial_Interacciones` (dirección = "AUTOMATICA").

### 5.2 Ciclo de Vida de una Venta con Consignación
1. El consignatario firma digitalmente el `Contratos_Consignacion` (integración DocuSign).
2. El vehículo se crea en `Vehiculos` con `estado = "EVALUACION"` e `id_consignatario` asignado.
3. El vendedor crea una `Cotizaciones` y la envía al comprador.
4. Si el comprador agenda un test drive, se crea un registro en `Test_Drives`.
5. Al cerrar la venta, se crea un registro en `Ventas`, el lead pasa a "CERRADO_GANADO" y el vehículo a "VENDIDO".
6. Se genera automáticamente la `Comisiones_Venta` para el vendedor.
7. Se genera la `Liquidaciones_Venta` para el consignatario.
8. Se inicia el `Tramites_PostVenta` para el comprador.
9. A los 15 días, se envía la `Encuestas_Satisfaccion` al comprador.

### 5.3 Automatización de Campaña de Marketing
1. Marketing crea un `Segmentos_Audiencia` con filtros específicos.
2. Crea una `Campanas_Marketing` seleccionando el segmento y la plantilla.
3. El sistema procesa la campaña (inmediata o programada) mediante una cola de tareas.
4. Por cada cliente en el segmento, se genera un `Eventos_Campana`.
5. Se actualizan las `Metricas_Campana` en tiempo real a medida que los eventos (apertura, clics) llegan vía webhook de SendGrid/WhatsApp.

---

## 6. Índices Recomendados

Índices críticos para el rendimiento de las consultas más frecuentes:

### Búsqueda de Inventario
*   `idx_vehiculos_estado_marca_anio` — Compuesto: `(estado, marca, año)` en `Vehiculos`
*   `idx_vehiculos_precio` — `(precio_venta_publico)` en `Vehiculos` WHERE estado = 'DISPONIBLE'

### Pipeline de Ventas
*   `idx_leads_vendedor_estado` — Compuesto: `(id_vendedor_asignado, estado_embudo)` en `Leads_Oportunidades`
*   `idx_leads_fecha_interaccion` — `(fecha_ultima_interaccion)` en `Leads_Oportunidades` WHERE estado_embudo NOT IN ('CERRADO_GANADO', 'CERRADO_PERDIDO')

### Búsqueda de Clientes
*   `idx_clientes_vendedor` — `(id_vendedor_asignado)` en `Clientes`
*   `idx_clientes_preferencias` — GIN index en `(preferencias_compra)` en `Clientes` para queries de "Clientes Gemelos"
*   `idx_clientes_rut` — Unique en `(rut_dni)` en `Clientes` WHERE rut_dni IS NOT NULL

### Marketing
*   `idx_eventos_campana` — Compuesto: `(id_campana, evento, fecha)` en `Eventos_Campana`

### Auditoría
*   `idx_audit_tabla_registro` — Compuesto: `(tabla_afectada, id_registro)` en `Audit_Log`
*   `idx_audit_usuario_fecha` — Compuesto: `(id_usuario, fecha)` en `Audit_Log`

### Taller y Órdenes de Trabajo
*   `idx_ordenes_trabajo_vehiculo_estado` — Compuesto: `(id_vehiculo, estado)` en `Ordenes_Trabajo`
*   `idx_ordenes_trabajo_tecnico` — `(id_tecnico_asignado)` en `Ordenes_Trabajo` WHERE estado NOT IN ('COMPLETADA', 'CANCELADA')
*   `idx_checklist_vehiculo_tipo` — Compuesto: `(id_vehiculo, tipo)` en `Checklist_Inspeccion`
*   `idx_presupuestos_estado` — `(estado)` en `Presupuestos_Taller` WHERE estado = 'PENDIENTE'

### Seguros y Ofertas Financieras
*   `idx_seguros_cliente_estado` — Compuesto: `(id_cliente, estado)` en `Seguros_Vehiculo`
*   `idx_seguros_vencimiento` — `(fecha_vencimiento)` en `Seguros_Vehiculo` WHERE estado = 'VIGENTE'
*   `idx_ofertas_solicitud` — `(id_solicitud)` en `Ofertas_Financieras`

---

## 7. Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Tablas | `snake_case` en español, plural | `vehiculos`, `leads_oportunidades` |
| Columnas | `snake_case` en español | `fecha_creacion`, `precio_venta_publico` |
| Primary Keys | `id` (UUID v4) | `id` |
| Foreign Keys | `id_<entidad_singular>` | `id_vehiculo`, `id_cliente` |
| Enums | `UPPER_SNAKE_CASE` | `CERRADO_GANADO`, `EN_PROCESO` |
| Índices | `idx_<tabla>_<columnas>` | `idx_vehiculos_estado_marca_anio` |
| Timestamps | `fecha_<accion>` | `fecha_creacion`, `fecha_venta` |
| Booleans | adjetivo o participio | `activo`, `respondida`, `leida` |
| JSON fields | Documentar estructura en el modelo | `preferencias_compra`, `datos_mercado` |

**Idioma:** Todos los nombres de tablas, columnas y enums se escriben en **español**. Excepciones permitidas: términos técnicos sin traducción directa (`hash`, `url`, `ip`).

**Soft Delete:** Todas las entidades principales (`Usuarios`, `Clientes`, `Vehiculos`, `Servicios_Complementarios`) implementan soft delete mediante el campo `activo` (Boolean). Los registros transaccionales (`Ventas`, `Cotizaciones`, `Comisiones_Venta`) NO se eliminan nunca.
