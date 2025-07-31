import React, { useState, useEffect } from 'react';
import { gamificationService, UserGamification, StreakUpdate } from '../services/gamificationService';
import './GamificationStats.css';

interface GamificationStatsProps {
  onStreakUpdate?: (update: StreakUpdate) => void;
}

const GamificationStats: React.FC<GamificationStatsProps> = ({ onStreakUpdate }) => {
  const [gamificationData, setGamificationData] = useState<UserGamification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setIsLoading(true);
      const data = await gamificationService.getUserGamification();
      setGamificationData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load gamification data:', err);
      setError('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateStreak = async () => {
    try {
      const update = await gamificationService.updateStreak();
      
      // Refresh data to show updated values
      await loadGamificationData();
      
      // Notify parent component
      if (onStreakUpdate) {
        onStreakUpdate(update);
      }
      
      return update;
    } catch (err) {
      console.error('Failed to update streak:', err);
      setError('Failed to update streak');
      throw err;
    }
  };

  const getLevelProgress = () => {
    if (!gamificationData) return { current: 0, needed: 100, percentage: 0 };
    return gamificationService.calculateLevelProgress(
      gamificationData.total_xp,
      gamificationData.current_level
    );
  };

  if (isLoading) {
    return (
      <div className="gamification-stats loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !gamificationData) {
    return (
      <div className="gamification-stats error">
        <p>{error || 'No gamification data available'}</p>
      </div>
    );
  }

  const levelProgress = getLevelProgress();
  const streakMessage = gamificationService.getStreakMessage(gamificationData.current_streak);
  const levelTitle = gamificationService.getLevelTitle(gamificationData.current_level);

  return (
    <div className="gamification-stats">
      {/* Streak Counter */}
      <div className="stat-card streak-card">
        <div className="streak-icon">🔥</div>
        <div className="streak-content">
          <div className="streak-number">{gamificationData.current_streak}</div>
          <div className="streak-label">Day Streak</div>
          <div className="streak-message">{streakMessage}</div>
        </div>
      </div>

      {/* XP and Level */}
      <div className="stat-card xp-card">
        <div className="xp-header">
          <div className="level-info">
            <span className="level-number">Level {gamificationData.current_level}</span>
            <span className="level-title">{levelTitle}</span>
          </div>
          <div className="total-xp">{gamificationData.total_xp} XP</div>
        </div>
        
        <div className="xp-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${levelProgress.percentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {levelProgress.current} / {levelProgress.needed} XP to Level {gamificationData.current_level + 1}
          </div>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="stat-card record-card">
        <div className="record-icon">🏆</div>
        <div className="record-content">
          <div className="record-number">{gamificationData.longest_streak}</div>
          <div className="record-label">Best Streak</div>
        </div>
      </div>

      {/* Streak Freezes Available */}
      {gamificationData.streak_freeze_count > 0 && (
        <div className="stat-card freeze-card">
          <div className="freeze-icon">❄️</div>
          <div className="freeze-content">
            <div className="freeze-number">{gamificationData.streak_freeze_count}</div>
            <div className="freeze-label">Streak Freezes</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationStats;