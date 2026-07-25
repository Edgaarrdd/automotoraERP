import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    GERENTE = "GERENTE"
    VENDEDOR = "VENDEDOR"
    MARKETING = "MARKETING"
    F_AND_I = "F_AND_I"
    TALLER = "TALLER"
    BDC = "BDC"

class CustomerTypeEnum(str, enum.Enum):
    COMPRADOR = "COMPRADOR"
    CONSIGNATARIO = "CONSIGNATARIO"
    AMBOS = "AMBOS"

class VehicleStatusEnum(str, enum.Enum):
    EVALUACION = "EVALUACION"
    PREPARACION = "PREPARACION"
    DISPONIBLE = "DISPONIBLE"
    RESERVADO = "RESERVADO"
    VENDIDO = "VENDIDO"
    ENTREGADO = "ENTREGADO"

class FuelTypeEnum(str, enum.Enum):
    BENCINA = "BENCINA"
    DIESEL = "DIESEL"
    ELECTRICO = "ELECTRICO"
    HIBRIDO = "HIBRIDO"
    GLP = "GLP"

class TransmissionEnum(str, enum.Enum):
    MANUAL = "MANUAL"
    AUTOMATICA = "AUTOMATICA"
    CVT = "CVT"

class PipelineStageEnum(str, enum.Enum):
    NUEVO = "NUEVO"
    CONTACTADO = "CONTACTADO"
    TEST_DRIVE_AGENDADO = "TEST_DRIVE_AGENDADO"
    NEGOCIACION = "NEGOCIACION"
    RESERVADO = "RESERVADO"
    CERRADO_GANADO = "CERRADO_GANADO"
    CERRADO_PERDIDO = "CERRADO_PERDIDO"

class LeadScoreEnum(str, enum.Enum):
    CALIENTE = "CALIENTE"
    TIBIO = "TIBIO"
    FRIO = "FRIO"

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=generate_uuid)
    nombre_empresa = Column(String, nullable=False)
    subdominio = Column(String, unique=True, nullable=False)
    plan = Column(String, default="PROFESIONAL")
    max_usuarios = Column(Integer, default=20)
    max_vehiculos = Column(Integer, default=200)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="tenant")

class User(Base):
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    rol = Column(SQLEnum(RoleEnum), default=RoleEnum.VENDEDOR, nullable=False)
    id_jefe_directo = Column(String, ForeignKey("usuarios.id"), nullable=True)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    configuracion_comision = Column(JSON, nullable=True)

    tenant = relationship("Tenant", back_populates="users")
    assigned_customers = relationship("Customer", back_populates="assigned_vendor", foreign_keys="Customer.id_vendedor_asignado")
    leads = relationship("LeadOpportunity", back_populates="assigned_vendor")

class Customer(Base):
    __tablename__ = "clientes"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    nombre_completo = Column(String, nullable=False)
    rut_dni = Column(String, nullable=True, index=True)
    telefono = Column(String, nullable=False)
    email = Column(String, nullable=False)
    direccion = Column(String, nullable=True)
    tipo = Column(SQLEnum(CustomerTypeEnum), default=CustomerTypeEnum.COMPRADOR)
    origen = Column(String, default="WEB")
    id_vendedor_asignado = Column(String, ForeignKey("usuarios.id"), nullable=True)
    preferencias_compra = Column(JSON, nullable=True)
    fecha_captacion = Column(DateTime, default=datetime.utcnow)
    activo = Column(Boolean, default=True)
    suscripto_marketing = Column(Boolean, default=True)
    notas_internas = Column(Text, nullable=True)

    assigned_vendor = relationship("User", back_populates="assigned_customers", foreign_keys=[id_vendedor_asignado])
    vehicles_consigned = relationship("Vehicle", back_populates="consignor")
    leads = relationship("LeadOpportunity", back_populates="customer")

class Vehicle(Base):
    __tablename__ = "vehiculos"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    patente = Column(String, unique=True, nullable=False, index=True)
    vin = Column(String, nullable=True)
    marca = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    version = Column(String, nullable=True)
    año = Column(Integer, nullable=False)
    kilometraje = Column(Integer, nullable=False, default=0)
    tipo_combustible = Column(SQLEnum(FuelTypeEnum), default=FuelTypeEnum.BENCINA)
    transmision = Column(SQLEnum(TransmissionEnum), default=TransmissionEnum.AUTOMATICA)
    color = Column(String, nullable=True)
    motor = Column(String, nullable=True)
    num_puertas = Column(Integer, default=5)
    num_asientos = Column(Integer, default=5)
    precio_compra_tasacion = Column(Float, nullable=False, default=0.0)
    precio_venta_publico = Column(Float, nullable=False, default=0.0)
    precio_minimo_venta = Column(Float, nullable=True)
    estado = Column(SQLEnum(VehicleStatusEnum), default=VehicleStatusEnum.EVALUACION)
    id_consignatario = Column(String, ForeignKey("clientes.id"), nullable=True)
    fecha_ingreso = Column(DateTime, default=datetime.utcnow)
    fecha_venta = Column(DateTime, nullable=True)
    id_vendedor_vendio = Column(String, ForeignKey("usuarios.id"), nullable=True)
    urls_fotos = Column(JSON, default=list)
    urls_documentos = Column(JSON, default=list)
    historial_legal = Column(JSON, nullable=True)

    consignor = relationship("Customer", back_populates="vehicles_consigned")
    leads = relationship("LeadOpportunity", back_populates="vehicle")

class LeadOpportunity(Base):
    __tablename__ = "leads_oportunidades"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    id_cliente = Column(String, ForeignKey("clientes.id"), nullable=True)
    id_vehiculo_interes = Column(String, ForeignKey("vehiculos.id"), nullable=True)
    id_vendedor_asignado = Column(String, ForeignKey("usuarios.id"), nullable=False)
    estado_embudo = Column(SQLEnum(PipelineStageEnum), default=PipelineStageEnum.NUEVO)
    score_lead = Column(SQLEnum(LeadScoreEnum), default=LeadScoreEnum.TIBIO)
    motivo_perdida = Column(String, nullable=True)
    monto_estimado = Column(Float, default=0.0)
    fecha_test_drive = Column(DateTime, nullable=True)
    auto_permuta_tradein = Column(JSON, nullable=True) # CU 2.7 trade-in vehicle details
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_ultima_interaccion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="leads")
    vehicle = relationship("Vehicle", back_populates="leads")
    assigned_vendor = relationship("User", back_populates="leads")
    quotes = relationship("Quote", back_populates="lead")

class Quote(Base):
    __tablename__ = "cotizaciones"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    id_lead = Column(String, ForeignKey("leads_oportunidades.id"), nullable=True)
    id_cliente = Column(String, ForeignKey("clientes.id"), nullable=True)
    id_vehiculo = Column(String, ForeignKey("vehiculos.id"), nullable=True)
    id_vendedor = Column(String, ForeignKey("usuarios.id"), nullable=False)
    tipo_financiamiento = Column(String, default="CREDITO_CONVENCIONAL") # CONTADO, CREDITO_INTELIGENTE, CREDITO_CONVENCIONAL
    precio_vehiculo = Column(Float, nullable=False)
    pie_monto = Column(Float, default=0.0)
    monto_financiar = Column(Float, nullable=False)
    cantidad_cuotas = Column(Integer, default=36)
    valor_cuota_estimado = Column(Float, nullable=False)
    vfg_monto = Column(Float, default=0.0) # Valor Futuro Garantizado para Crédito Inteligente
    tasa_interes = Column(Float, default=1.45)
    incluye_seguro = Column(Boolean, default=True)
    costo_seguro = Column(Float, default=38000.0)
    estado = Column(String, default="EMITIDA")
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_expiracion = Column(DateTime, nullable=True)

    lead = relationship("LeadOpportunity", back_populates="quotes")

class FISolicitud(Base):
    __tablename__ = "solicitudes_fi"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    id_cliente = Column(String, ForeignKey("clientes.id"), nullable=True)
    id_vehiculo = Column(String, ForeignKey("vehiculos.id"), nullable=True)
    id_cotizacion = Column(String, ForeignKey("cotizaciones.id"), nullable=True)
    id_asesor_fi = Column(String, ForeignKey("usuarios.id"), nullable=True)
    entidad_financiera = Column(String, nullable=False)
    monto_solicitado = Column(Float, nullable=False)
    pie_porcentaje = Column(Float, default=20.0)
    estado = Column(String, default="EN_ESTUDIO") # BORRADOR, ENVIADA, EN_ESTUDIO, PRE_APROBADA, APROBADA, RECHAZADA
    observaciones = Column(Text, nullable=True)
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)

class BDCLead(Base):
    __tablename__ = "bdc_leads"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=True)
    nombre_prospecto = Column(String, nullable=False)
    telefono = Column(String, nullable=False)
    email = Column(String, nullable=True)
    origen_contacto = Column(String, default="LLAMADA_ENTRANTE") # TELEFONO, PRESENCIAL, WHATSAPP, CHILEAUTOS, MERCADOLIBRE, INSTAGRAM
    score_lead = Column(SQLEnum(LeadScoreEnum), default=LeadScoreEnum.TIBIO)
    vehiculo_interes = Column(String, nullable=True)
    asignado_a = Column(String, ForeignKey("usuarios.id"), nullable=True)
    estado = Column(String, default="PENDIENTE_ASIGNACION")
    notas = Column(Text, nullable=True)
    fecha_recepcion = Column(DateTime, default=datetime.utcnow)
