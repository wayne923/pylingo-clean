import React, { useState, useRef } from 'react';
import { UserPreferences } from '../services/authService';
import { Lesson } from '../data/lessons';
import './EnhancedSkillTree.css';

interface EnhancedSkillTreeProps {
  userPreferences: UserPreferences | null;
  completedLessons: Set<number>;
  onStartLesson: (lessonId: number, track: string) => void;
  lessons: Lesson[];
}

interface SkillNode {
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
  mastery: number; // 0-100 for visual effects
  nextLesson?: Lesson;
  estimatedHours: number;
  skillPoints: number;
  connections: string[]; // Connected skill IDs
  position: { x: number; y: number }; // For tree layout
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  color: string;
  nodes: string[];
  estimatedWeeks: number;
}

const EnhancedSkillTree: React.FC<EnhancedSkillTreeProps> = ({
  userPreferences,
  completedLessons,
  onStartLesson,
  lessons
}) => {
  // Debug logging
  console.log('🌌 EnhancedSkillTree rendering!', { lessons: lessons.length, completedLessons: completedLessons.size });
  
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'constellation' | 'roadmap' | 'focus'>('constellation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [centerNode, setCenterNode] = useState<string>('python-basics');
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create enhanced skill nodes with better categorization and relationships
  const createEnhancedSkillNodes = (): SkillNode[] => {
    const nodes: SkillNode[] = [
      // Foundation Layer - Center of the tree
      {
        id: 'python-basics',
        title: 'Python Core',
        track: 'beginner',
        icon: '🐍',
        description: 'Master Python fundamentals: syntax, data types, control flow, and functions.',
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
        position: { x: 0, y: 0 }
      },
      
      // Core Layer - First ring around foundation
      {
        id: 'data-structures',
        title: 'Data Structures',
        track: 'beginner',
        icon: '📊',
        description: 'Lists, dictionaries, sets, and tuples. The building blocks of all programs.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'beginner' && l.id > 5),
        depth: 'core',
        category: 'technical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 15,
        skillPoints: 150,
        connections: ['algorithms-intro', 'data-analysis', 'database-ops'],
        position: { x: -200, y: -150 }
      },
      
      {
        id: 'algorithms-intro',
        title: 'Algorithm Thinking',
        track: 'algorithms',
        icon: '🧠',
        description: 'Problem-solving patterns, complexity analysis, and algorithmic reasoning.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'algorithms' && l.difficulty === 'beginner'),
        depth: 'core',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 25,
        skillPoints: 200,
        connections: ['advanced-algorithms', 'data-structures', 'optimization'],
        position: { x: 200, y: -150 }
      },
      
      {
        id: 'web-basics',
        title: 'Web Foundations',
        track: 'web-development',
        icon: '🌐',
        description: 'HTTP, APIs, and web fundamentals. Bridge to full-stack development.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'web-development' && l.id <= 25),
        depth: 'core',
        category: 'practical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 18,
        skillPoints: 175,
        connections: ['full-stack', 'api-design', 'database-ops'],
        position: { x: 0, y: 200 }
      },
      
      // Advanced Layer - Second ring
      {
        id: 'advanced-algorithms',
        title: 'Advanced Algorithms',
        track: 'algorithms',
        icon: '⚡',
        description: 'Dynamic programming, graph algorithms, and competitive programming techniques.',
        prerequisites: ['algorithms-intro', 'data-structures'],
        lessons: lessons.filter(l => l.track === 'algorithms' && l.difficulty === 'intermediate'),
        depth: 'advanced',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 35,
        skillPoints: 300,
        connections: ['optimization', 'ai-algorithms', 'system-design'],
        position: { x: 350, y: -200 }
      },
      
      {
        id: 'data-analysis',
        title: 'Data Analysis',
        track: 'data-science',
        icon: '📈',
        description: 'NumPy, Pandas, and statistical analysis. Transform raw data into insights.',
        prerequisites: ['data-structures'],
        lessons: lessons.filter(l => l.track === 'data-science' && l.id <= 20),
        depth: 'advanced',
        category: 'practical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 30,
        skillPoints: 250,
        connections: ['machine-learning', 'data-viz', 'big-data'],
        position: { x: -350, y: -100 }
      },
      
      {
        id: 'full-stack',
        title: 'Full-Stack Development',
        track: 'web-development',
        icon: '🏗️',
        description: 'Flask/Django, databases, and deployment. Build complete web applications.',
        prerequisites: ['web-basics', 'database-ops'],
        lessons: lessons.filter(l => l.track === 'web-development' && l.id > 25),
        depth: 'advanced',
        category: 'project',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 40,
        skillPoints: 350,
        connections: ['api-design', 'cloud-deployment', 'microservices'],
        position: { x: -150, y: 350 }
      },
      
      // Mastery Layer - Third ring
      {
        id: 'machine-learning',
        title: 'Machine Learning',
        track: 'ai-ml',
        icon: '🤖',
        description: 'Scikit-learn, neural networks, and predictive modeling.',
        prerequisites: ['data-analysis', 'algorithms-intro'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id <= 110),
        depth: 'mastery',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 45,
        skillPoints: 400,
        connections: ['deep-learning', 'nlp', 'computer-vision'],
        position: { x: -400, y: 150 }
      },
      
      {
        id: 'system-design',
        title: 'System Architecture',
        track: 'advanced',
        icon: '🏛️',
        description: 'Scalable systems, microservices, and distributed architecture.',
        prerequisites: ['advanced-algorithms', 'full-stack'],
        lessons: [],
        depth: 'mastery',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 50,
        skillPoints: 450,
        connections: ['cloud-architecture', 'performance-optimization'],
        position: { x: 200, y: 350 }
      },
      
      // Expert Layer - Outer ring
      {
        id: 'deep-learning',
        title: 'Deep Learning Mastery',
        track: 'ai-ml',
        icon: '🧬',
        description: 'PyTorch, transformers, and cutting-edge neural architectures.',
        prerequisites: ['machine-learning'],
        lessons: lessons.filter(l => l.track === 'ai-ml' && l.id > 110),
        depth: 'expert',
        category: 'theoretical',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 60,
        skillPoints: 500,
        connections: ['research-implementation', 'ai-systems'],
        position: { x: -550, y: 250 }
      },
      
      {
        id: 'research-implementation',
        title: 'AI Research & Papers',
        track: 'ai-ml',
        icon: '🔬',
        description: 'Implement cutting-edge research papers and contribute to the field.',
        prerequisites: ['deep-learning', 'advanced-algorithms'],
        lessons: [],
        depth: 'expert',
        category: 'project',
        unlocked: false,
        progress: 0,
        mastery: 0,
        estimatedHours: 80,
        skillPoints: 600,
        connections: [],
        position: { x: -500, y: 450 }
      }
    ];

    // Calculate progress and unlock status for each node
    return nodes.map(node => {
      const nodeCompletedLessons = node.lessons.filter(l => completedLessons.has(l.id));
      const progress = node.lessons.length > 0 ? (nodeCompletedLessons.length / node.lessons.length) * 100 : 0;
      
      // Calculate mastery (includes bonus for exceeding basic completion)
      const mastery = Math.min(100, progress * 1.2);
      
      // Advanced unlock logic with multiple pathways
      const unlocked = node.prerequisites.length === 0 || 
        node.prerequisites.some(prereqId => {
          const prereq = nodes.find(n => n.id === prereqId);
          return prereq ? prereq.progress >= 70 : false;
        }) ||
        completedLessons.size >= getUnlockThreshold(node.depth);

      const nextLesson = node.lessons.find(l => !completedLessons.has(l.id));

      return {
        ...node,
        progress,
        mastery,
        unlocked,
        nextLesson
      };
    });
  };

  // Define learning paths for guided progression
  const learningPaths: LearningPath[] = [
    {
      id: 'data-scientist',
      name: 'Data Scientist',
      description: 'From Python basics to machine learning mastery',
      color: '#8b5cf6',
      nodes: ['python-basics', 'data-structures', 'data-analysis', 'machine-learning', 'deep-learning'],
      estimatedWeeks: 16
    },
    {
      id: 'full-stack-dev',
      name: 'Full-Stack Developer',
      description: 'Build complete web applications from frontend to backend',
      color: '#3b82f6',
      nodes: ['python-basics', 'web-basics', 'database-ops', 'full-stack', 'api-design'],
      estimatedWeeks: 14
    },
    {
      id: 'algorithm-expert',
      name: 'Algorithm Expert',
      description: 'Master competitive programming and system design',
      color: '#f59e0b',
      nodes: ['python-basics', 'algorithms-intro', 'advanced-algorithms', 'optimization', 'system-design'],
      estimatedWeeks: 18
    },
    {
      id: 'ai-researcher',
      name: 'AI Researcher',
      description: 'Push the boundaries of artificial intelligence',
      color: '#ef4444',
      nodes: ['python-basics', 'data-analysis', 'machine-learning', 'deep-learning', 'research-implementation'],
      estimatedWeeks: 24
    }
  ];

  const getUnlockThreshold = (depth: string): number => {
    switch (depth) {
      case 'foundation': return 0;
      case 'core': return 3;
      case 'advanced': return 10;
      case 'mastery': return 25;
      case 'expert': return 50;
      default: return 0;
    }
  };

  const skillNodes = createEnhancedSkillNodes();
  
  // Filter nodes based on search and selected path
  const filteredNodes = skillNodes.filter(node => {
    const matchesSearch = searchQuery === '' || 
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPath = !selectedPath || 
      learningPaths.find(p => p.id === selectedPath)?.nodes.includes(node.id);
    
    return matchesSearch && matchesPath;
  });

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
    if (viewMode === 'focus') {
      setCenterNode(node.id);
    }
  };

  // Touch event handlers for mobile support
  const handleNodeTouch = (node: SkillNode, event: React.TouchEvent) => {
    event.preventDefault(); // Prevent unwanted scrolling/zooming
    setHoveredNode(node);
  };

  const handleNodeTouchEnd = (node: SkillNode, event: React.TouchEvent) => {
    event.preventDefault();
    handleNodeClick(node);
    // Clear hover state after a short delay on mobile
    setTimeout(() => setHoveredNode(null), 150);
  };

  const handleTouchLeave = () => {
    setHoveredNode(null);
  };

  const handleStartLearning = (node: SkillNode) => {
    if (node.nextLesson) {
      onStartLesson(node.nextLesson.id, node.track);
    } else if (node.lessons.length > 0) {
      onStartLesson(node.lessons[0].id, node.track);
    }
  };

  const getNodeColor = (node: SkillNode): string => {
    if (!node.unlocked) return '#9ca3af';
    
    switch (node.depth) {
      case 'foundation': return '#22c55e';
      case 'core': return '#3b82f6';
      case 'advanced': return '#8b5cf6';
      case 'mastery': return '#f59e0b';
      case 'expert': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderSkillNode = (node: SkillNode, index: number) => {
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;
    const isInPath = selectedPath && learningPaths.find(p => p.id === selectedPath)?.nodes.includes(node.id);
    
    return (
      <div
        key={node.id}
        className={`enhanced-skill-node ${node.depth} ${node.category} ${node.unlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isInPath ? 'in-path' : ''}`}
        style={{
          '--node-color': getNodeColor(node),
          '--mastery-level': `${node.mastery}%`,
          animationDelay: `${index * 0.1}s`
        } as React.CSSProperties}
        onClick={() => handleNodeClick(node)}
        onMouseEnter={() => setHoveredNode(node)}
        onMouseLeave={() => setHoveredNode(null)}
        onTouchStart={(e) => handleNodeTouch(node, e)}
        onTouchEnd={(e) => handleNodeTouchEnd(node, e)}
        onTouchCancel={handleTouchLeave}
      >
        <div className="node-glow" />
        <div className="node-content">
          <div className="node-icon">{node.icon}</div>
          <div className="node-title">{node.title}</div>
          <div className="node-progress">
            <div className="progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${node.progress * 1.13} 113`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span className="progress-text">{Math.round(node.progress)}%</span>
            </div>
          </div>
          <div className="node-meta">
            <span className="skill-points">+{node.skillPoints} XP</span>
            <span className="estimated-time">{node.estimatedHours}h</span>
          </div>
        </div>
        
        {node.mastery >= 100 && (
          <div className="mastery-effects">
            <div className="mastery-glow" />
            <div className="mastery-particles">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="particle" style={{ '--delay': `${i * 0.2}s` } as React.CSSProperties} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="enhanced-skill-tree" ref={containerRef}>
      {/* Debug Indicator */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'lime', color: 'black', padding: '5px', fontSize: '12px', zIndex: 9999 }}>
        ENHANCED SKILL TREE ACTIVE
      </div>
      
      {/* Header Controls */}
      <div className="skill-tree-header">
        <div className="header-left">
          <h2>🌌 Learning Universe</h2>
          <p>Chart your path to mastery through interconnected skills</p>
        </div>
        
        <div className="header-controls">
          {/* Search */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="skill-search"
            />
          </div>
          
          {/* Learning Paths */}
          <div className="path-selector">
            <select
              value={selectedPath || ''}
              onChange={(e) => setSelectedPath(e.target.value || null)}
              className="path-dropdown"
            >
              <option value="">All Skills</option>
              {learningPaths.map(path => (
                <option key={path.id} value={path.id}>
                  {path.name} ({path.estimatedWeeks}w)
                </option>
              ))}
            </select>
          </div>
          
          {/* View Mode */}
          <div className="view-controls">
            {['constellation', 'tree', 'roadmap', 'focus'].map(mode => (
              <button
                key={mode}
                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode as any)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setViewMode(mode as any);
                }}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
              >
                {mode === 'constellation' ? '🌌' : mode === 'tree' ? '🌳' : mode === 'roadmap' ? '🗺️' : '🎯'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="skill-tree-content">
        <div className={`skill-nodes-container ${viewMode}`}>
          {filteredNodes.map((node, index) => renderSkillNode(node, index))}
        </div>
        
        {/* Selected Path Visualization */}
        {selectedPath && (
          <div className="path-overlay">
            <svg className="path-connections" ref={svgRef}>
              {/* Connection lines will be drawn here via JavaScript */}
            </svg>
          </div>
        )}
      </div>

      {/* Skill Detail Panel */}
      {selectedNode && (
        <div className="enhanced-skill-detail">
          <div className="detail-header">
            <div className="detail-icon">{selectedNode.icon}</div>
            <div className="detail-info">
              <h3>{selectedNode.title}</h3>
              <div className="detail-badges">
                <span className={`depth-badge ${selectedNode.depth}`}>{selectedNode.depth}</span>
                <span className={`category-badge ${selectedNode.category}`}>{selectedNode.category}</span>
              </div>
            </div>
            <button 
              className="close-btn" 
              onClick={() => setSelectedNode(null)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setSelectedNode(null);
              }}
            >×</button>
          </div>
          
          <div className="detail-content">
            <p className="skill-description">{selectedNode.description}</p>
            
            <div className="skill-stats">
              <div className="stat">
                <span className="stat-label">Progress</span>
                <span className="stat-value">{Math.round(selectedNode.progress)}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Mastery</span>
                <span className="stat-value">{Math.round(selectedNode.mastery)}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Est. Time</span>
                <span className="stat-value">{selectedNode.estimatedHours}h</span>
              </div>
              <div className="stat">
                <span className="stat-label">Skill Points</span>
                <span className="stat-value">+{selectedNode.skillPoints} XP</span>
              </div>
            </div>
            
            {selectedNode.prerequisites.length > 0 && (
              <div className="prerequisites">
                <h4>Prerequisites</h4>
                <div className="prereq-list">
                  {selectedNode.prerequisites.map(prereqId => {
                    const prereq = skillNodes.find(n => n.id === prereqId);
                    return prereq ? (
                      <div key={prereqId} className={`prereq-item ${prereq.progress >= 70 ? 'completed' : 'pending'}`}>
                        <span className="prereq-icon">{prereq.icon}</span>
                        <span className="prereq-name">{prereq.title}</span>
                        <span className="prereq-progress">{Math.round(prereq.progress)}%</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {selectedNode.unlocked && selectedNode.nextLesson && (
              <div className="next-lesson">
                <h4>Continue Learning</h4>
                <div className="lesson-card">
                  <strong>{selectedNode.nextLesson.title}</strong>
                  <p>{selectedNode.nextLesson.description}</p>
                  <button
                    className="start-lesson-btn"
                    onClick={() => handleStartLearning(selectedNode)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleStartLearning(selectedNode);
                    }}
                  >
                    Start Lesson →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="skill-tree-legend">
        <div className="legend-item">
          <div className="legend-color foundation"></div>
          <span>Foundation</span>
        </div>
        <div className="legend-item">
          <div className="legend-color core"></div>
          <span>Core Skills</span>
        </div>
        <div className="legend-item">
          <div className="legend-color advanced"></div>
          <span>Advanced</span>
        </div>
        <div className="legend-item">
          <div className="legend-color mastery"></div>
          <span>Mastery</span>
        </div>
        <div className="legend-item">
          <div className="legend-color expert"></div>
          <span>Expert</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSkillTree;