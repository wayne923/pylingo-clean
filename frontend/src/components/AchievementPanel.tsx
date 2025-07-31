import React, { useState } from 'react';
import AchievementBadge from './AchievementBadge';
import { calculateAchievements } from '../utils/achievements';
import './AchievementPanel.css';

interface AchievementPanelProps {
  completedLessons: Set<number>;
  totalLessons: number;
  currentStreak: number;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({ 
  completedLessons, 
  totalLessons, 
  currentStreak 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const achievements = calculateAchievements(completedLessons, currentStreak, totalLessons);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="achievement-panel">
      <div 
        className="achievement-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>🏆 Achievements</h3>
        <div className="achievement-summary">
          <span className="unlocked-count">{unlockedCount}/{achievements.length}</span>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="achievement-list">
          {achievements.map(achievement => (
            <AchievementBadge 
              key={achievement.id} 
              achievement={achievement} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementPanel;