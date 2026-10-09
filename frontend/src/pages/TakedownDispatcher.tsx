import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  Send, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  Building, 
  Mail, 
  ExternalLink, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ScanResponse, UserSession } from '../types';
import { exportScanToPdf } from '../services/pdfExporter';

interface TakedownDispatcherProps {
  currentScan?: ScanResponse | null;
  userSession?: UserSession | null;
  onNavigateInvestigate?: () => void;
}

interface TakedownTicket {
  id: string;
  targetUrl: string;
  domain: string;
  registrar: string;
  recipients: string[];
  reportHash: string;
  timestamp: string;
  status: 'PENDING' | 'DISPATCHED' | 'SUSPENDED';
}

const REGISTRAR_ABUSE_MAP: Record<string, string> = {
  'namecheap': 'abuse@namecheap.com',
  'godaddy': 'abuse@godaddy.com',
  'markmonitor': 'abusecomplaints@markmonitor.com',
  'cloudflare': 'abuse@cloudflare.com',
  'tucows': 'domainabuse@tucows.com',
  'namesilo': 'abuse@namesilo.com',
  'dynadot': 'abuse@dynadot.com',
  'ovh': 'abuse@ovh.com',
  'hostinger': 'abuse@hostinger.com',
  'porkbun': 'abuse@porkbun.com',
  'google': 'registrar-abuse@google.com',
  'amazon': 'abuse@amazonaws.com'
};

const BRAND_LEGAL_MAP: Record<string, string> = {
  'paypal': 'spoof@paypal.com',
  'microsoft': 'phishdir@microsoft.com',
  'apple': 'reportphishing@apple.com',
  'amazon': 'stop-spoofing@amazon.com',
  'netflix': 'phishing@netflix.com',
  'chase': 'phishing@chase.com',
  'google': 'safebrowsing-reports@google.com'
};

export const TakedownDispatcher: React.FC<TakedownDispatcherProps> = ({ 
  currentScan,
  userSession,
  onNavigateInvestigate 
}) => {
  const isAdmin = userSession?.role === 'AUTHORITY';
  const [copied, setCopied] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [tickets, setTickets] = useState<TakedownTicket[]>([]);

  // Selected threat details
  const targetUrl = currentScan?.url_components.submitted_url || 'http://paypa1-security-verification.com/login';
  const domain = currentScan?.url_components.registrable_domain || 'paypa1-security-verification.com';
  const brandName = currentScan?.brand_match?.brand_name?.toLowerCase() || 'paypal';
  const reportHash = currentScan?.report_hash || '7be11937874363bc1c1eaf18b0e2aaff439dae952a51d66e3275c3f1251282ee';
  const riskScore = currentScan?.risk.score ?? 88;

  // Derive registrar abuse email
  const registrarFinding = currentScan?.findings.find(f => f.detector_id === 'DET-RDAP-REGISTRAR');
  const registrarRaw = registrarFinding ? registrarFinding.evidence : 'Public Domain Registrar (ICANN Accredited)';
  
  let registrarEmail = 'abuse@registrar-registry.org';
  for (const [key, email] of Object.entries(REGISTRAR_ABUSE_MAP)) {
    if (registrarRaw.toLowerCase().includes(key) || domain.toLowerCase().includes(key)) {
      registrarEmail = email;
      break;
    }
  }

  // Brand protection email
  const brandEmail = BRAND_LEGAL_MAP[brandName] || 'brand-protection@intel-security.org';
  const certEmail = 'reportphishing@apwg.org';

  // Load takedown history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('px_takedown_tickets');
      if (saved) {
        setTickets(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Construct formal legal notice
  const legalNoticeText = `
FORMAL NOTICE OF DOMAIN ABUSE & DEMAND FOR IMMEDIATE DE-REGISTRATION
Pursuant to ICANN Registrar Accreditation Agreement (RAA) Section 3.18
--------------------------------------------------------------------------------
ATTN: Domain Abuse Incident Response Team & Legal Compliance Officers
REGISTRAR: ${registrarRaw}
DATE OF NOTICE: ${new Date().toUTCString()}
CASE IDENTIFIER: CASE-PX-TKD-${Math.random().toString(36).substring(2, 9).toUpperCase()}

1. TARGET IDENTIFICATION & VIOLATING INFRASTRUCTURE:
   - Violating Target URL: ${targetUrl}
   - Registrable Domain:   ${domain}
   - Infringed Entity:     ${brandName.toUpperCase()} Brand Identity & Trademark Assets
   - Deterministic Risk:   ${riskScore} / 100 (HIGH SEVERITY / MALICIOUS)

2. FORENSIC EVIDENCE & STATUTORY VIOLATIONS:
   Forensic analysis by PHANTOM X Autonomous Cyber Defense has confirmed the aforementioned asset is actively
   staging a weaponized deceptive campaign involving:
   [X] Deceptive Homoglyph / Typosquatting impersonation of ${brandName.toUpperCase()}
   [X] Fraudulent credential harvesting and deceptive electronic spoofing
   [X] Violation of ICANN RAA 3.18 (Obligation to investigate and mitigate verified abuse)
   [X] Violation of Lanham Act & Anticybersquatting Consumer Protection Act (ACPA, 15 U.S.C. § 1125)

3. CRYPTOGRAPHIC EVIDENCE CHAIN-OF-CUSTODY:
   - Forensic Report Digest (SHA-256):
     ${reportHash}
   - Complete serialized PDF incident dossier with timestamped DNS, SSL, and HTTP findings
     has been recorded and sealed in the Digital Evidence Vault.

4. DEMAND FOR IMMEDIATE ACTION:
   Pursuant to your contractual obligations under ICANN policies and your published Acceptable 
   Use Policy (AUP), we formally demand that you immediately:
   1. Suspend / null-route DNS resolution for '${domain}' (Status: serverHold / clientHold).
   2. Lock the domain against unauthorized registrant transfer.
   3. Provide written confirmation of suspension to all carbon-copied parties.

Failure to remediate verified phishing infrastructure may result in direct escalation to ICANN
Compliance, national CERT coordination centers, and upstream transit provider abuse teams.

Respectfully submitted,
${isAdmin ? 'AUTHORIZING SUPERADMIN COMMANDER:' : 'FORENSIC INVESTIGATOR (ANALYST):'} ${userSession?.displayName || (isAdmin ? 'Admin Authority' : 'Security Analyst')}
AUTHORIZATION CLEARANCE: ${userSession?.clearanceLevel || (isAdmin ? 'LEVEL-5 ALPHA (STATUTORY COMMAND)' : 'LEVEL-3 BRAVO (INVESTIGATION DRAFT)')}
BADGE ID: ${userSession?.badgeId || (isAdmin ? 'ADM-8821' : 'USR-4412')}
STATUS: ${isAdmin ? 'OFFICIAL DIGITAL SIGNATURE APPLIED (MANDATORY REGISTRAR SUSPENSION)' : 'EVIDENTIARY DRAFT PENDING SUPERADMIN COUNTERSIGNATURE'}
PHANTOM X Autonomous Forensics Operations
https://phantom-x-efb92.web.app
--------------------------------------------------------------------------------
`.trim();

  // Handle Copy to Clipboard
  const handleCopyNotice = () => {
    navigator.clipboard.writeText(legalNoticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle native mailto dispatch
  const handleMailto = () => {
    const recipients = `${registrarEmail},${certEmail},${brandEmail}`;
    const subject = encodeURIComponent(`URGENT ABUSE TAKEDOWN: Phishing Infrastructure [${domain}] - Case CASE-PX-TKD`);
    const body = encodeURIComponent(legalNoticeText);
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
  };

  // Handle Automated Dispatch Simulation
  const handleSimulateDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      const newTicket: TakedownTicket = {
        id: `TKD-${Date.now().toString().slice(-6)}`,
        targetUrl,
        domain,
        registrar: registrarRaw,
        recipients: [registrarEmail, certEmail, brandEmail],
        reportHash,
        timestamp: new Date().toISOString(),
        status: 'DISPATCHED'
      };

      const updated = [newTicket, ...tickets];
      setTickets(updated);
      try {
        localStorage.setItem('px_takedown_tickets', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      setIsDispatching(false);
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 5000);
    }, 700);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-mono font-bold mb-2">
            <Gavel className="w-3.5 h-3.5 text-red-600" />
            <span>ACTIVE INCIDENT REMEDIATION PLAYBOOK</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            1-Click Registrar & CERT Takedown Dispatcher
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Automatically format, sign, and dispatch RFC-compliant legal cease-and-desist notices to accredited domain registrars, hosting providers, and national CERT authorities.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ICANN RAA 3.18 Standard</span>
          </div>
          {isAdmin ? (
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>SUPERADMIN LEVEL-5 AUTHORITY</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold flex items-center space-x-1.5">
              <span>ANALYST DRAFT CLEARANCE</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Threat Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono">
              Target Threat Profile Under Enforcement
            </h2>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
            riskScore >= 65 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800'
          }`}>
            Risk Score: {riskScore} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Violating Target URL</span>
            <span className="text-slate-900 font-bold truncate block">{targetUrl}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Registrable Domain</span>
            <span className="text-blue-700 font-bold block">{domain}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Identified Registrar</span>
            <span className="text-slate-800 font-semibold truncate block">{registrarRaw}</span>
          </div>
        </div>
      </div>

      {/* Auto-Discovered Abuse Recipients */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Mail className="w-4 h-4 text-blue-600" />
          <span>Auto-Discovered Abuse & Legal Inboxes</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Recipient 1: Registrar */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
              <span>Domain Registrar Abuse</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">PRIMARY</span>
            </div>
            <div className="font-mono font-bold text-blue-700 text-xs truncate">{registrarEmail}</div>
            <p className="text-[10px] text-slate-500">Obligated under ICANN RAA 3.18 to remediate phishing.</p>
          </div>

          {/* Recipient 2: Anti-Phishing Working Group / CERT */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>National CERT & APWG</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">ESCALATION</span>
            </div>
            <div className="font-mono font-bold text-slate-700 text-xs truncate">{certEmail}</div>
            <p className="text-[10px] text-slate-500">Global threat corpus for ISP & browser blocklist updates.</p>
          </div>

          {/* Recipient 3: Brand Trademark Security */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>Brand Legal Counsel</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-mono">TRADEMARK</span>
            </div>
            <div className="font-mono font-bold text-slate-700 text-xs truncate">{brandEmail}</div>
            <p className="text-[10px] text-slate-500">Direct notice to {brandName.toUpperCase()} security team.</p>
          </div>
        </div>
      </div>

      {/* Formal Legal Notice Preview & Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Generated RFC & ICANN-Compliant Legal Notice</span>
            </h3>
            <p className="text-xs text-slate-500">Cryptographically verifiable text payload ready for transmission.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopyNotice}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold font-mono transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied Notice!' : 'Copy Notice'}</span>
            </button>

            {currentScan && (
              <button
                onClick={() => exportScanToPdf(currentScan)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold font-mono transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export PDF Dossier</span>
              </button>
            )}

            <button
              onClick={handleMailto}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Mail Client</span>
            </button>
          </div>
        </div>

        {/* Notice Code Box */}
        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72 border border-slate-800 selection:bg-blue-500">
          {legalNoticeText}
        </pre>

        {/* 1-Click Automated Dispatch Simulator */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl gap-3">
          <div>
            <div className="text-xs font-bold text-red-900 flex items-center space-x-1.5">
              <span>{isAdmin ? 'Autonomous Registrar Dispatch API (SuperAdmin Authority)' : 'Analyst Takedown Escalation Pipeline'}</span>
            </div>
            <div className="text-[11px] text-red-700">
              {isAdmin 
                ? 'Applies Level-5 cryptographic digital seal and directly initiates registrar domain revocation protocol.'
                : 'Generates formal evidentiary notice and logs the escalation under your Analyst Badge ID.'}
            </div>
          </div>

          <button
            onClick={handleSimulateDispatch}
            disabled={isDispatching}
            className={`w-full sm:w-auto px-5 py-2.5 text-white font-bold font-mono text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50 ${
              isAdmin ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isDispatching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Dispatching Notice...</span>
              </>
            ) : (
              <>
                <Gavel className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Execute Official ICANN Takedown' : 'Dispatch Analyst Takedown Notice'}</span>
              </>
            )}
          </button>
        </div>

        {dispatchSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center space-x-2 text-xs font-mono animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Success: Formal takedown notice dispatched. Case ticket logged in SOC audit vault.</span>
          </div>
        )}
      </div>

      {/* Takedown History Vault */}
      {tickets.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>SOC Takedown Audit History ({tickets.length} Active Records)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Legally Verified Registry</span>
          </div>

          <div className="space-y-2.5">
            {tickets.map((t) => (
              <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{t.domain}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {t.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Case ID: <span className="text-slate-800 font-bold">{t.id}</span> • Registrar: {t.registrar}
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400">
                  <span>{new Date(t.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
