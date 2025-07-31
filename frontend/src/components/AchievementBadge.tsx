import React from 'react';
import './AchievementBadge.css';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  return (
    <div className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
      <div className="achievement-icon">
        {achievement.unlocked ? achievement.icon : '🔒'}
      </div>
      <div className="achievement-info">
        <h4 className="achievement-title">{achievement.title}</h4>
        <p className="achievement-description">{achievement.description}</p>
        {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
          <div className="achievement-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="progress-text">
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;