from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Quote, Vehicle, Customer, User, RoleEnum
from ..schemas import QuoteCreate, QuoteOut
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/quotes", tags=["Cotizaciones PDF y Web"])

@router.post("/", response_model=QuoteOut, status_code=status.HTTP_201_CREATED)
def create_quote(
    quote_in: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE, RoleEnum.VENDEDOR]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == quote_in.id_vehiculo).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    customer = db.query(Customer).filter(Customer.id == quote_in.id_cliente).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Financial math
    monto_financiar = quote_in.precio_vehiculo - quote_in.pie_monto
    if monto_financiar < 0:
        raise HTTPException(status_code=400, detail="El pie no puede ser superior al precio del vehículo")

    # Monthly installment formula with interest & insurance
    r = (quote_in.tasa_interes / 100.0)
    n = quote_in.cantidad_cuotas
    if r > 0 and n > 0:
        cuota_base = monto_financiar * (r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
    else:
        cuota_base = monto_financiar / max(n, 1)

    cuota_total = cuota_base + (quote_in.costo_seguro if quote_in.incluye_seguro else 0.0)

    db_quote = Quote(
        tenant_id=current_user.tenant_id,
        id_lead=quote_in.id_lead,
        id_cliente=quote_in.id_cliente,
        id_vehiculo=quote_in.id_vehiculo,
        id_vendedor=current_user.id,
        precio_vehiculo=quote_in.precio_vehiculo,
        pie_monto=quote_in.pie_monto,
        monto_financiar=monto_financiar,
        cantidad_cuotas=quote_in.cantidad_cuotas,
        valor_cuota_estimado=round(cuota_total, 2),
        tasa_interes=quote_in.tasa_interes,
        incluye_seguro=quote_in.incluye_seguro,
        costo_seguro=quote_in.costo_seguro,
        estado="EMITIDA",
        fecha_expiracion=datetime.utcnow() + timedelta(days=15)
    )

    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote

@router.get("/", response_model=List[QuoteOut])
def get_quotes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Quote)
    if current_user.rol == RoleEnum.VENDEDOR:
        query = query.filter(Quote.id_vendedor == current_user.id)
    return query.order_by(Quote.fecha_creacion.desc()).all()

@router.get("/{quote_id}", response_model=QuoteOut)
def get_quote_by_id(
    quote_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return quote
