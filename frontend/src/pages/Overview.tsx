import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Server, 
  Radar, 
  Layers,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats, ScanSummary } from '../types';
import { api } from '../services/api';

interface OverviewProps {
  onSelectScan: (scanId: string) => void;
  onNavigateInvestigate: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ onSelectScan, onNavigateInvestigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<ScanSummary[]>([]);
  const [healthData, setHealthData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [st, sc, hl] = await Promise.all([
          api.getStatistics(),
          api.listScans(),
          api.getHealth()
        ]);
        setStats(st);
        setRecentScans(sc.scans.slice(0, 5));
        setHealthData(hl);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Loading Command Center telemetry...
      </div>
    );
  }

  const categoryData = Object.entries(stats.categories || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));

  const COLORS: Record<string, string> = {
    MALICIOUS: '#ef4444',
    HIGH_RISK: '#f97316',
    SUSPICIOUS: '#f59e0b',
    BENIGN: '#10b981'
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#0a1220] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white font-mono uppercase tracking-wide flex items-center space-x-2">
            <span>Threat Intelligence Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, multi-layer heuristics, and autonomous investigative telemetry
          </p>
        </div>
        <button
          onClick={onNavigateInvestigate}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start md:self-auto"
        >
          <span>Launch Investigation</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>TOTAL SCANS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{stats.total_scans}</div>
          <div className="text-[10px] text-slate-400 mt-1">Recorded in Evidence Vault</div>
        </div>

        <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>HIGH RISK & MALICIOUS</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black font-mono text-red-400">{stats.high_risk_scans}</div>
          <div className="text-[10px] text-slate-400 mt-1">Risk score &gt;= 65/100</div>
        </div>

        <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SUSPICIOUS ASSETS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">{stats.suspicious_scans}</div>
          <div className="text-[10px] text-slate-400 mt-1">Elevated heuristic markers</div>
        </div>

        <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>BENIGN ASSETS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{stats.benign_scans}</div>
          <div className="text-[10px] text-slate-400 mt-1">Within standard baseline</div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-8 bg-[#0d1526] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Investigation Activity Trends</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">7-DAY HISTORICAL</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trends.length ? stats.trends : [{ date: 'Today', scans: stats.total_scans }]}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1220', borderColor: '#1e293b', fontSize: 11, fontFamily: 'monospace' }} 
                  labelStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#cyanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="lg:col-span-4 bg-[#0d1526] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Threat Category Ratio</span>
            </h2>
            <div className="h-44 w-full flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a1220', borderColor: '#1e293b', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400 font-mono">No data</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-3 border-t border-slate-800">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[c.name] || '#64748b' }}></span>
                <span className="text-slate-400">{c.name}:</span>
                <span className="text-white font-bold">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {healthData?.providers && Object.entries(healthData.providers).map(([pName, pStatus]: [string, any]) => {
          const isConfigured = String(pStatus).includes('CONFIGURED') || String(pStatus).includes('ACTIVE');
          return (
            <div key={pName} className="p-3.5 bg-[#0d1526] border border-slate-800 rounded-xl text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase mb-1">
                {pName.replace(/_/g, ' ')}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`font-bold ${isConfigured ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {pStatus}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Investigations Table */}
      <div className="bg-[#0d1526] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Recent Forensic Investigations
          </h2>
          <span className="text-xs text-cyan-400 font-mono cursor-pointer hover:underline" onClick={onNavigateInvestigate}>
            View All Scans &rarr;
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="pb-2">Scan ID</th>
                <th className="pb-2">Target Host / URL</th>
                <th className="pb-2">Risk Score</th>
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentScans.map((s) => (
                <tr key={s.scan_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 text-cyan-400 font-bold">{s.scan_id}</td>
                  <td className="py-2.5 text-slate-200 truncate max-w-md">{s.normalized_url}</td>
                  <td className="py-2.5 font-bold">
                    <span className={s.risk_score >= 65 ? 'text-red-400' : s.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'}>
                      {s.risk_score}/100
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-300">
                      {s.risk_category}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => onSelectScan(s.scan_id)}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline text-[11px]"
                    >
                      Inspect &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
