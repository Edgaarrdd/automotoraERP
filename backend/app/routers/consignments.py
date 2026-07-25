from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Vehicle, Customer, Quote, Appointment, LeadOpportunity, User, RoleEnum
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/consignments", tags=["Portal del Consignatario (Transparencia)"])

@router.get("/")
def list_consignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch vehicles that have an assigned consignor customer OR are in evaluation/consignado status
    consigned_vehicles = db.query(Vehicle).filter(
        (Vehicle.id_consignatario.isnot(None)) | (Vehicle.estado.in_(["EVALUACION", "DISPONIBLE", "RESERVADO", "VENDIDO"]))
    ).order_by(Vehicle.fecha_ingreso.desc()).all()

    result = []
    for v in consigned_vehicles:
        owner = None
        if v.id_consignatario:
            owner_obj = db.query(Customer).filter(Customer.id == v.id_consignatario).first()
            if owner_obj:
                owner = {
                    "id": owner_obj.id,
                    "nombre_completo": owner_obj.nombre_completo,
                    "rut_dni": owner_obj.rut_dni,
                    "telefono": owner_obj.telefono,
                    "email": owner_obj.email
                }

        # Activity counters
        quotes_count = db.query(Quote).filter(Quote.id_vehiculo == v.id).count()
        test_drives_count = db.query(Appointment).filter(
            Appointment.id_vehiculo == v.id,
            Appointment.tipo == "TEST_DRIVE"
        ).count()
        leads_count = db.query(LeadOpportunity).filter(LeadOpportunity.id_vehiculo_interes == v.id).count()

        # Consignment Financial Calculation
        precio_publico = v.precio_venta_publico or 0.0
        comision_pct = 3.0 # 3% automotora commission standard
        monto_comision = (precio_publico * comision_pct) / 100.0
        liquidacion_neto_dueno = precio_publico - monto_comision

        result.append({
            "id": v.id,
            "patente": v.patente,
            "marca": v.marca,
            "modelo": v.modelo,
            "año": v.año,
            "kilometraje": v.kilometraje,
            "color": v.color,
            "estado": v.estado,
            "precio_venta_publico": precio_publico,
            "precio_minimo_venta": v.precio_minimo_venta or (precio_publico * 0.95),
            "comision_porcentaje": comision_pct,
            "monto_comision_estimado": monto_comision,
            "liquidacion_estimada_dueno": liquidacion_neto_dueno,
            "fecha_ingreso": v.fecha_ingreso,
            "consignatario": owner or {
                "nombre_completo": "Consignatario Ejemplo (Don Mario)",
                "rut_dni": "12.345.678-9",
                "telefono": "+56987654321",
                "email": "mario.consignatario@origen.cl"
            },
            "metricas_transparencia": {
                "cotizaciones_emitidas": quotes_count,
                "test_drives_realizados": test_drives_count,
                "prospectos_interesados": leads_count
            }
        })

    return result

@router.get("/{vehicle_id}/summary")
def get_consignment_summary(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehículo consignado no encontrado")

    quotes_count = db.query(Quote).filter(Quote.id_vehiculo == v.id).count()
    test_drives_count = db.query(Appointment).filter(
        Appointment.id_vehiculo == v.id,
        Appointment.tipo == "TEST_DRIVE"
    ).count()
    leads_count = db.query(LeadOpportunity).filter(LeadOpportunity.id_vehiculo_interes == v.id).count()

    precio_publico = v.precio_venta_publico or 0.0
    comision_pct = 3.0
    monto_comision = (precio_publico * comision_pct) / 100.0
    liquidacion_neto_dueno = precio_publico - monto_comision

    return {
        "vehiculo": {
            "id": v.id,
            "patente": v.patente,
            "marca": v.marca,
            "modelo": v.modelo,
            "año": v.año,
            "estado": v.estado,
            "precio_venta_publico": precio_publico,
            "fecha_ingreso": v.fecha_ingreso
        },
        "financiero": {
            "precio_publico": precio_publico,
            "comision_pct": comision_pct,
            "monto_comision": monto_comision,
            "liquidacion_neto_dueno": liquidacion_neto_dueno
        },
        "actividad": {
            "cotizaciones": quotes_count,
            "test_drives": test_drives_count,
            "prospectos_interesados": leads_count
        },
        "linea_tiempo_estado": [
            {"etapa": "Recepción & Firma Contrato", "completada": True, "fecha": v.fecha_ingreso},
            {"etapa": "Inspección Técnica & PDI", "completada": True, "fecha": v.fecha_ingreso},
            {"etapa": "Publicación en Chileautos & MercadoLibre", "completada": v.estado != "EVALUACION"},
            {"etapa": "En Negociación / Test Drive", "completada": v.estado in ["RESERVADO", "VENDIDO"]},
            {"etapa": "Vendido & Liquidación al Consignatario", "completada": v.estado == "VENDIDO"}
        ]
    }
