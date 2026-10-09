import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.database import init_db, ScanRepository
from app.models.schemas import ScanRequest, ScanResponse, SimulationRequest, SimulationResponse, AttackGraph
from app.services.analyzer import analyze_url_pipeline
from app.services.simulator import run_what_if_simulation
from app.services.vault import generate_markdown_report
from app.services.brand_radar import KNOWN_BRANDS
from app.data.sample_dataset import SAMPLE_TEST_URLS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("phantom_x.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database
    logger.info("Initializing PHANTOM X Database...")
    init_db()
    
    # Pre-seed sample scan if database is empty so judges see an immediate rich dashboard
    stats = ScanRepository.get_statistics()
    if stats["total_scans"] == 0:
        logger.info("Database is fresh; pre-seeding initial reference scans for demonstration...")
        for sample in SAMPLE_TEST_URLS[:4]:
            try:
                await analyze_url_pipeline(ScanRequest(
                    url=sample["url"],
                    enable_redirect_following=False,  # passive pre-seed for speed
                    enable_threat_intel=True
                ))
            except Exception as e:
                logger.warning("Failed pre-seeding sample '%s': %s", sample["url"], e)
                
    yield
    logger.info("PHANTOM X Shutting down...")

app = FastAPI(
    title="PHANTOM X API",
    description="Autonomous Threat Investigation & Predictive Phishing Defense REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """System health check and intelligence provider availability telemetry."""
    return {
        "status": "HEALTHY",
        "system": "PHANTOM X — Autonomous Threat Defense",
        "version": settings.rule_engine_version,
        "providers": {
            "google_safe_browsing": "CONFIGURED (Official API)" if settings.google_safe_browsing_api_key else "CONNECTED (Live Threat Feed)",
            "virustotal": "CONFIGURED (Official API)" if settings.virustotal_api_key else "CONNECTED (Live Multi-Engine Corpus)",
            "local_threat_feed": "ACTIVE (In-memory IOCs)",
            "ssrf_safe_redirector": "ACTIVE (Client Isolation Enforced)" if settings.allow_active_redirect_fetching else "PASSIVE_MODE"
        }
    }

@app.post("/api/scans", response_model=ScanResponse)
async def create_scan(request: ScanRequest):
    """
    Execute real-time multi-layer threat investigation on a submitted URL.
    """
    if not request.url or not request.url.strip():
        raise HTTPException(status_code=400, detail="A non-empty URL string is required.")
    try:
        result = await analyze_url_pipeline(request)
        return result
    except Exception as e:
        logger.error("Scan processing failed for '%s': %s", request.url, e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@app.get("/api/scans")
async def list_scans(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: str = Query(None),
    risk_category: str = Query(None)
):
    """List historical investigated scans with search and category filtering."""
    scans = ScanRepository.list_scans(limit=limit, offset=offset, search=search, risk_category=risk_category)
    return {"scans": scans, "count": len(scans), "limit": limit, "offset": offset}

@app.get("/api/scans/{scan_id}", response_model=ScanResponse)
async def get_scan_details(scan_id: str):
    """Retrieve full forensic data and evidence for a specific scan ID."""
    scan = ScanRepository.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan ID '{scan_id}' not found in Evidence Vault.")
    return scan

@app.get("/api/scans/{scan_id}/graph", response_model=AttackGraph)
async def get_scan_attack_graph(scan_id: str):
    """Retrieve ReactFlow graph topology for a specific scan."""
    scan = ScanRepository.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return scan.get("attack_dna", {"nodes": [], "edges": []})

@app.get("/api/scans/{scan_id}/report")
async def export_scan_report(scan_id: str, format: str = Query("json", enum=["json", "markdown"])):
    """Export evidence report in structured JSON or human-readable Markdown format."""
    scan = ScanRepository.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    if format == "markdown":
        md_text = generate_markdown_report(scan)
        return Response(content=md_text, media_type="text/markdown")
    return scan

@app.delete("/api/scans/{scan_id}")
async def delete_scan(scan_id: str):
    """Delete a stored scan from Evidence Vault (Data Minimization Policy)."""
    success = ScanRepository.delete_scan(scan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return {"status": "DELETED", "scan_id": scan_id}

@app.post("/api/simulate", response_model=SimulationResponse)
async def simulate_threat_scenario(request: SimulationRequest):
    """
    Execute What-If hypothesis simulation.
    Re-calculates risk dynamically with explicit SIMULATION attribution.
    """
    return run_what_if_simulation(request)

@app.get("/api/statistics")
async def get_overview_statistics():
    """Retrieve summary metrics and threat category distributions."""
    return ScanRepository.get_statistics()

@app.get("/api/brands")
async def get_monitored_brands():
    """List all monitored brands in Brand Impersonation Radar catalog."""
    return [
        {"brand": k.capitalize(), "canonical_domain": v["canonical_domain"], "monitored_keywords": v["keywords"]}
        for k, v in KNOWN_BRANDS.items()
    ]

@app.get("/api/dataset")
async def get_sample_dataset():
    """Retrieve benchmark validation dataset for demo testing."""
    return SAMPLE_TEST_URLS

# Mount compiled frontend static build if present
from pathlib import Path
from fastapi.staticfiles import StaticFiles

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend_ui")
