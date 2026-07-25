from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Appointment, User, RoleEnum, AppointmentTypeEnum, AppointmentStatusEnum
from ..schemas import AppointmentCreate, AppointmentOut, AppointmentUpdateStatus
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/appointments", tags=["Calendario & Citas Comerciales"])

@router.get("/", response_model=List[AppointmentOut])
def get_appointments(
    tipo: Optional[AppointmentTypeEnum] = None,
    vendedor_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment)
    if current_user.rol == RoleEnum.VENDEDOR:
        query = query.filter(Appointment.id_vendedor == current_user.id)
    elif vendedor_id:
        query = query.filter(Appointment.id_vendedor == vendedor_id)

    if tipo:
        query = query.filter(Appointment.tipo == tipo)

    return query.order_by(Appointment.fecha_inicio.asc()).all()

@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    app_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = app_in.model_dump()
    data["tenant_id"] = current_user.tenant_id
    if not data.get("id_vendedor"):
        data["id_vendedor"] = current_user.id

    db_app = Appointment(**data)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: str,
    status_in: AppointmentUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_item = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app_item:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    if current_user.rol == RoleEnum.VENDEDOR and app_item.id_vendedor != current_user.id:
        raise HTTPException(status_code=403, detail="No tiene permiso para modificar esta cita")

    app_item.estado = status_in.estado
    db.commit()
    db.refresh(app_item)
    return app_item

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_item = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app_item:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    if current_user.rol == RoleEnum.VENDEDOR and app_item.id_vendedor != current_user.id:
        raise HTTPException(status_code=403, detail="No tiene permiso para eliminar esta cita")

    db.delete(app_item)
    db.commit()
    return None
