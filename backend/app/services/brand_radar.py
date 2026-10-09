import re
from typing import Optional, Tuple
from app.models.schemas import BrandMatch, Finding, SeverityLevel

# Extensible registry of monitored high-value target brands and their canonical domains
KNOWN_BRANDS = {
    "paypal": {"canonical_domain": "paypal.com", "keywords": ["paypal", "paypa1", "pay-pal", "paypall", "paypaI"]},
    "microsoft": {"canonical_domain": "microsoft.com", "keywords": ["microsoft", "micros0ft", "micro-soft", "msft", "live", "office365", "outlook"]},
    "google": {"canonical_domain": "google.com", "keywords": ["google", "g00gle", "goog1e", "gmail", "googl"]},
    "apple": {"canonical_domain": "apple.com", "keywords": ["apple", "app1e", "icloud", "appleid", "itunes"]},
    "amazon": {"canonical_domain": "amazon.com", "keywords": ["amazon", "amaz0n", "amzn", "prime-video"]},
    "netflix": {"canonical_domain": "netflix.com", "keywords": ["netflix", "netf1ix", "net-flix"]},
    "chase": {"canonical_domain": "chase.com", "keywords": ["chase", "chase-bank", "chasebank"]},
    "bankofamerica": {"canonical_domain": "bankofamerica.com", "keywords": ["bankofamerica", "bofa", "bank-of-america"]},
    "facebook": {"canonical_domain": "facebook.com", "keywords": ["facebook", "faceb00k", "fb", "meta", "instagram"]},
    "steam": {"canonical_domain": "steampowered.com", "keywords": ["steam", "steampowered", "steamcommunity", "steamc0mmunity"]},
    "binance": {"canonical_domain": "binance.com", "keywords": ["binance", "binanace", "binance-us"]},
    "coinbase": {"canonical_domain": "coinbase.com", "keywords": ["coinbase", "c0inbase", "coin-base"]},
    "dhl": {"canonical_domain": "dhl.com", "keywords": ["dhl", "dhl-tracking", "dhl-express"]},
    "fedex": {"canonical_domain": "fedex.com", "keywords": ["fedex", "fed-ex", "fedexpress"]},
}

# Common leetspeak & homoglyph character substitutions
SUBSTITUTION_TABLE = {
    '1': 'l', 'i': 'l', 'l': 'i',
    '0': 'o',
    '3': 'e',
    '4': 'a', '@': 'a',
    '5': 's', '$': 's',
    '8': 'b',
    'vv': 'w',
}

def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute standard Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def normalize_substitutions(text: str) -> Tuple[str, list[str]]:
    """Normalize common leet-speak substitutions and track techniques."""
    normalized = text.lower()
    techniques = []
    
    if "vv" in normalized:
        normalized = normalized.replace("vv", "w")
        techniques.append("Double 'v' for 'w' substitution")
        
    for char, target in SUBSTITUTION_TABLE.items():
        if char in normalized:
            normalized = normalized.replace(char, target)
            techniques.append(f"Character substitution '{char}' -> '{target}'")
            
    return normalized, list(set(techniques))

def detect_brand_impersonation(registrable_domain: str, hostname: str, full_url: str) -> Tuple[Optional[BrandMatch], list[Finding]]:
    """
    Detect brand impersonation or typosquatting targeting known brands.
    """
    findings: list[Finding] = []
    clean_domain = registrable_domain.lower()
    clean_host = hostname.lower()
    clean_full = full_url.lower()

    # Split domain into label without TLD
    domain_label = clean_domain.split(".")[0] if "." in clean_domain else clean_domain

    best_match: Optional[BrandMatch] = None
    highest_similarity = 0.0

    for brand_key, brand_info in KNOWN_BRANDS.items():
        canonical = brand_info["canonical_domain"]
        canonical_label = canonical.split(".")[0]

        # If it is the legitimate canonical domain, it's not impersonating
        if clean_domain == canonical or clean_domain.endswith(f".{canonical}"):
            continue

        # Check 1: Brand appears in subdomain or path on an unrelated root domain
        if brand_key in clean_host or brand_key in clean_full:
            if clean_domain != canonical:
                match = BrandMatch(
                    brand_name=brand_key.capitalize(),
                    claimed=True,
                    actual_domain=clean_domain,
                    legitimate_domain=canonical,
                    similarity_score=0.95,
                    substitution_technique="Brand string on external registrable domain",
                    confidence="HIGH",
                    evidence=f"Brand '{brand_key}' appears in URL/host, but registrable domain is '{clean_domain}' (expected '{canonical}')",
                    limitations="Brand name could legitimately appear in third-party partnership or news context; heuristic signal only."
                )
                findings.append(Finding(
                    detector_id="DET-BRAND-IMPERSON-01",
                    name=f"Brand Impersonation Signal: {brand_key.capitalize()}",
                    severity=SeverityLevel.HIGH,
                    evidence=match.evidence,
                    rationale="Legitimate brand services operate under their verified authoritative domains. Hostname or path inclusion on unrelated domains strongly correlates with credential phishing.",
                    recommended_action="Do not authenticate or share sensitive payment/account data on this domain.",
                    source_type="HEURISTIC_RULE",
                    weight=4.5
                ))
                return match, findings

        # Check 2: Leet-speak and character substitution in the registrable domain
        normalized_label, techniques = normalize_substitutions(domain_label)
        has_keyword = any(kw in clean_domain for kw in brand_info["keywords"])
        if (canonical_label in normalized_label or has_keyword) and clean_domain != canonical:
            tech_desc = ", ".join(techniques) if techniques else f"Brand keyword inclusion '{brand_key}' in domain"
            match = BrandMatch(
                brand_name=brand_key.capitalize(),
                claimed=True,
                actual_domain=clean_domain,
                legitimate_domain=canonical,
                similarity_score=0.96,
                substitution_technique=tech_desc,
                confidence="CONFIRMED" if techniques else "HIGH",
                evidence=f"Domain '{clean_domain}' contains brand identity pattern for '{brand_key.capitalize()}' (expected '{canonical}').",
                limitations="Brand keyword detection; evaluate in context of page intent."
            )
            findings.append(Finding(
                detector_id="DET-BRAND-HOMOGLYPH-01" if techniques else "DET-BRAND-KEYWORD-01",
                name=f"Deceptive Brand Spoofing of {brand_key.capitalize()}",
                severity=SeverityLevel.CRITICAL if techniques else SeverityLevel.HIGH,
                evidence=match.evidence,
                rationale="Attackers register domains with brand strings and character swaps specifically to mislead victims during login attempts.",
                recommended_action=f"Treat as potential brand spoofing campaign against {brand_key.capitalize()}. Block domain at perimeter resolver.",
                source_type="DIRECT_OBSERVATION" if techniques else "HEURISTIC_RULE",
                weight=5.5
            ))
            return match, findings

        # Check 3: Levenshtein distance typosquatting (1 or 2 edits away)
        dist = levenshtein_distance(domain_label, canonical_label)
        max_len = max(len(domain_label), len(canonical_label))
        sim = 1.0 - (dist / max_len) if max_len > 0 else 0.0

        if dist in (1, 2) and len(canonical_label) >= 4 and sim > 0.70:
            if sim > highest_similarity:
                highest_similarity = sim
                best_match = BrandMatch(
                    brand_name=brand_key.capitalize(),
                    claimed=False,
                    actual_domain=clean_domain,
                    legitimate_domain=canonical,
                    similarity_score=round(sim, 2),
                    substitution_technique=f"Levenshtein edit distance of {dist}",
                    confidence="MEDIUM",
                    evidence=f"Domain label '{domain_label}' is {dist} character edit(s) away from '{canonical_label}' (Similarity: {round(sim * 100)}%)",
                    limitations="Short or common words might coincidently share edit distance; evaluate together with page structure."
                )

    if best_match:
        findings.append(Finding(
            detector_id="DET-BRAND-TYPO-01",
            name=f"Potential Typosquatting of {best_match.brand_name} (Distance {best_match.substitution_technique})",
            severity=SeverityLevel.HIGH,
            evidence=best_match.evidence,
            rationale=f"Domain closely mimics '{best_match.legitimate_domain}'. Typosquatting relies on user typographical error or deceptive links.",
            recommended_action=f"Verify intention before accessing. Official destination is {best_match.legitimate_domain}.",
            source_type="HEURISTIC_RULE",
            weight=4.0
        ))
        return best_match, findings

    return None, findings
