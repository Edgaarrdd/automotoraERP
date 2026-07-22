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
