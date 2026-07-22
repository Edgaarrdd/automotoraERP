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
    # Run seed in test db
    db = TestingSessionLocal()
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
        json={"email": "admin@automotoralascondes.cl", "password": "Admin123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@automotoralascondes.cl"

def test_vehicles_list():
    # Login first
    login_res = client.post(
        "/api/auth/login",
        json={"email": "gerente@automotoralascondes.cl", "password": "Gerente123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/vehicles/", headers=headers)
    assert res.status_code == 200
    vehicles = res.json()
    assert len(vehicles) >= 4
    patentes = [v["patente"] for v in vehicles]
    assert "PXYZ88" in patentes

def test_dashboard_metrics():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "gerente@automotoralascondes.cl", "password": "Gerente123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/dashboard/metrics", headers=headers)
    assert res.status_code == 200
    metrics = res.json()
    assert metrics["total_vehiculos_stock"] >= 4
    assert metrics["vehiculos_disponibles"] >= 2
