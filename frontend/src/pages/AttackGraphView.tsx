import React from 'react';
import { GitFork, AlertCircle, ArrowLeft } from 'lucide-react';
import { AttackFlowGraph } from '../components/AttackFlowGraph';
import { ScanResponse } from '../types';

interface AttackGraphViewProps {
  currentScan: ScanResponse | null;
  onNavigateInvestigate: () => void;
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({ currentScan, onNavigateInvestigate }) => {
  if (!currentScan) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="bg-[#0d1526] border border-slate-800 rounded-2xl p-12">
          <GitFork className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white font-mono uppercase">
            No Scan Loaded For Graph Analysis
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Investigate a suspicious URL first to synthesize its typed relationship graph and evidence nodes.
          </p>
          <button
            onClick={onNavigateInvestigate}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase rounded-lg transition-colors"
          >
            Launch Investigation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-white font-mono uppercase flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <span>Phantom X Attack DNA Graph</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive multi-entity relationship graph derived strictly from real forensic observations
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-slate-400">Target:</span>
          <span className="text-cyan-400 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
            {currentScan.url_components.hostname}
          </span>
        </div>
      </div>

      <div className="h-[650px]">
        <AttackFlowGraph graph={currentScan.attack_dna} title={`Attack Topology — ${currentScan.scan_id}`} />
      </div>
    </div>
  );
};
