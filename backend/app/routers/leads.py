from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import LeadOpportunity, Customer, Vehicle, User, RoleEnum, PipelineStageEnum, CustomerTypeEnum, VehicleStatusEnum
from ..schemas import LeadCreate, LeadOut, LeadUpdateStage, CustomerCreate, CustomerOut
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/leads", tags=["Pipeline & Leads Comercial"])

@router.get("/", response_model=List[LeadOut])
def get_leads(
    stage: Optional[PipelineStageEnum] = None,
    vendor_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LeadOpportunity)
    
    # RBAC filtering: VENDEDOR can only view assigned leads unless ADMIN/GERENTE/BDC
    if current_user.rol == RoleEnum.VENDEDOR:
        query = query.filter(LeadOpportunity.id_vendedor_asignado == current_user.id)
    elif vendor_id:
        query = query.filter(LeadOpportunity.id_vendedor_asignado == vendor_id)

    if stage:
        query = query.filter(LeadOpportunity.estado_embudo == stage)

    return query.order_by(LeadOpportunity.fecha_creacion.desc()).all()

@router.post("/", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE, RoleEnum.VENDEDOR, RoleEnum.BDC]))
):
    customer = db.query(Customer).filter(Customer.id == lead_in.id_cliente).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    data = lead_in.dict()
    data["tenant_id"] = current_user.tenant_id

    db_lead = LeadOpportunity(**data)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.patch("/{lead_id}/stage", response_model=LeadOut)
def update_lead_stage(
    lead_id: str,
    stage_in: LeadUpdateStage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(LeadOpportunity).filter(LeadOpportunity.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Oportunidad/Lead no encontrado")

    # Check RBAC
    if current_user.rol == RoleEnum.VENDEDOR and lead.id_vendedor_asignado != current_user.id:
        raise HTTPException(status_code=403, detail="No tiene permisos para modificar este lead asignado a otro vendedor")

    lead.estado_embudo = stage_in.estado_embudo
    if stage_in.motivo_perdida:
        lead.motivo_perdida = stage_in.motivo_perdida

    # Auto update vehicle status if win/reserved
    if lead.id_vehiculo_interes:
        vehicle = db.query(Vehicle).filter(Vehicle.id == lead.id_vehiculo_interes).first()
        if vehicle:
            if stage_in.estado_embudo == PipelineStageEnum.RESERVADO:
                vehicle.estado = VehicleStatusEnum.RESERVADO
            elif stage_in.estado_embudo == PipelineStageEnum.CERRADO_GANADO:
                vehicle.estado = VehicleStatusEnum.VENDIDO
                vehicle.id_vendedor_vendio = lead.id_vendedor_asignado

    db.commit()
    db.refresh(lead)
    return lead

# Customers management endpoints
@router.get("/customers", response_model=List[CustomerOut])
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Customer).order_by(Customer.nombre_completo.asc()).all()

@router.post("/customers", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = customer_in.dict()
    data["tenant_id"] = current_user.tenant_id
    if not data.get("id_vendedor_asignado"):
        data["id_vendedor_asignado"] = current_user.id

    db_cust = Customer(**data)
    db.add(db_cust)
    db.commit()
    db.refresh(db_cust)
    return db_cust
