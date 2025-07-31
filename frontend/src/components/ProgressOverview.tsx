import React from 'react';
import { UserPreferences } from '../services/authService';
import { Lesson } from '../data/lessons';
import './ProgressOverview.css';

interface ProgressOverviewProps {
  userPreferences: UserPreferences | null;
  completedLessons: Set<number>;
  lessons: Lesson[];
}

interface TrackProgress {
  track: string;
  displayName: string;
  icon: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  userPreferences,
  completedLessons,
  lessons
}) => {
  const getTrackProgress = (): TrackProgress[] => {
    const tracks = [
      { track: 'beginner', displayName: 'Python Basics', icon: '🐍', color: '#22c55e' },
      { track: 'algorithms', displayName: 'Algorithms', icon: '⚡', color: '#3b82f6' },
      { track: 'data-science', displayName: 'Data Science', icon: '📊', color: '#8b5cf6' },
      { track: 'web-development', displayName: 'Web Dev', icon: '🌐', color: '#f59e0b' },
      { track: 'ai-ml', displayName: 'AI/ML', icon: '🤖', color: '#ef4444' }
    ];

    return tracks.map(({ track, displayName, icon, color }) => {
      const trackLessons = lessons.filter(l => l.track === track);
      const completedInTrack = trackLessons.filter(l => completedLessons.has(l.id)).length;
      const total = trackLessons.length;
      const percentage = total > 0 ? Math.round((completedInTrack / total) * 100) : 0;

      return {
        track,
        displayName,
        icon,
        completed: completedInTrack,
        total,
        percentage,
        color
      };
    }).filter(t => t.total > 0); // Only show tracks that have lessons
  };

  const getAchievements = (): Achievement[] => {
    const completedCount = completedLessons.size;
    const trackProgress = getTrackProgress();
    
    const achievements: Achievement[] = [
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👶',
        earned: completedCount >= 1
      },
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Complete 5 lessons',
        icon: '🚀',
        earned: completedCount >= 5,
        progress: Math.min(completedCount, 5),
        target: 5
      },
      {
        id: 'dedicated-learner',
        title: 'Dedicated Learner',
        description: 'Complete 10 lessons',
        icon: '📚',
        earned: completedCount >= 10,
        progress: Math.min(completedCount, 10),
        target: 10
      },
      {
        id: 'algorithm-explorer',
        title: 'Algorithm Explorer',
        description: 'Complete 3 algorithm challenges',
        icon: '🧩',
        earned: (trackProgress.find(t => t.track === 'algorithms')?.completed ?? 0) >= 3 || false,
        progress: Math.min(trackProgress.find(t => t.track === 'algorithms')?.completed ?? 0, 3),
        target: 3
      },
      {
        id: 'data-scientist',
        title: 'Data Scientist',
        description: 'Complete 5 data science lessons',
        icon: '🔬',
        earned: (trackProgress.find(t => t.track === 'data-science')?.completed ?? 0) >= 5 || false,
        progress: Math.min(trackProgress.find(t => t.track === 'data-science')?.completed || 0, 5),
        target: 5
      },
      {
        id: 'web-builder',
        title: 'Web Builder',
        description: 'Complete 3 web development lessons',
        icon: '🏗️',
        earned: (trackProgress.find(t => t.track === 'web-development')?.completed ?? 0) >= 3 || false,
        progress: Math.min(trackProgress.find(t => t.track === 'web-development')?.completed || 0, 3),
        target: 3
      },
      {
        id: 'ai-pioneer',
        title: 'AI Pioneer',
        description: 'Complete 3 AI/ML lessons',
        icon: '🤖',
        earned: (trackProgress.find(t => t.track === 'ai-ml')?.completed ?? 0) >= 3 || false,
        progress: Math.min(trackProgress.find(t => t.track === 'ai-ml')?.completed || 0, 3),
        target: 3
      },
      {
        id: 'completionist',
        title: 'Completionist',
        description: 'Complete 25 lessons',
        icon: '🏆',
        earned: completedCount >= 25,
        progress: Math.min(completedCount, 25),
        target: 25
      }
    ];

    return achievements;
  };

  const getOverallStats = () => {
    const totalLessons = lessons.length;
    const completedCount = completedLessons.size;
    const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    
    // Calculate difficulty distribution
    const beginnerCompleted = lessons.filter(l => l.difficulty === 'beginner' && completedLessons.has(l.id)).length;
    const intermediateCompleted = lessons.filter(l => l.difficulty === 'intermediate' && completedLessons.has(l.id)).length;
    const advancedCompleted = lessons.filter(l => l.difficulty === 'advanced' && completedLessons.has(l.id)).length;
    
    return {
      totalLessons,
      completedCount,
      overallProgress,
      beginnerCompleted,
      intermediateCompleted,
      advancedCompleted
    };
  };

  const trackProgress = getTrackProgress();
  const achievements = getAchievements();
  const earnedAchievements = achievements.filter(a => a.earned);
  const overallStats = getOverallStats();

  return (
    <div className="progress-overview">
      <div className="overview-header">
        <h2>📈 Your Progress</h2>
        <p>Track your learning journey across all Python skills.</p>
      </div>

      {/* Overall Stats */}
      <div className="overall-stats">
        <div className="stat-card main">
          <div className="stat-number">{overallStats.completedCount}</div>
          <div className="stat-label">Lessons Completed</div>
          <div className="stat-progress">
            <div 
              className="progress-bar"
              style={{ width: `${overallStats.overallProgress}%` }}
            />
          </div>
          <div className="stat-subtitle">{overallStats.overallProgress}% of all content</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{earnedAchievements.length}</div>
          <div className="stat-label">Achievements</div>
          <div className="stat-subtitle">out of {achievements.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{userPreferences?.skill_level || 'Beginner'}</div>
          <div className="stat-label">Current Level</div>
          <div className="stat-subtitle">Keep learning to advance!</div>
        </div>
      </div>

      {/* Track Progress */}
      <div className="track-progress-section">
        <h3>📚 Progress by Track</h3>
        <div className="track-progress-grid">
          {trackProgress.map((track) => (
            <div key={track.track} className="track-card">
              <div className="track-header">
                <div className="track-icon">{track.icon}</div>
                <div className="track-info">
                  <h4>{track.displayName}</h4>
                  <div className="track-stats">
                    {track.completed} / {track.total} lessons
                  </div>
                </div>
                <div className="track-percentage">{track.percentage}%</div>
              </div>
              <div className="track-progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${track.percentage}%`,
                    backgroundColor: track.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="difficulty-breakdown">
        <h3>🎯 Difficulty Mastery</h3>
        <div className="difficulty-grid">
          <div className="difficulty-card beginner">
            <div className="difficulty-icon">😊</div>
            <div className="difficulty-info">
              <h4>Beginner</h4>
              <div className="difficulty-count">{overallStats.beginnerCompleted} completed</div>
            </div>
          </div>
          <div className="difficulty-card intermediate">
            <div className="difficulty-icon">🤔</div>
            <div className="difficulty-info">
              <h4>Intermediate</h4>
              <div className="difficulty-count">{overallStats.intermediateCompleted} completed</div>
            </div>
          </div>
          <div className="difficulty-card advanced">
            <div className="difficulty-icon">🔥</div>
            <div className="difficulty-info">
              <h4>Advanced</h4>
              <div className="difficulty-count">{overallStats.advancedCompleted} completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h3>🏆 Achievements</h3>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.earned ? achievement.icon : '🔒'}
              </div>
              <div className="achievement-info">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                {!achievement.earned && achievement.progress !== undefined && achievement.target && (
                  <div className="achievement-progress">
                    <div className="progress-text">
                      {achievement.progress} / {achievement.target}
                    </div>
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill-small"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;