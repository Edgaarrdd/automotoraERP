from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed import seed_database
from .routers import auth, vehicles, leads, quotes, dashboard, fi, bdc, security, appointments

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CRM Automotora ERP API",
    description="API REST centralizada para gestión de inventario, pipeline de ventas, cotizaciones y financiamiento para automotoras.",
    version="1.0.0"
)

# CORS Middleware setup
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(leads.router)
app.include_router(quotes.router)
app.include_router(dashboard.router)
app.include_router(fi.router)
app.include_router(bdc.router)
app.include_router(security.router)
app.include_router(appointments.router)

@app.on_event("startup")
def startup_event():
    seed_database()

@app.get("/")
def root():
    return {
        "message": "Bienvenido al Backend API de CRM Automotora ERP",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
