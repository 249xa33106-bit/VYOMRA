import React, { useEffect, useState } from 'react';
import { History, Search, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ScanSummary } from '../types';

interface ScanHistoryViewProps {
  onSelectScan: (scanId: string) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({ onSelectScan }) => {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadScans = async () => {
    setIsLoading(true);
    try {
      const data = await api.listScans(search, categoryFilter === 'ALL' ? undefined : categoryFilter);
      setScans(data.scans);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, [categoryFilter]);

  const handleDelete = async (e: React.MouseEvent, scanId: string) => {
    e.stopPropagation();
    if (!confirm(`Permanently delete scan ${scanId} under Data Minimization policy?`)) return;
    try {
      await api.deleteScan(scanId);
      setScans(prev => prev.filter(s => s.scan_id !== scanId));
    } catch (e) {
      alert('Failed to delete scan record');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-white font-mono uppercase flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Digital Evidence Vault — Scan History</span>
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically hashed historical records stored locally with data minimization controls
          </p>
        </div>

        <button
          onClick={loadScans}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadScans()}
            placeholder="Search by URL or domain keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'MALICIOUS', 'HIGH_RISK', 'SUSPICIOUS', 'BENIGN'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                categoryFilter === cat
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1526] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0a1220] text-slate-400 text-[10px] uppercase">
                <th className="p-3.5">Scan ID</th>
                <th className="p-3.5">Normalized Target</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Findings</th>
                <th className="p-3.5">SHA-256 Vault Hash</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading historical scan records...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No scan records found.
                  </td>
                </tr>
              ) : (
                scans.map((s) => (
                  <tr 
                    key={s.scan_id} 
                    onClick={() => onSelectScan(s.scan_id)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 text-cyan-400 font-bold">{s.scan_id}</td>
                    <td className="p-3.5 text-slate-200 truncate max-w-xs">{s.normalized_url}</td>
                    <td className="p-3.5 font-bold">
                      <span className={
                        s.risk_score >= 65 ? 'text-red-400' :
                        s.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                      }>
                        {s.risk_score}/100
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-300">
                        {s.risk_category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{s.findings_count} signals</td>
                    <td className="p-3.5 text-slate-400 text-[10px] truncate max-w-[140px]">
                      {s.report_hash}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={(e) => handleDelete(e, s.scan_id)}
                        className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                        title="Delete scan (Data Minimization)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
