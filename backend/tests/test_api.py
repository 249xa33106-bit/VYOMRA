import pytest
import pytest_asyncio
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_api_health():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "HEALTHY"
        assert "providers" in data

@pytest.mark.asyncio
async def test_api_scan_and_report():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Submit scan
        payload = {"url": "http://paypa1-security.com/login", "enable_redirect_following": False}
        resp = await client.post("/api/scans", json=payload)
        assert resp.status_code == 200
        scan = resp.json()
        scan_id = scan["scan_id"]
        assert scan["risk"]["score"] >= 35
        assert scan["risk"]["category"] in ("SUSPICIOUS", "HIGH_RISK", "MALICIOUS")
        assert scan["brand_match"] is not None
        assert scan["brand_match"]["brand_name"] == "Paypal"
        assert len(scan["report_hash"]) == 64

        # Retrieve scan
        get_resp = await client.get(f"/api/scans/{scan_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["scan_id"] == scan_id

        # Retrieve report markdown
        rpt_resp = await client.get(f"/api/scans/{scan_id}/report?format=markdown")
        assert rpt_resp.status_code == 200
        assert "# PHANTOM X" in rpt_resp.text

@pytest.mark.asyncio
async def test_api_simulation():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        sim_payload = {
            "base_url": "http://verify-bank.com",
            "flag_brand_mismatch": True,
            "flag_suspicious_credential_form": True
        }
        resp = await client.post("/api/simulate", json=sim_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_simulation"] is True
        assert data["simulated_score"] >= 65
