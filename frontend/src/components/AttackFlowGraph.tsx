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
  X
} from 'lucide-react';
import { AttackGraph } from '../types';

interface AttackFlowGraphProps {
  graph: AttackGraph;
  title?: string;
}

// Custom Node Component for ReactFlow
const CustomAttackNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.entity_type) {
      case 'SUBMITTED_URL':
        return <Link2 className="w-3.5 h-3.5 text-cyan-600" />;
      case 'REGISTRABLE_DOMAIN':
        return <Globe className="w-3.5 h-3.5 text-blue-600" />;
      case 'INFRASTRUCTURE_IP':
        return <Server className="w-3.5 h-3.5 text-amber-600" />;
      case 'BRAND_IDENTITY':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
      case 'REDIRECT_HOP':
        return <CornerDownRight className="w-3.5 h-3.5 text-violet-600" />;
      case 'THREAT_INTEL_INDICATOR':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getBorderColor = () => {
    switch (data.severity) {
      case 'CRITICAL':
        return 'border-red-400 bg-red-50/60 shadow-red-200';
      case 'HIGH':
        return 'border-orange-400 bg-orange-50/60 shadow-orange-200';
      case 'MEDIUM':
        return 'border-amber-400 bg-amber-50/60 shadow-amber-200';
      default:
        return 'border-cyan-300 bg-white shadow-cyan-100';
    }
  };

  return (
    <div className={`px-3 py-2.5 rounded-lg border-2 shadow-sm transition-all hover:scale-105 cursor-pointer max-w-[220px] ${getBorderColor()}`}>
      <Handle type="target" position={Position.Left} className="!bg-cyan-600 !w-2 !h-2" />
      
      <div className="flex items-center space-x-2 mb-1">
        <div className="p-1 rounded bg-slate-100 border border-slate-200">
          {getIcon()}
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider truncate">
          {data.entity_type.replace('_', ' ')}
        </span>
      </div>

      <div className="text-xs font-bold text-slate-900 truncate font-mono">
        {data.label}
      </div>

      <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
        <span className="text-slate-500">{data.source_type}</span>
        <span className={`px-1 py-0.5 rounded font-bold ${
          data.severity === 'CRITICAL' ? 'text-red-700 bg-red-100' :
          data.severity === 'HIGH' ? 'text-orange-700 bg-orange-100' : 'text-slate-600'
        }`}>
          {data.severity}
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-cyan-600 !w-2 !h-2" />
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
      style: { stroke: '#0891b2', strokeWidth: 1.5 },
      labelStyle: { fill: '#475569', fontSize: 10, fontFamily: 'monospace' }
    }));
  }, [graph.edges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden relative flex flex-col h-[520px] shadow-sm">
      {/* Graph Toolbar Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded font-mono font-semibold">
              {graph.nodes.length} Nodes • {graph.edges.length} Edges
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Interactive entity relationship graph synthesized from observed forensics
          </p>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span className="text-slate-600">Direct</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-600">Critical</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
            <span className="text-slate-600">Redirect</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">Infra</span>
          </span>
        </div>
      </div>

      {/* ReactFlow Interactive Canvas */}
      <div className="flex-1 w-full h-full relative bg-slate-50">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#cbd5e1" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-white !border-slate-200 !text-slate-700 !shadow-sm" />
          <MiniMap 
            nodeColor="#0891b2" 
            maskColor="rgba(241, 245, 249, 0.7)"
            className="!bg-white !border-slate-200 rounded-lg shadow-sm"
          />
        </ReactFlow>

        {/* Evidence Inspection Modal / Panel on Node Click */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-80 bg-white/95 backdrop-blur-md border border-cyan-400/80 rounded-xl p-4 shadow-xl z-20 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-mono font-bold text-cyan-700 uppercase tracking-wide">
                Evidence Dossier
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Entity Type:</span>
                <div className="text-slate-900 font-bold">{selectedNode.entity_type}</div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase">Node Label:</span>
                <div className="text-cyan-700 font-bold break-all">{selectedNode.label}</div>
              </div>

              {selectedNode.full_value && (
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Full Value:</span>
                  <div className="text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200 break-all text-[11px]">
                    {selectedNode.full_value}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-500 text-[10px] uppercase">Source Origin:</span>
                <div className="text-slate-700">{selectedNode.source_type}</div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase">Observed Evidence:</span>
                <div className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px] leading-relaxed">
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
