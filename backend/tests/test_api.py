import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.seed import seed_database

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    from app import seed
    seed.engine = engine
    seed.SessionLocal = TestingSessionLocal
    seed_database()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "version" in response.json()

def test_login_success():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@origen.cl", "password": "Admin123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@origen.cl"

def test_clean_stock():
    # Login first
    login_res = client.post(
        "/api/auth/login",
        json={"email": "gerente@origen.cl", "password": "Gerente123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/vehicles/", headers=headers)
    assert res.status_code == 200
    vehicles = res.json()
    # Limpieza Alpha 0.0.1 debe resultar en 0 vehículos de muestra iniciales
    assert len(vehicles) == 0

def test_security_module_endpoints():
    # 1. Test credentials endpoint
    res_cred = client.post(
        "/api/security/test-credentials",
        json={"email": "admin@origen.cl", "password": "Admin123!"}
    )
    assert res_cred.status_code == 200
    assert res_cred.json()["valid"] is True

    # 2. Test role permission check
    res_role = client.post(
        "/api/security/test-role",
        json={"role": "VENDEDOR", "action": "CREAR_USUARIO"}
    )
    assert res_role.status_code == 200
    assert res_role.json()["authorized"] is False

    # 3. Test list users access restriction (ADMIN allowed, VENDEDOR denied)
    # Admin login
    admin_login = client.post(
        "/api/auth/login",
        json={"email": "admin@origen.cl", "password": "Admin123!"}
    )
    admin_token = admin_login.json()["access_token"]
    
    admin_users_res = client.get(
        "/api/security/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_users_res.status_code == 200
    assert len(admin_users_res.json()) >= 6

    # Vendedor login
    vendedor_login = client.post(
        "/api/auth/login",
        json={"email": "vendedor1@origen.cl", "password": "Vendedor123!"}
    )
    vendedor_token = vendedor_login.json()["access_token"]

    vendedor_users_res = client.get(
        "/api/security/users",
        headers={"Authorization": f"Bearer {vendedor_token}"}
    )
    assert vendedor_users_res.status_code == 403

def test_full_persistence_flow():
    # 1. Login as Admin
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@origen.cl", "password": "Admin123!"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create vehicle
    v_res = client.post(
        "/api/vehicles/",
        headers=headers,
        json={
            "patente": "AB123CD",
            "marca": "Toyota",
            "modelo": "RAV4",
            "año": 2023,
            "kilometraje": 15000,
            "precio_compra_tasacion": 15000000,
            "precio_venta_publico": 18990000,
            "estado": "DISPONIBLE"
        }
    )
    assert v_res.status_code == 201
    vehicle_id = v_res.json()["id"]

    # 3. Create customer and lead
    c_res = client.post(
        "/api/leads/customers",
        headers=headers,
        json={
            "nombre_completo": "Esteban Quito",
            "telefono": "+56912345678",
            "email": "esteban@origen.cl"
        }
    )
    assert c_res.status_code == 201
    customer_id = c_res.json()["id"]

    l_res = client.post(
        "/api/leads/",
        headers=headers,
        json={
            "id_cliente": customer_id,
            "id_vehiculo_interes": vehicle_id,
            "id_vendedor_asignado": login_res.json()["user"]["id"],
            "monto_estimado": 18990000,
            "estado_embudo": "NUEVO"
        }
    )
    assert l_res.status_code == 201

    # 4. Create BDC lead
    bdc_res = client.post(
        "/api/bdc/",
        headers=headers,
        json={
            "nombre_prospecto": "Maria Gomez",
            "telefono": "+56998765432",
            "vehiculo_interes": "Toyota RAV4"
        }
    )
    assert bdc_res.status_code == 201

    # 5. Create F&I application
    fi_res = client.post(
        "/api/fi/",
        headers=headers,
        json={
            "entidad_financiera": "Forum",
            "monto_solicitado": 12000000,
            "id_vehiculo": vehicle_id
        }
    )
    assert fi_res.status_code == 201

    # 6. Verify Dashboard Metrics
    m_res = client.get("/api/dashboard/metrics", headers=headers)
    assert m_res.status_code == 200
    metrics = m_res.json()
    assert metrics["total_vehiculos_stock"] == 1
    assert metrics["total_leads_activos"] == 1

def test_appointments_flow():
    # Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": "vendedor1@origen.cl", "password": "Vendedor123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create appointment
    create_res = client.post(
        "/api/appointments/",
        headers=headers,
        json={
            "titulo": "Test Drive Suzuki Swift",
            "tipo": "TEST_DRIVE",
            "fecha_inicio": "2026-07-26T10:00:00",
            "fecha_fin": "2026-07-26T11:00:00",
            "notas": "Ruta autopista"
        }
    )
    assert create_res.status_code == 201
    app_id = create_res.json()["id"]

    # List appointments
    get_res = client.get("/api/appointments/", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) >= 1

    # Update status to COMPLETADA
    patch_res = client.patch(
        f"/api/appointments/{app_id}/status",
        headers=headers,
        json={"estado": "COMPLETADA"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["estado"] == "COMPLETADA"

def test_decode_patent_flow():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "vendedor1@origen.cl", "password": "Vendedor123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test preset patent decoding
    res_kjpw = client.get("/api/vehicles/decode/KJPW99", headers=headers)
    assert res_kjpw.status_code == 200
    data = res_kjpw.json()
    assert data["marca"] == "Nissan"
    assert data["modelo"] == "Kicks"
    assert "historial_legal" in data

    # Test dynamic fallback patent decoding
    res_dyn = client.get("/api/vehicles/decode/RSTU77", headers=headers)
    assert res_dyn.status_code == 200
    assert res_dyn.json()["patente"] == "RSTU77"

def test_consignments_flow():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@origen.cl", "password": "Admin123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create vehicle for consignment
    v_res = client.post(
        "/api/vehicles/",
        headers=headers,
        json={
            "patente": "CONS88",
            "marca": "Mazda",
            "modelo": "CX-5",
            "año": 2022,
            "kilometraje": 30000,
            "precio_compra_tasacion": 13000000,
            "precio_venta_publico": 15990000,
            "estado": "DISPONIBLE"
        }
    )
    assert v_res.status_code == 201
    vehicle_id = v_res.json()["id"]

    # Get consignments list
    list_res = client.get("/api/consignments/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get consignment summary for vehicle
    summary_res = client.get(f"/api/consignments/{vehicle_id}/summary", headers=headers)
    assert summary_res.status_code == 200
    s_data = summary_res.json()
    assert s_data["financiero"]["precio_publico"] == 15990000
    assert "linea_tiempo_estado" in s_data

def test_commissions_flow():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@origen.cl", "password": "Admin123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get commissions summary
    comm_res = client.get("/api/commissions/summary", headers=headers)
    assert comm_res.status_code == 200
    c_data = comm_res.json()
    assert isinstance(c_data, list)
    assert len(c_data) >= 1

    # Update commission status
    seller_id = c_data[0]["vendedor_id"]
    patch_res = client.patch(
        f"/api/commissions/{seller_id}/status?estado_nuevo=PAGADA",
        headers=headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["estado_liquidacion"] == "PAGADA"

def test_public_storefront_cms_flow():
    # 1. Login as Admin
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@origen.cl", "password": "Admin123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get and update CMS config
    cms_get = client.get("/api/cms/config", headers=headers)
    assert cms_get.status_code == 200

    cms_patch = client.patch(
        "/api/cms/config",
        headers=headers,
        json={
            "slogan": "La mejor automotora de Las Condes",
            "color_primario": "#0284c7",
            "whatsapp_contacto": "+56912345678"
        }
    )
    assert cms_patch.status_code == 200
    assert cms_patch.json()["slogan"] == "La mejor automotora de Las Condes"

    # 3. Create vehicle & publish to web
    v_res = client.post(
        "/api/vehicles/",
        headers=headers,
        json={
            "patente": "WEB999",
            "marca": "Subaru",
            "modelo": "Outback",
            "año": 2023,
            "kilometraje": 12000,
            "precio_compra_tasacion": 18000000,
            "precio_venta_publico": 22490000,
            "estado": "DISPONIBLE"
        }
    )
    assert v_res.status_code == 201
    vehicle_id = v_res.json()["id"]

    pub_res = client.patch(
        f"/api/vehicles/{vehicle_id}/web-publish",
        headers=headers,
        json={"publicado_web": True, "destacado_web": True, "precio_oferta_web": 21990000}
    )
    assert pub_res.status_code == 200
    assert pub_res.json()["publicado_web"] is True

    # 4. Access public endpoints without token
    pub_cfg = client.get("/api/public/tenant_origen/config")
    assert pub_cfg.status_code == 200
    assert pub_cfg.json()["slogan"] == "La mejor automotora de Las Condes"

    pub_veh_list = client.get("/api/public/tenant_origen/vehicles")
    assert pub_veh_list.status_code == 200
    veh_list = pub_veh_list.json()
    assert len(veh_list) >= 1
    assert veh_list[0]["marca"] == "Subaru"

    pub_veh_det = client.get(f"/api/public/tenant_origen/vehicles/{vehicle_id}")
    assert pub_veh_det.status_code == 200
    assert pub_veh_det.json()["web_view_count"] == 1

    # 5. Submit public web lead
    lead_sub = client.post(
        "/api/public/tenant_origen/leads",
        json={
            "nombre_completo": "Juan Perez Web",
            "telefono": "+56988776655",
            "email": "juan.web@gmail.com",
            "mensaje": "Quiero cotizar este Subaru",
            "id_vehiculo_interes": vehicle_id
        }
    )
    assert lead_sub.status_code == 201
    assert lead_sub.json()["success"] is True






