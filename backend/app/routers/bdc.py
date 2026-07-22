from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import BDCLead, User, RoleEnum
from ..schemas import BDCLeadCreate, BDCLeadOut
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/bdc", tags=["BDC & Recepción de Leads"])

@router.get("/", response_model=List[BDCLeadOut])
def get_bdc_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(BDCLead).order_by(BDCLead.fecha_recepcion.desc()).all()

@router.post("/", response_model=BDCLeadOut, status_code=status.HTTP_201_CREATED)
def create_bdc_lead(
    bdc_in: BDCLeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE, RoleEnum.BDC, RoleEnum.VENDEDOR]))
):
    data = bdc_in.dict()
    data["tenant_id"] = current_user.tenant_id

    db_bdc = BDCLead(**data)
    db.add(db_bdc)
    db.commit()
    db.refresh(db_bdc)
    return db_bdc
