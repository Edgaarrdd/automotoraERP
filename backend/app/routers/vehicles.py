from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Vehicle, User, RoleEnum, VehicleStatusEnum
from ..schemas import VehicleCreate, VehicleOut, VehicleUpdateStatus
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/vehicles", tags=["Inventario de Vehículos"])

@router.get("/", response_model=List[VehicleOut])
def get_vehicles(
    estado: Optional[VehicleStatusEnum] = None,
    search: Optional[str] = None,
    marca: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Vehicle)
    if estado:
        query = query.filter(Vehicle.estado == estado)
    if marca:
        query = query.filter(Vehicle.marca.ilike(f"%{marca}%"))
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Vehicle.patente.ilike(search_filter)) |
            (Vehicle.marca.ilike(search_filter)) |
            (Vehicle.modelo.ilike(search_filter)) |
            (Vehicle.vin.ilike(search_filter))
        )
    return query.order_by(Vehicle.fecha_ingreso.desc()).all()

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle_by_id(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehicle

@router.post("/", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE, RoleEnum.VENDEDOR, RoleEnum.TALLER]))
):
    existing = db.query(Vehicle).filter(Vehicle.patente == vehicle_in.patente.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Ya existe un vehículo registrado con la patente {vehicle_in.patente}")

    data = vehicle_in.dict()
    data["patente"] = data["patente"].upper().strip()
    data["tenant_id"] = current_user.tenant_id

    db_vehicle = Vehicle(**data)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.patch("/{vehicle_id}/status", response_model=VehicleOut)
def update_vehicle_status(
    vehicle_id: str,
    status_update: VehicleUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE, RoleEnum.VENDEDOR, RoleEnum.TALLER]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    vehicle.estado = status_update.estado
    if status_update.estado == VehicleStatusEnum.VENDIDO:
        vehicle.id_vendedor_vendio = current_user.id
    
    db.commit()
    db.refresh(vehicle)
    return vehicle
