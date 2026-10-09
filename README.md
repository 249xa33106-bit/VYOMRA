# PHANTOM X — Autonomous Threat Investigation & Predictive Phishing Defense

[![Defense Ready](https://img.shields.io/badge/Status-Hackathon--Ready-06b6d4?style=for-the-badge)](http://localhost:8000)
[![Engine Version](https://img.shields.io/badge/Engine-v1.4.2--deterministic-8b5cf6?style=for-the-badge)](http://localhost:8000)
[![SSRF Guard](https://img.shields.io/badge/SSRF--Shield-RFC1918%20%2B%20IMDS-10b981?style=for-the-badge)](http://localhost:8000)

**PHANTOM X** is a full-stack, enterprise-grade cybersecurity command center engineered for autonomous URL threat investigation, homoglyph brand impersonation detection, SSRF-shielded redirect analysis, explainable multi-signal risk scoring, and interactive attack relationship graph synthesis.

---

## 🛡️ Key Platform Capabilities

### 1. Multi-Layer Forensics Engine
- **Safe Input Sanitization & Normalization:** Handles schemes, subdomains, ports, and authorities. Automatically redacts sensitive authentication parameters (`password`, `token`, `api_key`, `session_id`) from logs and reports.
- **Punycode & IDN Confusables:** Detects Cyrillic, Greek, and Unicode lookalike homoglyphs (e.g., Cyrillic `а` vs Latin `a`).
- **Domain Identity via PSL:** Leverages the Public Suffix List to derive true registrable domains rather than simplistic two-label splits.
- **Syntactic Anomaly Detections:** Identifies embedded authority credentials, raw IP hosts, non-standard egress ports, excessive subdomain depth, and direct executable payload formats (`.exe`, `.scr`, `.bat`, `.iso`, etc.).

### 2. Brand Impersonation Radar
- Monitors high-value tier-1 targets (PayPal, Microsoft, Google, Apple, Amazon, Chase, Bank of America, Binance, etc.).
- Detects character substitutions (`paypa1`), leetspeak variations, and keyword brand affixations on third-party domains.
- Computes Levenshtein edit distance and structural similarity metrics.

### 3. SSRF-Guarded Redirect Analysis ("Time Machine")
- Validates every hop against private RFC1918 address space, loopback (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16`), cloud metadata endpoints (`169.254.169.254`, `fd00:ec2::254`), and multicast ranges.
- Enforces DNS rebinding defense, hop quotas, connection timeouts, and protocol restrictions.

### 4. Explainable Multi-Signal Risk Engine
- Deterministic, versioned, transparent scoring model (0–100) calibrated across standard severity matrices.
- Distinguishes observed syntactic evidence, external reputation signals, heuristic suspicions, and uncalibrated assumptions.
- Explicitly flags when threat intelligence feeds are `UNAVAILABLE` rather than misleadingly assuming safety.

### 5. Zero-Hour Suspicion Engine
- Identifies unlisted, freshly provisioned infrastructure exhibiting high structural anomaly density and brand imitation even before global blocklists register matches.

### 6. Interactive Attack DNA Graph
- Genuine interactive graph powered by React Flow (`@xyflow/react`).
- Typed nodes (`SUBMITTED_URL`, `REGISTRABLE_DOMAIN`, `INFRASTRUCTURE_IP`, `BRAND_IDENTITY`, `REDIRECT_HOP`, `THREAT_INTEL`).
- Click any node to open the live evidence dossier.

### 7. AI Attack Story Generator
- Synthesizes observed forensic evidence into an executive incident narrative, detailing suspected attack categories, blast radius, defensive countermeasures, and investigation unknowns.
- Built-in deterministic expert-system fallback ensuring reliable offline demos immune to prompt injection.

### 8. What-If Defense Simulator
- Isolated hypothesis sandbox allowing analysts to toggle hypothetical signals (brand mismatch, credential forms, zero-day feeds) and watch illustrative risk re-calibrate in real time.
- Strictly isolated and tagged as `SIMULATION`.

### 9. Digital Evidence Vault
- Persists scan history locally in SQLite (WAL mode).
- Computes canonical SHA-256 integrity hashes for every investigation dossier.
- Provides 1-click export of structured JSON and human-readable Markdown reports.

---

## 🚀 Quick Start & Hackathon Walkthrough

### Option A: 1-Click Launch (Recommended)
Double-click `start.bat` in the project root, or execute:
```powershell
python run.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

The full React frontend and FastAPI backend run concurrently on `http://localhost:8000`.

### Option B: Development Mode (Vite Hot-Reload)
**Terminal 1 (Backend):**
```powershell
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)**.

---

## 🎯 5-Minute Evaluation Guide for Hackathon Judges

1. **Launch Investigation Dashboard:**
   - Navigate to the **URL Investigation** console (default screen).
   - Click the preset button: `PayPal Leetspeak Typosquatting` (`http://paypa1-security-verification.com/login`).
   - Click **Investigate URL**.
2. **Observe Multi-Layer Detection:**
   - Notice the calibrated **Risk Score** and **HIGH CONFIDENCE** rating.
   - Inspect the **Brand Impersonation Radar** flag detecting character substitution `'1' -> 'l'` targeting PayPal.
   - Read the **AI Incident Explanation** describing the attack vector and recommended SOC actions.
3. **Explore Attack DNA Graph:**
   - Switch to the **Attack DNA Graph** tab or inspect the embedded graph.
   - Click on the `REGISTRABLE_DOMAIN` or `BRAND_IDENTITY` node to reveal the **Evidence Dossier**.
4. **Test Zero-Hour & SSRF Defense:**
   - Enter `http://198.51.100.42:8080/stage/payload.exe` to observe direct IP host and binary executable warnings.
   - Enter an internal destination like `http://169.254.169.254/latest/meta-data` to witness immediate SSRF policy enforcement.
5. **Interactive What-If Simulator:**
   - Click **What-If Simulator** in the sidebar.
   - Toggle signals like `Brand Impersonation`, `Insecure Password Form`, and `Confirmed Threat Intel`.
   - Observe real-time illustrative risk recalculation and notice clear `SIMULATION` tagging.
6. **Integrity Dossier & Export:**
   - Click **Reports & Vault** to view the Markdown report and verify the SHA-256 cryptographic digest.

---

## ⚙️ Environment Configuration

Configuration is managed via `.env` in the backend root:
```ini
APP_ENV=development
API_PORT=8000
API_HOST=127.0.0.1

# Optional Threat Intel Keys (Gracefully reported as UNAVAILABLE if omitted)
GOOGLE_SAFE_BROWSING_API_KEY=
VIRUSTOTAL_API_KEY=

# Optional AI Story Keys (Deterministic expert template used if omitted)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Safety & Isolation Controls
ALLOW_ACTIVE_REDIRECT_FETCHING=true
REDIRECT_TIMEOUT_SECONDS=4.0
MAX_REDIRECT_HOPS=5
MAX_RESPONSE_BYTES=1048576

# Persistence
DATABASE_URL=sqlite:///./phantom_x.db
```

---

## 🧪 Automated Testing

Run the automated test suite covering unit forensics, SSRF blockers, and REST API integration:
```powershell
$env:PYTHONPATH = "backend"
python -m pytest backend/tests -v
```
All 10 unit and security tests run in <1 second with zero external dependencies.

---

## 🔒 Security & Limitations Notice
- **Non-Destructive Scanning:** PHANTOM X conducts passive syntactic forensics and safe SSRF-isolated HTTP inquiries. It never attempts unauthorized credential submission, form posting, or exploit execution.
- **Data Minimization:** Scan records can be permanently deleted via the Evidence Vault interface.
- **Report Integrity:** The SHA-256 digest guarantees document tamper-resistance; it does not serve as an asymmetric public key signature.
