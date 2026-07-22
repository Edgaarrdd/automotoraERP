from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from .models import Tenant, User, Customer, Vehicle, LeadOpportunity, Quote, FISolicitud, BDCLead, RoleEnum, CustomerTypeEnum, VehicleStatusEnum, FuelTypeEnum, TransmissionEnum, PipelineStageEnum
from .auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "admin@automotoralascondes.cl").first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with demo Chilean Automotora ERP data...")

    # 1. Create or get Tenant
    tenant = db.query(Tenant).filter(Tenant.subdominio == "lascondes").first()
    if not tenant:
        tenant = Tenant(
            nombre_empresa="Automotora Las Condes SpA",
            subdominio="lascondes",
            plan="ENTERPRISE",
            max_usuarios=50,
            max_vehiculos=500
        )
        db.add(tenant)
        db.flush()

    # 2. Create Users
    admin = User(
        tenant_id=tenant.id,
        nombre="Carlos Mendoza (Admin)",
        email="admin@automotoralascondes.cl",
        password_hash=get_password_hash("Admin123!"),
        telefono="+56911223344",
        rol=RoleEnum.ADMIN
    )
    gerente = User(
        tenant_id=tenant.id,
        nombre="Roberto Gómez (Gerente Comercial)",
        email="gerente@automotoralascondes.cl",
        password_hash=get_password_hash("Gerente123!"),
        telefono="+56922334455",
        rol=RoleEnum.GERENTE
    )
    vendedor1 = User(
        tenant_id=tenant.id,
        nombre="Matías Silva (Asesor Comercial)",
        email="vendedor1@automotoralascondes.cl",
        password_hash=get_password_hash("Vendedor123!"),
        telefono="+56933445566",
        rol=RoleEnum.VENDEDOR
    )
    vendedor2 = User(
        tenant_id=tenant.id,
        nombre="Camila Torres (Asesora Comercial)",
        email="vendedor2@automotoralascondes.cl",
        password_hash=get_password_hash("Vendedor123!"),
        telefono="+56944556677",
        rol=RoleEnum.VENDEDOR
    )
    fi_user = User(
        tenant_id=tenant.id,
        nombre="Felipe Reyes (Ejecutivo F&I)",
        email="fi@automotoralascondes.cl",
        password_hash=get_password_hash("Fi123!"),
        telefono="+56955667788",
        rol=RoleEnum.F_AND_I
    )
    bdc_user = User(
        tenant_id=tenant.id,
        nombre="Valentina Morales (Agente BDC)",
        email="bdc@automotoralascondes.cl",
        password_hash=get_password_hash("Bdc123!"),
        telefono="+56966778899",
        rol=RoleEnum.BDC
    )

    db.add_all([admin, gerente, vendedor1, vendedor2, fi_user, bdc_user])
    db.flush()

    # 3. Create Customers
    cliente1 = Customer(
        tenant_id=tenant.id,
        nombre_completo="Juan Pablo Pérez",
        rut_dni="16.482.193-K",
        telefono="+56987654321",
        email="jperez@gmail.com",
        direccion="Av. Apoquindo 4500, Las Condes",
        tipo=CustomerTypeEnum.COMPRADOR,
        origen="WEB",
        id_vendedor_asignado=vendedor1.id,
        preferencias_compra={"tipo_vehiculo": "SUV", "presupuesto_max": 18000000}
    )
    cliente2 = Customer(
        tenant_id=tenant.id,
        nombre_completo="María Josefa Fernández",
        rut_dni="18.123.456-7",
        telefono="+56976543210",
        email="mj.fernandez@outlook.cl",
        direccion="Av. Vitacura 2300, Vitacura",
        tipo=CustomerTypeEnum.COMPRADOR,
        origen="PRESENCIAL",
        id_vendedor_asignado=vendedor2.id,
        preferencias_compra={"tipo_vehiculo": "Sedan", "presupuesto_max": 14000000}
    )
    cliente3 = Customer(
        tenant_id=tenant.id,
        nombre_completo="Gonzalo Larraín (Consignatario)",
        rut_dni="12.987.654-3",
        telefono="+56965432109",
        email="glarrain@empresa.cl",
        direccion="Camino El Alba 9000, Las Condes",
        tipo=CustomerTypeEnum.CONSIGNATARIO,
        origen="REFERIDO",
        id_vendedor_asignado=vendedor1.id
    )

    db.add_all([cliente1, cliente2, cliente3])
    db.flush()

    # 4. Create Vehicles
    auto1 = Vehicle(
        tenant_id=tenant.id,
        patente="PXYZ88",
        vin="CL9RAV4X202200981",
        marca="Toyota",
        modelo="RAV4",
        version="2.0 VX Automatico 4x2",
        año=2022,
        kilometraje=32000,
        tipo_combustible=FuelTypeEnum.BENCINA,
        transmision=TransmissionEnum.AUTOMATICA,
        color="Gris Grafito",
        precio_compra_tasacion=16500000,
        precio_venta_publico=18990000,
        precio_minimo_venta=18200000,
        estado=VehicleStatusEnum.DISPONIBLE,
        id_consignatario=cliente3.id,
        urls_fotos=[
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800"
        ],
        urls_documentos=["padron_PXYZ88.pdf", "rt_PXYZ88.pdf"],
        historial_legal={"multas": False, "prendas": False, "choques_graves": False}
    )
    auto2 = Vehicle(
        tenant_id=tenant.id,
        patente="RSTV33",
        vin="KMHTC20230004512",
        marca="Hyundai",
        modelo="Tucson",
        version="2.0 CRDi Limited 4x4",
        año=2023,
        kilometraje=18500,
        tipo_combustible=FuelTypeEnum.DIESEL,
        transmision=TransmissionEnum.AUTOMATICA,
        color="Blanco Perla",
        precio_compra_tasacion=19000000,
        precio_venta_publico=21490000,
        precio_minimo_venta=20800000,
        estado=VehicleStatusEnum.RESERVADO,
        urls_fotos=[
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"
        ],
        historial_legal={"multas": False, "prendas": False, "choques_graves": False}
    )
    auto3 = Vehicle(
        tenant_id=tenant.id,
        patente="KGTR45",
        vin="JMZCX52023007891",
        marca="Mazda",
        modelo="CX-5",
        version="2.5 GT AWD",
        año=2023,
        kilometraje=15000,
        tipo_combustible=FuelTypeEnum.BENCINA,
        transmision=TransmissionEnum.AUTOMATICA,
        color="Rojo Soul Red",
        precio_compra_tasacion=20000000,
        precio_venta_publico=22990000,
        precio_minimo_venta=22000000,
        estado=VehicleStatusEnum.VENDIDO,
        fecha_venta=datetime.utcnow() - timedelta(days=5),
        id_vendedor_vendio=vendedor1.id,
        urls_fotos=[
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"
        ]
    )
    auto4 = Vehicle(
        tenant_id=tenant.id,
        patente="ABCD12",
        vin="3GNCJ20210088990",
        marca="Chevrolet",
        modelo="Tracker",
        version="1.2 Turbo LTZ",
        año=2021,
        kilometraje=45000,
        tipo_combustible=FuelTypeEnum.BENCINA,
        transmision=TransmissionEnum.MANUAL,
        color="Azul Oscuro",
        precio_compra_tasacion=10500000,
        precio_venta_publico=12490000,
        precio_minimo_venta=11900000,
        estado=VehicleStatusEnum.DISPONIBLE,
        urls_fotos=[
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800"
        ]
    )

    db.add_all([auto1, auto2, auto3, auto4])
    db.flush()

    # 5. Create Leads in Pipeline
    lead1 = LeadOpportunity(
        tenant_id=tenant.id,
        id_cliente=cliente1.id,
        id_vehiculo_interes=auto1.id,
        id_vendedor_asignado=vendedor1.id,
        estado_embudo=PipelineStageEnum.NEGOCIACION,
        monto_estimado=18990000,
        fecha_creacion=datetime.utcnow() - timedelta(days=3)
    )
    lead2 = LeadOpportunity(
        tenant_id=tenant.id,
        id_cliente=cliente2.id,
        id_vehiculo_interes=auto2.id,
        id_vendedor_asignado=vendedor2.id,
        estado_embudo=PipelineStageEnum.RESERVADO,
        monto_estimado=21490000,
        fecha_creacion=datetime.utcnow() - timedelta(days=7)
    )
    lead3 = LeadOpportunity(
        tenant_id=tenant.id,
        id_cliente=cliente1.id,
        id_vehiculo_interes=auto3.id,
        id_vendedor_asignado=vendedor1.id,
        estado_embudo=PipelineStageEnum.CERRADO_GANADO,
        monto_estimado=22990000,
        fecha_creacion=datetime.utcnow() - timedelta(days=12)
    )

    db.add_all([lead1, lead2, lead3])
    db.flush()

    # 6. Create Quotes
    quote1 = Quote(
        tenant_id=tenant.id,
        id_lead=lead1.id,
        id_cliente=cliente1.id,
        id_vehiculo=auto1.id,
        id_vendedor=vendedor1.id,
        precio_vehiculo=18990000,
        pie_monto=5000000,
        monto_financiar=13990000,
        cantidad_cuotas=36,
        valor_cuota_estimado=485000,
        tasa_interes=1.45,
        incluye_seguro=True,
        costo_seguro=38000,
        estado="EMITIDA"
    )
    db.add(quote1)

    # 7. Create F&I Solicitud
    fi_sol = FISolicitud(
        tenant_id=tenant.id,
        id_cliente=cliente2.id,
        id_vehiculo=auto2.id,
        id_cotizacion=None,
        id_asesor_fi=fi_user.id,
        entidad_financiera="Forum Servicios Financieros",
        monto_solicitado=15000000,
        pie_porcentaje=30.0,
        estado="APROBADA",
        observaciones="Crédito aprobado sujeto a verificación de liquidación de sueldo."
    )
    db.add(fi_sol)

    # 8. Create BDC Lead
    bdc_lead = BDCLead(
        tenant_id=tenant.id,
        nombre_prospecto="Andrés Sepúlveda",
        telefono="+56912345678",
        email="asepulveda@gmail.com",
        origen_contacto="LLAMADA_ENTRANTE",
        vehiculo_interes="Toyota RAV4",
        asignado_a=vendedor1.id,
        estado="DERIVADO",
        notas="Llamó preguntando por pie mínimo y retoma de su auto en parte de pago."
    )
    db.add(bdc_lead)

    db.commit()
    print("Database successfully seeded with realistic Chilean Automotora data!")
    db.close()

if __name__ == "__main__":
    seed_database()
