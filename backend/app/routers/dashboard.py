from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Vehicle, LeadOpportunity, Quote, VehicleStatusEnum, PipelineStageEnum, User, RoleEnum
from ..schemas import DashboardMetrics
from ..auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Executive Metrics"])

@router.get("/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total stock count
    total_stock = db.query(func.count(Vehicle.id)).scalar() or 0
    disponibles = db.query(func.count(Vehicle.id)).filter(Vehicle.estado == VehicleStatusEnum.DISPONIBLE).scalar() or 0
    reservados = db.query(func.count(Vehicle.id)).filter(Vehicle.estado == VehicleStatusEnum.RESERVADO).scalar() or 0
    vendidos = db.query(func.count(Vehicle.id)).filter(Vehicle.estado == VehicleStatusEnum.VENDIDO).scalar() or 0

    # Active leads count
    active_leads_query = db.query(func.count(LeadOpportunity.id)).filter(
        LeadOpportunity.estado_embudo.notin_([PipelineStageEnum.CERRADO_GANADO, PipelineStageEnum.CERRADO_PERDIDO])
    )
    if current_user.rol == RoleEnum.VENDEDOR:
        active_leads_query = active_leads_query.filter(LeadOpportunity.id_vendedor_asignado == current_user.id)
    total_active_leads = active_leads_query.scalar() or 0

    # Quotes total sum
    monto_cotizado = db.query(func.sum(Quote.precio_vehiculo)).scalar() or 0.0

    # Total sold value
    total_sales_monto = db.query(func.sum(Vehicle.precio_venta_publico)).filter(
        Vehicle.estado == VehicleStatusEnum.VENDIDO
    ).scalar() or 0.0

    # Conversion rate
    total_leads = db.query(func.count(LeadOpportunity.id)).scalar() or 1
    won_leads = db.query(func.count(LeadOpportunity.id)).filter(LeadOpportunity.estado_embudo == PipelineStageEnum.CERRADO_GANADO).scalar() or 0
    conversion_rate = round((won_leads / max(total_leads, 1)) * 100.0, 1)

    return DashboardMetrics(
        total_vehiculos_stock=total_stock,
        vehiculos_disponibles=disponibles,
        vehiculos_reservados=reservados,
        vehiculos_vendidos_mes=vendidos,
        total_leads_activos=total_active_leads,
        monto_cotizado_mes=monto_cotizado,
        ventas_totales_monto_mes=total_sales_monto,
        tasa_conversion_pct=conversion_rate
    )
