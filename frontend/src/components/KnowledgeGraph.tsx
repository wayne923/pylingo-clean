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
  velocity?: { x: number; y: number };
  fixed?: boolean;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  color: string;
  nodes: string[];
  estimatedWeeks: number;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  userPreferences,
  completedLessons,
  onStartLesson,
  lessons
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<GraphNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Learning paths for different goals
  const learningPaths: LearningPath[] = [
    {
      id: 'beginner-path',
      name: 'Python Foundations',
      description: 'Start your Python journey from scratch',
      color: '#4ecdc4',
      nodes: ['python-basics', 'data-structures', 'algorithms-intro', 'functions-advanced'],
      estimatedWeeks: 8
    },
    {
      id: 'data-science-path',
      name: 'Data Science Track',
      description: 'Master data analysis and machine learning',
      color: '#45b7d1',
      nodes: ['python-basics', 'data-structures', 'numpy-pandas', 'data-analysis', 'ml-basics'],
      estimatedWeeks: 16
    },
    {
      id: 'web-dev-path',
      name: 'Web Development',
      description: 'Build modern web applications',
      color: '#96ceb4',
      nodes: ['python-basics', 'web-basics', 'flask-django', 'databases', 'deployment'],
      estimatedWeeks: 12
    },
    {
      id: 'ai-path',
      name: 'AI & Machine Learning',
      description: 'Deep dive into artificial intelligence',
      color: '#feca57',
      nodes: ['python-basics', 'algorithms-intro', 'ml-basics', 'deep-learning', 'llm-mastery'],
      estimatedWeeks: 20
    }
  ];

  // Create knowledge graph nodes
  const createGraphNodes = useCallback((): GraphNode[] => {
    const graphNodes: GraphNode[] = [
      // Foundation Layer
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
        position: { x: 400, y: 300 },
        fixed: false
      },
      
      // Core Layer
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
        connections: ['python-basics', 'algorithms-intro', 'numpy-pandas'],
        position: { x: 300, y: 200 }
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
        connections: ['python-basics', 'data-structures', 'ml-basics'],
        position: { x: 500, y: 200 }
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
        connections: ['python-basics', 'databases', 'deployment'],
        position: { x: 600, y: 350 }
      },
      
      // Advanced Layer
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
        connections: ['data-structures', 'data-analysis', 'ml-basics'],
        position: { x: 200, y: 150 }
      },
      
      {
        id: 'ml-basics',
        title: 'Machine Learning',
        track: 'ai-ml',
        icon: '🤖',
        description: 'PyTorch, neural networks, and machine learning fundamentals.',
        prerequisites: ['algorithms-intro', 'numpy-pandas'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id >= 101 && l.id <= 120),
        depth: 'advanced',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 60,
        skillPoints: 300,
        connections: ['algorithms-intro', 'numpy-pandas', 'deep-learning'],
        position: { x: 350, y: 100 }
      },
      
      // Mastery Layer
      {
        id: 'deep-learning',
        title: 'Deep Learning',
        track: 'ai-ml',
        icon: '🧠',
        description: 'Advanced neural networks, CNNs, RNNs, and Transformers.',
        prerequisites: ['ml-basics'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id >= 121 && l.id <= 140),
        depth: 'mastery',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 80,
        skillPoints: 400,
        connections: ['ml-basics', 'llm-mastery'],
        position: { x: 250, y: 50 }
      },
      
      {
        id: 'llm-mastery',
        title: 'LLM Development',
        track: 'ai-ml',
        icon: '🚀',
        description: 'Build and fine-tune large language models like GPT.',
        prerequisites: ['deep-learning'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id >= 141),
        depth: 'expert',
        category: 'project',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 100,
        skillPoints: 500,
        connections: ['deep-learning'],
        position: { x: 150, y: 0 }
      }
    ];

    // Calculate progress and unlock status
    return graphNodes.map(node => {
      const nodeCompletedLessons = node.lessons.filter(lesson => 
        completedLessons.has(lesson.id)
      ).length;
      
      const progress = node.lessons.length > 0 
        ? (nodeCompletedLessons / node.lessons.length) * 100 
        : 0;
      
      const mastery = Math.min(progress * 1.2, 100);
      
      const unlocked = node.prerequisites.length === 0 || 
        node.prerequisites.every(prereqId => {
          const prereqNode = graphNodes.find(n => n.id === prereqId);
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
  }, [lessons, completedLessons]);

  // Initialize nodes
  useEffect(() => {
    setNodes(createGraphNodes());
  }, [createGraphNodes]);

  // Physics simulation for force-directed layout
  const updateForces = useCallback(() => {
    if (viewMode !== 'graph') return;

    setNodes(prevNodes => {
      const newNodes = [...prevNodes];
      const center = { x: 400, y: 300 };
      const repulsion = 100;
      const attraction = 0.01;
      const damping = 0.9;

      // Initialize velocities if not present
      newNodes.forEach(node => {
        if (!node.velocity) {
          node.velocity = { x: 0, y: 0 };
        }
      });

      // Apply forces
      for (let i = 0; i < newNodes.length; i++) {
        const node = newNodes[i];
        if (node.fixed) continue;

        let fx = 0, fy = 0;

        // Repulsion from other nodes
        for (let j = 0; j < newNodes.length; j++) {
          if (i === j) continue;
          const other = newNodes[j];
          const dx = node.position.x - other.position.x;
          const dy = node.position.y - other.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          if (distance < 200) {
            const force = repulsion / (distance * distance);
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        }

        // Attraction to connected nodes
        node.connections.forEach(connId => {
          const connected = newNodes.find(n => n.id === connId);
          if (connected) {
            const dx = connected.position.x - node.position.x;
            const dy = connected.position.y - node.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            fx += dx * attraction;
            fy += dy * attraction;
          }
        });

        // Spring force toward center
        const centerDx = center.x - node.position.x;
        const centerDy = center.y - node.position.y;
        fx += centerDx * 0.001;
        fy += centerDy * 0.001;

        // Update velocity and position
        node.velocity!.x = (node.velocity!.x + fx) * damping;
        node.velocity!.y = (node.velocity!.y + fy) * damping;
        
        node.position.x += node.velocity!.x;
        node.position.y += node.velocity!.y;

        // Keep within bounds
        node.position.x = Math.max(50, Math.min(750, node.position.x));
        node.position.y = Math.max(50, Math.min(550, node.position.y));
      }

      return newNodes;
    });
  }, [viewMode]);

  // Animation loop
  useEffect(() => {
    if (viewMode === 'graph') {
      const animate = () => {
        updateForces();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewMode, updateForces]);

  // Mouse handlers for dragging
  const handleMouseDown = (node: GraphNode, event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setDragNode(node);
    node.fixed = true;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && dragNode && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / transform.scale - transform.x;
      const y = (event.clientY - rect.top) / transform.scale - transform.y;
      
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === dragNode.id 
            ? { ...node, position: { x, y } }
            : node
        )
      );
    }
  };

  const handleMouseUp = () => {
    if (dragNode) {
      dragNode.fixed = false;
    }
    setIsDragging(false);
    setDragNode(null);
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
        </div>
      </div>

      <div className="graph-content">
        {viewMode === 'graph' ? (
          <svg 
            ref={svgRef}
            className="knowledge-graph-svg"
            viewBox="0 0 800 600"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
          {/* Connections */}
          <g className="connections">
            {filteredNodes.map(node => 
              node.connections.map(connId => {
                const connectedNode = nodes.find(n => n.id === connId);
                if (!connectedNode) return null;
                
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={connectedNode.position.x}
                    y2={connectedNode.position.y}
                    className={`connection ${selectedPath ? 'dimmed' : ''}`}
                    strokeWidth="2"
                    stroke={node.unlocked && connectedNode.unlocked ? '#ddd' : '#f0f0f0'}
                  />
                );
              })
            )}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {filteredNodes.map(node => (
              <g key={node.id} className={`node-group ${!node.unlocked ? 'locked' : ''}`}>
                {/* Node circle */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={30 + (node.mastery * 0.2)}
                  className={`skill-node depth-${node.depth} category-${node.category}`}
                  fill={node.unlocked ? `hsl(${node.progress * 1.2}, 70%, 60%)` : '#ccc'}
                  stroke={selectedNode?.id === node.id ? '#333' : '#fff'}
                  strokeWidth={selectedNode?.id === node.id ? 3 : 2}
                  onMouseDown={(e) => handleMouseDown(node, e)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
                
                {/* Node label */}
                <text
                  x={node.position.x}
                  y={node.position.y + 50}
                  textAnchor="middle"
                  className="node-label"
                  pointerEvents="none"
                >
                  {node.title}
                </text>
                
                {/* Progress indicator */}
                {node.progress > 0 && (
                  <circle
                    cx={node.position.x + 20}
                    cy={node.position.y - 20}
                    r="8"
                    fill="#4ecdc4"
                    className="progress-indicator"
                  />
                )}
              </g>
            ))}
          </g>
        </svg>
        ) : (
          <div className="skills-list">
            {filteredNodes.map(node => (
              <div 
                key={node.id} 
                className={`skill-card ${!node.unlocked ? 'locked' : ''}`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="skill-header">
                  <span className="skill-icon">{node.icon}</span>
                  <div className="skill-info">
                    <h3>{node.title}</h3>
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
            ))}
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