# Casos de Uso: CMS Storefront — Sitio Web Público para Automotoras

> **Producto:** CRM Automotora ERP — Módulo CMS Storefront (Enfoque Híbrido SaaS)
> **Versión del Documento:** 1.0
> **Grupo de Numeración:** 9 (CU 9.X)
> **Relación con el ERP:** Módulo administrativo integrado en el ERP ("Mi Sitio Web CMS") + Portal Público de Tienda independiente consumiendo API Multi-Tenant.

Este documento detalla los casos de uso para el módulo **CMS Storefront**, que permite a cada automotora del ecosistema multi-tenant crear, personalizar y administrar su propio sitio web público de catálogo de vehículos, conectado en tiempo real con el inventario, pipeline de ventas y módulo BDC del ERP.

---

## Actores Involucrados

| Actor | Descripción | Acceso |
| :--- | :--- | :--- |
| **Admin / Gerente** | Configura la identidad visual del sitio, gestiona dominio y personaliza secciones del CMS | ERP Interno (Autenticado, RBAC) |
| **Vendedor / Asesor Comercial** | Publica/despublica vehículos al sitio web, gestiona ofertas web y responde leads inbound | ERP Interno (Autenticado, RBAC) |
| **Comprador Web (Visitante)** | Navega el catálogo público, filtra vehículos, consulta fichas, envía formularios de contacto y agenda test drives | Portal Público (Sin autenticación) |
| **Sistema (Automatización)** | Sincroniza inventario, captura leads automáticamente, genera métricas de tráfico web y optimiza SEO | Procesos internos |

---

## 🌐 9. Casos de Uso: CMS Storefront (Sitio Web Público de la Automotora)
*El módulo CMS Storefront permite a cada automotora del ecosistema tener presencia digital propia, conectada en tiempo real al ERP, sin depender de desarrolladores externos ni plataformas de terceros.*

---

### CU 9.1: Configuración de Identidad Visual y Branding del Sitio Web
📌 **Prioridad:** Must Have (MVP) | **Fase:** 2

**Historia de Usuario:** Como *Admin o Gerente de la automotora*, quiero *configurar la identidad visual de mi sitio web público (logo, colores, slogan, banner, información de contacto)* para *que mi marca sea reconocible y profesional ante los compradores que visitan mi catálogo online.*

**Criterios de Aceptación:**
*   El Admin/Gerente debe acceder a una nueva pestaña **"Mi Sitio Web (CMS)"** dentro del panel lateral del ERP.
*   El formulario de configuración debe incluir los siguientes campos editables:
    *   **Nombre de fantasía / Razón social** (precargado desde `Tenant.nombre_empresa`).
    *   **Slogan** (texto libre, máx. 120 caracteres, con placeholder sugerido).
    *   **Logo de la automotora** (upload de imagen PNG/SVG, máx. 2MB, previsualización en tiempo real).
    *   **Banner principal del sitio** (upload de imagen JPG/PNG, resolución recomendada 1920×600, previsualización en tiempo real).
    *   **Color primario de marca** (selector de color hexadecimal, con previsualización aplicada al header del sitio).
    *   **Color secundario / acento** (selector de color hexadecimal).
    *   **WhatsApp de contacto** (formato internacional `+569XXXXXXXX`, con validación de formato chileno).
    *   **Teléfono fijo** (formato `+562XXXXXXXX`, opcional).
    *   **Email de contacto comercial** (validación de formato email).
    *   **Dirección física del salón** (texto libre, con integración futura a Google Maps embed).
    *   **Horario de atención** (Lunes a Viernes, Sábado, Domingo/Festivos — campos de hora inicio y hora cierre).
    *   **Redes sociales** (URLs opcionales: Instagram, Facebook, TikTok, YouTube).
*   Al guardar, los cambios deben reflejarse **inmediatamente** en el portal público de la automotora (sin necesidad de deploy o reinicio).
*   Debe existir un botón **"Vista Previa"** que abra el portal público en una nueva pestaña del navegador.
*   El sistema debe persistir la configuración en los campos de la entidad `Tenant` en la base de datos mediante el endpoint `PATCH /api/tenants/{tenant_id}/cms`.

**Flujos Alternativos / Excepciones:**
*   Si el archivo de imagen del logo o banner excede 2MB, el sistema debe mostrar: "La imagen supera el tamaño máximo permitido (2MB). Por favor, comprime la imagen antes de subirla."
*   Si el formato de imagen no es válido (no es PNG, JPG, SVG o WEBP), alertar: "Formato no soportado. Usa PNG, JPG, SVG o WEBP."
*   Si el Admin intenta guardar sin haber completado al menos: Nombre, Color Primario y WhatsApp, bloquear el guardado con: "Completa los campos obligatorios marcados con * antes de guardar."
*   Si el subdominio deseado ya está ocupado por otro tenant, alertar: "Este subdominio ya está en uso. Elige otro nombre."

---

### CU 9.2: Activación y Desactivación del Sitio Web Público
📌 **Prioridad:** Must Have (MVP) | **Fase:** 2

**Historia de Usuario:** Como *Admin de la automotora*, quiero *poder activar o desactivar mi sitio web público con un solo clic* para *controlar cuándo mi inventario es visible al público general sin tener que borrar la configuración.*

**Criterios de Aceptación:**
*   En la sección "Mi Sitio Web (CMS)", debe existir un toggle prominente **"Sitio Web Activo"** (ON/OFF) que controle el campo `Tenant.sitio_web_activo`.
*   Cuando el sitio está **desactivado (OFF):**
    *   El portal público debe mostrar una página de "En construcción" o "Próximamente" con el logo de la automotora y un mensaje personalizable.
    *   Los endpoints públicos `GET /api/public/vehicles` deben retornar una respuesta vacía con estado `HTTP 503`.
    *   Los vehículos previamente publicados deben conservar su flag `publicado_web = True` internamente, sin perder la configuración.
*   Cuando el sitio está **activado (ON):**
    *   El portal público muestra el catálogo completo de vehículos marcados como publicados.
    *   Todos los formularios de contacto y captura de leads están funcionales.
*   El cambio de estado debe ser instantáneo (sin delay de propagación mayor a 5 segundos).

**Flujos Alternativos / Excepciones:**
*   Si se intenta activar el sitio sin haber configurado al menos el logo y color primario, alertar: "Antes de activar tu sitio web, completa la configuración mínima: logo y color primario."
*   Si el plan del tenant no incluye la funcionalidad de sitio web (planes futuros de pricing), alertar: "Tu plan actual no incluye Sitio Web. Contacta a soporte para actualizar tu plan."

---

### CU 9.3: Publicación y Despublicación de Vehículos al Sitio Web
📌 **Prioridad:** Must Have (MVP) | **Fase:** 2

**Historia de Usuario:** Como *Vendedor o Gerente*, quiero *seleccionar qué vehículos del inventario se publican en el sitio web de la automotora y cuáles no* para *controlar la oferta visible al público y evitar mostrar autos que aún no están listos para la venta.*

**Criterios de Aceptación:**
*   En la ficha de cada vehículo dentro del módulo de Inventario del ERP, debe aparecer una nueva sección **"Publicación Web"** con:
    *   **Toggle "Publicar en Sitio Web"** (ON/OFF) → persiste en el campo `Vehicle.publicado_web`.
    *   **Campo "Precio Oferta Web"** (opcional) → si se llena, se muestra como "Precio Oferta" tachando el precio original en el portal público.
    *   **Toggle "Vehículo Destacado"** (ON/OFF) → marca el vehículo para aparecer en la sección "Destacados" de la portada del sitio.
    *   **Campo "Orden de visualización"** (numérico, opcional) → controla la posición del vehículo en el listado público.
*   Solo los vehículos con estado `DISPONIBLE` o `RESERVADO` pueden ser publicados. Si el estado cambia a `VENDIDO`, `ENTREGADO` o `EVALUACION`, el vehículo se despublica automáticamente del sitio web (cambiando `publicado_web = False`).
*   Al activar la publicación, el sistema debe validar que el vehículo tenga al menos: 1 foto subida, marca, modelo, año, precio y patente.
*   Los cambios de publicación deben reflejarse en el portal público en **menos de 10 segundos** (vía invalidación de caché o polling).
*   En la vista de lista del inventario, debe existir un **ícono visual** (🌐) que indique cuáles vehículos están publicados en la web y cuáles no.

**Flujos Alternativos / Excepciones:**
*   Si se intenta publicar un vehículo sin fotos, alertar: "Agrega al menos una foto del vehículo antes de publicarlo en el sitio web."
*   Si se intenta publicar un vehículo en estado `EVALUACION` o `PREPARACION`, bloquear: "Este vehículo aún está en evaluación/preparación. Cámbialo a 'Disponible' antes de publicarlo."
*   Si se intenta publicar más vehículos que el máximo permitido por el plan del tenant (`Tenant.max_vehiculos`), alertar: "Has alcanzado el límite de vehículos publicables en tu plan. Despublica alguno o actualiza tu plan."
*   Si el sitio web del tenant está desactivado (`sitio_web_activo = False`), mostrar un aviso informativo: "Tu sitio web está desactivado. Los vehículos se marcarán para publicación pero no serán visibles hasta que actives el sitio."

---

### CU 9.4: Catálogo Público de Vehículos con Filtros Avanzados
📌 **Prioridad:** Must Have (MVP) | **Fase:** 2

**Historia de Usuario:** Como *Comprador Web (visitante)*, quiero *navegar el catálogo de vehículos disponibles de la automotora con filtros por marca, modelo, año, precio, combustible y transmisión* para *encontrar rápidamente el auto que se ajusta a mis necesidades y presupuesto sin tener que visitar el salón.*

**Criterios de Aceptación:**
*   El portal público debe mostrar una grilla/lista de vehículos publicados (`publicado_web = True`) del tenant correspondiente, ordenados por fecha de publicación (más recientes primero) o por relevancia (destacados primero).
*   Cada tarjeta de vehículo en el catálogo debe mostrar:
    *   Foto principal (primera imagen del array `urls_fotos`).
    *   Marca + Modelo + Versión.
    *   Año y Kilometraje.
    *   Precio venta público (formateado en $CLP con separador de miles).
    *   Precio oferta (si existe, con el precio original tachado).
    *   Etiqueta visual de estado: "Disponible" (verde) o "Reservado" (naranja).
    *   Badge "🔥 Destacado" si el vehículo tiene `destacado_web = True`.
*   Los filtros de búsqueda deben incluir:
    *   **Barra de búsqueda libre** (busca por marca, modelo, patente parcial o versión).
    *   **Filtro por Marca** (select múltiple, populado dinámicamente desde los vehículos disponibles).
    *   **Filtro por Rango de Precio** (slider o inputs min-max en $CLP).
    *   **Filtro por Año** (rango min-max).
    *   **Filtro por Tipo de Combustible** (checkboxes: Bencina, Diésel, Eléctrico, Híbrido).
    *   **Filtro por Transmisión** (checkboxes: Manual, Automática, CVT).
    *   **Filtro por Kilometraje** (rango max).
*   Los filtros deben aplicarse sin recargar la página (filtrado reactivo en frontend o API con query params).
*   Si no hay resultados, mostrar: "No encontramos vehículos con esos filtros. Intenta ampliar tu búsqueda." con un botón "Limpiar filtros".
*   El catálogo debe ser **responsive** (mobile-first): en celular muestra 1 columna, en tablet 2 columnas, en desktop 3-4 columnas.
*   El endpoint público debe ser `GET /api/public/{tenant_slug}/vehicles` y **no requerir autenticación JWT**.

**Flujos Alternativos / Excepciones:**
*   Si el tenant no tiene vehículos publicados, mostrar un estado vacío elegante con el mensaje: "Estamos preparando nuestro inventario. ¡Vuelve pronto!" con el logo de la automotora.
*   Si el sitio web del tenant está desactivado, redirigir a una página de "Próximamente" o mostrar `HTTP 503`.
*   Si la API no responde en 10 segundos, mostrar un skeleton loader y reintentar automáticamente hasta 3 veces.

---

### CU 9.5: Ficha Pública Detallada del Vehículo
📌 **Prioridad:** Must Have (MVP) | **Fase:** 2

**Historia de Usuario:** Como *Comprador Web*, quiero *ver la ficha completa de un vehículo específico con galería de fotos, especificaciones técnicas, precio y opciones de contacto* para *evaluar en detalle si el auto me interesa antes de ir al salón o contactar al vendedor.*

**Criterios de Aceptación:**
*   Al hacer clic en un vehículo del catálogo, se debe abrir la **ficha pública detallada** con la siguiente información:
    *   **Galería de fotos** (carrusel deslizable con zoom, soporte para 1 a 20 fotos).
    *   **Título:** `{Marca} {Modelo} {Versión} — {Año}`.
    *   **Precio venta público** (grande, prominente, formateado en $CLP).
    *   **Precio oferta** (si aplica, con el original tachado y badge "OFERTA").
    *   **Simulador de cuota rápida** (widget inline: dado un pie de 20%, muestra cuota estimada a 36 meses con tasa 1.5%). El comprador puede ajustar el porcentaje del pie y el número de cuotas (12, 24, 36, 48, 60).
    *   **Tabla de especificaciones técnicas:**
        *   Patente (parcialmente oculta: `KJ****9` — solo primeras 2 y último dígito visibles).
        *   Kilometraje.
        *   Tipo de Combustible.
        *   Transmisión.
        *   Motor.
        *   Color.
        *   Nº de Puertas y Asientos.
    *   **Sección "Historial Legal"** (si disponible): Multas de tránsito, Prendas, Revisión técnica al día (datos de `historial_legal`).
    *   **Botones de acción (CTA):**
        *   📱 **"Consultar por WhatsApp"** → Abre WhatsApp Web/App con mensaje predeterminado: `"Hola, estoy interesado en el {Marca} {Modelo} {Año} publicado en su sitio web (Ref: {patente_parcial}). ¿Podrían darme más información?"`. El número destino es `Tenant.whatsapp_contacto`.
        *   📧 **"Solicitar Cotización"** → Abre el formulario de captura de lead web (CU 9.6).
        *   📅 **"Agendar Test Drive"** → Abre el formulario de agendamiento (CU 9.7).
        *   📤 **"Compartir"** → Genera un enlace corto copiable para compartir en redes sociales.
*   La URL de la ficha debe ser **SEO-friendly**: `/{tenant_slug}/vehiculo/{marca}-{modelo}-{año}-{id_corto}` (ej: `/automotora-origen/vehiculo/nissan-kicks-2022-kj9w`).
*   La página debe incluir las meta tags Open Graph (`og:title`, `og:image`, `og:description`, `og:url`) para que al compartir en WhatsApp/Instagram se muestre la previsualización con foto y precio.
*   El endpoint público debe ser `GET /api/public/{tenant_slug}/vehicles/{vehicle_id}`.

**Flujos Alternativos / Excepciones:**
*   Si el vehículo fue despublicado o vendido entre que el comprador abrió el catálogo y la ficha, mostrar: "Este vehículo ya no está disponible. Te sugerimos explorar opciones similares:" con un carrusel de vehículos de la misma marca o rango de precio.
*   Si el vehículo no tiene fotos (caso edge), mostrar una imagen placeholder con el texto "Fotos próximamente".
*   Si el ID del vehículo en la URL no existe, retornar `HTTP 404` y mostrar página de "Vehículo no encontrado" con enlace al catálogo.

---

### CU 9.6: Formulario de Contacto y Captura Automática de Lead Web (Inbound)
📌 **Prioridad:** Must Have (MVP) | **Fase:** 2

**Historia de Usuario:** Como *Comprador Web*, quiero *enviar un formulario de consulta o solicitud de cotización desde la ficha del vehículo que me interesa* para *recibir atención de un vendedor sin tener que llamar por teléfono ni ir al salón.*

**Historia de Usuario (ERP):** Como *Vendedor o Agente BDC*, quiero *recibir automáticamente los leads generados desde el sitio web en mi pipeline Kanban del ERP* para *responderlos con la mayor rapidez posible y no perder ninguna oportunidad de venta.*

**Criterios de Aceptación:**

**Lado Portal Público (Comprador Web):**
*   El formulario de contacto debe incluir los campos:
    *   **Nombre completo** (requerido).
    *   **RUT / Cédula** (opcional, con validación de formato chileno `XX.XXX.XXX-X`).
    *   **Teléfono** (requerido, formato `+569XXXXXXXX`).
    *   **Email** (requerido, validación de formato).
    *   **Mensaje / Consulta** (textarea, máx. 500 caracteres, opcional).
    *   **Tipo de consulta** (select: "Solicitar Cotización", "Consultar Disponibilidad", "Agendar Test Drive", "Consultar por Financiamiento", "Otra consulta").
    *   **¿Tiene auto para entregar en parte de pago?** (toggle Sí/No, si Sí: campo para patente del auto actual).
*   El formulario debe incluir un checkbox de **aceptación de política de privacidad**: "Acepto que mis datos sean utilizados para recibir información comercial de {nombre_automotora}."
*   Protección anti-spam con **reCAPTCHA v3** o **honeypot field**.
*   Al enviar exitosamente, mostrar un mensaje de confirmación: "¡Gracias, {nombre}! Un asesor de {nombre_automotora} se comunicará contigo a la brevedad. Tu referencia es #{id_corto}."
*   El endpoint público debe ser `POST /api/public/{tenant_slug}/leads`.

**Lado ERP (Vendedor / BDC):**
*   Al recibir un formulario del portal público, el backend debe:
    1.  **Buscar si el cliente ya existe** en la tabla `Clientes` (por teléfono o email). Si existe, vincular al registro existente. Si no, crear un nuevo `Customer` con `origen = "SITIO_WEB"`.
    2.  **Crear automáticamente un nuevo `LeadOpportunity`** en el pipeline con:
        *   `estado_embudo = NUEVO`.
        *   `id_vehiculo_interes` = vehículo desde el cual se envió el formulario.
        *   `score_lead` = `CALIENTE` (si seleccionó "Agendar Test Drive" o "Solicitar Cotización"), `TIBIO` (otros tipos de consulta).
    3.  **Asignar el lead al vendedor** según reglas de distribución:
        *   Si el vehículo tiene un vendedor asignado (`id_vendedor_vendio`), asignar a ese vendedor.
        *   Si no, asignar al vendedor con menor carga de leads activos (round-robin).
        *   Si existe un Agente BDC activo, asignar primero al BDC para calificación previa.
    4.  **Registrar la interacción** en `Historial_Interacciones` con dirección `ENTRANTE`, canal `SITIO_WEB` y el texto del mensaje.
    5.  **Enviar notificación en tiempo real** al vendedor/BDC asignado (vía WebSocket futuro o polling de nuevos leads).
*   El lead debe aparecer inmediatamente en el tablero Kanban del ERP con un badge visual **"🌐 Lead Web"** que lo distinga de los leads telefónicos o presenciales.

**Flujos Alternativos / Excepciones:**
*   Si el mismo teléfono o email envía más de 3 formularios en 24 horas para el mismo vehículo, bloquear el envío con: "Ya has enviado una consulta sobre este vehículo. Un asesor se comunicará contigo pronto."
*   Si el vehículo fue vendido entre que el comprador abrió la ficha y envió el formulario, aceptar el lead igualmente pero marcarlo con nota interna: "Vehículo ya vendido al momento del envío — sugerir alternativas."
*   Si la API del backend no está disponible, el formulario debe guardar los datos localmente (localStorage) y reintentar el envío en background.
*   Si el reCAPTCHA detecta bot, bloquear el envío silenciosamente y no mostrar error al usuario.

---

### CU 9.7: Agendamiento Online de Test Drive desde el Portal Web
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Comprador Web*, quiero *seleccionar una fecha y horario disponible directamente desde el sitio web para agendar un test drive del vehículo que me interesa* para *asegurar mi cita sin tener que llamar por teléfono ni esperar confirmación manual.*

**Criterios de Aceptación:**
*   En la ficha del vehículo (CU 9.5), el botón **"Agendar Test Drive"** debe abrir un modal o sección con:
    *   **Calendario visual** que muestre los próximos 14 días con slots disponibles (franjas de 1 hora, dentro del horario de atención configurado en CU 9.1).
    *   **Nombre completo** (requerido).
    *   **Teléfono** (requerido).
    *   **Email** (requerido).
    *   **Notas / Preferencia horaria** (textarea, opcional).
*   Los slots ya ocupados (citas existentes en la tabla `Appointment`) deben mostrarse como **no disponibles** (gris, no clickeables).
*   Al confirmar la cita, el sistema debe:
    1.  Crear un registro en la tabla `Appointment` con `tipo = TEST_DRIVE` y `estado = AGENDADA`.
    2.  Crear o vincular un `Customer` y un `LeadOpportunity` (reutilizando la lógica del CU 9.6).
    3.  Enviar confirmación automática al comprador vía email con los detalles: fecha, hora, dirección del salón y vehículo de interés.
    4.  Notificar al vendedor asignado sobre la nueva cita.
*   El endpoint público debe ser `POST /api/public/{tenant_slug}/appointments`.

**Flujos Alternativos / Excepciones:**
*   Si el comprador selecciona un slot que fue reservado por otro usuario mientras completaba el formulario (race condition), alertar: "El horario seleccionado ya no está disponible. Por favor, elige otro." y refrescar los slots.
*   Si el comprador intenta agendar más de 2 test drives activos (no completados ni cancelados) en la misma automotora, alertar: "Ya tienes 2 citas agendadas. Completa o cancela una antes de agendar otra."
*   Si no hay slots disponibles en los próximos 14 días, mostrar: "No hay horarios disponibles por el momento. ¿Deseas que te contactemos para coordinar?" con un formulario simplificado (CU 9.6).

---

### CU 9.8: Personalización de Secciones y Páginas del Sitio Web (CMS Avanzado)
📌 **Prioridad:** Should Have | **Fase:** 3

**Historia de Usuario:** Como *Admin o Gerente*, quiero *personalizar las secciones visibles de mi sitio web (página de inicio, quiénes somos, servicios, testimonios, ubicación)* para *transmitir la identidad y los valores de mi automotora más allá de solo mostrar autos.*

**Criterios de Aceptación:**
*   El módulo CMS del ERP debe permitir gestionar las siguientes secciones/páginas editables:
    *   **Página de Inicio (Home):**
        *   Banner principal con imagen, título y subtítulo editables.
        *   Sección "Vehículos Destacados" (autopopulada desde vehículos con `destacado_web = True`, máximo 6).
        *   Sección "¿Por qué elegirnos?" con 3-4 bloques de texto + ícono editables (ej: "Garantía de 6 meses", "Financiamiento directo", "Tasamos tu auto al instante").
        *   Sección "Testimonios de clientes" con tarjetas de nombre + texto + estrellas (1-5).
    *   **Página "Quiénes Somos" (About Us):**
        *   Texto descriptivo largo (editor rich text con negritas, cursiva, listas y enlaces).
        *   Foto del equipo (upload de imagen).
        *   Misión y Visión (campos de texto).
    *   **Página "Servicios":**
        *   Lista editable de servicios ofrecidos (ej: "Financiamiento directo", "Consignación transparente", "Taller propio", "Seguros automotrices").
        *   Cada servicio con: Título, Descripción breve, Ícono/Imagen.
    *   **Página "Contacto / Ubicación":**
        *   Mapa de Google Maps embebido (con dirección precargada desde `Tenant.direccion_fisica`).
        *   Formulario de contacto general (reutiliza CU 9.6 sin vehículo asociado).
        *   Horarios de atención (precargados desde CU 9.1).
*   Cada sección debe poder **activarse o desactivarse** individualmente (toggle ON/OFF).
*   El contenido debe persistir en un campo JSON o tabla de configuración vinculada al tenant.
*   Los cambios deben reflejarse en el portal público de forma instantánea.

**Flujos Alternativos / Excepciones:**
*   Si el Admin intenta guardar un texto de "Quiénes Somos" vacío con la sección activada, alertar: "Completa el contenido antes de activar esta sección."
*   Si la sección "Testimonios" no tiene testimonios cargados, no mostrarla en el portal público (ocultamiento automático).

---

### CU 9.9: Simulador de Financiamiento Público (Widget en Portal Web)
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Comprador Web*, quiero *simular el financiamiento de un vehículo directamente desde su ficha pública (ajustando pie, cuotas y tipo de crédito)* para *conocer cuánto pagaría mensualmente antes de contactar a la automotora.*

**Criterios de Aceptación:**
*   En la ficha pública del vehículo (CU 9.5), debe existir un widget interactivo de **"Simula tu crédito"** que incluya:
    *   **Precio del vehículo** (precargado, no editable).
    *   **Slider de Pie (%):** Rango de 0% a 50%, paso de 5%, default 20%.
    *   **Selector de Cuotas:** 12, 24, 36, 48, 60 meses.
    *   **Tipo de crédito:** Crédito Convencional o Crédito Inteligente (VFG).
    *   **Resultado en tiempo real:**
        *   Monto del pie ($CLP).
        *   Monto a financiar ($CLP).
        *   Valor estimado de cuota mensual ($CLP).
        *   Monto VFG (si aplica Crédito Inteligente, calculado como 30% del valor del vehículo).
*   El cálculo debe usar la fórmula de cuota fija: `Cuota = P * [r(1+r)^n] / [(1+r)^n - 1]` donde P = monto a financiar, r = tasa mensual, n = número de cuotas.
*   La tasa de interés por defecto debe ser 1.45% mensual (configurable por el Admin desde el CMS).
*   Debajo del simulador, un botón CTA: **"Solicitar Pre-Aprobación"** que redirige al formulario de contacto (CU 9.6) con tipo de consulta "Consultar por Financiamiento" preseleccionado.
*   Disclaimer legal visible: *"*Esta simulación es referencial y no constituye una oferta de crédito. Las condiciones finales dependerán de la evaluación de la entidad financiera.*"*
*   El cálculo debe ejecutarse **100% en el frontend** (sin llamadas API por cada ajuste del slider).

**Flujos Alternativos / Excepciones:**
*   Si el precio del vehículo es $0 o no está definido, ocultar el widget simulador.
*   Si el comprador ajusta el pie a 0%, mostrar un aviso: "La mayoría de las financieras requieren un pie mínimo del 10-20%."

---

### CU 9.10: Página Pública de Vehículos Recién Llegados y Ofertas
📌 **Prioridad:** Should Have | **Fase:** 3

**Historia de Usuario:** Como *Comprador Web*, quiero *ver una sección dedicada a los vehículos recién llegados y las ofertas especiales* para *descubrir oportunidades antes que otros compradores.*

**Criterios de Aceptación:**
*   El portal público debe tener una sección **"Recién Llegados"** que muestre automáticamente los últimos 8 vehículos publicados (ordenados por `fecha_ingreso` descendente, máximo 30 días de antigüedad).
*   Debe existir una sección **"Ofertas"** que muestre los vehículos que tienen `precio_oferta_web` definido (precio oferta < precio público).
*   Cada vehículo en la sección de ofertas debe mostrar:
    *   Precio original tachado.
    *   Precio oferta resaltado en color.
    *   Porcentaje de descuento calculado (`(1 - precio_oferta / precio_publico) * 100`%).
    *   Badge "🔥 OFERTA" visible.
*   Ambas secciones deben estar vinculadas desde la Home y desde el menú de navegación del sitio.

**Flujos Alternativos / Excepciones:**
*   Si no hay vehículos recién llegados (ninguno ingresado en los últimos 30 días), ocultar la sección automáticamente.
*   Si no hay vehículos en oferta, ocultar la sección de ofertas automáticamente.

---

### CU 9.11: Métricas y Analíticas del Sitio Web (Dashboard CMS)
📌 **Prioridad:** Should Have | **Fase:** 3

**Historia de Usuario:** Como *Admin o Gerente*, quiero *ver métricas de rendimiento de mi sitio web (visitas, vehículos más vistos, leads generados, tasa de conversión web)* para *evaluar el retorno de inversión del canal digital y tomar decisiones informadas sobre qué autos destacar.*

**Criterios de Aceptación:**
*   En la sección "Mi Sitio Web (CMS)" del ERP, debe existir una pestaña **"Analíticas"** con las siguientes métricas:
    *   **Visitas totales al sitio** (últimos 7, 30 y 90 días).
    *   **Vehículos más vistos** (Top 10 por número de vistas de ficha detallada).
    *   **Leads generados desde la web** (total y por tipo de consulta).
    *   **Tasa de conversión web:** `(Leads generados desde web / Visitas totales) × 100%`.
    *   **Leads web que avanzaron a NEGOCIACIÓN o CERRADO_GANADO** (efectividad del canal web).
    *   **Test drives agendados desde la web** (total y tasa de confirmación).
    *   **Fuente de tráfico** (si se integra con Google Analytics: orgánico, directo, redes sociales, referido).
*   Las métricas deben actualizarse cada 24 horas como mínimo.
*   Debe existir un filtro de rango de fechas para todas las métricas.
*   Las vistas de vehículos deben rastrearse incrementando un contador (`view_count`) en cada petición `GET /api/public/{tenant_slug}/vehicles/{vehicle_id}`.

**Flujos Alternativos / Excepciones:**
*   Si el sitio tiene menos de 7 días de actividad, mostrar mensaje: "Recopilando datos. Las analíticas estarán disponibles después de 7 días de actividad."
*   Si no hay datos suficientes para calcular la tasa de conversión (0 visitas), mostrar "N/A" en lugar de un porcentaje.

---

### CU 9.12: Optimización SEO Automática del Portal Público
📌 **Prioridad:** Should Have | **Fase:** 3

**Historia de Usuario:** Como *Admin de la automotora*, quiero *que mi sitio web público esté optimizado automáticamente para motores de búsqueda (Google)* para *que los compradores me encuentren cuando busquen "autos usados en [ciudad]" o "[marca] [modelo] en venta".*

**Criterios de Aceptación:**
*   Cada página del portal público debe generar automáticamente:
    *   **`<title>`:** `{Marca} {Modelo} {Año} - {precio} | {nombre_automotora}` (para fichas de vehículo).
    *   **`<meta name="description">`:** `Compra tu {Marca} {Modelo} {Versión} {Año} con {kilometraje}km en {nombre_automotora}. Precio: ${precio_venta}. Financiamiento disponible. {dirección}.`
    *   **Tags Open Graph** (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`).
    *   **Tags Twitter Card** (`twitter:card=summary_large_image`, etc.).
    *   **Schema.org / JSON-LD** de tipo `Vehicle` y `AutoDealer` para rich snippets en Google.
*   El portal debe generar un **`sitemap.xml`** dinámico que incluya:
    *   URL de la home del tenant.
    *   URL de cada vehículo publicado.
    *   URL de las páginas estáticas (Quiénes Somos, Contacto, etc.).
    *   `lastmod` basado en la última actualización del vehículo o de la página.
*   El portal debe generar un **`robots.txt`** que permita la indexación de las páginas públicas y bloquee las rutas internas del ERP.
*   Las URLs deben ser **semánticas y legibles**: `/vehiculo/toyota-rav4-2023-abc123` en lugar de `/vehicle/uuid-largo`.
*   El portal debe soportar **Server-Side Rendering (SSR)** o **Static Site Generation (SSG)** para que el contenido sea rastreable por los bots de Google.

**Flujos Alternativos / Excepciones:**
*   Si un vehículo es despublicado, el sitemap debe actualizarse en el siguiente ciclo de generación y la URL anterior debe retornar `HTTP 410 Gone`.
*   Si la meta description generada excede 160 caracteres, truncar automáticamente y agregar "...".

---

### CU 9.13: Gestión de Dominio Personalizado (Subdominio / Dominio Propio)
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Admin de la automotora*, quiero *configurar mi propio dominio personalizado (ej: www.automotoraorigen.cl) o usar el subdominio gratuito (origen.automotora.app)* para *proyectar una imagen profesional y memorable de mi negocio en internet.*

**Criterios de Aceptación:**
*   Cada tenant debe tener un **subdominio gratuito por defecto**: `{subdominio}.automotora.app` (generado desde `Tenant.subdominio`).
*   En la configuración CMS, debe existir una sección **"Dominio"** con:
    *   **Subdominio actual** (solo lectura, editable solo por Admin de plataforma).
    *   **Dominio personalizado** (campo de texto, ej: `www.miauto.cl`).
    *   **Instrucciones para configurar DNS:** Guía paso a paso para agregar un registro CNAME apuntando a `proxy.automotora.app`.
    *   **Estado de verificación del dominio:** "Pendiente" (amarillo), "Verificado" (verde), "Error de DNS" (rojo).
*   El sistema debe verificar periódicamente (cada 30 minutos) que el registro CNAME del dominio personalizado apunte correctamente al servidor.
*   Si el dominio está verificado, todo el tráfico a ese dominio debe servir el portal del tenant correspondiente.
*   El sistema debe gestionar automáticamente el certificado SSL (Let's Encrypt / Cloudflare) para el dominio personalizado.

**Flujos Alternativos / Excepciones:**
*   Si el dominio personalizado no pasa la verificación DNS después de 72 horas, enviar un email de recordatorio al Admin con instrucciones actualizadas.
*   Si el Admin ingresa un dominio que ya está vinculado a otro tenant, alertar: "Este dominio ya está en uso por otra automotora en la plataforma."
*   Si el certificado SSL no puede generarse, servir el sitio en HTTP con un banner de advertencia visible solo para el Admin.

---

### CU 9.14: Compartir Vehículos en Redes Sociales y WhatsApp desde el ERP
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Vendedor*, quiero *generar un enlace público atractivo de un vehículo y compartirlo directamente en WhatsApp, Instagram o Facebook desde el ERP* para *promocionar mis vehículos en mis redes personales y las de la automotora sin salir del sistema.*

**Criterios de Aceptación:**
*   En la ficha del vehículo dentro del Inventario del ERP (solo para vehículos con `publicado_web = True`), debe existir un botón **"Compartir en Web"** que muestre:
    *   **Enlace público corto** copiable al portapapeles (ej: `origen.automotora.app/v/kj9w`).
    *   **Botón "Enviar por WhatsApp"** que abra WhatsApp Web con un mensaje predeterminado que incluya foto, descripción y enlace.
    *   **Botón "Compartir en Facebook"** que abra el diálogo de compartir de Facebook con la URL y las meta tags Open Graph.
    *   **Botón "Copiar para Instagram"** que copie al portapapeles un texto formateado con emojis para pegar como caption de una publicación:
        ```
        🚗 {Marca} {Modelo} {Versión} — {Año}
        📍 {kilometraje} km | {combustible} | {transmisión}
        💰 ${precio_venta_publico} CLP
        🔗 {enlace_público}
        📱 Consultas: {whatsapp_contacto}
        ```
*   Al compartir, se debe registrar un evento de "Compartido en {canal}" en el historial del vehículo para medir efectividad del canal.

**Flujos Alternativos / Excepciones:**
*   Si el vehículo no está publicado en la web, el botón "Compartir en Web" debe estar deshabilitado con tooltip: "Publica este vehículo en tu sitio web para poder compartirlo."
*   Si el sitio web del tenant está desactivado, alertar: "Tu sitio web está desactivado. Actívalo para que el enlace funcione."

---

### CU 9.15: Notificaciones Automáticas de Nuevos Vehículos a Suscriptores Web
📌 **Prioridad:** Could Have | **Fase:** 4

**Historia de Usuario:** Como *Comprador Web*, quiero *suscribirme a alertas de nuevos vehículos que coincidan con mis preferencias (marca, rango de precio, año)* para *ser el primero en enterarme cuando llegue un auto que me interesa sin tener que revisar el sitio todos los días.*

**Criterios de Aceptación:**
*   En el portal público, debe existir un formulario de **"Suscripción a Alertas"** con:
    *   Email (requerido).
    *   Marca de interés (select múltiple, opcional).
    *   Rango de precio máximo (slider o input, opcional).
    *   Año mínimo (input, opcional).
*   La suscripción debe almacenarse en una tabla `WebSubscribers` vinculada al tenant.
*   Cuando un nuevo vehículo que coincida con los filtros del suscriptor sea publicado en el sitio web (`publicado_web = True`), el sistema debe enviar automáticamente un email con:
    *   Foto del vehículo.
    *   Marca, Modelo, Año, Precio.
    *   Enlace directo a la ficha pública.
    *   Botón "Consultar por este auto".
    *   Enlace de "Darse de baja" (unsubscribe) funcional en un clic.
*   La frecuencia máxima de envío de alertas debe ser de **1 email por día** (agrupando múltiples vehículos en un solo email si hay más de uno nuevo).

**Flujos Alternativos / Excepciones:**
*   Si el suscriptor no abre ningún email en 90 días, desactivar automáticamente la suscripción y registrar como "Inactivo".
*   Si el email rebota (bounce), marcar la suscripción como "Email inválido" y no reintentar.
*   El sistema debe respetar las regulaciones de anti-spam y GDPR/LGPD.

---

### CU 9.16: Reserva Online con Pago de Seña desde el Portal Web
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Comprador Web*, quiero *poder reservar un vehículo directamente desde el sitio web pagando una seña online (con tarjeta de crédito/débito o transferencia)* para *asegurar el auto sin tener que ir presencialmente a la automotora.*

**Criterios de Aceptación:**
*   En la ficha del vehículo, si el vehículo está en estado `DISPONIBLE`, debe existir un botón **"Reservar con Seña Online"**.
*   Al presionar el botón, se abre un flujo de reserva con:
    *   Datos del vehículo (resumen: foto, marca, modelo, año, precio).
    *   Monto de la seña: fijo o configurable por el Admin (por defecto: $200.000 CLP o 2% del precio).
    *   Formulario de datos del comprador (Nombre, RUT, Teléfono, Email).
    *   **Pasarela de pago integrada:** Webpay (Transbank) o MercadoPago según lo configurado por el Admin.
*   Al confirmar el pago exitoso:
    1.  El estado del vehículo cambia a `RESERVADO` en el ERP.
    2.  Se crea un `LeadOpportunity` con estado `RESERVADO` y monto de seña registrado.
    3.  Se envía comprobante de pago al comprador por email.
    4.  Se notifica al vendedor asignado y al Gerente con los datos de la reserva.
    5.  La seña tiene validez de **72 horas** (configurable). Si el comprador no concreta la compra en ese plazo, la reserva se libera automáticamente y el vehículo vuelve a `DISPONIBLE`.
*   En el portal público, el vehículo reservado debe mostrar un badge **"Reservado"** y ya no permitir nueva reserva.

**Flujos Alternativos / Excepciones:**
*   Si el pago falla (tarjeta rechazada, timeout de pasarela), mostrar: "No pudimos procesar tu pago. Intenta con otro medio o contacta a la automotora." El estado del vehículo no debe cambiar.
*   Si dos compradores intentan reservar el mismo vehículo simultáneamente, solo el primer pago exitoso procesa la reserva. El segundo debe recibir: "Este vehículo acaba de ser reservado. Te sugerimos explorar opciones similares."
*   Si el comprador solicita la devolución de la seña dentro de las primeras 24 horas, el sistema debe permitirlo y liberar la reserva automáticamente.
*   Si la pasarela de pago no está configurada por el Admin, el botón de reserva no debe mostrarse en el portal.

---

## 11. Resumen de Casos de Uso del Módulo CMS Storefront

| Nº | Caso de Uso | Actor Principal | Prioridad | Fase |
| :--- | :--- | :--- | :--- | :--- |
| CU 9.1 | Configuración de Identidad Visual y Branding | Admin / Gerente | Must Have | 2 |
| CU 9.2 | Activación y Desactivación del Sitio Web | Admin | Must Have | 2 |
| CU 9.3 | Publicación / Despublicación de Vehículos | Vendedor / Gerente | Must Have | 2 |
| CU 9.4 | Catálogo Público con Filtros Avanzados | Comprador Web | Must Have | 2 |
| CU 9.5 | Ficha Pública Detallada del Vehículo | Comprador Web | Must Have | 2 |
| CU 9.6 | Formulario de Contacto y Captura de Lead Web | Comprador Web + ERP | Must Have | 2 |
| CU 9.7 | Agendamiento Online de Test Drive | Comprador Web | Should Have | 2 |
| CU 9.8 | Personalización de Secciones CMS Avanzado | Admin / Gerente | Should Have | 3 |
| CU 9.9 | Simulador de Financiamiento Público | Comprador Web | Should Have | 2 |
| CU 9.10 | Recién Llegados y Ofertas | Comprador Web | Should Have | 3 |
| CU 9.11 | Métricas y Analíticas del Sitio Web | Admin / Gerente | Should Have | 3 |
| CU 9.12 | Optimización SEO Automática | Sistema | Should Have | 3 |
| CU 9.13 | Gestión de Dominio Personalizado | Admin | Could Have | 3 |
| CU 9.14 | Compartir Vehículos en Redes Sociales | Vendedor | Should Have | 2 |
| CU 9.15 | Notificaciones a Suscriptores Web | Comprador Web + Sistema | Could Have | 4 |
| CU 9.16 | Reserva Online con Pago de Seña | Comprador Web | Could Have | 3 |
| **Total** | | | **16 casos de uso** | |

---

## Diagrama de Flujo: Arquitectura CMS Storefront ↔ ERP

```
┌─────────────────────────────────────────────────────────┐
│                   PORTAL PÚBLICO                        │
│              (Sitio Web de la Automotora)                │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Catálogo    │  │ Ficha Auto   │  │ Formulario    │  │
│  │  Público     │  │ Detallada    │  │ Contacto/Lead │  │
│  │  (CU 9.4)   │  │ (CU 9.5)    │  │ (CU 9.6)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│  ┌──────┴─────┐    ┌──────┴───────┐  ┌──────┴────────┐  │
│  │ Simulador  │    │ Test Drive   │  │ Reserva Seña  │  │
│  │ Crédito    │    │ Online       │  │ Online        │  │
│  │ (CU 9.9)  │    │ (CU 9.7)    │  │ (CU 9.16)    │  │
│  └────────────┘    └──────────────┘  └───────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
                    API REST Pública
               (Sin autenticación JWT)
              GET /api/public/{slug}/...
              POST /api/public/{slug}/...
                            │
┌───────────────────────────┼─────────────────────────────┐
│                    BACKEND ERP                          │
│                  (FastAPI + SQLAlchemy)                  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Router       │  │ Router       │  │ Router        │  │
│  │ Public       │  │ Vehicles     │  │ Leads         │  │
│  │ (nuevo)      │  │ (existente)  │  │ (existente)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│         └─────────────────┼──────────────────┘           │
│                           │                              │
│                    Base de Datos                         │
│              (SQLite / PostgreSQL)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Tenants  │ │Vehiculos │ │  Leads   │ │ Customers  │  │
│  │ (+CMS)  │ │(+web pub)│ │(+origen  │ │ (+origen   │  │
│  │         │ │          │ │  web)    │ │   web)     │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│                    ERP FRONTEND                         │
│                (React + Vite — Autenticado)              │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Tab "Mi      │  │ Inventario   │  │ Pipeline      │  │
│  │ Sitio Web"   │  │ (toggle web) │  │ Kanban        │  │
│  │ CMS (CU 9.1)│  │ (CU 9.3)    │  │ (🌐 badge)   │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Endpoints API Públicos Requeridos (Nuevos)

| Método | Endpoint | Descripción | CU Relacionado |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/{tenant_slug}/config` | Configuración CMS del tenant (branding, colores, contacto) | CU 9.1, 9.4, 9.5 |
| `GET` | `/api/public/{tenant_slug}/vehicles` | Catálogo de vehículos publicados con filtros | CU 9.4 |
| `GET` | `/api/public/{tenant_slug}/vehicles/{vehicle_id}` | Ficha pública detallada del vehículo | CU 9.5 |
| `GET` | `/api/public/{tenant_slug}/vehicles/featured` | Vehículos destacados para portada | CU 9.10 |
| `GET` | `/api/public/{tenant_slug}/vehicles/offers` | Vehículos en oferta | CU 9.10 |
| `GET` | `/api/public/{tenant_slug}/vehicles/recent` | Vehículos recién llegados | CU 9.10 |
| `POST` | `/api/public/{tenant_slug}/leads` | Captura de lead web (formulario contacto) | CU 9.6 |
| `GET` | `/api/public/{tenant_slug}/appointments/slots` | Slots disponibles para test drive | CU 9.7 |
| `POST` | `/api/public/{tenant_slug}/appointments` | Agendar test drive online | CU 9.7 |
| `GET` | `/api/public/{tenant_slug}/pages/{page_slug}` | Contenido de páginas CMS (About, Servicios) | CU 9.8 |
| `GET` | `/api/public/{tenant_slug}/sitemap.xml` | Sitemap XML dinámico | CU 9.12 |
| `POST` | `/api/public/{tenant_slug}/subscribe` | Suscripción a alertas de nuevos autos | CU 9.15 |
| `POST` | `/api/public/{tenant_slug}/reservations` | Reserva online con inicio de pago | CU 9.16 |

## Endpoints API Internos Requeridos (ERP — Autenticados)

| Método | Endpoint | Descripción | CU Relacionado |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tenants/{id}/cms` | Obtener configuración CMS actual | CU 9.1 |
| `PATCH` | `/api/tenants/{id}/cms` | Actualizar configuración CMS | CU 9.1, 9.2 |
| `PATCH` | `/api/vehicles/{id}/web-publish` | Publicar/Despublicar vehículo en web | CU 9.3 |
| `GET` | `/api/analytics/web` | Métricas del sitio web | CU 9.11 |

---

*Documentación CMS Storefront generada para CRM Automotora ERP. Abierta a revisión, comentarios y modificaciones antes de la implementación.*
