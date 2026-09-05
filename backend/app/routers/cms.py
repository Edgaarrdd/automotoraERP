from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Tenant, User, RoleEnum
from ..schemas import TenantCMSUpdate, TenantPublicConfig
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/cms", tags=["CMS Storefront Admin"])

@router.get("/config", response_model=TenantPublicConfig)
def get_cms_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    if not tenant:
        # Fallback to first tenant
        tenant = db.query(Tenant).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant no encontrado")

    return TenantPublicConfig(
        nombre_empresa=tenant.nombre_empresa,
        subdominio=tenant.subdominio,
        sitio_web_activo=tenant.sitio_web_activo if tenant.sitio_web_activo is not None else True,
        slogan=tenant.slogan or "Tu automotora de confianza en Chile",
        color_primario=tenant.color_primario or "#0284c7",
        tema_diseno=tenant.tema_diseno or "dark_luxury",
        dominio_personalizado=tenant.dominio_personalizado,
        estado_dns=tenant.estado_dns or "PENDIENTE",
        logo_url=tenant.logo_url,
        banner_url=tenant.banner_url,
        whatsapp_contacto=tenant.whatsapp_contacto or "+56912345678",
        direccion_fisica=tenant.direccion_fisica or "Av. Vitacura 4560, Santiago"
    )

@router.patch("/config", response_model=TenantPublicConfig)
def update_cms_config(
    cms_in: TenantCMSUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([RoleEnum.ADMIN, RoleEnum.GERENTE]))
):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    if not tenant:
        tenant = db.query(Tenant).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant no encontrado")

    if cms_in.sitio_web_activo is not None:
        tenant.sitio_web_activo = cms_in.sitio_web_activo
    if cms_in.slogan is not None:
        tenant.slogan = cms_in.slogan
    if cms_in.color_primario is not None:
        tenant.color_primario = cms_in.color_primario
    if cms_in.tema_diseno is not None:
        tenant.tema_diseno = cms_in.tema_diseno
    if cms_in.dominio_personalizado is not None:
        tenant.dominio_personalizado = cms_in.dominio_personalizado
        tenant.estado_dns = "VERIFICADO" if cms_in.dominio_personalizado.strip() else "NO_CONFIGURADO"
    if cms_in.estado_dns is not None:
        tenant.estado_dns = cms_in.estado_dns
    if cms_in.logo_url is not None:
        tenant.logo_url = cms_in.logo_url
    if cms_in.banner_url is not None:
        tenant.banner_url = cms_in.banner_url
    if cms_in.whatsapp_contacto is not None:
        tenant.whatsapp_contacto = cms_in.whatsapp_contacto
    if cms_in.direccion_fisica is not None:
        tenant.direccion_fisica = cms_in.direccion_fisica

    db.commit()
    db.refresh(tenant)

    return TenantPublicConfig(
        nombre_empresa=tenant.nombre_empresa,
        subdominio=tenant.subdominio,
        sitio_web_activo=tenant.sitio_web_activo,
        slogan=tenant.slogan,
        color_primario=tenant.color_primario,
        tema_diseno=tenant.tema_diseno,
        dominio_personalizado=tenant.dominio_personalizado,
        estado_dns=tenant.estado_dns,
        logo_url=tenant.logo_url,
        banner_url=tenant.banner_url,
        whatsapp_contacto=tenant.whatsapp_contacto,
        direccion_fisica=tenant.direccion_fisica
    )
