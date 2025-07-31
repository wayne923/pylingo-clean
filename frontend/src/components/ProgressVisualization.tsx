import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { spacedRepetitionService, LearningMetrics, ReviewItem } from '../services/spacedRepetitionService';
import './ProgressVisualization.css';

interface ProgressVisualizationProps {
  completedLessons: Set<number>;
  currentStreak: number;
  totalLessons: number;
  userLevel: string;
}

interface SkillNode {
  id: string;
  name: string;
  category: string;
  mastery: number;
  position: { x: number; y: number };
  dependencies: string[];
  isUnlocked: boolean;
  color: string;
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  completedLessons,
  currentStreak,
  totalLessons,
  userLevel
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'analytics' | 'review'>('overview');
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Mock data for demonstration - in real app, this would come from your backend
  const skillNodes: SkillNode[] = [
    // Python Fundamentals
    { id: 'variables', name: 'Variables', category: 'fundamentals', mastery: 95, position: { x: 100, y: 200 }, dependencies: [], isUnlocked: true, color: '#10b981' },
    { id: 'functions', name: 'Functions', category: 'fundamentals', mastery: 88, position: { x: 200, y: 150 }, dependencies: ['variables'], isUnlocked: true, color: '#10b981' },
    { id: 'loops', name: 'Loops', category: 'fundamentals', mastery: 92, position: { x: 200, y: 250 }, dependencies: ['variables'], isUnlocked: true, color: '#10b981' },
    
    // Data Structures
    { id: 'lists', name: 'Lists', category: 'data-structures', mastery: 85, position: { x: 300, y: 120 }, dependencies: ['functions'], isUnlocked: true, color: '#3b82f6' },
    { id: 'dictionaries', name: 'Dictionaries', category: 'data-structures', mastery: 78, position: { x: 300, y: 180 }, dependencies: ['functions'], isUnlocked: true, color: '#3b82f6' },
    { id: 'classes', name: 'Classes', category: 'data-structures', mastery: 65, position: { x: 300, y: 280 }, dependencies: ['loops'], isUnlocked: true, color: '#3b82f6' },
    
    // AI/ML
    { id: 'numpy', name: 'NumPy', category: 'ai-ml', mastery: 72, position: { x: 450, y: 100 }, dependencies: ['lists'], isUnlocked: true, color: '#8b5cf6' },
    { id: 'pytorch', name: 'PyTorch', category: 'ai-ml', mastery: 45, position: { x: 550, y: 150 }, dependencies: ['numpy'], isUnlocked: true, color: '#8b5cf6' },
    { id: 'transformers', name: 'Transformers', category: 'ai-ml', mastery: 25, position: { x: 650, y: 120 }, dependencies: ['pytorch'], isUnlocked: false, color: '#ef4444' },
    { id: 'attention', name: 'Attention', category: 'ai-ml', mastery: 15, position: { x: 650, y: 200 }, dependencies: ['pytorch'], isUnlocked: false, color: '#ef4444' },
    
    // Visualization
    { id: 'matplotlib', name: 'Matplotlib', category: 'visualization', mastery: 80, position: { x: 450, y: 250 }, dependencies: ['numpy'], isUnlocked: true, color: '#f59e0b' },
    { id: 'plotly', name: 'Plotly', category: 'visualization', mastery: 35, position: { x: 550, y: 300 }, dependencies: ['matplotlib'], isUnlocked: true, color: '#f59e0b' },
  ];

  useEffect(() => {
    // Simulate loading review items
    const mockReviewItems: ReviewItem[] = [
      spacedRepetitionService.initializeConcept(1, 'Variables', 0.2),
      spacedRepetitionService.initializeConcept(2, 'Functions', 0.4),
      spacedRepetitionService.initializeConcept(3, 'PyTorch Tensors', 0.8),
      spacedRepetitionService.initializeConcept(4, 'Attention Mechanism', 0.9),
    ];

    // Simulate some review history
    mockReviewItems.forEach((item, index) => {
      for (let i = 0; i < index + 2; i++) {
        const quality = Math.random() * 2 + 3; // 3-5 range
        const responseTime = 2000 + Math.random() * 5000;
        const contextualFactors = {
          timeOfDay: 10,
          studySessionLength: 30,
          previousPerformance: 0.8
        };
        const updatedItem = spacedRepetitionService.calculateNextReview(item, quality, responseTime, contextualFactors);
        Object.assign(item, updatedItem);
      }
    });

    setReviewItems(mockReviewItems);
    setLearningMetrics(spacedRepetitionService.calculateLearningMetrics(mockReviewItems));
  }, []);

  const getCompletionPercentage = () => {
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  const getNextMilestone = () => {
    const completion = getCompletionPercentage();
    if (completion < 25) return { target: 25, reward: '🎯 Fundamentals Badge' };
    if (completion < 50) return { target: 50, reward: '🚀 Intermediate Certificate' };
    if (completion < 75) return { target: 75, reward: '🧠 Advanced Recognition' };
    return { target: 100, reward: '🏆 AI Master Achievement' };
  };

  const skillCategories = [
    { id: 'fundamentals', name: 'Python Fundamentals', color: '#10b981', icon: '🐍' },
    { id: 'data-structures', name: 'Data Structures', color: '#3b82f6', icon: '📊' },
    { id: 'ai-ml', name: 'AI & Machine Learning', color: '#8b5cf6', icon: '🤖' },
    { id: 'visualization', name: 'Data Visualization', color: '#f59e0b', icon: '📈' }
  ];

  const renderSkillMap = () => (
    <div className="skill-map">
      <svg width="800" height="400" viewBox="0 0 800 400">
        {/* Connection lines */}
        {skillNodes.map(node => 
          node.dependencies.map(depId => {
            const depNode = skillNodes.find(n => n.id === depId);
            if (!depNode) return null;
            
            return (
              <motion.line
                key={`${depId}-${node.id}`}
                x1={depNode.position.x + 25}
                y1={depNode.position.y + 25}
                x2={node.position.x + 25}
                y2={node.position.y + 25}
                stroke={node.isUnlocked ? '#4f46e5' : '#64748b'}
                strokeWidth="2"
                strokeDasharray={node.isUnlocked ? "0" : "5,5"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            );
          })
        )}

        {/* Skill nodes */}
        {skillNodes.map((node, index) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredSkill(node.id)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <circle
              cx={node.position.x + 25}
              cy={node.position.y + 25}
              r="25"
              fill={node.isUnlocked ? node.color : '#64748b'}
              stroke={hoveredSkill === node.id ? '#ffffff' : 'transparent'}
              strokeWidth="3"
              className="skill-node"
            />
            
            {/* Mastery ring */}
            <circle
              cx={node.position.x + 25}
              cy={node.position.y + 25}
              r="30"
              fill="none"
              stroke={node.color}
              strokeWidth="3"
              strokeDasharray={`${(node.mastery / 100) * 188.5} 188.5`}
              strokeDashoffset="0"
              opacity={node.isUnlocked ? 1 : 0.3}
              transform={`rotate(-90 ${node.position.x + 25} ${node.position.y + 25})`}
            />
            
            <text
              x={node.position.x + 25}
              y={node.position.y + 30}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="600"
            >
              {node.mastery}%
            </text>
            
            <text
              x={node.position.x + 25}
              y={node.position.y + 70}
              textAnchor="middle"
              fill={node.isUnlocked ? '#1f2937' : '#64748b'}
              fontSize="11"
              fontWeight="500"
            >
              {node.name}
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Skill details tooltip */}
      {hoveredSkill && (
        <motion.div
          className="skill-tooltip"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {(() => {
            const skill = skillNodes.find(n => n.id === hoveredSkill);
            if (!skill) return null;
            return (
              <div>
                <h4>{skill.name}</h4>
                <p>Mastery: {skill.mastery}%</p>
                <p>Category: {skill.category}</p>
                <p>Status: {skill.isUnlocked ? '🟢 Unlocked' : '🔒 Locked'}</p>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="progress-visualization">
      <div className="progress-header">
        <div className="user-level-badge">
          <span className="level-icon">🏆</span>
          <span className="level-text">{userLevel} Developer</span>
        </div>
        
        <div className="streak-display">
          <span className="streak-icon">🔥</span>
          <span className="streak-number">{currentStreak}</span>
          <span className="streak-label">day streak</span>
        </div>
      </div>

      <div className="progress-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'skills', label: 'Skill Map', icon: '🗺️' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'review', label: 'Review', icon: '🔄' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`progress-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="progress-content">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              className="overview-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="overview-grid">
                <div className="progress-card main-progress">
                  <h3>Overall Progress</h3>
                  <div className="circular-progress">
                    <svg width="120" height="120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                        animate={{ 
                          strokeDashoffset: 2 * Math.PI * 50 - (getCompletionPercentage() / 100) * 2 * Math.PI * 50 
                        }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        transform="rotate(-90 60 60)"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="progress-text">
                      <span className="progress-percentage">{getCompletionPercentage()}%</span>
                      <span className="progress-label">Complete</span>
                    </div>
                  </div>
                  <div className="lessons-completed">
                    {completedLessons.size} / {totalLessons} lessons completed
                  </div>
                </div>

                <div className="progress-card milestone">
                  <h3>Next Milestone</h3>
                  <div className="milestone-info">
                    <div className="milestone-progress">
                      <div 
                        className="milestone-fill"
                        style={{ width: `${(getCompletionPercentage() / getNextMilestone().target) * 100}%` }}
                      />
                    </div>
                    <div className="milestone-details">
                      <span className="milestone-reward">{getNextMilestone().reward}</span>
                      <span className="milestone-target">
                        {getNextMilestone().target - getCompletionPercentage()}% to go
                      </span>
                    </div>
                  </div>
                </div>

                <div className="progress-card categories">
                  <h3>Learning Categories</h3>
                  <div className="category-list">
                    {skillCategories.map(category => {
                      const categorySkills = skillNodes.filter(n => n.category === category.id);
                      const avgMastery = categorySkills.reduce((sum, n) => sum + n.mastery, 0) / categorySkills.length;
                      
                      return (
                        <div key={category.id} className="category-item">
                          <div className="category-header">
                            <span className="category-icon">{category.icon}</span>
                            <span className="category-name">{category.name}</span>
                            <span className="category-mastery">{Math.round(avgMastery)}%</span>
                          </div>
                          <div className="category-progress">
                            <div 
                              className="category-fill"
                              style={{ 
                                width: `${avgMastery}%`,
                                backgroundColor: category.color
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {learningMetrics && (
                  <div className="progress-card insights">
                    <h3>Learning Insights</h3>
                    <div className="insights-list">
                      <div className="insight-item">
                        <span className="insight-icon">🎯</span>
                        <span className="insight-text">
                          {learningMetrics.retentionRate}% retention rate
                        </span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-icon">⚡</span>
                        <span className="insight-text">
                          {learningMetrics.conceptsMastered} concepts mastered
                        </span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-icon">📅</span>
                        <span className="insight-text">
                          {learningMetrics.suggestedReviewTime} min daily review
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              className="skills-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="skills-header">
                <h3>Your Skill Development Path</h3>
                <p>Interactive map showing your progress through Python and AI concepts</p>
              </div>
              {renderSkillMap()}
              
              <div className="skill-legend">
                <h4>Legend</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-circle unlocked" />
                    <span>Unlocked & In Progress</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-circle locked" />
                    <span>Locked (Complete prerequisites)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-ring" />
                    <span>Mastery Level (outer ring)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && learningMetrics && (
            <motion.div
              key="analytics"
              className="analytics-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Learning Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">{learningMetrics.retentionRate}%</div>
                      <div className="stat-label">Retention Rate</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{learningMetrics.averageInterval}</div>
                      <div className="stat-label">Avg Review Interval</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{learningMetrics.conceptsMastered}</div>
                      <div className="stat-label">Concepts Mastered</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{learningMetrics.streakDays}</div>
                      <div className="stat-label">Current Streak</div>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Areas for Improvement</h3>
                  <div className="weak-concepts">
                    {learningMetrics.weakConcepts.map(concept => (
                      <div key={concept.id} className="concept-item weak">
                        <span className="concept-name">{concept.conceptName}</span>
                        <span className="concept-mastery">{concept.conceptMastery}%</span>
                        <div className="concept-bar">
                          <div 
                            className="concept-fill"
                            style={{ width: `${concept.conceptMastery}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Strong Areas</h3>
                  <div className="strong-concepts">
                    {learningMetrics.strongConcepts.map(concept => (
                      <div key={concept.id} className="concept-item strong">
                        <span className="concept-name">{concept.conceptName}</span>
                        <span className="concept-mastery">{concept.conceptMastery}%</span>
                        <div className="concept-bar">
                          <div 
                            className="concept-fill"
                            style={{ width: `${concept.conceptMastery}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'review' && learningMetrics && (
            <motion.div
              key="review"
              className="review-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="review-header">
                <h3>Spaced Repetition Review</h3>
                <p>Optimize your learning with scientifically-backed review scheduling</p>
              </div>

              <div className="review-stats">
                <div className="review-stat">
                  <span className="stat-number">{spacedRepetitionService.getItemsDueForReview(reviewItems).length}</span>
                  <span className="stat-label">Due for Review</span>
                </div>
                <div className="review-stat">
                  <span className="stat-number">{learningMetrics.suggestedReviewTime}</span>
                  <span className="stat-label">Suggested Minutes</span>
                </div>
                <div className="review-stat">
                  <span className="stat-number">{learningMetrics.retentionRate}%</span>
                  <span className="stat-label">Retention Rate</span>
                </div>
              </div>

              <div className="recommendations">
                <h4>Personalized Recommendations</h4>
                <div className="recommendation-list">
                  {spacedRepetitionService.getPersonalizedRecommendations(learningMetrics, reviewItems).map((rec, index) => (
                    <motion.div
                      key={index}
                      className="recommendation-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {rec}
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                className="start-review-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Review Session 🚀
              </motion.button>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default ProgressVisualization;