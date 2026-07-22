from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import FISolicitud, User, RoleEnum
from ..schemas import FISolicitudCreate, FISolicitudOut
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/fi", tags=["F&I Financiamiento y Seguros"])

@router.get("/", response_model=List[FISolicitudOut])
def get_fi_solicitudes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(FISolicitud).order_by(FISolicitud.fecha_solicitud.desc()).all()

@router.post("/", response_model=FISolicitudOut, status_code=status.HTTP_201_CREATED)
def create_fi_solicitud(
    sol_in: FISolicitudCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE, RoleEnum.F_AND_I, RoleEnum.VENDEDOR]))
):
    data = sol_in.dict()
    data["tenant_id"] = current_user.tenant_id
    data["id_asesor_fi"] = current_user.id if current_user.rol == RoleEnum.F_AND_I else None

    db_sol = FISolicitud(**data)
    db.add(db_sol)
    db.commit()
    db.refresh(db_sol)
    return db_sol
