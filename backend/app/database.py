import sqlite3
import json
import logging
from typing import Optional, Any
from pathlib import Path

logger = logging.getLogger("phantom_x.database")

DB_PATH = Path(__file__).resolve().parent.parent / "phantom_x.db"

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    """Initialize the SQLite database schema if not already present."""
    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                scan_id TEXT PRIMARY KEY,
                submitted_url TEXT NOT NULL,
                normalized_url TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                risk_category TEXT NOT NULL,
                evidence_confidence TEXT NOT NULL,
                findings_count INTEGER NOT NULL,
                report_hash TEXT NOT NULL,
                scan_data TEXT NOT NULL
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp DESC)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_scans_risk ON scans(risk_score DESC)")
        conn.commit()
    logger.info("PHANTOM X database initialized at %s", DB_PATH)

# Ensure database tables exist automatically
init_db()

class ScanRepository:
    """Repository pattern for scan persistence and retrieval."""
    
    @staticmethod
    def save_scan(scan_data: dict[str, Any]) -> str:
        scan_id = scan_data["scan_id"]
        submitted_url = scan_data["url_components"]["submitted_url"]
        normalized_url = scan_data["url_components"]["normalized_url"]
        timestamp = scan_data["timestamp"]
        risk_score = scan_data["risk"]["score"]
        risk_category = scan_data["risk"]["category"]
        confidence = scan_data["risk"]["confidence"]
        findings_count = len(scan_data.get("findings", []))
        report_hash = scan_data.get("report_hash", "")
        serialized_json = json.dumps(scan_data)

        with get_db_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO scans (
                    scan_id, submitted_url, normalized_url, timestamp,
                    risk_score, risk_category, evidence_confidence,
                    findings_count, report_hash, scan_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scan_id, submitted_url, normalized_url, timestamp,
                risk_score, risk_category, confidence,
                findings_count, report_hash, serialized_json
            ))
            conn.commit()
        return scan_id

    @staticmethod
    def get_scan(scan_id: str) -> Optional[dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT scan_data FROM scans WHERE scan_id = ?", (scan_id,))
            row = cursor.fetchone()
            if row:
                return json.loads(row["scan_data"])
        return None

    @staticmethod
    def list_scans(limit: int = 50, offset: int = 0, search: Optional[str] = None, risk_category: Optional[str] = None) -> list[dict[str, Any]]:
        query = "SELECT scan_id, submitted_url, normalized_url, timestamp, risk_score, risk_category, findings_count, report_hash FROM scans"
        params: list[Any] = []
        conditions: list[str] = []

        if search:
            conditions.append("(submitted_url LIKE ? OR normalized_url LIKE ?)")
            params.extend([f"%{search}%", f"%{search}%"])
        if risk_category and risk_category.upper() != "ALL":
            conditions.append("risk_category = ?")
            params.append(risk_category.upper())

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def delete_scan(scan_id: str) -> bool:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM scans WHERE scan_id = ?", (scan_id,))
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def get_statistics() -> dict[str, Any]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) AS total FROM scans")
            total = cursor.fetchone()["total"]

            cursor.execute("SELECT COUNT(*) AS high_risk FROM scans WHERE risk_score >= 65")
            high_risk = cursor.fetchone()["high_risk"]

            cursor.execute("""
                SELECT risk_category, COUNT(*) AS count 
                FROM scans 
                GROUP BY risk_category
            """)
            categories = {row["risk_category"]: row["count"] for row in cursor.fetchall()}

            cursor.execute("""
                SELECT substr(timestamp, 1, 10) AS day, COUNT(*) AS count
                FROM scans
                GROUP BY day
                ORDER BY day DESC
                LIMIT 7
            """)
            trends = [{"date": row["day"], "scans": row["count"]} for row in cursor.fetchall()]

            return {
                "total_scans": total,
                "high_risk_scans": high_risk,
                "benign_scans": categories.get("BENIGN", 0),
                "suspicious_scans": categories.get("SUSPICIOUS", 0),
                "malicious_scans": categories.get("MALICIOUS", 0),
                "categories": categories,
                "trends": list(reversed(trends))
            }
