import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Search, Info, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { ScanResponse } from '../types';

interface BrandImpersonationViewProps {
  currentScan: ScanResponse | null;
  onScanUrl: (url: string) => void;
}

export const BrandImpersonationView: React.FC<BrandImpersonationViewProps> = ({ currentScan, onScanUrl }) => {
  const [brands, setBrands] = useState<Array<{ brand: string; canonical_domain: string; monitored_keywords: string[] }>>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    api.getMonitoredBrands().then(setBrands).catch(console.error);
  }, []);

  const filteredBrands = brands.filter(b => 
    b.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.canonical_domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg font-black text-white font-mono uppercase flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <span>Brand Impersonation & Typosquatting Radar</span>
        </h1>
        <p className="text-xs text-slate-400">
          Algorithmic detection of homoglyphs, leetspeak character substitutions, and deceptive domain squatting
        </p>
      </div>

      {/* Active Scan Brand Impersonation Card */}
      {currentScan?.brand_match ? (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>ACTIVE IMPERSONATION DETECTED ON TARGET</span>
            </span>
            <span className="text-[10px] font-mono bg-red-900/60 text-red-200 px-2.5 py-0.5 rounded font-bold">
              CONFIDENCE: {currentScan.brand_match.confidence}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono mb-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Target Brand:</span>
              <div className="text-base font-bold text-white mt-0.5">{currentScan.brand_match.brand_name}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Legitimate Domain:</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{currentScan.brand_match.legitimate_domain}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Actual Registrable Domain:</span>
              <div className="text-base font-bold text-red-400 mt-0.5">{currentScan.brand_match.actual_domain}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">Similarity Metric: </span>
              <span className="text-cyan-400 font-bold">{Math.round(currentScan.brand_match.similarity_score * 100)}% Match</span>
            </div>
            <div>
              <span className="text-slate-400">Substitution Technique: </span>
              <span className="text-white">{currentScan.brand_match.substitution_technique || 'None recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400">Forensic Evidence: </span>
              <span className="text-slate-300">{currentScan.brand_match.evidence}</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
              <span className="font-semibold text-slate-300">Methodological Limitation: </span>
              {currentScan.brand_match.limitations}
            </div>
          </div>
        </div>
      ) : currentScan ? (
        <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-mono">
            <span className="text-emerald-400 font-bold">No High-Confidence Brand Impersonation Detected: </span>
            <span className="text-slate-300">
              Target domain '{currentScan.url_components.registrable_domain}' does not exhibit homoglyphs or keywords matching monitored high-value brands.
            </span>
          </div>
        </div>
      ) : null}

      {/* Monitored Brand Catalog */}
      <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Monitored Enterprise Brands ({brands.length} Tier-1 Targets)
            </h2>
            <p className="text-[11px] text-slate-400">
              Continuously guarded against character swaps, punycode lookalikes, and subdomain spoofing
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brands..."
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBrands.map((b) => (
            <div key={b.brand} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{b.brand}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {b.canonical_domain}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                <span>Guard Keywords: </span>
                <span className="text-slate-300">{b.monitored_keywords.slice(0, 4).join(', ')}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
