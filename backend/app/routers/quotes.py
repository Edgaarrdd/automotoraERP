from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
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
    if quote_in.id_vehiculo:
        vehicle = db.query(Vehicle).filter(Vehicle.id == quote_in.id_vehiculo).first()
        if not vehicle:
            quote_in.id_vehiculo = None

    if quote_in.id_cliente:
        customer = db.query(Customer).filter(Customer.id == quote_in.id_cliente).first()
        if not customer:
            quote_in.id_cliente = None

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

@router.get("/{quote_id}/pdf-html", response_class=HTMLResponse)
def get_quote_pdf_html(
    quote_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")

    vehicle = quote.vehicle
    customer = quote.customer

    v_nombre = f"{vehicle.marca} {vehicle.modelo}" if vehicle else "Vehículo en Cotización"
    v_patente = vehicle.patente if vehicle else "KJPW99"
    c_nombre = customer.nombre_completo if customer else "Cliente Particular"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Cotización {quote.id[:8].upper()} - Automotora Origen</title>
        <style>
            body {{ font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; background: #f8fafc; }}
            .card {{ background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }}
            .logo {{ font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; }}
            .table {{ width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }}
            .table th, .table td {{ border: 1px solid #e2e8f0; padding: 12px; text-align: left; }}
            .table th {{ background-color: #f1f5f9; font-weight: 700; color: #334155; }}
            .total {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; }}
            @media print {{ body {{ margin: 0; background: white; }} .card {{ box-shadow: none; border: none; padding: 0; }} }}
        </style>
    </head>
    <body onload="window.print()">
        <div class="card">
            <div class="header">
                <div>
                    <div class="logo">AUTOMOTORA ORIGEN</div>
                    <p style="margin: 4px 0; font-size: 12px; color: #64748b;">Av. Apoquindo 4500, Las Condes • Santiago, Chile</p>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">Mesa Central: +56 2 2987 6543 • www.automotoraorigen.cl</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0; font-size: 18px; color: #0f172a;">COTIZACIÓN DE VEHÍCULO</h2>
                    <p style="margin: 4px 0; font-size: 12px; font-family: monospace; font-weight: bold; color: #0284c7;">COT-2026-{quote.id[:8].upper()}</p>
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">Fecha Emisión: {quote.fecha_creacion.strftime('%d/%m/%Y')}</p>
                </div>
            </div>
            
            <div style="display: flex; gap: 20px; margin-top: 24px;">
                <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px;">
                    <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">Información del Cliente</strong><br>
                    <div style="font-size: 15px; font-weight: bold; margin-top: 4px; color: #0f172a;">{c_nombre}</div>
                    <div style="color: #475569; margin-top: 2px;">Teléfono: {customer.telefono if customer else '+569 1122 3344'}</div>
                </div>
                <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px;">
                    <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">Vehículo Cotizado</strong><br>
                    <div style="font-size: 15px; font-weight: bold; margin-top: 4px; color: #0f172a;">{v_nombre}</div>
                    <div style="color: #475569; margin-top: 2px; font-family: monospace;">Patente: {v_patente}</div>
                </div>
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th>Concepto Financiero ({quote.tipo_financiamiento})</th>
                        <th style="text-align: right;">Monto (CLP)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Precio Venta Público del Vehículo</td>
                        <td style="text-align: right; font-weight: bold;">${quote.precio_vehiculo:,.0f} CLP</td>
                    </tr>
                    <tr>
                        <td style="color: #475569;">(-) Pie Inicial Cancelado</td>
                        <td style="text-align: right; color: #059669; font-weight: bold;">-${quote.pie_monto:,.0f} CLP</td>
                    </tr>
                    <tr style="background: #f8fafc; font-weight: bold;">
                        <td>(=) Monto Neto a Financiar</td>
                        <td style="text-align: right; color: #0f172a;">${quote.monto_financiar:,.0f} CLP</td>
                    </tr>
                </tbody>
            </table>

            <div class="total">
                <div>
                    <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase;">Cuota Mensual Estimada</div>
                    <div style="font-size: 13px; font-weight: normal; margin-top: 2px;">{quote.cantidad_cuotas} Cuotas Fijas • Tasa {quote.tasa_interes}%</div>
                </div>
                <div style="font-size: 24px; color: #38bdf8;">${quote.valor_cuota_estimado:,.0f} / mes</div>
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
                Cotización válida por 15 días desde su fecha de emisión. Documento no válido como factura. Sujeto a aprobación del departamento de crédito F&I.
            </div>

            <div style="margin-top: 60px; display: flex; justify-content: space-between; text-align: center; font-size: 12px; color: #475569;">
                <div style="width: 220px; border-top: 1px solid #94a3b8; padding-top: 6px;">Firma Asesor Comercial</div>
                <div style="width: 220px; border-top: 1px solid #94a3b8; padding-top: 6px;">Firma y Rut Cliente</div>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
