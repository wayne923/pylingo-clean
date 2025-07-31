import React, { useState } from 'react';
import { UserPreferences } from '../services/authService';
import { Lesson } from '../data/lessons';
import './SkillTree.css';

interface SkillTreeProps {
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
  depth: 'basic' | 'intermediate' | 'advanced' | 'professional';
  unlocked: boolean;
  progress: number;
  nextLesson?: Lesson;
}

const SkillTree: React.FC<SkillTreeProps> = ({ 
  userPreferences, 
  completedLessons, 
  onStartLesson, 
  lessons 
}) => {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  const createSkillNodes = (): SkillNode[] => {
    const nodes: SkillNode[] = [
      // Foundation Level
      {
        id: 'python-basics',
        title: 'Python Foundations',
        track: 'beginner',
        icon: '🐍',
        description: 'Master Python fundamentals: variables, loops, functions, and basic data structures.',
        prerequisites: [],
        lessons: lessons.filter(l => l.track === 'beginner'),
        depth: 'basic',
        unlocked: true,
        progress: 0,
      },
      
      // Intermediate Paths
      {
        id: 'algorithms-ds',
        title: 'Algorithms & Data Structures',
        track: 'algorithms',
        icon: '⚡',
        description: 'Solve coding challenges and master algorithmic thinking. From Two Sum to graph algorithms.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'algorithms'),
        depth: 'intermediate',
        unlocked: false,
        progress: 0,
      },
      {
        id: 'data-science-path',
        title: 'Data Science Pipeline',
        track: 'data-science',
        icon: '📊',
        description: 'NumPy, Pandas, visualization, and statistical analysis. Build real data insights.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'data-science'),
        depth: 'intermediate',
        unlocked: false,
        progress: 0,
      },
      {
        id: 'web-development',
        title: 'Web Development',
        track: 'web-development',
        icon: '🌐',
        description: 'Flask, APIs, databases, and full-stack development.',
        prerequisites: ['python-basics'],
        lessons: lessons.filter(l => l.track === 'web-development'),
        depth: 'intermediate',
        unlocked: false,
        progress: 0,
      },
      
      // Advanced Paths  
      {
        id: 'ai-ml-mastery',
        title: 'AI/ML Engineering',
        track: 'ai-ml',
        icon: '🤖',
        description: 'PyTorch, transformers, LLMs. Build production AI systems like ChatGPT.',
        prerequisites: ['python-basics', 'data-science-path'],
        lessons: lessons.filter(l => l.track === 'ai-ml'),
        depth: 'advanced',
        unlocked: false,
        progress: 0,
      },
      
      // Professional Specializations
      {
        id: 'ml-research',
        title: 'ML Research & Papers',
        track: 'ai-ml',
        icon: '🔬',
        description: 'Implement cutting-edge research papers. Attention mechanisms, novel architectures.',
        prerequisites: ['ai-ml-mastery'],
        lessons: [], // Special advanced content
        depth: 'professional',
        unlocked: false,
        progress: 0,
      },
      {
        id: 'systems-design',
        title: 'ML Systems Design',
        track: 'advanced',
        icon: '🏗️',
        description: 'Production ML systems, scalability, MLOps. Google/OpenAI level engineering.',
        prerequisites: ['ai-ml-mastery', 'algorithms-ds'],
        lessons: [], // Special advanced content
        depth: 'professional',
        unlocked: false,
        progress: 0,
      }
    ];

    // Calculate progress and unlock status
    return nodes.map(node => {
      const nodeCompletedLessons = node.lessons.filter(l => completedLessons.has(l.id));
      const progress = node.lessons.length > 0 ? (nodeCompletedLessons.length / node.lessons.length) * 100 : 0;
      
      // Check if prerequisites are met
      const unlocked = node.prerequisites.length === 0 || 
        node.prerequisites.every(prereqId => {
          const prereq = nodes.find(n => n.id === prereqId);
          return prereq ? prereq.progress >= 70 : false; // Need 70% completion
        });

      // Find next lesson
      const nextLesson = node.lessons.find(l => !completedLessons.has(l.id));

      return {
        ...node,
        progress,
        unlocked: unlocked || completedLessons.size >= getUnlockThreshold(node.depth),
        nextLesson
      };
    });
  };

  const getUnlockThreshold = (depth: string): number => {
    switch (depth) {
      case 'basic': return 0;
      case 'intermediate': return 3;
      case 'advanced': return 15;
      case 'professional': return 50;
      default: return 0;
    }
  };

  const getDepthColor = (depth: string): string => {
    switch (depth) {
      case 'basic': return '#22c55e';
      case 'intermediate': return '#3b82f6';
      case 'advanced': return '#8b5cf6';
      case 'professional': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const skillNodes = createSkillNodes();

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
  };

  const handleStartLearning = (node: SkillNode) => {
    if (node.nextLesson) {
      onStartLesson(node.nextLesson.id, node.track);
    }
  };

  return (
    <div className="skill-tree">
      <div className="skill-tree-header">
        <h2>🌳 Your Learning Journey</h2>
        <p>Unlock advanced skills by mastering the fundamentals. Each path builds on previous knowledge.</p>
        
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            🌳 Tree View
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
        </div>
      </div>

      <div className="skill-tree-content">
        {viewMode === 'tree' ? (
          <div className="tree-view">
            <div className="skill-grid">
              {skillNodes.map((node) => (
                <div 
                  key={node.id}
                  className={`skill-node ${node.unlocked ? 'unlocked' : 'locked'} ${selectedNode?.id === node.id ? 'selected' : ''}`}
                  onClick={() => handleNodeClick(node)}
                  style={{ borderColor: getDepthColor(node.depth) }}
                >
                  <div className="node-icon">{node.icon}</div>
                  <div className="node-title">{node.title}</div>
                  <div className="node-progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${node.progress}%`,
                        backgroundColor: getDepthColor(node.depth)
                      }}
                    />
                  </div>
                  <div className="node-stats">
                    {node.unlocked ? (
                      <span className="progress-text">{Math.round(node.progress)}% complete</span>
                    ) : (
                      <span className="locked-text">🔒 Locked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="list-view">
            {skillNodes.map((node) => (
              <div 
                key={node.id}
                className={`skill-card ${node.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="card-header">
                  <div className="card-icon">{node.icon}</div>
                  <div className="card-info">
                    <h3>{node.title}</h3>
                    <div className="depth-badge" style={{ backgroundColor: getDepthColor(node.depth) }}>
                      {node.depth}
                    </div>
                  </div>
                  <div className="card-progress">
                    {Math.round(node.progress)}%
                  </div>
                </div>
                <p className="card-description">{node.description}</p>
                {node.unlocked && node.nextLesson && (
                  <button 
                    className="start-btn"
                    onClick={() => handleStartLearning(node)}
                  >
                    Continue: {node.nextLesson.title}
                  </button>
                )}
                {!node.unlocked && (
                  <div className="prerequisites">
                    <small>Requires: {node.prerequisites.join(', ') || 'Complete more lessons'}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Panel */}
        {selectedNode && (
          <div className="skill-detail-panel">
            <div className="detail-header">
              <div className="detail-icon">{selectedNode.icon}</div>
              <div>
                <h3>{selectedNode.title}</h3>
                <div className="depth-badge" style={{ backgroundColor: getDepthColor(selectedNode.depth) }}>
                  {selectedNode.depth} level
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedNode(null)}>×</button>
            </div>
            
            <div className="detail-content">
              <p>{selectedNode.description}</p>
              
              <div className="detail-stats">
                <div className="stat">
                  <strong>Progress:</strong> {Math.round(selectedNode.progress)}%
                </div>
                <div className="stat">
                  <strong>Lessons:</strong> {selectedNode.lessons.length}
                </div>
                <div className="stat">
                  <strong>Status:</strong> {selectedNode.unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                </div>
              </div>

              {selectedNode.unlocked && selectedNode.nextLesson && (
                <div className="next-lesson">
                  <h4>Next Up:</h4>
                  <div className="lesson-preview">
                    <strong>{selectedNode.nextLesson.title}</strong>
                    <p>{selectedNode.nextLesson.description}</p>
                  </div>
                  <button 
                    className="primary-action-btn"
                    onClick={() => handleStartLearning(selectedNode)}
                  >
                    Start Lesson →
                  </button>
                </div>
              )}

              {!selectedNode.unlocked && (
                <div className="unlock-requirements">
                  <h4>Unlock Requirements:</h4>
                  <ul>
                    {selectedNode.prerequisites.map(prereq => (
                      <li key={prereq}>Complete {prereq.replace('-', ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTree;