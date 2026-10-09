import React, { useState, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge, 
  Handle, 
  Position, 
  BackgroundVariant 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Globe, 
  Server, 
  Link2, 
  ShieldAlert, 
  CornerDownRight, 
  AlertTriangle, 
  Info,
  Maximize2,
  X
} from 'lucide-react';
import { AttackGraph, GraphNode } from '../types';

interface AttackFlowGraphProps {
  graph: AttackGraph;
  title?: string;
}

// Custom Node Component for ReactFlow
const CustomAttackNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.entity_type) {
      case 'SUBMITTED_URL':
        return <Link2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'REGISTRABLE_DOMAIN':
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'INFRASTRUCTURE_IP':
        return <Server className="w-3.5 h-3.5 text-amber-400" />;
      case 'BRAND_IDENTITY':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'REDIRECT_HOP':
        return <CornerDownRight className="w-3.5 h-3.5 text-violet-400" />;
      case 'THREAT_INTEL_INDICATOR':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getBorderColor = () => {
    switch (data.severity) {
      case 'CRITICAL':
        return 'border-red-500/80 shadow-red-500/20';
      case 'HIGH':
        return 'border-orange-500/80 shadow-orange-500/20';
      case 'MEDIUM':
        return 'border-amber-500/70 shadow-amber-500/10';
      default:
        return 'border-cyan-500/50 shadow-cyan-500/10';
    }
  };

  return (
    <div className={`px-3 py-2.5 rounded-lg bg-[#0a1220] border-2 shadow-md transition-all hover:scale-105 cursor-pointer max-w-[220px] ${getBorderColor()}`}>
      <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2 !h-2" />
      
      <div className="flex items-center space-x-2 mb-1">
        <div className="p-1 rounded bg-slate-900 border border-slate-800">
          {getIcon()}
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider truncate">
          {data.entity_type.replace('_', ' ')}
        </span>
      </div>

      <div className="text-xs font-bold text-white truncate font-mono">
        {data.label}
      </div>

      <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
        <span className="text-slate-400">{data.source_type}</span>
        <span className={`px-1 py-0.2 rounded font-bold ${
          data.severity === 'CRITICAL' ? 'text-red-400 bg-red-950/60' :
          data.severity === 'HIGH' ? 'text-orange-400 bg-orange-950/60' : 'text-slate-400'
        }`}>
          {data.severity}
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2 !h-2" />
    </div>
  );
};

export const AttackFlowGraph: React.FC<AttackFlowGraphProps> = ({ graph, title = "Phantom X Attack DNA Graph" }) => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const nodeTypes = useMemo(() => ({
    customNode: CustomAttackNode
  }), []);

  // Format ReactFlow Nodes
  const rfNodes: Node[] = useMemo(() => {
    return graph.nodes.map(n => ({
      id: n.id,
      type: 'customNode',
      position: n.position,
      data: n.data
    }));
  }, [graph.nodes]);

  // Format ReactFlow Edges
  const rfEdges: Edge[] = useMemo(() => {
    return graph.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || undefined,
      animated: e.animated ?? true,
      style: { stroke: '#06b6d4', strokeWidth: 1.5 },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }
    }));
  }, [graph.edges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data);
  };

  return (
    <div className="bg-[#0d1526] border border-slate-800 rounded-xl overflow-hidden relative flex flex-col h-[520px]">
      {/* Graph Toolbar Header */}
      <div className="p-4 bg-[#0a1220] border-b border-slate-800 flex items-center justify-between z-10">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              {graph.nodes.length} Nodes • {graph.edges.length} Edges
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive entity relationship graph synthesized from observed forensics
          </p>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300">Direct</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-300">Critical</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
            <span className="text-slate-300">Redirect</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Infra</span>
          </span>
        </div>
      </div>

      {/* ReactFlow Interactive Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-[#0a1220] !border-slate-800 !text-slate-300" />
          <MiniMap 
            nodeColor="#06b6d4" 
            maskColor="rgba(5, 11, 20, 0.8)"
            className="!bg-[#0a1220] !border-slate-800 rounded-lg"
          />
        </ReactFlow>

        {/* Evidence Inspection Modal / Panel on Node Click */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-80 bg-[#0a1220]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-4 shadow-2xl z-20 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                Evidence Dossier
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Entity Type:</span>
                <div className="text-white font-bold">{selectedNode.entity_type}</div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase">Node Label:</span>
                <div className="text-cyan-300 font-bold break-all">{selectedNode.label}</div>
              </div>

              {selectedNode.full_value && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Full Value:</span>
                  <div className="text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800 break-all text-[11px]">
                    {selectedNode.full_value}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 text-[10px] uppercase">Source Origin:</span>
                <div className="text-slate-200">{selectedNode.source_type}</div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase">Observed Evidence:</span>
                <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 text-[11px] leading-relaxed">
                  {selectedNode.evidence}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
