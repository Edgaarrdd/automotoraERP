# Casos de Uso e Historias de Usuario: CRM Automotora

Este documento detalla los principales casos de uso (User Stories) para los actores clave del ecosistema: El **Gerente de Ventas**, el **Vendedor**, el **Comprador** (cliente final), el **Equipo de Marketing**, el **Consignatario**, el **Encargado de F&I**, el **Jefe de Taller**, el **Recepcionista / Agente BDC** y el **Administrador del Sistema**. Cada caso incluye criterios de aceptación que servirán como guía exacta para el equipo de desarrollo.

---

## 👨‍💼 1. Casos de Uso: Gerente de Ventas
*El Gerente necesita control, visibilidad de las métricas clave y asegurar que la rentabilidad de la automotora se mantenga saludable.*

### CU 1.1: Dashboard de Rendimiento en Tiempo Real
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Gerente de Ventas*, quiero *visualizar un panel de control con métricas en tiempo real (ventas cerradas, leads activos, rotación de inventario)* para *tomar decisiones rápidas y auditar el rendimiento general del negocio.*

**Criterios de Aceptación:**
*   El panel debe mostrar el número de autos en stock, segmentados por estado (En preparación, Disponible, Reservado).
*   Debe mostrar un gráfico del "Embudo de Ventas" con las tasas de conversión (Ej: Cuántos leads pasaron de "Visita" a "Cierre").
*   Debe existir un indicador de "Tiempo en Inventario" que alerte en color rojo los autos que llevan más de 45 días sin venderse.

**Flujos Alternativos / Excepciones:**
*   Si no hay datos suficientes para generar un gráfico (menos de 5 leads o 0 ventas), el panel debe mostrar un estado vacío con el mensaje "Aún no hay suficientes datos" y un enlace para crear el primer lead.
*   Si la carga del dashboard excede 5 segundos, mostrar los widgets individuales a medida que se cargan (carga progresiva).

### CU 1.2: Aprobación y Auditoría de Tasaciones
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Gerente de Ventas*, quiero *recibir notificaciones para revisar y aprobar las tasaciones automáticas de nuevos vehículos* para *asegurar que el precio de compra o consignación garantice un margen de ganancia adecuado.*

**Criterios de Aceptación:**
*   Cuando un vendedor tasa un auto, el sistema debe bloquear su publicación hasta la aprobación del Gerente.
*   El Gerente debe ver la tasación generada por el sistema comparada con el valor propuesto por el vendedor.
*   El Gerente debe tener un botón de "Aprobar", "Rechazar" o "Modificar Precio".

**Flujos Alternativos / Excepciones:**
*   Si la API de tasación no devuelve datos de mercado, el sistema debe permitir al vendedor ingresar el precio manualmente y marcar la tasación como "Sin datos de mercado".
*   Si el gerente no aprueba la tasación en 48 horas, el sistema envía un recordatorio automático.

### CU 1.3: Asignación y Re-asignación de Leads
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Gerente de Ventas*, quiero *ver los leads sin atención o estancados y reasignarlos a otro vendedor* para *no perder ninguna oportunidad de venta por falta de seguimiento.*

**Criterios de Aceptación:**
*   El sistema debe mostrar una alerta de "Leads inactivos" si un cliente no ha sido contactado en más de 24 horas.
*   El Gerente debe poder arrastrar y soltar un lead de la bandeja de "Vendedor A" hacia "Vendedor B" enviando una notificación automática a este último.

**Flujos Alternativos / Excepciones:**
*   Si el vendedor destino tiene más de 20 leads activos, el sistema debe mostrar una advertencia de sobrecarga antes de confirmar la reasignación.
*   Si un lead lleva más de 72 horas sin contacto, debe escalarse automáticamente al gerente.

### CU 1.4: Gestión de Comisiones y Bonos por Desempeño
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Gerente de Ventas*, quiero *configurar reglas de comisiones y visualizar las comisiones generadas por cada vendedor* para *motivar al equipo y mantener el control de la nómina variable.*

**Criterios de Aceptación:**
*   El Gerente debe poder definir reglas de comisión por vendedor o por rol (Ej: "3% del margen por auto", "Bono de $200 si vende 5 autos en el mes").
*   El sistema debe calcular automáticamente la comisión de cada venta cerrada y agregarla al panel del vendedor.
*   Debe existir un reporte exportable (PDF/Excel) de comisiones pagadas y pendientes por período.

### CU 1.5: Reportes Avanzados de Inventario y Proyección de Compras
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Gerente de Ventas*, quiero *generar reportes dinámicos de rotación de inventario y proyección de compras* para *identificar qué segmentos de autos comprar en la próxima temporada.*

**Criterios de Aceptación:**
*   El sistema debe mostrar un ranking de modelos más vendidos vs. modelos más lentos en rotar.
*   Debe existir un reporte de "Margen Bruto por Vehículo" que cruce precio de compra/tasación con precio de venta final.
*   El reporte debe permitir filtrar por rango de fechas, marca, modelo y vendedor.

### CU 1.6: Configuración de Productos y Servicios Complementarios
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Gerente de Ventas*, quiero *configurar el catálogo de servicios complementarios (garantía extendida, seguros, accesorios)* para *que los vendedores puedan ofrecer paquetes adicionales en cada cotización.*

**Criterios de Aceptación:**
*   El Gerente debe tener una sección de "Catálogo de Servicios" donde pueda agregar, editar y asignar precio a servicios como "Garantía 12 meses", "Seguro todo riesgo", "Tapiz de cuero".
*   Los servicios configurados deben aparecer automáticamente como checkboxes opcionales en el generador de cotizaciones del vendedor.
*   Cada servicio debe poder tener un costo y un precio de venta distintos (para calcular margen del servicio).

---

## 🏃‍♂️ 2. Casos de Uso: Vendedor (Asesor Comercial)
*El Vendedor necesita agilidad, perder el menor tiempo posible en administración y tener herramientas para cerrar ventas rápido.*

### CU 2.1: Ingreso Express y Ficha Técnica Automatizada
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Vendedor*, quiero *ingresar la patente de un vehículo para que el sistema autocompleta la ficha técnica* para *ahorrar tiempo en registro manual y publicar el auto rápidamente.*

**Criterios de Aceptación:**
*   El vendedor ingresa solo la patente (ej. ABCD-12) en la barra de búsqueda inicial.
*   El sistema debe consultar en segundos la API externa y rellenar automáticamente: Marca, Modelo, Año, Tipo de Combustible, Motor, Transmisión, VIN.
*   Si la API no encuentra un dato, el campo debe quedar habilitado para ingreso manual.

**Flujos Alternativos / Excepciones:**
*   Si la API de patentes no responde en 10 segundos, el sistema debe mostrar un mensaje "Servicio no disponible" y habilitar todos los campos para ingreso manual.
*   Si la patente ya existe en el sistema, alertar: "Este vehículo ya está registrado" y mostrar un enlace a la ficha existente.
*   Si la API devuelve datos parciales (ej: marca y modelo pero no VIN), los campos faltantes deben quedar habilitados para completar manualmente.

### CU 2.2: Gestión de Clientes en el Embudo (Kanban)
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Vendedor*, quiero *ver mis prospectos de compra en un tablero visual tipo Kanban* para *saber exactamente en qué estado de negociación está cada uno.*

**Criterios de Aceptación:**
*   El vendedor debe ver columnas claras: *Nuevo Lead, Contactado, Test Drive Agendado, Negociación, Reservado, Vendido.*
*   Debe poder mover a un cliente de columna simplemente arrastrando la tarjeta (drag and drop).
*   Al mover la tarjeta a "Test Drive Agendado", el sistema debe exigir que se ingrese una fecha y hora.

**Flujos Alternativos / Excepciones:**
*   Si un vendedor intenta mover un lead a "Reservado" sin que exista una reserva registrada en el sistema, bloquear la acción y mostrar: "Primero debes registrar una reserva para este cliente".
*   Si dos vendedores intentan mover el mismo lead simultáneamente, el sistema debe usar bloqueo optimista y notificar al segundo: "Este lead fue modificado por [nombre]. Recarga para ver los cambios".

### CU 2.3: Generación de Cotización Inmediata
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Vendedor*, quiero *generar una cotización en un clic con opciones de pago y compartirla por WhatsApp* para *responder de inmediato al cliente mientras su interés es alto.*

**Criterios de Aceptación:**
*   En el perfil del cliente, debe haber un botón "Generar Cotización".
*   El sistema crea un PDF (o enlace web dinámico) que incluye las fotos del auto, especificaciones, precio final y simulación de 3 métodos de financiamiento (Contado, Crédito Inteligente, Crédito Convencional).
*   Debe incluir un botón de "Enviar por WhatsApp" que abra la aplicación con un mensaje predeterminado.

**Flujos Alternativos / Excepciones:**
*   Si el vehículo ya no está en estado "DISPONIBLE" al momento de generar la cotización, alertar: "Este vehículo ya no está disponible" y sugerir vehículos similares.
*   Si el servicio de generación de PDF falla, ofrecer la cotización como enlace web dinámico como alternativa.

### CU 2.4: Agenda y Gestión de Test Drives
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Vendedor*, quiero *gestionar una agenda de test drives con recordatorios automáticos* para *organizar mi día y no superponer citas.*

**Criterios de Aceptación:**
*   El sistema debe mostrar un calendario semanal con los test drives agendados, separados por hora y vendedor.
*   Al agendar un test drive, el sistema debe verificar que el vendedor no tenga otra cita en el mismo horario.
*   El sistema debe enviar un recordatorio automático al vendedor y al comprador 2 horas antes de la cita (por WhatsApp o email).

**Flujos Alternativos / Excepciones:**
*   Si el cliente no confirma el test drive 24 horas antes, el sistema debe enviar un recordatorio adicional.
*   Si el cliente marca "No se presentó" 3 veces consecutivas, el lead debe ser marcado automáticamente con una alerta de "Cliente no confiable".

### CU 2.5: Seguimiento Post-Venta y Encuesta de Satisfacción
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Vendedor*, quiero *recibir alertas para hacer seguimiento post-venta a mis clientes* para *asegurar su satisfacción y generar referidos.*

**Criterios de Aceptación:**
*   El sistema debe disparar una tarea automática "Contactar post-venta" a los 7, 30 y 90 días después de la venta.
*   El vendedor debe tener un script o guía de llamada visible en la pantalla.
*   El sistema debe enviar una encuesta de satisfacción (NPS) al comprador 15 días después de la entrega del vehículo.

### CU 2.6: Catálogo Móvil Interactivo para Clientes
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Vendedor*, quiero *poder mostrar un catálogo interactivo de autos en stock desde mi celular* para *captar el interés de un cliente en cualquier lugar sin tener que volver a la oficina.*

**Criterios de Aceptación:**
*   El vendedor debe poder abrir una vista de "Catálogo" con todos los vehículos disponibles, filtrables por marca, modelo, año y rango de precio.
*   Al tocar un auto, se debe abrir una ficha detallada con fotos, especificaciones y precio.
*   El vendedor debe poder "Compartir" un auto directamente desde el catálogo a WhatsApp con un mensaje prediseñado.

**Flujos Alternativos / Excepciones:**
*   Si no hay vehículos disponibles que coincidan con los filtros aplicados, mostrar: "No hay resultados. Intenta con menos filtros" y sugerir los filtros más cercanos.

### CU 2.7: Cierre y Registro de Venta
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Vendedor*, quiero *registrar formalmente el cierre de una venta con todos los datos de la transacción* para *generar el contrato, disparar las comisiones y dar inicio a los trámites post-venta.*

**Criterios de Aceptación:**
*   El vendedor debe poder seleccionar el lead ganado y presionar "Cerrar Venta".
*   El sistema debe solicitar: precio de venta final, método de pago (Contado / Crédito / Mixto), monto del pie (si aplica), y si hay auto en permuta (trade-in).
*   Si hay auto en permuta, el sistema debe permitir ingresar o buscar el vehículo del cliente y registrar su valor de tasación.
*   Al confirmar, el sistema debe automáticamente:
    *   Crear el registro de `Venta`.
    *   Cambiar el estado del vehículo a "VENDIDO".
    *   Mover el lead a "CERRADO_GANADO".
    *   Calcular y registrar la comisión del vendedor.
    *   Iniciar el flujo de trámites post-venta.
    *   Si el vehículo era de consignación, generar la liquidación para el consignatario.
    *   Programar la encuesta de satisfacción a los 15 días.
*   El sistema debe generar un contrato de compraventa en PDF con los datos de la transacción.

**Flujos Alternativos / Excepciones:**
*   Si el precio de venta final es menor al `precio_minimo_venta`, el sistema debe requerir aprobación del gerente antes de proceder.
*   Si el comprador tiene una solicitud de financiamiento pendiente (estado != "APROBADA"), el sistema debe alertar: "El financiamiento aún no está aprobado. ¿Deseas continuar igualmente?".
*   Si la venta se anula posteriormente, el sistema debe revertir: estado del vehículo a "DISPONIBLE", anular la comisión, y notificar al consignatario (si aplica).

---

## 🚘 3. Casos de Uso: Comprador (Cliente Final)
*El comprador busca transparencia, información clara, y sentir que le están ofreciendo opciones personalizadas sin ser invasivos.*

### CU 3.1: Recepción de Cotización Interactiva y Transparente
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Comprador*, quiero *recibir una cotización detallada en mi teléfono que incluya el historial del vehículo* para *sentir confianza de que estoy comprando un auto sin problemas legales o mecánicos ocultos.*

**Criterios de Aceptación:**
*   Al abrir el enlace enviado por el vendedor, la vista (optimizada para móviles) debe ser atractiva, con galería de fotos deslizable.
*   Debe existir una pestaña de "Transparencia" o "Historial" donde se certifique que el auto no tiene encargo por robo, multas impagas o choques graves.

**Flujos Alternativos / Excepciones:**
*   Si el enlace de la cotización ha expirado (>7 días), mostrar un mensaje claro: "Esta cotización ha vencido. Contacta a tu asesor para una nueva" con los datos del vendedor.
*   Si el historial del vehículo revela problemas (multas, prendas), el sistema debe mostrar una alerta visible pero no bloquear la visualización.

### CU 3.2: Notificaciones de "Clientes Gemelos" (Marketing Inteligente)
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Comprador*, quiero *recibir una alerta automática si llega al inventario un auto que coincide con mis preferencias pasadas* para *tener la primera oportunidad de comprarlo antes que otros.*

**Criterios de Aceptación:**
*   Si el comprador cotizó un "Subaru XV 2019" hace 3 meses y no compró, y la automotora ingresa un nuevo "Subaru XV 2020".
*   El sistema debe enviar un Email o SMS diciendo: *"Hola [Nombre], acaba de ingresar el Subaru XV que estabas buscando. ¡Ven a verlo antes de que se publique!"*
*   Debe incluir la opción de darse de baja (unsubscribe) de estos avisos en un clic.

### CU 3.3: Solicitud de Reserva / Agendar Test Drive Online
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Comprador*, quiero *poder agendar un Test Drive o realizar una pre-reserva directamente desde la cotización* para *asegurar el vehículo sin tener que ir físicamente o hacer llamadas innecesarias.*

**Criterios de Aceptación:**
*   En la cotización digital, debe haber un botón de "Agendar Test Drive".
*   Al presionarlo, el sistema mostrará un calendario con los horarios disponibles del vendedor asignado.
*   Opcionalmente (si se implementa pasarela de pago), un botón de "Reservar con $X" que integre un pago online (ej. Webpay, MercadoPago), y que automáticamente mueva el estado del auto a "Reservado" en el CRM, notificando al vendedor.

**Flujos Alternativos / Excepciones:**
*   Si el pago de la seña falla (tarjeta rechazada, timeout), el sistema debe mostrar opciones alternativas de pago y no cambiar el estado del vehículo.
*   Si el vehículo es reservado por otro cliente mientras el comprador está en el proceso de pago, notificar inmediatamente y ofrecer vehículos similares.

### CU 3.4: Portal de Seguimiento de Trámites Post-Compra
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Comprador*, quiero *recibir actualizaciones del estado de los trámites de mi auto comprado (transferencia, encargo de patente)* para *tener tranquilidad sin tener que llamar a la automotora.*

**Criterios de Aceptación:**
*   Después de la compra, el comprador debe recibir un enlace único donde vea una línea de tiempo de los trámites: "Documentación recibida", "En proceso de transferencia en el Registro Civil", "Transferencia completada", "Patente lista para retirar".
*   El sistema debe actualizar automáticamente el estado cuando el vendedor marque un hito como completado.
*   Si un trámite se demora más de lo estimado, debe aparecer una alerta naranja con el motivo de la demora.

### CU 3.5: Evaluación y Feedback del Vehículo Recibido
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Comprador*, quiero *poder calificar mi experiencia de compra y reportar cualquier detalle del vehículo recibido* para *que la automotora pueda corregir problemas y yo quede satisfecho.*

**Criterios de Aceptación:**
*   15 días después de la entrega, el comprador recibe un enlace con una encuesta de satisfacción (NPS de 1 a 10).
*   El comprador debe poder adjuntar fotos si desea reportar un detalle estético o mecánico no informado.
*   El reporte debe llegar automáticamente al vendedor y al gerente con una notificación.

### CU 3.6: Simulación y Solicitud de Financiamiento
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Comprador*, quiero *simular diferentes opciones de financiamiento desde la cotización digital y enviar mis datos para pre-aprobación* para *saber exactamente cuánto pagaría al mes sin tener que ir al banco.*

**Criterios de Aceptación:**
*   La cotización digital debe tener un slider interactivo donde el comprador ajuste el pie (entrada) y visualice el valor de las cuotas en 12, 24, 36 o 48 meses.
*   Al seleccionar una opción, el comprador debe poder llenar un formulario corto (nombre, RUT, ingresos) y enviarlo para pre-aprobación.
*   El sistema debe enviar una notificación al vendedor con los datos de la solicitud de financiamiento.

---

## 📢 4. Casos de Uso: Equipo de Marketing
*El equipo de Marketing necesita data segmentada, automatización de campañas y métricas de retorno para maximizar el valor de la base de clientes.*

### CU 4.1: Creación y Gestión de Campañas Multicanal
📌 **Prioridad:** Could Have | **Fase:** 4

**Historia de Usuario:** Como *Marketing*, quiero *crear campañas de email/SMS/WhatsApp desde el CRM seleccionando una audiencia segmentada* para *lanzar promociones y reactivar clientes fríos sin depender de herramientas externas.*

**Criterios de Aceptación:**
*   El usuario debe poder crear una campaña nueva seleccionando: nombre, canal (Email, SMS, WhatsApp), lista de destinatarios y fecha de envío.
*   Debe existir un editor de plantillas con variables dinámicas (Ej: `{{nombre_cliente}}`, `{{marca_auto_interes}}`).
*   La campaña debe poder programarse para envío inmediato o diferido.

### CU 4.2: Segmentación Avanzada de Audiencia
📌 **Prioridad:** Could Have | **Fase:** 4

**Historia de Usuario:** Como *Marketing*, quiero *construir segmentos de clientes usando filtros combinados (comportamiento, datos demográficos, historial de compra)* para *enviar el mensaje correcto a la persona correcta.*

**Criterios de Aceptación:**
*   El sistema debe permitir crear segmentos con filtros como: "Clientes que compraron hace más de 2 años", "Personas que cotizaron un SUV y no compraron", "Clientes con cumpleaños este mes".
*   Los segmentos deben ser guardables y reutilizables para futuras campañas.
*   El sistema debe mostrar el tamaño estimado de la audiencia antes de enviar la campaña.

### CU 4.3: Dashboard de Rendimiento de Campañas
📌 **Prioridad:** Could Have | **Fase:** 4

**Historia de Usuario:** Como *Marketing*, quiero *ver métricas de rendimiento de cada campaña (tasa de apertura, clics, conversiones)* para *optimizar las próximas comunicaciones y reportar resultados al gerente.*

**Criterios de Aceptación:**
*   El dashboard debe mostrar para cada campaña: enviados, entregados, abiertos, clics en enlaces y bajas (unsubscribes).
*   Debe existir un gráfico de línea temporal que muestre la apertura en las primeras 24 horas.
*   El sistema debe calcular el ROI estimado de la campaña si se pueden rastrear ventas generadas a partir de ella.

---

## 🤝 5. Casos de Uso: Consignatario (Dueño del Vehículo)
*El Consignatario es la persona que deja su auto a la venta en la automotora. Busca transparencia, tranquilidad y comunicación sin fricción.*

### CU 5.1: Portal de Transparencia del Auto en Consignación
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Consignatario*, quiero *ingresar a un portal con un enlace único para ver en tiempo real el estado de mi auto* para *saber si se ha mostrado, si hay ofertas o si ya se vendió, sin tener que llamar.*

**Criterios de Aceptación:**
*   El consignatario recibe un enlace único por WhatsApp/email al momento de firmar el contrato de consignación.
*   El portal debe mostrar: estado actual del auto, número de visitas (clientes que lo vieron en el salón o en la web), ofertas recibidas y precio sugerido vs. precio de venta actual.
*   Si el auto recibe una oferta, el portal debe mostrar un botón "Aceptar Oferta" o "Rechazar Oferta" que notifique al vendedor.

**Flujos Alternativos / Excepciones:**
*   Si el consignatario intenta acceder con un enlace inválido o expirado, mostrar: "Enlace no válido. Contacta a la automotora" con los datos de contacto.
*   Si no hay actividad en el vehículo durante 2 semanas, el sistema debe enviar un mensaje proactivo al consignatario explicando la situación.

### CU 5.2: Firma Digital de Contratos y Documentación
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Consignatario*, quiero *firmar digitalmente el contrato de consignación y subir los documentos de mi auto* para *hacer todo el proceso desde mi casa sin tener que desplazarme.*

**Criterios de Aceptación:**
*   El sistema debe generar un contrato de consignación digital con los datos del auto y las condiciones acordadas (plazo, precio mínimo, comisión).
*   El consignatario debe poder firmar electrónicamente el contrato desde el portal (integración con API de firma electrónica como DocuSign o Firma.cl).
*   El consignatario debe poder subir fotos del auto, padrón, revisión técnica y certificado de multas desde su celular.

### CU 5.3: Historial de Pagos y Liquidación de Venta
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Consignatario*, quiero *ver el detalle de la liquidación cuando mi auto se venda (precio de venta, comisión, impuestos) y el estado de pago* para *tener total transparencia de cuánto y cuándo recibiré mi dinero.*

**Criterios de Aceptación:**
*   Cuando el auto se vende, el portal del consignatario debe mostrar una "Liquidación de Venta" desglosada: Precio de venta, Comisión de la automotora, Gastos administrativos, Impuestos aplicables, Monto neto a recibir.
*   El sistema debe actualizar el estado del pago: "Pendiente", "En proceso de pago (próximos 5 días hábiles)", "Pagado".
*   El consignatario debe poder descargar la liquidación en PDF y ver el comprobante de transferencia una vez pagado.

---

## 💰 6. Casos de Uso: Encargado de F&I (Finanzas y Seguros)
*El Encargado de F&I es el puente entre la automotora, los bancos/financieras y las compañías de seguros. Su objetivo es conseguir las mejores condiciones de financiamiento para el cliente y maximizar los ingresos por productos financieros.*

### CU 6.1: Gestión de Solicitudes de Financiamiento
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Encargado de F&I*, quiero *recibir, revisar y gestionar las solicitudes de financiamiento enviadas por los compradores* para *enviarlas a las instituciones financieras correspondientes y hacer seguimiento hasta su aprobación o rechazo.*

**Criterios de Aceptación:**
*   Al recibir una nueva solicitud de financiamiento (creada desde CU 3.6), el sistema debe notificar al Encargado de F&I con los datos del cliente, vehículo y monto solicitado.
*   El Encargado debe poder revisar la información del cliente (ingresos, RUT) y completar campos adicionales requeridos por las financieras (antigüedad laboral, tipo de contrato, referencias).
*   El sistema debe permitir seleccionar una o más instituciones financieras destino y registrar el envío de la solicitud.
*   Cada solicitud debe mostrar un timeline de estados: BORRADOR → ENVIADA → EN_ESTUDIO → PRE_APROBADA → APROBADA / RECHAZADA.
*   El Encargado debe poder actualizar el estado de la solicitud a medida que recibe respuestas de las financieras.

**Flujos Alternativos / Excepciones:**
*   Si el cliente no proporciona documentación suficiente, el sistema debe permitir enviar una solicitud de documentos pendientes por email o WhatsApp.
*   Si la solicitud es rechazada por una financiera, el Encargado debe poder reenviarla a otra institución sin re-ingresar los datos.
*   Si hay múltiples solicitudes activas para el mismo cliente, el sistema debe consolidarlas en una vista unificada.

### CU 6.2: Comparador de Ofertas Financieras
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Encargado de F&I*, quiero *comparar las propuestas de diferentes instituciones financieras en una tabla lado a lado* para *presentar al cliente la mejor opción de financiamiento según su perfil.*

**Criterios de Aceptación:**
*   El sistema debe mostrar una tabla comparativa con: nombre de la institución, tasa de interés, CAE (Carga Anual Equivalente), valor de cuota, plazo, monto total a pagar y requisitos.
*   Debe resaltar automáticamente la opción con el menor CAE como "Opción recomendada".
*   El Encargado debe poder generar un PDF comparativo para compartir con el cliente.
*   Debe registrar en el historial de interacciones cuándo se presentó la comparación al cliente.

**Flujos Alternativos / Excepciones:**
*   Si solo hay una oferta disponible, el sistema debe mostrar igualmente la tabla con la simulación original del sistema como referencia.
*   Si una oferta financiera expira (más de 15 días), debe mostrarse en gris con alerta "Oferta vencida — Solicitar actualización".

### CU 6.3: Gestión de Seguros Asociados a la Venta
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Encargado de F&I*, quiero *cotizar y gestionar seguros automotrices (desgravamen, todo riesgo, SOAP) como parte del proceso de venta* para *ofrecer un paquete completo al cliente y generar ingresos adicionales para la automotora.*

**Criterios de Aceptación:**
*   El sistema debe permitir registrar cotizaciones de seguros de diferentes compañías, asociadas al vehículo y al cliente.
*   Debe existir un catálogo configurable de tipos de seguro: Desgravamen, Todo Riesgo, SOAP, Garantía Extendida Mecánica.
*   Al cerrar una venta con seguro incluido, el sistema debe registrar la póliza y programar alertas de renovación.
*   El Encargado debe poder ver un reporte de seguros vendidos y comisiones generadas por este concepto.

**Flujos Alternativos / Excepciones:**
*   Si el cliente rechaza el seguro, el sistema debe registrar el rechazo como evidencia de que fue ofrecido (cumplimiento normativo).
*   Si el seguro requiere inspección previa del vehículo, el sistema debe generar una tarea para el Jefe de Taller.

---

## 🔧 7. Casos de Uso: Jefe de Taller / Service Advisor
*El Jefe de Taller es responsable de que cada vehículo esté en condiciones óptimas para la venta y de gestionar el servicio post-venta. Es el garante de la calidad mecánica y estética del inventario.*

### CU 7.1: Recepción de Vehículos en Taller
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Jefe de Taller*, quiero *registrar el ingreso de un vehículo al taller con un checklist de estado inicial* para *documentar las condiciones en que llega y planificar los trabajos necesarios.*

**Criterios de Aceptación:**
*   Al recibir un vehículo (nuevo ingreso o retorno de consignación), el Jefe de Taller debe poder crear una "Orden de Ingreso" vinculada al vehículo.
*   El sistema debe presentar un checklist configurable con categorías: Motor, Transmisión, Frenos, Suspensión, Carrocería, Interior, Eléctrico, Neumáticos.
*   Cada ítem del checklist debe permitir: estado (Bueno / Regular / Malo), foto adjunta y observaciones.
*   Al completar la inspección, el sistema debe generar un resumen con el costo estimado de reparaciones y actualizar el `Historial_Vehiculo`.
*   El estado del vehículo debe cambiar automáticamente a "PREPARACION".

**Flujos Alternativos / Excepciones:**
*   Si el costo estimado de reparación supera el 30% del valor de tasación del vehículo, el sistema debe alertar al Gerente para revisión.
*   Si el vehículo tiene problemas mecánicos graves no detectados en la tasación, el sistema debe generar una alerta de "Revisión de tasación recomendada".

### CU 7.2: Gestión de Órdenes de Trabajo
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Jefe de Taller*, quiero *crear, asignar y dar seguimiento a las órdenes de trabajo de cada vehículo* para *controlar los tiempos de reparación y asegurar que los autos estén listos para la venta en plazo.*

**Criterios de Aceptación:**
*   El Jefe de Taller debe poder crear una Orden de Trabajo (OT) seleccionando el vehículo y los trabajos a realizar desde un catálogo de servicios.
*   Cada OT debe tener: responsable asignado, fecha estimada de entrega, estado (ABIERTA → EN_PROGRESO → EN_REVISION → COMPLETADA) y costo real.
*   El sistema debe mostrar un tablero Kanban con las OTs organizadas por estado.
*   Al completar una OT, el estado del vehículo debe actualizarse a "DISPONIBLE" si no hay más trabajos pendientes.
*   El Gerente debe poder ver el tiempo promedio de preparación por vehículo en el dashboard.

**Flujos Alternativos / Excepciones:**
*   Si una OT lleva más de 5 días en estado "EN_PROGRESO", el sistema debe enviar una alerta al Jefe de Taller y al Gerente.
*   Si se necesitan repuestos externos, la OT debe permitir registrar el pedido con proveedor, costo y fecha estimada de llegada.

### CU 7.3: Preparación Pre-Entrega (PDI — Pre-Delivery Inspection)
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Jefe de Taller*, quiero *completar un checklist de preparación pre-entrega cuando un vehículo es vendido* para *asegurar que el auto se entrega al comprador en condiciones impecables.*

**Criterios de Aceptación:**
*   Cuando una venta se registra (CU 2.7), el sistema debe generar automáticamente una tarea de PDI asignada al Jefe de Taller.
*   El checklist PDI debe incluir: Limpieza interior/exterior, Revisión de fluidos, Presión de neumáticos, Funcionamiento de luces, Documentación completa en guantera, Fotos de entrega.
*   Al completar el PDI, el estado del vehículo debe cambiar a "LISTO_PARA_ENTREGA" y notificar al vendedor.
*   El comprador debe recibir una notificación: "Tu vehículo está listo para la entrega. Coordina con tu asesor".

**Flujos Alternativos / Excepciones:**
*   Si el PDI detecta un problema no identificado previamente, el Jefe de Taller debe poder crear una OT de urgencia y retrasar la entrega, notificando al vendedor y al comprador con el motivo.

### CU 7.4: Presupuesto de Reparaciones para Aprobación
📌 **Prioridad:** Could Have | **Fase:** 3

**Historia de Usuario:** Como *Jefe de Taller*, quiero *generar presupuestos detallados de reparación y enviarlos al Gerente para aprobación* para *controlar los costos de preparación de cada vehículo antes de ejecutar los trabajos.*

**Criterios de Aceptación:**
*   El presupuesto debe detallar: ítem de trabajo, repuestos necesarios (con costo unitario), mano de obra estimada (horas x tarifa), y total.
*   El sistema debe permitir enviar el presupuesto al Gerente para aprobación digital (botón Aprobar / Rechazar / Modificar).
*   Si el presupuesto es aprobado, se genera automáticamente la Orden de Trabajo correspondiente.
*   Debe existir un reporte de "Costo de Preparación vs. Margen de Venta" por vehículo.

**Flujos Alternativos / Excepciones:**
*   Si el Gerente no aprueba en 48 horas, el sistema envía un recordatorio.
*   Si el costo real de reparación excede el presupuesto aprobado en más del 15%, el sistema debe solicitar re-aprobación.

---

## 📞 8. Casos de Uso: Recepcionista / Agente BDC
*El Agente BDC (Business Development Center) es el primer punto de contacto con los clientes potenciales. Su misión es capturar, calificar y distribuir los leads para que ninguna oportunidad se pierda.*

### CU 8.1: Captura y Calificación Inicial de Leads
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Agente BDC*, quiero *registrar rápidamente los leads que llegan por teléfono, walk-in o redes sociales, calificarlos con un scoring básico y asignarlos al vendedor más adecuado* para *asegurar que cada prospecto reciba atención inmediata.*

**Criterios de Aceptación:**
*   El Agente BDC debe tener una vista de "Captura Rápida" con campos: nombre, teléfono, email (opcional), canal de origen (Teléfono, Presencial, WhatsApp, Chileautos, MercadoLibre, Instagram, Otro), y vehículo de interés (búsqueda por patente o modelo).
*   El sistema debe verificar automáticamente si el cliente ya existe en la base de datos (por teléfono o email) y, de existir, vincular al registro existente mostrando su historial.
*   Al registrar el lead, el Agente debe asignar un score inicial: Caliente (quiere comprar hoy/esta semana), Tibio (interesado, cotizando), Frío (solo consultando).
*   El sistema debe sugerir automáticamente el vendedor con menor carga de leads activos para la asignación, o permitir asignación manual.
*   Debe registrarse la interacción en `Historial_Interacciones` con la dirección "ENTRANTE".

**Flujos Alternativos / Excepciones:**
*   Si el cliente ya tiene un lead activo con otro vendedor, el sistema debe alertar: "Este cliente ya está siendo atendido por [vendedor]. ¿Deseas agregar una nota al lead existente o crear uno nuevo?".
*   Si todos los vendedores tienen más de 15 leads activos, el sistema debe alertar al Gerente sobre la necesidad de balanceo de carga.
*   Si el lead llega fuera del horario laboral, debe quedar en cola con prioridad para el primer vendedor disponible al día siguiente.

### CU 8.2: Gestión de Citas y Agenda Centralizada
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Agente BDC*, quiero *coordinar y gestionar la agenda de visitas y test drives de todos los vendedores desde una vista centralizada* para *optimizar la distribución de citas y evitar solapamientos.*

**Criterios de Aceptación:**
*   El Agente BDC debe ver un calendario semanal con las agendas de todos los vendedores en una vista unificada (tipo Google Calendar multi-usuario).
*   Debe poder agendar una cita seleccionando: cliente, vendedor, tipo de cita (Visita al salón, Test Drive, Reunión de cierre), fecha/hora y duración estimada.
*   El sistema debe bloquear automáticamente los horarios ya ocupados y sugerir el próximo slot disponible.
*   Al confirmar la cita, el sistema debe enviar confirmación automática al cliente (WhatsApp/email) y al vendedor.
*   24 horas antes de la cita, el sistema debe enviar recordatorio automático a ambas partes.

**Flujos Alternativos / Excepciones:**
*   Si el cliente solicita cambiar la cita, el Agente BDC debe poder reagendar enviando automáticamente la nueva confirmación.
*   Si un vendedor marca una cita como "Cancelada por el cliente" 3 veces seguidas para el mismo lead, el sistema debe marcarlo como "Lead de baja prioridad".

### CU 8.3: Seguimiento de Leads No Contactados
📌 **Prioridad:** Should Have | **Fase:** 2

**Historia de Usuario:** Como *Agente BDC*, quiero *ver un panel con todos los leads que no han sido contactados en las últimas 24 horas* para *hacer seguimiento proactivo y escalar al Gerente si es necesario.*

**Criterios de Aceptación:**
*   El sistema debe mostrar un panel de "Leads sin contacto" con filtro por vendedor, ordenado por antigüedad (más antiguo primero).
*   Cada lead debe mostrar: nombre del cliente, vehículo de interés, vendedor asignado, horas sin contacto, y canal de origen.
*   El Agente BDC debe poder contactar al cliente directamente desde el panel (botón de WhatsApp / Llamar) y registrar la interacción.
*   Si un lead supera las 48 horas sin contacto, el Agente BDC debe poder escalarlo al Gerente con un clic.
*   El sistema debe generar un reporte diario automático de "Leads no contactados" enviado al Gerente a las 9:00 AM.

**Flujos Alternativos / Excepciones:**
*   Si el Agente BDC contacta al cliente y este ya no está interesado, debe poder cerrar el lead como "CERRADO_PERDIDO" con motivo "Desistió".
*   Si el Agente BDC no puede contactar al cliente después de 3 intentos en 48 horas, el lead debe marcarse automáticamente como "Contacto fallido" con una tarea programada de reintento a los 7 días.

---

## 🔐 10. Casos de Uso: Administración del Sistema
*Funcionalidades transversales de configuración y seguridad.*

### CU 10.1: Autenticación y Control de Acceso
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Usuario del sistema*, quiero *iniciar sesión de forma segura con mi correo y contraseña, y opcionalmente con un segundo factor de autenticación* para *acceder únicamente a las funciones que mi rol me permite.*

**Criterios de Aceptación:**
*   El sistema debe permitir login con email + contraseña.
*   MFA (autenticación multifactor) debe ser obligatorio para roles Gerente y Admin, y opcional para Vendedor y Marketing.
*   Después de 5 intentos fallidos en 10 minutos, la cuenta se bloquea temporalmente por 30 minutos.
*   El sistema debe permitir recuperación de contraseña vía email con enlace de un solo uso (expira en 1 hora).
*   Las sesiones deben expirar automáticamente después de 8 horas de inactividad.

**Flujos Alternativos / Excepciones:**
*   Si el usuario ingresa credenciales incorrectas, mostrar: "Email o contraseña incorrectos" (sin revelar cuál es el incorrecto).
*   Si la cuenta está bloqueada, mostrar: "Cuenta bloqueada temporalmente. Intenta en 30 minutos o contacta al administrador".
*   Si el token de recuperación ha expirado, mostrar: "El enlace ha expirado. Solicita uno nuevo".

### CU 10.2: Gestión de Usuarios y Roles
📌 **Prioridad:** Must Have (MVP) | **Fase:** 1

**Historia de Usuario:** Como *Administrador*, quiero *crear, editar y desactivar usuarios, asignándoles un rol específico* para *controlar quién tiene acceso al sistema y qué permisos tiene.*

**Criterios de Aceptación:**
*   El Admin debe poder crear un nuevo usuario ingresando: nombre, email, teléfono y rol.
*   Al crear un usuario, el sistema envía un email de invitación con enlace para establecer contraseña.
*   El Admin debe poder desactivar (no eliminar) un usuario, lo que revoca inmediatamente su acceso.
*   El Admin debe poder cambiar el rol de un usuario existente.
*   Debe existir una vista de "Usuarios activos" con filtros por rol y estado.

**Flujos Alternativos / Excepciones:**
*   Si se intenta crear un usuario con un email ya registrado, alertar: "Este email ya está en uso".
*   Si se intenta desactivar al último usuario con rol Admin, bloquear la acción: "No se puede desactivar al único administrador del sistema".

---

## 11. Resumen de Actores y Casos de Uso

| Actor | Casos de Uso |
|-------|-------------|
| Gerente de Ventas | 1.1 a 1.6 (6 casos) |
| Vendedor | 2.1 a 2.7 (7 casos) |
| Comprador | 3.1 a 3.6 (6 casos) |
| Marketing | 4.1 a 4.3 (3 casos) |
| Consignatario | 5.1 a 5.3 (3 casos) |
| Encargado de F&I | 6.1 a 6.3 (3 casos) |
| Jefe de Taller | 7.1 a 7.4 (4 casos) |
| Recepcionista / BDC | 8.1 a 8.3 (3 casos) |
| Administración | 10.1 a 10.2 (2 casos) |
| **Total** | **37 casos de uso** |
