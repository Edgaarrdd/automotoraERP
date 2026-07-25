# Documentación Técnica: Módulo CMS Storefront
**CRM Automotora ERP** — Arquitectura Híbrida SaaS
**Versión del Documento:** 1.0

---

## 1. Resumen Ejecutivo

El módulo **CMS Storefront** es un producto complementario al ERP de automotoras que permite a cada tenant (automotora) del ecosistema multi-tenant crear y administrar su propio sitio web público de catálogo de vehículos. La arquitectura sigue un **enfoque híbrido SaaS**:

1. **Panel Administrativo CMS (ERP Interno):** Nueva pestaña "Mi Sitio Web" dentro del dashboard del ERP, donde el Admin/Gerente configura branding, publica vehículos y visualiza analíticas web.
2. **Portal Público Storefront (Producto Independiente):** Aplicación frontend independiente (Next.js/Vite) que consume una API REST pública multi-tenant del backend FastAPI existente, sin autenticación JWT.

> [!IMPORTANT]
> El CMS Storefront comparte la **misma base de datos** y **backend FastAPI** que el ERP. No se requiere un servidor o base de datos separada. Los endpoints públicos son un nuevo router dentro de la misma aplicación FastAPI.

---

## 2. Decisión Arquitectónica: ¿Módulo o Producto Separado?

| Criterio | Módulo Integrado al ERP | Producto Separado (Microservicio) | **Enfoque Híbrido (Elegido)** |
| :--- | :--- | :--- | :--- |
| **Complejidad de deploy** | Baja (mismo build) | Alta (2 deploys, 2 repos) | **Media (mismo backend, frontend separado)** |
| **Separación de tráfico** | ❌ Público y privado mezclados | ✅ Aislamiento total | ✅ **Frontend aislado, backend compartido** |
| **SEO y Performance** | ❌ SPA no indexable | ✅ SSR/SSG | ✅ **SSR en portal público** |
| **Reutilización de datos** | ✅ Acceso directo a BD | ❌ API de sincronización | ✅ **Acceso directo a BD** |
| **Seguridad** | ⚠️ Riesgo de exposición | ✅ Aislamiento total | ✅ **Router público separado sin JWT** |
| **Costo de desarrollo** | Bajo | Alto | **Medio** |
| **Escalabilidad** | ⚠️ Limitada | ✅ Independiente | ✅ **Frontend escala independiente** |

**Conclusión:** El enfoque híbrido ofrece el mejor balance entre reutilización de la infraestructura existente y aislamiento del tráfico público.

---

## 3. Modelo de Datos — Extensiones para CMS Storefront

### 3.1 Modificaciones a Entidades Existentes

#### `Tenant` (tabla `tenants`) — Campos CMS Agregados

| Campo | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `sitio_web_activo` | `Boolean` | `True` | Toggle maestro ON/OFF del sitio público |
| `slogan` | `String` | `"Tu automotora de confianza en Chile"` | Slogan visible en el header del sitio |
| `color_primario` | `String(7)` | `"#0284c7"` | Color primario hexadecimal de marca |
| `color_secundario` | `String(7)` | `"#f97316"` | Color de acento/secundario |
| `logo_url` | `String` | `NULL` | URL del logo de la automotora |
| `banner_url` | `String` | `NULL` | URL de la imagen de banner principal |
| `whatsapp_contacto` | `String` | `"+56912345678"` | Número WhatsApp con formato internacional |
| `telefono_fijo` | `String` | `NULL` | Teléfono fijo de la automotora |
| `email_contacto` | `String` | `NULL` | Email de contacto comercial |
| `direccion_fisica` | `String` | `"Av. Vitacura 4560, Santiago"` | Dirección del salón |
| `horario_atencion` | `JSON` | `{}` | Horarios de atención por día |
| `redes_sociales` | `JSON` | `{}` | URLs de Instagram, Facebook, TikTok, YouTube |
| `cms_paginas` | `JSON` | `{}` | Contenido de páginas CMS (About, Servicios, etc.) |
| `cms_testimonios` | `JSON` | `[]` | Array de testimonios de clientes |
| `cms_servicios` | `JSON` | `[]` | Array de servicios ofrecidos |
| `cms_propuestas_valor` | `JSON` | `[]` | Bloques "¿Por qué elegirnos?" |
| `tasa_interes_default` | `Float` | `1.45` | Tasa de interés mensual para el simulador web |
| `monto_sena_reserva` | `Float` | `200000` | Monto de seña para reserva online ($CLP) |
| `pasarela_pago` | `String` | `NULL` | Pasarela configurada: `"WEBPAY"`, `"MERCADOPAGO"`, `NULL` |

> [!NOTE]
> Los campos `sitio_web_activo`, `slogan`, `color_primario`, `logo_url`, `banner_url`, `whatsapp_contacto` y `direccion_fisica` ya fueron agregados al modelo `Tenant` en [models.py](file:///C:/Users/edgar/OneDrive/Escritorio/automotoraERP/backend/app/models.py#L83-L90) durante la sesión anterior.

#### `Vehicle` (tabla `vehiculos`) — Campos Web Agregados

| Campo | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `publicado_web` | `Boolean` | `False` | Si el vehículo es visible en el portal público |
| `destacado_web` | `Boolean` | `False` | Si el vehículo aparece en la sección "Destacados" |
| `precio_oferta_web` | `Float` | `NULL` | Precio de oferta para el sitio web (si aplica) |
| `orden_visualizacion` | `Integer` | `0` | Orden de aparición en el catálogo público |
| `web_view_count` | `Integer` | `0` | Contador de vistas de la ficha pública |

### 3.2 Nuevas Entidades

#### `WebLead` (tabla `web_leads`)
Almacena los formularios enviados desde el portal público antes de ser procesados y convertidos en `LeadOpportunity` + `Customer`.

| Campo | Tipo | Nullable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | PK | Identificador único |
| `tenant_id` | `String (FK → tenants.id)` | No | Tenant de la automotora |
| `id_vehiculo` | `String (FK → vehiculos.id)` | Sí | Vehículo de interés (si aplica) |
| `nombre_completo` | `String` | No | Nombre del comprador web |
| `rut_dni` | `String` | Sí | RUT del comprador (opcional) |
| `telefono` | `String` | No | Teléfono de contacto |
| `email` | `String` | No | Email del comprador |
| `mensaje` | `Text` | Sí | Texto libre del formulario |
| `tipo_consulta` | `String` | No | COTIZACION, DISPONIBILIDAD, TEST_DRIVE, FINANCIAMIENTO, OTRA |
| `tiene_permuta` | `Boolean` | `False` | Si tiene auto para entregar en parte de pago |
| `patente_permuta` | `String` | Sí | Patente del auto actual (si tiene_permuta = True) |
| `origen` | `String` | `"SITIO_WEB"` | Siempre `SITIO_WEB` para leads de portal público |
| `id_lead_generado` | `String (FK → leads_oportunidades.id)` | Sí | Lead creado automáticamente en el ERP |
| `id_cliente_generado` | `String (FK → clientes.id)` | Sí | Cliente creado o vinculado |
| `procesado` | `Boolean` | `False` | Si el lead ya fue procesado y asignado |
| `ip_origen` | `String` | Sí | IP del visitante (anti-spam) |
| `fecha_envio` | `DateTime` | No | Timestamp del envío del formulario |

#### `WebSubscriber` (tabla `web_suscriptores`)
Almacena las suscripciones de alertas de nuevos vehículos (CU 9.15).

| Campo | Tipo | Nullable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | PK | Identificador único |
| `tenant_id` | `String (FK → tenants.id)` | No | Tenant de la automotora |
| `email` | `String` | No | Email del suscriptor |
| `marcas_interes` | `JSON` | Sí | Array de marcas de interés |
| `precio_maximo` | `Float` | Sí | Precio máximo de interés |
| `año_minimo` | `Integer` | Sí | Año mínimo de interés |
| `activo` | `Boolean` | `True` | Si la suscripción está activa |
| `fecha_ultimo_envio` | `DateTime` | Sí | Última fecha de envío de alerta |
| `fecha_suscripcion` | `DateTime` | No | Fecha de alta |

---

## 4. Arquitectura de Endpoints

### 4.1 Router Público (`/api/public/`) — Sin Autenticación JWT

```python
# Nuevo archivo: backend/app/routers/public.py
router = APIRouter(prefix="/api/public", tags=["Portal Público Storefront"])
```

| Método | Ruta | Respuesta | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/{slug}/config` | `TenantPublicConfig` | Branding, colores, contacto, horarios, redes sociales |
| `GET` | `/{slug}/vehicles` | `List[VehiclePublicOut]` | Catálogo con filtros (query params: marca, precio_min, precio_max, año_min, combustible, transmision, search) |
| `GET` | `/{slug}/vehicles/{id}` | `VehiclePublicDetail` | Ficha completa pública (incrementa `web_view_count`) |
| `GET` | `/{slug}/vehicles/featured` | `List[VehiclePublicOut]` | Máximo 6 vehículos con `destacado_web = True` |
| `GET` | `/{slug}/vehicles/recent` | `List[VehiclePublicOut]` | Últimos 8 publicados (30 días) |
| `GET` | `/{slug}/vehicles/offers` | `List[VehiclePublicOut]` | Vehículos con `precio_oferta_web` definido |
| `POST` | `/{slug}/leads` | `WebLeadConfirmation` | Captura formulario contacto → crea Lead + Customer |
| `GET` | `/{slug}/appointments/slots` | `List[AvailableSlot]` | Slots disponibles próximos 14 días |
| `POST` | `/{slug}/appointments` | `AppointmentConfirmation` | Crea cita de test drive + Lead |
| `GET` | `/{slug}/pages/{page}` | `CMSPageContent` | Contenido de páginas CMS |
| `GET` | `/{slug}/sitemap.xml` | XML | Sitemap dinámico |
| `POST` | `/{slug}/subscribe` | `SubscriptionConfirmation` | Alta de suscripción alertas |
| `DELETE` | `/{slug}/subscribe/{id}` | `204` | Baja de suscripción (unsubscribe) |

### 4.2 Schemas Pydantic Públicos (Nuevos)

```python
# Schemas que NO exponen datos sensibles (sin tenant_id, sin precios de compra, sin patente completa)

class VehiclePublicOut(BaseModel):
    id: str
    marca: str
    modelo: str
    version: Optional[str]
    año: int
    kilometraje: int
    tipo_combustible: str
    transmision: str
    color: Optional[str]
    precio_venta_publico: float
    precio_oferta_web: Optional[float]
    estado: str  # Solo DISPONIBLE o RESERVADO
    destacado_web: bool
    url_foto_principal: Optional[str]
    patente_parcial: str  # "KJ****9" — oculta parcialmente

class VehiclePublicDetail(VehiclePublicOut):
    motor: Optional[str]
    num_puertas: int
    num_asientos: int
    urls_fotos: List[str]
    historial_legal: Optional[dict]
    web_view_count: int

class TenantPublicConfig(BaseModel):
    nombre_empresa: str
    subdominio: str
    slogan: Optional[str]
    color_primario: str
    color_secundario: Optional[str]
    logo_url: Optional[str]
    banner_url: Optional[str]
    whatsapp_contacto: str
    telefono_fijo: Optional[str]
    email_contacto: Optional[str]
    direccion_fisica: str
    horario_atencion: Optional[dict]
    redes_sociales: Optional[dict]
    tasa_interes_default: float
    cms_propuestas_valor: Optional[list]
    cms_testimonios: Optional[list]
    cms_servicios: Optional[list]
```

### 4.3 Router Interno CMS (`/api/tenants/`) — Con Autenticación JWT

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tenants/{id}/cms` | ADMIN, GERENTE | Obtener configuración CMS completa |
| `PATCH` | `/api/tenants/{id}/cms` | ADMIN, GERENTE | Actualizar configuración CMS |
| `PATCH` | `/api/vehicles/{id}/web-publish` | ADMIN, GERENTE, VENDEDOR | Toggle publicación web del vehículo |
| `GET` | `/api/analytics/web` | ADMIN, GERENTE | Dashboard de analíticas web |

---

## 5. Seguridad del Router Público

> [!CAUTION]
> Los endpoints públicos (`/api/public/`) **NO requieren autenticación JWT**. Es crítico implementar las siguientes protecciones:

| Medida | Implementación | Objetivo |
| :--- | :--- | :--- |
| **Rate Limiting** | `slowapi`: 60 req/min por IP para `GET`, 5 req/min por IP para `POST` | Anti-DDoS y anti-scraping |
| **Anti-Spam (POST)** | reCAPTCHA v3 token en body o Honeypot field | Evitar envíos automatizados de formularios |
| **Validación de Tenant** | Verificar que `slug` corresponda a un tenant activo con `sitio_web_activo = True` | Evitar acceso a tenants inexistentes |
| **Sanitización de Datos** | Escapar HTML en todos los inputs de texto de formularios | Prevenir XSS almacenado |
| **Datos Sensibles** | No exponer: `precio_compra_tasacion`, `precio_minimo_venta`, `tenant_id`, patente completa, `id_vendedor` | Proteger información comercial interna |
| **CORS** | Permitir origen `*.automotora.app` y dominios personalizados verificados | Control de acceso cross-origin |

---

## 6. Flujo de Captura de Lead Web (Diagrama de Secuencia)

```
Comprador Web          Portal Público         Backend FastAPI            Base de Datos
     │                      │                       │                        │
     │  Llena formulario    │                       │                        │
     │  + reCAPTCHA         │                       │                        │
     │─────────────────────>│                       │                        │
     │                      │  POST /api/public/    │                        │
     │                      │  {slug}/leads         │                        │
     │                      │──────────────────────>│                        │
     │                      │                       │  1. Valida reCAPTCHA   │
     │                      │                       │  2. Busca tenant       │
     │                      │                       │     por slug           │
     │                      │                       │─────────────────────> │
     │                      │                       │  3. Busca cliente      │
     │                      │                       │     existente          │
     │                      │                       │     (tel/email)        │
     │                      │                       │─────────────────────> │
     │                      │                       │  4. Crea/Vincula       │
     │                      │                       │     Customer           │
     │                      │                       │─────────────────────> │
     │                      │                       │  5. Crea Lead en       │
     │                      │                       │     Pipeline (NUEVO)   │
     │                      │                       │─────────────────────> │
     │                      │                       │  6. Asigna vendedor    │
     │                      │                       │     (round-robin)      │
     │                      │                       │─────────────────────> │
     │                      │                       │  7. Registra WebLead   │
     │                      │                       │─────────────────────> │
     │                      │                       │                        │
     │                      │  201 Created          │                        │
     │                      │  {ref: "WL-12345"}    │                        │
     │                      │<──────────────────────│                        │
     │  "¡Gracias!          │                       │                        │
     │   Ref: #WL-12345"    │                       │                        │
     │<─────────────────────│                       │                        │
     │                      │                       │                        │
     │                      │                       │  → Vendedor en ERP     │
     │                      │                       │    ve nuevo lead con   │
     │                      │                       │    badge "🌐 Lead Web" │
```

---

## 7. Stack Tecnológico del Portal Público

| Componente | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Framework Frontend** | Next.js 14+ (React) | SSR/SSG para SEO, rutas dinámicas por tenant |
| **Styling** | Tailwind CSS | Consistente con el ERP interno, rápido desarrollo |
| **Estado** | React Query (TanStack) | Caché y revalidación del catálogo público |
| **Backend API** | FastAPI (existente) | Reutilización del backend, nuevo router `/api/public/` |
| **Base de Datos** | SQLite → PostgreSQL | Compartida con el ERP |
| **CDN / Imágenes** | Cloudflare R2 / AWS S3 | Almacenamiento de fotos de vehículos, logos y banners |
| **Pasarela de Pago** | Webpay (Transbank) / MercadoPago | Reserva online con seña (CU 9.16) |
| **SEO** | next-seo, JSON-LD, Sitemap.xml dinámico | Indexación en Google |
| **Anti-Spam** | reCAPTCHA v3 (Google) | Protección de formularios públicos |
| **Analytics** | Google Analytics 4 / Plausible | Métricas de tráfico web |
| **SSL** | Let's Encrypt / Cloudflare | Certificados automáticos para dominios personalizados |
| **Deploy** | Vercel (Portal Público) + Railway/Render (Backend) | Frontend y backend desplegados independientemente |

---

## 8. Roadmap de Implementación

### Fase 2A — MVP CMS Storefront (4-6 semanas)

| Semana | Entregable | CU Relacionados |
| :--- | :--- | :--- |
| 1-2 | Backend: Router público, schemas públicos, campos web en Vehicle y Tenant, endpoint de captura de leads | CU 9.1, 9.2, 9.3, 9.6 |
| 2-3 | ERP Frontend: Tab "Mi Sitio Web" en panel lateral, formulario de branding, toggle publicación web en inventario | CU 9.1, 9.2, 9.3, 9.14 |
| 3-4 | Portal Público: Catálogo responsive, ficha de vehículo, formulario de contacto, simulador de crédito | CU 9.4, 9.5, 9.6, 9.9 |
| 4-5 | Portal Público: Agendamiento de test drive, compartir en redes, SEO básico | CU 9.7, 9.14, 9.12 |
| 5-6 | Testing E2E, corrección de bugs, deploy staging, revisión de seguridad de endpoints públicos | Todos MVP |

### Fase 2B — CMS Avanzado (3-4 semanas)

| Semana | Entregable | CU Relacionados |
| :--- | :--- | :--- |
| 7-8 | CMS: Editor de secciones (Home, About, Servicios, Testimonios), Recién Llegados y Ofertas | CU 9.8, 9.10 |
| 8-9 | Analíticas: Dashboard de métricas web en ERP, contadores de vistas | CU 9.11 |
| 9-10 | Dominio personalizado: Verificación DNS, SSL automático | CU 9.13 |

### Fase 3 — Monetización y Escala (4-6 semanas)

| Semana | Entregable | CU Relacionados |
| :--- | :--- | :--- |
| 11-12 | Reserva online con pasarela de pago (Webpay/MercadoPago) | CU 9.16 |
| 13-14 | Suscripciones de alertas automáticas (email) | CU 9.15 |
| 15-16 | Multi-tenant deploy, onboarding SaaS de nuevas automotoras | — |

---

## 9. Relación con Casos de Uso Existentes del ERP

| CU Existente | CU CMS Storefront Relacionado | Integración |
| :--- | :--- | :--- |
| CU 2.1 (Ingreso Express) | CU 9.3 (Publicación Web) | Al ingresar un vehículo, opción de publicar directamente en web |
| CU 2.2 (Kanban) | CU 9.6 (Lead Web) | Leads web aparecen automáticamente en Kanban con badge 🌐 |
| CU 2.3 (Cotización) | CU 9.9 (Simulador Web) | El simulador web genera leads pre-calificados para cotización |
| CU 2.6 (Catálogo Móvil) | CU 9.4, 9.5 (Catálogo Público) | El catálogo móvil del vendedor ahora es el portal público |
| CU 3.3 (Reserva Online) | CU 9.16 (Reserva con Seña) | Reserva online desde portal público con pasarela de pago |
| CU 5.1 (Portal Consignatario) | CU 9.5 (Ficha Pública) | El consignatario puede ver su auto publicado en la web |
| CU 8.1 (BDC Lead Capture) | CU 9.6 (Lead Inbound Web) | Leads web se distribuyen al BDC igual que los telefónicos |

---

## 10. Métricas de Éxito del CMS Storefront

| KPI | Baseline | Meta MVP (3 meses) | Meta Escala (12 meses) | Método de Medición |
| :--- | :--- | :--- | :--- | :--- |
| Tenants con sitio web activo | 0 | 5 automotoras | 30 automotoras | Count `sitio_web_activo = True` |
| Vehículos publicados por tenant | 0 | 20 vehículos promedio | 50 vehículos promedio | Avg `publicado_web = True` por tenant |
| Leads web generados por mes (por tenant) | 0 | 15 leads/mes | 50 leads/mes | Count `WebLead` por mes |
| Tasa de conversión web | 0% | 3% | 8% | Leads web / Visitas únicas |
| Test drives agendados desde web | 0 | 5/mes | 20/mes | Count Appointments con origen web |
| Tiempo promedio en catálogo | 0 | > 2 min | > 4 min | Google Analytics / Plausible |

---

*Documentación técnica del módulo CMS Storefront generada para CRM Automotora ERP. Abierta a revisión y retroalimentación antes de iniciar la implementación.*
