from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import User, Vehicle, Quote, FISolicitud, RoleEnum
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/commissions", tags=["Liquidación de Comisiones & Reportes"])

@router.get("/summary")
def get_commissions_summary(
    mes: Optional[int] = None,
    año: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch sales users
    sellers = db.query(User).filter(User.rol.in_([RoleEnum.VENDEDOR, RoleEnum.GERENTE, RoleEnum.ADMIN])).all()

    # Calculate metrics for each seller
    summary_list = []
    for s in sellers:
        # Sold vehicles by seller
        sold_vehicles = db.query(Vehicle).filter(
            Vehicle.id_vendedor_vendio == s.id,
            Vehicle.estado == "VENDIDO"
        ).all()

        cant_vendidos = len(sold_vehicles)
        monto_total_ventas = sum(v.precio_venta_publico or 0 for v in sold_vehicles)
        margen_bruto_total = sum(
            (v.precio_venta_publico or 0) - (v.precio_compra_tasacion or 0) for v in sold_vehicles
        )

        # Base commission calculation: 1.5% of total sales
        comision_base_pct = 1.5
        comision_base_monto = (monto_total_ventas * comision_base_pct) / 100.0

        # F&I Bonus count for closed credits
        fi_solicitudes = db.query(FISolicitud).filter(
            FISolicitud.id_asesor_fi == s.id,
            FISolicitud.estado.in_(["APROBADA", "PRE_APROBADA"])
        ).count()
        bono_fi_monto = fi_solicitudes * 50000.0 # $50.000 CLP bonus per F&I credit

        total_comision_pagar = comision_base_monto + bono_fi_monto

        summary_list.append({
            "vendedor_id": s.id,
            "nombre": s.nombre,
            "email": s.email,
            "rol": s.rol,
            "vehiculos_vendidos": cant_vendidos,
            "monto_total_ventas": monto_total_ventas,
            "margen_bruto_total": margen_bruto_total,
            "comision_base_porcentaje": comision_base_pct,
            "comision_base_monto": comision_base_monto,
            "creditos_fi_colocados": fi_solicitudes,
            "bono_fi_monto": bono_fi_monto,
            "total_comision_pagar": total_comision_pagar,
            "estado_liquidacion": "PENDIENTE_REVISION" if cant_vendidos > 0 else "SIN_VENTAS",
            "fecha_calculo": datetime.utcnow()
        })

    return summary_list

@router.patch("/{vendedor_id}/status")
def update_commission_status(
    vendedor_id: str,
    estado_nuevo: str, # APROBADA, PAGADA, PENDIENTE_REVISION
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE]))
):
    seller = db.query(User).filter(User.id == vendedor_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    return {
        "vendedor_id": seller.id,
        "nombre": seller.nombre,
        "estado_liquidacion": estado_nuevo,
        "actualizado_por": current_user.nombre,
        "fecha_actualizacion": datetime.utcnow()
    }
