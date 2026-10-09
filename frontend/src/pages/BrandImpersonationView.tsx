import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { ScanResponse } from '../types';

interface BrandImpersonationViewProps {
  currentScan: ScanResponse | null;
  onScanUrl: (url: string) => void;
}

export const BrandImpersonationView: React.FC<BrandImpersonationViewProps> = ({ currentScan }) => {
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
        <h1 className="text-lg font-black text-slate-900 font-mono uppercase flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-cyan-600" />
          <span>Brand Impersonation & Typosquatting Radar</span>
        </h1>
        <p className="text-xs text-slate-500">
          Algorithmic detection of homoglyphs, leetspeak character substitutions, and deceptive domain squatting
        </p>
      </div>

      {/* Active Scan Brand Impersonation Card */}
      {currentScan?.brand_match ? (
        <div className="bg-red-50 border border-red-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>ACTIVE IMPERSONATION DETECTED ON TARGET</span>
            </span>
            <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2.5 py-0.5 rounded font-bold">
              CONFIDENCE: {currentScan.brand_match.confidence}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono mb-4">
            <div className="bg-white p-3 rounded-lg border border-red-200">
              <span className="text-slate-500 text-[10px] uppercase">Target Brand:</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{currentScan.brand_match.brand_name}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-red-200">
              <span className="text-slate-500 text-[10px] uppercase">Legitimate Domain:</span>
              <div className="text-base font-bold text-emerald-700 mt-0.5">{currentScan.brand_match.legitimate_domain}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-red-200">
              <span className="text-slate-500 text-[10px] uppercase">Actual Registrable Domain:</span>
              <div className="text-base font-bold text-red-600 mt-0.5">{currentScan.brand_match.actual_domain}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono bg-white p-3 rounded-lg border border-red-200">
            <div>
              <span className="text-slate-500">Similarity Metric: </span>
              <span className="text-cyan-700 font-bold">{Math.round(currentScan.brand_match.similarity_score * 100)}% Match</span>
            </div>
            <div>
              <span className="text-slate-500">Substitution Technique: </span>
              <span className="text-slate-900 font-semibold">{currentScan.brand_match.substitution_technique || 'None recorded'}</span>
            </div>
            <div>
              <span className="text-slate-500">Forensic Evidence: </span>
              <span className="text-slate-800">{currentScan.brand_match.evidence}</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Methodological Limitation: </span>
              {currentScan.brand_match.limitations}
            </div>
          </div>
        </div>
      ) : currentScan ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-mono">
            <span className="text-emerald-800 font-bold">No High-Confidence Brand Impersonation Detected: </span>
            <span className="text-slate-700">
              Target domain '{currentScan.url_components.registrable_domain}' does not exhibit homoglyphs or keywords matching monitored high-value brands.
            </span>
          </div>
        </div>
      ) : null}

      {/* Monitored Brand Catalog */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Monitored Enterprise Brands ({brands.length} Tier-1 Targets)
            </h2>
            <p className="text-[11px] text-slate-500">
              Continuously guarded against character swaps, punycode lookalikes, and subdomain spoofing
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brands..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBrands.map((b) => (
            <div key={b.brand} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{b.brand}</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  {b.canonical_domain}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                <span>Guard Keywords: </span>
                <span className="text-slate-700">{b.monitored_keywords.slice(0, 4).join(', ')}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
