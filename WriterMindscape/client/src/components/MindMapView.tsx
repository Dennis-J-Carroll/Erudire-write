import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Folder, FileText, Move, ZoomIn, ZoomOut, Tag } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document, Folder as FolderType } from "@shared/schema";

interface CanvasNode {
  id: string;
  title: string;
  type: 'document' | 'folder';
  color: string;
  tags: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging?: boolean;
  documentId?: number;
  folderId?: number;
}

interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface Connection {
  from: string;
  to: string;
  tag: string;
  color: string;
}

export default function MindMapView() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: folders = [] } = useQuery<FolderType[]>({
    queryKey: ["/api/folders"],
  });

  // Initialize nodes from documents and folders
  useEffect(() => {
    const newNodes: CanvasNode[] = [];
    const newConnections: Connection[] = [];

    // Create document nodes
    documents.forEach((doc, index) => {
      const node: CanvasNode = {
        id: `doc-${doc.id}`,
        title: doc.title,
        type: 'document',
        color: getColorByTags(doc.tags || []),
        tags: doc.tags || [],
        x: 200 + (index % 4) * 300,
        y: 150 + Math.floor(index / 4) * 200,
        width: 240,
        height: 160,
        documentId: doc.id
      };
      newNodes.push(node);
    });

    // Create folder nodes
    folders.forEach((folder, index) => {
      const node: CanvasNode = {
        id: `folder-${folder.id}`,
        title: folder.name,
        type: 'folder',
        color: folder.color || '#6C7B95',
        tags: [],
        x: 100 + index * 400,
        y: 50,
        width: 200,
        height: 80,
        folderId: folder.id
      };
      newNodes.push(node);
    });

    // Create connections based on shared tags
    const tagGroups: { [tag: string]: CanvasNode[] } = {};
    newNodes.forEach(node => {
      node.tags.forEach(tag => {
        if (!tagGroups[tag]) tagGroups[tag] = [];
        tagGroups[tag].push(node);
      });
    });

    Object.entries(tagGroups).forEach(([tag, nodeGroup]: [string, CanvasNode[]]) => {
      if (nodeGroup.length > 1) {
        for (let i = 0; i < nodeGroup.length - 1; i++) {
          for (let j = i + 1; j < nodeGroup.length; j++) {
            newConnections.push({
              from: nodeGroup[i].id,
              to: nodeGroup[j].id,
              tag,
              color: getTagColor(tag)
            });
          }
        }
      }
    });

    setNodes(newNodes);
    setConnections(newConnections);
  }, [documents, folders]);

  const getColorByTags = (tags: string[]): string => {
    if (tags.includes('story') || tags.includes('fantasy')) return '#8B5CF6';
    if (tags.includes('character')) return '#6C7B95';
    if (tags.includes('setting')) return '#10B981';
    if (tags.includes('outline')) return '#F59E0B';
    return '#8B5CF6';
  };

  const getTagColor = (tag: string): string => {
    const colors: { [key: string]: string } = {
      'story': '#8B5CF6',
      'fantasy': '#8B5CF6',
      'character': '#6C7B95',
      'setting': '#10B981',
      'outline': '#F59E0B',
      'plot': '#EF4444',
      'theme': '#EC4899'
    };
    return colors[tag.toLowerCase()] || '#64748B';
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const canvasX = (e.clientX - rect.left - panX) / zoom;
    const canvasY = (e.clientY - rect.top - panY) / zoom;

    setDragState({
      isDragging: true,
      nodeId,
      startX: canvasX,
      startY: canvasY,
      offsetX: canvasX - node.x,
      offsetY: canvasY - node.y
    });

    // Mark node as dragging
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, isDragging: true } : n
    ));
  }, [nodes, panX, panY, zoom]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.nodeId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = (e.clientX - rect.left - panX) / zoom;
    const canvasY = (e.clientY - rect.top - panY) / zoom;

    const newX = canvasX - dragState.offsetX;
    const newY = canvasY - dragState.offsetY;

    setNodes(prev => prev.map(node => 
      node.id === dragState.nodeId 
        ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) }
        : node
    ));
  }, [dragState, panX, panY, zoom]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setNodes(prev => prev.map(n => ({ ...n, isDragging: false })));
      setDragState({
        isDragging: false,
        nodeId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
      });
    }
  }, [dragState.isDragging]);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));

  const renderConnection = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    const fromX = fromNode.x + fromNode.width / 2;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = toNode.x + toNode.width / 2;
    const toY = toNode.y + toNode.height / 2;

    // Calculate control points for curved line
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.2, 50);

    const controlX = midX - dy * curvature / distance;
    const controlY = midY + dx * curvature / distance;

    return (
      <g key={`${connection.from}-${connection.to}-${connection.tag}`}>
        <path
          d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`}
          stroke={connection.color}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          markerEnd="url(#arrowhead)"
        />
        <text
          x={controlX}
          y={controlY - 5}
          fontSize="10"
          fill={connection.color}
          textAnchor="middle"
          className="pointer-events-none select-none"
        >
          {connection.tag}
        </text>
      </g>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mind Map Controls */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Document Canvas</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Filter by tag:</span>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="character">Character</SelectItem>
                  <SelectItem value="setting">Setting</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
            <Button variant="outline" size="sm">
              <Folder className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Textured Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, rgba(0,0,0,.1) 2px, transparent 0),
              radial-gradient(circle at 75px 75px, rgba(0,0,0,.1) 2px, transparent 0)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          style={{
            minHeight: '800px',
            minWidth: '1200px',
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: '0 0'
          }}
        >
          {/* SVG for connections */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#64748B"
                  opacity="0.6"
                />
              </marker>
            </defs>
            {connections.map(renderConnection)}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`absolute bg-white dark:bg-slate-800 rounded-lg shadow-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                node.isDragging ? 'shadow-2xl scale-105 z-50' : 'hover:shadow-xl hover:scale-[1.02]'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
                borderColor: node.color,
                borderLeftWidth: '6px',
                minWidth: '180px',
                minHeight: '120px',
                maxWidth: '400px',
                maxHeight: '300px',
                resize: 'both',
                overflow: 'hidden'
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
            >
              <div className="p-3 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {node.type === 'document' ? (
                        <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                      )}
                      <Move className="h-3 w-3 text-slate-400 opacity-50 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2 leading-tight">
                    {node.title}
                  </h3>
                  
                  {node.type === 'document' && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {documents.find(d => d.id === node.documentId)?.content?.split(' ').length || 0} words
                    </div>
                  )}
                </div>
                
                {node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {node.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: `${getTagColor(tag)}20`,
                          color: getTagColor(tag)
                        }}
                      >
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {node.tags.length > 2 && (
                      <span className="text-xs text-slate-400 px-1">+{node.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Resize Handle */}
              <div 
                className="absolute bottom-0 right-0 w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-tl-lg cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(-45deg, transparent 40%, currentColor 40%, currentColor 60%, transparent 60%)'
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Connection Types</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-purple-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Story</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-slate-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Character</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-green-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Setting</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-amber-500 rounded"></div>
              <span className="text-slate-600 dark:text-slate-400">Outline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}