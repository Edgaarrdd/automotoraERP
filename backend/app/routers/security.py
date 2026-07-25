from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, ConfigDict
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, RoleEnum
from ..auth import get_current_user, require_roles, verify_password, get_password_hash

router = APIRouter(prefix="/api/security", tags=["Seguridad & Pruebas RBAC"])

class TestCredentialsRequest(BaseModel):
    email: str
    password: str

class TestCredentialsResponse(BaseModel):
    valid: bool
    email: str
    nombre: Optional[str] = None
    rol: Optional[str] = None
    message: str
    hash_algorithm: str = "bcrypt"

class TestRoleRequest(BaseModel):
    role: RoleEnum
    action: str

class TestRoleResponse(BaseModel):
    role: str
    action: str
    authorized: bool
    reason: str

class UserCreateRequest(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: RoleEnum
    telefono: Optional[str] = None

class SecurityUserOut(BaseModel):
    id: str
    nombre: str
    email: str
    rol: RoleEnum
    activo: bool
    telefono: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Matriz de permisos del sistema por rol para simulación y pruebas
ROLE_PERMISSIONS = {
    RoleEnum.ADMIN: [
        "GESTION_USUARIOS", "CREAR_USUARIO", "CAMBIAR_ROLES", "VER_REPORTES_GERENCIALES",
        "GESTION_STOCK", "CREAR_VEHICULO", "ELIMINAR_VEHICULO", "CREAR_COTIZACION",
        "APROBAR_FI", "GESTION_BDC", "CONFIGURACION_SISTEMA"
    ],
    RoleEnum.GERENTE: [
        "VER_REPORTES_GERENCIALES", "GESTION_STOCK", "CREAR_VEHICULO", "CREAR_COTIZACION",
        "APROBAR_FI", "GESTION_BDC"
    ],
    RoleEnum.VENDEDOR: [
        "VER_STOCK", "CREAR_COTIZACION", "GESTIONAR_LEADS_PROPIOS", "REGISTRAR_TEST_DRIVE"
    ],
    RoleEnum.F_AND_I: [
        "VER_SOLICITUDES_FI", "EVALUAR_CREDITO", "APROBAR_FI", "GENERAR_SIMULACION_FINANCIERA"
    ],
    RoleEnum.BDC: [
        "GESTION_BDC", "CREAR_PROSPECTO_BDC", "DERIVAR_PROSPECTO", "REGISTRAR_LLAMADA"
    ]
}

@router.get("/users", response_model=List[SecurityUserOut])
def list_system_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN]))
):
    """
    Lista todos los usuarios almacenados en la base de datos.
    ACCESO EXCLUSIVO: Únicamente el usuario con rol ADMINISTRADOR puede acceder a la gestión de cuentas.
    """
    return db.query(User).all()

@router.post("/create-user", response_model=SecurityUserOut)
def create_system_user(
    req: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN]))
):
    """
    Crea una nueva cuenta de usuario en la BD con hashing bcrypt.
    ACCESO EXCLUSIVO: Únicamente el usuario con rol ADMINISTRADOR puede crear nuevas cuentas.
    """
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con ese correo electrónico"
        )
    
    new_user = User(
        nombre=req.nombre,
        email=req.email,
        password_hash=get_password_hash(req.password),
        rol=req.rol,
        telefono=req.telefono,
        activo=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/test-credentials", response_model=TestCredentialsResponse)
def test_credentials(req: TestCredentialsRequest, db: Session = Depends(get_db)):
    """
    Verifica credenciales (Email y Contraseña) contra el hash bcrypt almacenado en la BD sin alterar la sesión.
    """
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return TestCredentialsResponse(
            valid=False,
            email=req.email,
            message="El correo electrónico no se encuentra registrado en la base de datos."
        )
    
    is_valid = verify_password(req.password, user.password_hash)
    if not is_valid:
        return TestCredentialsResponse(
            valid=False,
            email=req.email,
            nombre=user.nombre,
            rol=user.rol.value,
            message="Contraseña incorrecta para el usuario especificado."
        )
    
    return TestCredentialsResponse(
        valid=True,
        email=user.email,
        nombre=user.nombre,
        rol=user.rol.value,
        message="Credenciales correctas. Hash bcrypt verificado exitosamente."
    )

@router.post("/test-role", response_model=TestRoleResponse)
def test_role_permissions(req: TestRoleRequest):
    """
    Evalúa la matriz de roles y permisos RBAC para una acción específica.
    """
    allowed_actions = ROLE_PERMISSIONS.get(req.role, [])
    authorized = req.action in allowed_actions

    reason = (
        f"El rol {req.role.value} TIENE PERMISO para ejecutar '{req.action}'."
        if authorized
        else f"ACCESO DENEGADO (HTTP 403): El rol {req.role.value} no posee la facultad para '{req.action}'."
    )

    return TestRoleResponse(
        role=req.role.value,
        action=req.action,
        authorized=authorized,
        reason=reason
    )
