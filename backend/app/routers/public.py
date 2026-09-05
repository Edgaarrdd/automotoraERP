from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Tenant, Vehicle, Customer, LeadOpportunity, User, RoleEnum, VehicleStatusEnum, PipelineStageEnum, LeadScoreEnum
from ..schemas import TenantPublicConfig, VehiclePublicOut, VehiclePublicDetail, WebLeadCreate

router = APIRouter(prefix="/api/public", tags=["Portal Público Storefront"])

def get_tenant_by_slug(tenant_slug: str, db: Session) -> Tenant:
    tenant = db.query(Tenant).filter(
        (Tenant.subdominio.ilike(tenant_slug)) | (Tenant.id == tenant_slug)
    ).first()
    if not tenant:
        # Fallback to first active tenant if slug is demo / default
        tenant = db.query(Tenant).filter(Tenant.activo == True).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Automotora no encontrada")
    return tenant

def format_patente_parcial(patente: str) -> str:
    if not patente or len(patente) < 4:
        return "XX****"
    return f"{patente[:2]}****{patente[-1]}"

@router.get("/{tenant_slug}/config", response_model=TenantPublicConfig)
def get_public_config(tenant_slug: str, db: Session = Depends(get_db)):
    tenant = get_tenant_by_slug(tenant_slug, db)
    return TenantPublicConfig(
        nombre_empresa=tenant.nombre_empresa,
        subdominio=tenant.subdominio,
        sitio_web_activo=tenant.sitio_web_activo if tenant.sitio_web_activo is not None else True,
        slogan=tenant.slogan or "Tu automotora de confianza en Chile",
        color_primario=tenant.color_primario or "#0284c7",
        tema_diseno=tenant.tema_diseno or "dark_luxury",
        dominio_personalizado=tenant.dominio_personalizado,
        estado_dns=tenant.estado_dns or "PENDIENTE",
        logo_url=tenant.logo_url,
        banner_url=tenant.banner_url,
        whatsapp_contacto=tenant.whatsapp_contacto or "+56912345678",
        direccion_fisica=tenant.direccion_fisica or "Av. Vitacura 4560, Santiago"
    )

@router.get("/{tenant_slug}/vehicles", response_model=List[VehiclePublicOut])
def get_public_vehicles(
    tenant_slug: str,
    search: Optional[str] = None,
    marca: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    año_min: Optional[int] = None,
    destacados_only: bool = False,
    db: Session = Depends(get_db)
):
    tenant = get_tenant_by_slug(tenant_slug, db)
    if tenant.sitio_web_activo is False:
        raise HTTPException(status_code=503, detail="El sitio web de esta automotora se encuentra temporalmente en mantenimiento")

    query = db.query(Vehicle).filter(
        Vehicle.tenant_id == tenant.id,
        Vehicle.publicado_web == True,
        Vehicle.estado.in_([VehicleStatusEnum.DISPONIBLE, VehicleStatusEnum.RESERVADO])
    )

    if destacados_only:
        query = query.filter(Vehicle.destacado_web == True)
    if marca:
        query = query.filter(Vehicle.marca.ilike(f"%{marca}%"))
    if precio_min:
        query = query.filter(Vehicle.precio_venta_publico >= precio_min)
    if precio_max:
        query = query.filter(Vehicle.precio_venta_publico <= precio_max)
    if año_min:
        query = query.filter(Vehicle.año >= año_min)
    if search:
        s_filter = f"%{search}%"
        query = query.filter(
            (Vehicle.marca.ilike(s_filter)) |
            (Vehicle.modelo.ilike(s_filter)) |
            (Vehicle.version.ilike(s_filter))
        )

    vehicles = query.order_by(Vehicle.destacado_web.desc(), Vehicle.fecha_ingreso.desc()).all()

    result = []
    for v in vehicles:
        result.append(VehiclePublicOut(
            id=v.id,
            marca=v.marca,
            modelo=v.modelo,
            version=v.version,
            año=v.año,
            kilometraje=v.kilometraje,
            tipo_combustible=v.tipo_combustible.value if hasattr(v.tipo_combustible, 'value') else str(v.tipo_combustible),
            transmision=v.transmision.value if hasattr(v.transmision, 'value') else str(v.transmision),
            color=v.color,
            precio_venta_publico=v.precio_venta_publico,
            precio_oferta_web=v.precio_oferta_web,
            estado=v.estado.value if hasattr(v.estado, 'value') else str(v.estado),
            destacado_web=v.destacado_web or False,
            urls_fotos=v.urls_fotos or [],
            patente_parcial=format_patente_parcial(v.patente)
        ))
    return result

@router.get("/{tenant_slug}/vehicles/{vehicle_id}", response_model=VehiclePublicDetail)
def get_public_vehicle_detail(tenant_slug: str, vehicle_id: str, db: Session = Depends(get_db)):
    tenant = get_tenant_by_slug(tenant_slug, db)
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.tenant_id == tenant.id,
        Vehicle.publicado_web == True
    ).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado o no disponible en el sitio web")

    # Increment web view count
    vehicle.web_view_count = (vehicle.web_view_count or 0) + 1
    db.commit()
    db.refresh(vehicle)

    return VehiclePublicDetail(
        id=vehicle.id,
        marca=vehicle.marca,
        modelo=vehicle.modelo,
        version=vehicle.version,
        año=vehicle.año,
        kilometraje=vehicle.kilometraje,
        tipo_combustible=vehicle.tipo_combustible.value if hasattr(vehicle.tipo_combustible, 'value') else str(vehicle.tipo_combustible),
        transmision=vehicle.transmision.value if hasattr(vehicle.transmision, 'value') else str(vehicle.transmision),
        color=vehicle.color,
        precio_venta_publico=vehicle.precio_venta_publico,
        precio_oferta_web=vehicle.precio_oferta_web,
        estado=vehicle.estado.value if hasattr(vehicle.estado, 'value') else str(vehicle.estado),
        destacado_web=vehicle.destacado_web or False,
        urls_fotos=vehicle.urls_fotos or [],
        patente_parcial=format_patente_parcial(vehicle.patente),
        motor=vehicle.motor,
        num_puertas=vehicle.num_puertas or 5,
        num_asientos=vehicle.num_asientos or 5,
        historial_legal=vehicle.historial_legal,
        web_view_count=vehicle.web_view_count or 1
    )

@router.post("/{tenant_slug}/leads", status_code=status.HTTP_201_CREATED)
def submit_public_web_lead(tenant_slug: str, lead_in: WebLeadCreate, db: Session = Depends(get_db)):
    tenant = get_tenant_by_slug(tenant_slug, db)

    # 1. Find or create Customer
    customer = db.query(Customer).filter(
        (Customer.email == lead_in.email) | (Customer.telefono == lead_in.telefono)
    ).first()

    if not customer:
        customer = Customer(
            tenant_id=tenant.id,
            nombre_completo=lead_in.nombre_completo,
            rut_dni=lead_in.rut_dni,
            telefono=lead_in.telefono,
            email=lead_in.email,
            origen="SITIO_WEB",
            notas_internas=f"Consulta Web ({lead_in.tipo_consulta}): {lead_in.mensaje or 'Sin mensaje adicional'}"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # 2. Select vendor to assign (Round Robin / First available vendor)
    vendor = db.query(User).filter(
        User.tenant_id == tenant.id,
        User.rol.in_([RoleEnum.VENDEDOR, RoleEnum.BDC, RoleEnum.GERENTE]),
        User.activo == True
    ).first()

    vendor_id = vendor.id if vendor else "u3"

    # 3. Create LeadOpportunity in Pipeline
    estimated_amount = 0.0
    if lead_in.id_vehiculo_interes:
        veh = db.query(Vehicle).filter(Vehicle.id == lead_in.id_vehiculo_interes).first()
        if veh:
            estimated_amount = veh.precio_venta_publico

    new_lead = LeadOpportunity(
        tenant_id=tenant.id,
        id_cliente=customer.id,
        id_vehiculo_interes=lead_in.id_vehiculo_interes,
        id_vendedor_asignado=vendor_id,
        estado_embudo=PipelineStageEnum.NUEVO,
        score_lead=LeadScoreEnum.CALIENTE,
        monto_estimado=estimated_amount
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    return {
        "success": True,
        "message": f"¡Gracias {lead_in.nombre_completo}! Tu consulta ha sido recibida con éxito.",
        "lead_id": new_lead.id,
        "vendedor_asignado": vendor.nombre if vendor else "Mesa Comercial"
    }
