from datetime import datetime
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from .models import Tenant, User, Customer, Vehicle, LeadOpportunity, Quote, FISolicitud, BDCLead, RoleEnum
from .auth import get_password_hash

def seed_database():
    """
    Inicializa la base de datos limpia para la versión Alpha 0.0.1.
    Elimina datos de muestra operacionales (vehículos, leads, cotizaciones, etc.)
    y asegura la creación de las cuentas de usuario de sistema iniciales por rol con dominio @origen.cl.
    """
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    print("Limpiando datos de muestra y asegurando estructura limpia Alpha 0.0.1...")

    # Limpiar datos operacionales de muestra si existen
    db.query(BDCLead).delete()
    db.query(FISolicitud).delete()
    db.query(Quote).delete()
    db.query(LeadOpportunity).delete()
    db.query(Vehicle).delete()
    db.query(Customer).delete()
    db.commit()

    # 1. Crear o recuperar Tenant base
    tenant = db.query(Tenant).filter(Tenant.subdominio == "origen").first()
    if not tenant:
        tenant = db.query(Tenant).filter(Tenant.subdominio == "lascondes").first()
    
    if not tenant:
        tenant = Tenant(
            nombre_empresa="Automotora Origen SpA",
            subdominio="origen",
            plan="ENTERPRISE",
            max_usuarios=50,
            max_vehiculos=500
        )
        db.add(tenant)
        db.flush()
    else:
        tenant.nombre_empresa = "Automotora Origen SpA"
        tenant.subdominio = "origen"

    # 2. Definición de Usuarios Iniciales del Sistema por Rol (@origen.cl)
    initial_users = [
        {
            "nombre": "Carlos Mendoza (Admin)",
            "email": "admin@origen.cl",
            "password": "Admin123!",
            "telefono": "+56911223344",
            "rol": RoleEnum.ADMIN
        },
        {
            "nombre": "Roberto Gómez (Gerente Comercial)",
            "email": "gerente@origen.cl",
            "password": "Gerente123!",
            "telefono": "+56922334455",
            "rol": RoleEnum.GERENTE
        },
        {
            "nombre": "Matías Silva (Asesor Comercial)",
            "email": "vendedor1@origen.cl",
            "password": "Vendedor123!",
            "telefono": "+56933445566",
            "rol": RoleEnum.VENDEDOR
        },
        {
            "nombre": "Camila Torres (Asesora Comercial)",
            "email": "vendedor2@origen.cl",
            "password": "Vendedor123!",
            "telefono": "+56944556677",
            "rol": RoleEnum.VENDEDOR
        },
        {
            "nombre": "Felipe Reyes (Ejecutivo F&I)",
            "email": "fi@origen.cl",
            "password": "Fi123!",
            "telefono": "+56955667788",
            "rol": RoleEnum.F_AND_I
        },
        {
            "nombre": "Valentina Morales (Agente BDC)",
            "email": "bdc@origen.cl",
            "password": "Bdc123!",
            "telefono": "+56966778899",
            "rol": RoleEnum.BDC
        }
    ]

    # Limpiar usuarios anteriores que no sean del dominio @origen.cl o recrearlos
    db.query(User).filter(~User.email.endswith("@origen.cl")).delete(synchronize_session=False)
    db.commit()

    for u_data in initial_users:
        user = db.query(User).filter(User.email == u_data["email"]).first()
        if not user:
            new_user = User(
                tenant_id=tenant.id,
                nombre=u_data["nombre"],
                email=u_data["email"],
                password_hash=get_password_hash(u_data["password"]),
                telefono=u_data["telefono"],
                rol=u_data["rol"],
                activo=True
            )
            db.add(new_user)
        else:
            # Asegurar contraseña y estado
            user.password_hash = get_password_hash(u_data["password"])
            user.activo = True

    db.commit()
    print("Base de datos configurada en estado limpio Alpha 0.0.1 con usuarios @origen.cl")
    db.close()

if __name__ == "__main__":
    seed_database()
