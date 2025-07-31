import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserPreferences } from '../services/authService';
import { Lesson } from '../data/lessons';
import './KnowledgeGraph.css';

interface KnowledgeGraphProps {
  userPreferences: UserPreferences | null;
  completedLessons: Set<number>;
  onStartLesson: (lessonId: number, track: string) => void;
  lessons: Lesson[];
}

interface GraphNode {
  id: string;
  title: string;
  track: string;
  icon: string;
  description: string;
  prerequisites: string[];
  lessons: Lesson[];
  depth: 'foundation' | 'core' | 'advanced' | 'mastery' | 'expert';
  category: 'technical' | 'practical' | 'theoretical' | 'project';
  unlocked: boolean;
  progress: number;
  mastery: number;
  nextLesson?: Lesson;
  estimatedHours: number;
  skillPoints: number;
  connections: string[];
  position: { x: number; y: number };
  pathIndex: number;
  trackName: string;
}


const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  userPreferences,
  completedLessons,
  onStartLesson,
  lessons
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [, setHoveredNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [searchQuery] = useState('');
  const [selectedPath] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedListItems, setExpandedListItems] = useState<Set<string>>(new Set());
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  // Create learning paths for journey layout with better alignment
  const createLearningPaths = useCallback(() => {
    const paths = {
      'foundation': {
        color: '#4ecdc4',
        curve: (t: number) => ({
          x: 150 + t * 900,
          y: 500 + Math.sin(t * Math.PI * 0.3) * 60
        })
      },
      'core': {
        color: '#45b7d1', 
        curve: (t: number) => ({
          x: 200 + t * 800,
          y: 400 + Math.sin(t * Math.PI * 0.4) * 50
        })
      },
      'advanced': {
        color: '#96ceb4',
        curve: (t: number) => ({
          x: 250 + t * 700,
          y: 300 + Math.sin(t * Math.PI * 0.5) * 40
        })
      },
      'mastery': {
        color: '#feca57',
        curve: (t: number) => ({
          x: 300 + t * 600,
          y: 200 + Math.sin(t * Math.PI * 0.6) * 30
        })
      },
      'expert': {
        color: '#ff6b6b',
        curve: (t: number) => ({
          x: 350 + t * 500,
          y: 100 + Math.sin(t * Math.PI * 0.7) * 20
        })
      }
    };
    return paths;
  }, []);

  // Create expanded lesson nodes with improved hierarchy
  const createSubNodes = useCallback((parentNode: GraphNode): GraphNode[] => {
    const subNodes: GraphNode[] = [];
    const maxSubnodes = 3; // Reduced from 4 to 3 for less clutter
    const lessonsToShow = parentNode.lessons.slice(0, maxSubnodes);
    
    // Create nodes in a more structured layout
    lessonsToShow.forEach((lesson, index) => {
      // Use a curved arc below parent for better visual hierarchy
      const angle = (index - (lessonsToShow.length - 1) / 2) * 0.4; // Smaller spread
      const radius = 120; // Distance from parent
      const offsetX = Math.sin(angle) * radius;
      const offsetY = Math.cos(angle) * 60 + 80; // Closer to parent
      
      const subNode: GraphNode = {
        id: `${parentNode.id}-lesson-${lesson.id}`,
        title: lesson.title.length > 15 ? lesson.title.substring(0, 15) + '...' : lesson.title,
        track: lesson.track,
        icon: completedLessons.has(lesson.id) ? '✅' : '📚',
        description: lesson.description || `Lesson: ${lesson.title}`,
        prerequisites: [],
        lessons: [lesson],
        depth: 'foundation',
        category: 'technical',
        unlocked: parentNode.unlocked,
        progress: completedLessons.has(lesson.id) ? 100 : 0,
        mastery: completedLessons.has(lesson.id) ? 100 : 0,
        estimatedHours: 1,
        skillPoints: 10,
        connections: [],
        position: {
          x: parentNode.position.x + offsetX,
          y: parentNode.position.y + offsetY
        },
        pathIndex: -1,
        trackName: parentNode.trackName
      };
      subNodes.push(subNode);
    });
    
    // Only show "more" indicator if there are significantly more lessons
    if (parentNode.lessons.length > maxSubnodes + 2) {
      const moreNode: GraphNode = {
        id: `${parentNode.id}-more`,
        title: `+${parentNode.lessons.length - maxSubnodes}`,
        track: parentNode.track,
        icon: '📋',
        description: `${parentNode.lessons.length - maxSubnodes} more lessons`,
        prerequisites: [],
        lessons: [],
        depth: 'foundation',
        category: 'technical',
        unlocked: parentNode.unlocked,
        progress: 0,
        mastery: 0,
        estimatedHours: 0,
        skillPoints: 0,
        connections: [],
        position: {
          x: parentNode.position.x,
          y: parentNode.position.y + 160 // Below the arc
        },
        pathIndex: -1,
        trackName: parentNode.trackName
      };
      subNodes.push(moreNode);
    }
    
    return subNodes;
  }, [completedLessons]);

  // Create knowledge graph nodes with journey path positioning
  const createGraphNodes = useCallback((): GraphNode[] => {
    const paths = createLearningPaths();
    
    const graphNodes: GraphNode[] = [
      // Foundation Path - Starting point
      {
        id: 'python-basics',
        title: 'Python Core',
        track: 'beginner',
        icon: '🐍',
        description: 'Master Python fundamentals: syntax, variables, data types, and control flow.',
        prerequisites: [],
        lessons: lessons.filter(l => l.track === 'beginner' && l.id <= 5),
        depth: 'foundation',
        category: 'technical',
        unlocked: true,
        progress: 0,
        mastery: 0,
        estimatedHours: 20,
        skillPoints: 100,
        connections: ['data-structures', 'algorithms-intro', 'web-basics'],
        position: paths.foundation.curve(0),
        pathIndex: 0,
        trackName: 'Foundation'
      },
      
      // Core Path - Second tier
      {
        id: 'data-structures',
        title: 'Data Structures',
        track: 'intermediate',
        icon: '📊',
        description: 'Lists, dictionaries, sets, and advanced data manipulation techniques.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'intermediate' && [6, 7, 8].includes(l.id)),
        depth: 'core',
        category: 'technical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 15,
        skillPoints: 80,
        connections: ['python-basics', 'numpy-pandas'],
        position: paths.core.curve(0.2),
        pathIndex: 1,
        trackName: 'Core Skills'
      },
      
      {
        id: 'algorithms-intro',
        title: 'Algorithm Fundamentals',
        track: 'algorithms',
        icon: '🧮',
        description: 'Problem-solving techniques and algorithmic thinking.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'algorithms' && l.id >= 1001 && l.id <= 1003),
        depth: 'core',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 25,
        skillPoints: 120,
        connections: ['python-basics', 'ml-basics'],
        position: paths.core.curve(0.6),
        pathIndex: 2,
        trackName: 'Core Skills'
      },
      
      {
        id: 'web-basics',
        title: 'Web Development',
        track: 'web-development',
        icon: '🌐',
        description: 'Build web applications with Flask and handle HTTP requests.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'web-development'),
        depth: 'core',
        category: 'practical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 30,
        skillPoints: 150,
        connections: ['python-basics'],
        position: paths.foundation.curve(0.7),
        pathIndex: 3,
        trackName: 'Foundation'
      },
      
      // Advanced Path - Third tier
      {
        id: 'numpy-pandas',
        title: 'Data Science Tools',
        track: 'data-science',
        icon: '📈',
        description: 'NumPy arrays, Pandas DataFrames, and data analysis techniques.',
        prerequisites: ['data-structures'],
        lessons: lessons.filter(l => l.track === 'data-science' && l.id >= 13 && l.id <= 16),
        depth: 'advanced',
        category: 'practical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 40,
        skillPoints: 200,
        connections: ['data-structures', 'ml-basics'],
        position: paths.advanced.curve(0.3),
        pathIndex: 4,
        trackName: 'Advanced'
      },
      
      {
        id: 'ml-basics',
        title: 'Machine Learning',
        track: 'ai-ml',
        icon: '🤖',
        description: 'PyTorch, neural networks, and machine learning fundamentals.',
        prerequisites: ['algorithms-intro', 'numpy-pandas'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id >= 101 && l.id <= 204),
        depth: 'advanced',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 60,
        skillPoints: 300,
        connections: ['algorithms-intro', 'numpy-pandas', 'deep-learning'],
        position: paths.advanced.curve(0.7),
        pathIndex: 5,
        trackName: 'Advanced'
      },
      
      // Mastery Path - Fourth tier
      {
        id: 'deep-learning',
        title: 'Deep Learning',
        track: 'ai-ml',
        icon: '🧠',
        description: 'Advanced neural networks, CNNs, RNNs, and Transformers.',
        prerequisites: ['ml-basics'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id >= 301 && l.id <= 402),
        depth: 'mastery',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 80,
        skillPoints: 400,
        connections: ['ml-basics', 'llm-mastery'],
        position: paths.mastery.curve(0.4),
        pathIndex: 6,
        trackName: 'Mastery'
      },
      
      // Expert Path - Final tier
      {
        id: 'llm-mastery',
        title: 'LLM Development',
        track: 'ai-ml',
        icon: '🚀',
        description: 'Build and fine-tune large language models like GPT.',
        prerequisites: ['deep-learning'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id >= 501),
        depth: 'expert',
        category: 'project',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 100,
        skillPoints: 500,
        connections: ['deep-learning'],
        position: paths.expert.curve(0.5),
        pathIndex: 7,
        trackName: 'Expert'
      }
    ];

    // Add expanded subnodes
    const allNodes: GraphNode[] = [...graphNodes];
    expandedNodes.forEach(nodeId => {
      const parentNode = graphNodes.find(n => n.id === nodeId);
      if (parentNode) {
        const subNodes = createSubNodes(parentNode);
        allNodes.push(...subNodes);
      }
    });

    // Calculate progress and unlock status
    return allNodes.map(node => {
      const nodeCompletedLessons = node.lessons.filter(lesson => 
        completedLessons.has(lesson.id)
      ).length;
      
      const progress = node.lessons.length > 0 
        ? (nodeCompletedLessons / node.lessons.length) * 100 
        : 0;
      
      const mastery = Math.min(progress * 1.2, 100);
      
      const unlocked = node.prerequisites.length === 0 || 
        node.prerequisites.every(prereqId => {
          const prereqNode = allNodes.find(n => n.id === prereqId);
          return prereqNode && prereqNode.lessons.every(lesson => 
            completedLessons.has(lesson.id)
          );
        });

      const nextLesson = node.lessons.find(lesson => 
        !completedLessons.has(lesson.id)
      );

      return {
        ...node,
        progress,
        mastery,
        unlocked,
        nextLesson
      };
    });
  }, [lessons, completedLessons, expandedNodes, createSubNodes, createLearningPaths]);

  // Initialize nodes
  useEffect(() => {
    setNodes(createGraphNodes());
  }, [createGraphNodes]);

  // Generate smooth SVG path for journey connections
  const generateConnectionPath = (from: GraphNode, to: GraphNode): string => {
    const dx = to.position.x - from.position.x;
    
    // Create a curved path with control points
    const controlX1 = from.position.x + dx * 0.5;
    const controlY1 = from.position.y;
    const controlX2 = to.position.x - dx * 0.5;
    const controlY2 = to.position.y;
    
    return `M ${from.position.x} ${from.position.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${to.position.x} ${to.position.y}`;
  };

  // Handle zoom and pan functionality
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1.1 : 0.9;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Convert mouse position to SVG coordinates
    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width;
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height;
    
    setViewBox(prev => {
      const newWidth = Math.max(400, Math.min(3000, prev.width * delta));
      const newHeight = Math.max(300, Math.min(2250, prev.height * delta));
      
      // Zoom toward mouse position
      const newX = svgX - (mouseX / rect.width) * newWidth;
      const newY = svgY - (mouseY / rect.height) * newHeight;
      
      return { x: newX, y: newY, width: newWidth, height: newHeight };
    });
  }, [viewBox]);
  
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, []);
  
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Convert pixel movement to SVG coordinate movement
      const svgDeltaX = -(deltaX / rect.width) * viewBox.width;
      const svgDeltaY = -(deltaY / rect.height) * viewBox.height;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x + svgDeltaX,
        y: prev.y + svgDeltaY
      }));
      
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, [isPanning, lastPanPoint, viewBox]);
  
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);
  
  // Reset view to center
  const resetView = useCallback(() => {
    setViewBox({ x: 0, y: 0, width: 1200, height: 800 });
  }, []);

  // Handle node interactions
  const handleNodeClick = (node: GraphNode, event: React.MouseEvent) => {
    event.stopPropagation();
    if (node.lessons.length > 1 && !node.id.includes('-lesson-') && !node.id.includes('-more')) {
      // Toggle expansion for main nodes with multiple lessons
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(node.id)) {
        newExpanded.delete(node.id);
      } else {
        // Only allow one expansion at a time for cleaner UX
        newExpanded.clear();
        newExpanded.add(node.id);
      }
      setExpandedNodes(newExpanded);
    } else if (node.id.includes('-lesson-') && node.lessons.length > 0) {
      // Click on lesson subnode to start lesson
      onStartLesson(node.lessons[0].id, node.lessons[0].track);
    } else {
      setSelectedNode(node);
    }
  };

  // Filter nodes based on search
  const filteredNodes = nodes.filter(node =>
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current user's position and next steps
  const getCurrentStatus = () => {
    const unlockedNodes = nodes.filter(n => n.unlocked);
    const completedNodes = nodes.filter(n => n.progress === 100);
    const inProgressNodes = nodes.filter(n => n.progress > 0 && n.progress < 100);
    const nextNodes = nodes.filter(n => !n.unlocked && 
      n.prerequisites.every(prereqId => {
        const prereq = nodes.find(p => p.id === prereqId);
        return prereq && prereq.progress === 100;
      })
    );

    return {
      completed: completedNodes.length,
      inProgress: inProgressNodes.length,
      available: unlockedNodes.length - completedNodes.length - inProgressNodes.length,
      nextAvailable: nextNodes.length,
      totalSkillPoints: completedNodes.reduce((sum, node) => sum + node.skillPoints, 0)
    };
  };

  const status = getCurrentStatus();

  return (
    <div className="knowledge-graph-container" ref={containerRef}>
      <div className="graph-header">
        <div className="header-content">
          <h2>🌌 Learning Universe</h2>
          <p>Chart your path to mastery through interconnected skills</p>
          
          <div className="status-bar">
            <div className="status-item">
              <span className="status-icon">✅</span>
              <span>{status.completed} Completed</span>
            </div>
            <div className="status-item">
              <span className="status-icon">🔄</span>
              <span>{status.inProgress} In Progress</span>
            </div>
            <div className="status-item">
              <span className="status-icon">🔓</span>
              <span>{status.available} Available</span>
            </div>
            <div className="status-item">
              <span className="status-icon">⭐</span>
              <span>{status.totalSkillPoints} Points</span>
            </div>
          </div>
        </div>
        
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
          >
            🕸️ Graph
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
          {viewMode === 'graph' && (
            <>
              <button 
                className="view-btn zoom-btn"
                onClick={() => setViewBox(prev => ({ ...prev, width: prev.width * 0.8, height: prev.height * 0.8 }))}
                title="Zoom In"
              >
                🔍+
              </button>
              <button 
                className="view-btn zoom-btn"
                onClick={() => setViewBox(prev => ({ ...prev, width: prev.width * 1.25, height: prev.height * 1.25 }))}
                title="Zoom Out"
              >
                🔍-
              </button>
              <button 
                className="view-btn reset-btn"
                onClick={resetView}
                title="Reset View"
              >
                🏠
              </button>
            </>
          )}
        </div>
      </div>

      <div className="graph-content">
        {viewMode === 'graph' ? (
          <svg 
            ref={svgRef}
            className="knowledge-graph-svg"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          >
          {/* SVG Definitions for gradients and effects */}
          <defs>
            <linearGradient id="technicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ecdc4" />
              <stop offset="100%" stopColor="#44b3aa" />
            </linearGradient>
            <linearGradient id="practicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#45b7d1" />
              <stop offset="100%" stopColor="#3498db" />
            </linearGradient>
            <linearGradient id="theoreticalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#96ceb4" />
              <stop offset="100%" stopColor="#74b49b" />
            </linearGradient>
            <linearGradient id="projectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#feca57" />
              <stop offset="100%" stopColor="#ff9f43" />
            </linearGradient>
            <filter id="glowEffect">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Journey Path Lines */}
          <g className="journey-paths">
            {filteredNodes.map(node => 
              node.connections.map(connId => {
                const connectedNode = nodes.find(n => n.id === connId);
                if (!connectedNode || node.id.includes('-lesson-')) return null;
                
                return (
                  <path
                    key={`path-${node.id}-${connId}`}
                    d={generateConnectionPath(node, connectedNode)}
                    className={`journey-connection ${selectedPath ? 'dimmed' : ''}`}
                    stroke={node.unlocked && connectedNode.unlocked ? '#4ecdc4' : '#ddd'}
                    strokeWidth="3"
                    strokeDasharray={connectedNode.unlocked ? '0' : '8,4'}
                    fill="none"
                    opacity={node.unlocked ? 0.8 : 0.3}
                  />
                );
              })
            )}
          </g>
          
          {/* Expansion Lines - Connect parent to subnodes */}
          <g className="expansion-lines">
            {filteredNodes.filter(node => node.id.includes('-lesson-') || node.id.includes('-more')).map(subNode => {
              const parentId = subNode.id.split('-lesson-')[0].split('-more')[0];
              const parentNode = nodes.find(n => n.id === parentId);
              if (!parentNode) return null;
              
              return (
                <line
                  key={`expansion-${subNode.id}`}
                  x1={parentNode.position.x}
                  y1={parentNode.position.y}
                  x2={subNode.position.x}
                  y2={subNode.position.y}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              );
            })}
          </g>
          
          {/* Track Background Paths */}
          <g className="track-backgrounds">
            {Object.entries(createLearningPaths()).map(([trackName, pathData]) => {
              const pathPoints = [];
              for (let t = 0; t <= 1; t += 0.02) {
                pathPoints.push(pathData.curve(t));
              }
              const pathString = pathPoints.map((p, i) => 
                i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
              ).join(' ');
              
              return (
                <path
                  key={`track-${trackName}`}
                  d={pathString}
                  stroke={pathData.color}
                  strokeWidth="6"
                  fill="none"
                  opacity="0.2"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {filteredNodes.map(node => (
              <g key={node.id} className={`node-group ${!node.unlocked ? 'locked' : ''}`}>
                {/* Larger invisible click area for easier clicking */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={45}
                  fill="transparent"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => handleNodeClick(node, e)}
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Visible node circle */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={node.id.includes('-lesson-') ? 12 : node.id.includes('-more') ? 10 : (28 + Math.min(node.mastery * 0.15, 8))}
                  className={`skill-node depth-${node.depth} category-${node.category} journey-node ${node.unlocked ? 'unlocked' : 'locked'} ${node.progress === 100 ? 'completed' : ''}`}
                  fill={node.unlocked ? undefined : '#ccc'}
                  stroke={selectedNode?.id === node.id ? '#333' : '#fff'}
                  strokeWidth={selectedNode?.id === node.id ? 3 : 2}
                  pointerEvents="none"
                  opacity={node.id.includes('-lesson-') || node.id.includes('-more') ? 0.7 : 1}
                />
                
                {/* Node icon */}
                <text
                  x={node.position.x}
                  y={node.position.y + 5}
                  textAnchor="middle"
                  className="node-icon"
                  pointerEvents="none"
                >
                  {node.icon}
                </text>
                
                {/* Node label - better positioning and alignment */}
                <text
                  x={node.position.x}
                  y={node.position.y + (node.id.includes('-lesson-') ? 35 : 45)}
                  textAnchor="middle"
                  className="node-label"
                  pointerEvents="none"
                  dominantBaseline="central"
                  fontSize={node.id.includes('-lesson-') ? '10' : '12'}
                >
                  {node.id.includes('-lesson-') || node.id.includes('-more') ? 
                    (node.title.length > 10 ? node.title.substring(0, 10) + '...' : node.title) : 
                    node.title
                  }
                </text>
                
                {/* Expansion indicator for nodes with multiple lessons */}
                {node.lessons.length > 1 && !node.id.includes('-lesson-') && !node.id.includes('-more') && (
                  <g>
                    <circle
                      cx={node.position.x + 20}
                      cy={node.position.y - 20}
                      r="8"
                      fill="rgba(78, 205, 196, 0.9)"
                      stroke="#fff"
                      strokeWidth="1"
                      pointerEvents="none"
                    />
                    <text
                      x={node.position.x + 20}
                      y={node.position.y - 17}
                      textAnchor="middle"
                      className="expansion-indicator"
                      pointerEvents="none"
                      fontSize="10"
                      fill="white"
                      fontWeight="bold"
                    >
                      {expandedNodes.has(node.id) ? '−' : '+'}
                    </text>
                  </g>
                )}
                
                {/* Progress indicator */}
                {node.progress > 0 && (
                  <circle
                    cx={node.position.x + 20}
                    cy={node.position.y - 20}
                    r="8"
                    fill="#4ecdc4"
                    className="progress-indicator"
                    pointerEvents="none"
                  />
                )}
              </g>
            ))}
          </g>
        </svg>
        ) : (
          <div className="skills-list">
            {filteredNodes.filter(node => !node.id.includes('-lesson-')).map(node => (
              <div key={node.id}>
                <div 
                  className={`skill-card ${!node.unlocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (node.lessons.length > 1) {
                      const newExpanded = new Set(expandedListItems);
                      if (newExpanded.has(node.id)) {
                        newExpanded.delete(node.id);
                      } else {
                        newExpanded.add(node.id);
                      }
                      setExpandedListItems(newExpanded);
                    } else {
                      setSelectedNode(node);
                    }
                  }}
                >
                  <div className="skill-header">
                    <span className="skill-icon">{node.icon}</span>
                    <div className="skill-info">
                      <h3>
                        {node.title}
                        {node.lessons.length > 1 && (
                          <span className="expand-indicator">
                            {expandedListItems.has(node.id) ? ' ▼' : ' ▶'}
                          </span>
                        )}
                      </h3>
                      <p className="skill-description">{node.description}</p>
                    </div>
                    <div className="skill-stats">
                      <div className="progress-circle">
                        <span>{Math.round(node.progress)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {node.progress > 0 && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${node.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                {/* Expanded lesson list */}
                {expandedListItems.has(node.id) && (
                  <div className="lesson-sublist">
                    {node.lessons.map(lesson => (
                      <div 
                        key={lesson.id}
                        className={`lesson-item ${completedLessons.has(lesson.id) ? 'completed' : ''}`}
                        onClick={() => {
                          if (!completedLessons.has(lesson.id)) {
                            onStartLesson(lesson.id, lesson.track);
                          }
                        }}
                      >
                        <span className="lesson-icon">
                          {completedLessons.has(lesson.id) ? '✅' : '📚'}
                        </span>
                        <div className="lesson-info">
                          <h4>{lesson.title}</h4>
                          <p>{lesson.description || 'Complete this lesson to progress'}</p>
                        </div>
                        <div className="lesson-status">
                          {completedLessons.has(lesson.id) ? 'Complete' : 'Start'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Journey Path Legend */}
        {viewMode === 'graph' && (
          <div className="journey-legend">
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Learning Paths</h4>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#4ecdc4' }}></div>
              <span>Foundation Track</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#45b7d1' }}></div>
              <span>Core Skills</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#96ceb4' }}></div>
              <span>Advanced</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#feca57' }}></div>
              <span>Mastery</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></div>
              <span>Expert</span>
            </div>
          </div>
        )}

        {/* Node details panel */}
        {selectedNode && (
          <div className="node-details-panel">
            <div className="panel-header">
              <span className="panel-icon">{selectedNode.icon}</span>
              <h3>{selectedNode.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedNode(null)}
              >
                ×
              </button>
            </div>
            
            <div className="panel-content">
              <p className="node-description">{selectedNode.description}</p>
              
              <div className="node-stats">
                <div className="stat">
                  <span className="stat-label">Progress</span>
                  <div className="stat-bar">
                    <div 
                      className="stat-fill"
                      style={{ width: `${selectedNode.progress}%` }}
                    />
                  </div>
                  <span className="stat-value">{Math.round(selectedNode.progress)}%</span>
                </div>
                
                <div className="stat">
                  <span className="stat-label">Estimated Time</span>
                  <span className="stat-value">{selectedNode.estimatedHours}h</span>
                </div>
                
                <div className="stat">
                  <span className="stat-label">Skill Points</span>
                  <span className="stat-value">{selectedNode.skillPoints}</span>
                </div>
              </div>
              
              {selectedNode.nextLesson && (
                <button 
                  className="start-lesson-btn"
                  onClick={() => {
                    onStartLesson(selectedNode.nextLesson!.id, selectedNode.nextLesson!.track);
                    setSelectedNode(null);
                  }}
                >
                  Continue Learning: {selectedNode.nextLesson.title}
                </button>
              )}
              
              {!selectedNode.unlocked && (
                <div className="prerequisites">
                  <h4>Prerequisites:</h4>
                  {selectedNode.prerequisites.map(prereqId => {
                    const prereq = nodes.find(n => n.id === prereqId);
                    return prereq ? (
                      <div key={prereqId} className="prerequisite">
                        {prereq.icon} {prereq.title}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;