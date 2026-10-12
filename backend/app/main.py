from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.routes import router

app = FastAPI(
    title="GitHub Project Health Analyzer API",
    description="Explainable, deterministic repository health evaluation engine powered by GitHub REST API data.",
    version=settings.APP_VERSION
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "GitHub Project Health Analyzer API",
        "version": settings.APP_VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
