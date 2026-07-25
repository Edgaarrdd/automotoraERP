from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from .models import RoleEnum, CustomerTypeEnum, VehicleStatusEnum, FuelTypeEnum, TransmissionEnum, PipelineStageEnum, LeadScoreEnum, AppointmentTypeEnum, AppointmentStatusEnum

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class TokenData(BaseModel):
    email: Optional[str] = None
    rol: Optional[RoleEnum] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# User Schemas
class UserBase(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    rol: RoleEnum = RoleEnum.VENDEDOR

class UserCreate(UserBase):
    password: str
    tenant_id: Optional[str] = None

class UserOut(UserBase):
    id: str
    tenant_id: Optional[str] = None
    activo: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    nombre_completo: str
    rut_dni: Optional[str] = None
    telefono: str
    email: EmailStr
    direccion: Optional[str] = None
    tipo: CustomerTypeEnum = CustomerTypeEnum.COMPRADOR
    origen: Optional[str] = "WEB"
    preferencias_compra: Optional[dict] = None
    notas_internas: Optional[str] = None

class CustomerCreate(CustomerBase):
    id_vendedor_asignado: Optional[str] = None

class CustomerOut(CustomerBase):
    id: str
    tenant_id: Optional[str] = None
    id_vendedor_asignado: Optional[str] = None
    fecha_captacion: datetime
    activo: bool

    class Config:
        from_attributes = True

# Vehicle Schemas
class VehicleBase(BaseModel):
    patente: str
    vin: Optional[str] = None
    marca: str
    modelo: str
    version: Optional[str] = None
    año: int
    kilometraje: int = 0
    tipo_combustible: FuelTypeEnum = FuelTypeEnum.BENCINA
    transmision: TransmissionEnum = TransmissionEnum.AUTOMATICA
    color: Optional[str] = None
    motor: Optional[str] = None
    num_puertas: Optional[int] = 5
    num_asientos: Optional[int] = 5
    precio_compra_tasacion: float = 0.0
    precio_venta_publico: float = 0.0
    precio_minimo_venta: Optional[float] = None
    estado: VehicleStatusEnum = VehicleStatusEnum.EVALUACION
    id_consignatario: Optional[str] = None
    urls_fotos: List[str] = []
    urls_documentos: List[str] = []
    historial_legal: Optional[dict] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdateStatus(BaseModel):
    estado: VehicleStatusEnum

class VehicleOut(VehicleBase):
    id: str
    tenant_id: Optional[str] = None
    fecha_ingreso: datetime
    fecha_venta: Optional[datetime] = None
    id_vendedor_vendio: Optional[str] = None

    class Config:
        from_attributes = True

# Lead Schemas
class LeadBase(BaseModel):
    id_cliente: Optional[str] = None
    id_vehiculo_interes: Optional[str] = None
    id_vendedor_asignado: Optional[str] = None
    estado_embudo: PipelineStageEnum = PipelineStageEnum.NUEVO
    score_lead: LeadScoreEnum = LeadScoreEnum.TIBIO
    monto_estimado: float = 0.0

class LeadCreate(LeadBase):
    pass

class LeadUpdateStage(BaseModel):
    estado_embudo: PipelineStageEnum
    motivo_perdida: Optional[str] = None

class LeadOut(LeadBase):
    id: str
    tenant_id: Optional[str] = None
    motivo_perdida: Optional[str] = None
    fecha_creacion: datetime
    fecha_ultima_interaccion: datetime
    customer: Optional[CustomerOut] = None
    vehicle: Optional[VehicleOut] = None

    class Config:
        from_attributes = True

# Quote Schemas
class QuoteCreate(BaseModel):
    id_lead: Optional[str] = None
    id_cliente: Optional[str] = None
    id_vehiculo: Optional[str] = None
    precio_vehiculo: float
    pie_monto: float = 0.0
    cantidad_cuotas: int = 36
    tasa_interes: float = 1.5
    incluye_seguro: bool = True
    costo_seguro: float = 35000.0

class QuoteOut(BaseModel):
    id: str
    tenant_id: Optional[str] = None
    id_lead: Optional[str] = None
    id_cliente: Optional[str] = None
    id_vehiculo: Optional[str] = None
    id_vendedor: str
    precio_vehiculo: float
    pie_monto: float
    monto_financiar: float
    cantidad_cuotas: int
    valor_cuota_estimado: float
    tasa_interes: float
    incluye_seguro: bool
    costo_seguro: float
    estado: str
    fecha_creacion: datetime
    customer: Optional[CustomerOut] = None
    vehicle: Optional[VehicleOut] = None

    class Config:
        from_attributes = True

# F&I Schemas
class FISolicitudCreate(BaseModel):
    id_cliente: Optional[str] = None
    id_vehiculo: Optional[str] = None
    id_cotizacion: Optional[str] = None
    entidad_financiera: str
    monto_solicitado: float
    pie_porcentaje: float = 20.0
    observaciones: Optional[str] = None

class FISolicitudOut(FISolicitudCreate):
    id: str
    tenant_id: Optional[str] = None
    id_asesor_fi: Optional[str] = None
    estado: str
    fecha_solicitud: datetime

    class Config:
        from_attributes = True

# BDC Schemas
class BDCLeadCreate(BaseModel):
    nombre_prospecto: str
    telefono: str
    email: Optional[str] = None
    origen_contacto: str = "LLAMADA_ENTRANTE"
    vehiculo_interes: Optional[str] = None
    notas: Optional[str] = None

class BDCLeadOut(BDCLeadCreate):
    id: str
    tenant_id: Optional[str] = None
    asignado_a: Optional[str] = None
    estado: str
    fecha_recepcion: datetime

    class Config:
        from_attributes = True

# Dashboard Metrics Schema
class DashboardMetrics(BaseModel):
    total_vehiculos_stock: int
    vehiculos_disponibles: int
    vehiculos_reservados: int
    vehiculos_vendidos_mes: int
    total_leads_activos: int
    monto_cotizado_mes: float
    ventas_totales_monto_mes: float
    tasa_conversion_pct: float

# Appointment Schemas
class AppointmentBase(BaseModel):
    titulo: str
    tipo: AppointmentTypeEnum = AppointmentTypeEnum.TEST_DRIVE
    fecha_inicio: datetime
    fecha_fin: datetime
    id_cliente: Optional[str] = None
    id_vehiculo: Optional[str] = None
    id_lead: Optional[str] = None
    notas: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    id_vendedor: Optional[str] = None

class AppointmentUpdateStatus(BaseModel):
    estado: AppointmentStatusEnum

class AppointmentOut(AppointmentBase):
    id: str
    tenant_id: Optional[str] = None
    id_vendedor: str
    estado: AppointmentStatusEnum
    fecha_creacion: datetime

    class Config:
        from_attributes = True
