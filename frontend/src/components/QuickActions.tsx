import React from 'react';
import { UserPreferences } from '../services/authService';
import { lessons } from '../data/lessons';
import './QuickActions.css';

interface QuickActionsProps {
  userPreferences: UserPreferences | null;
  completedLessons: Set<number>;
  onStartLesson: (lessonId: number, track: string) => void;
  selectedTrack: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  priority: 'primary' | 'secondary';
  lessonInfo?: {
    title: string;
    track: string;
    difficulty: string;
  };
}

const QuickActions: React.FC<QuickActionsProps> = ({
  userPreferences,
  completedLessons,
  onStartLesson,
  selectedTrack
}) => {
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];
    const completedCount = completedLessons.size;
    const skillLevel = userPreferences?.skill_level || 'beginner';
    const goals = userPreferences?.goals || [];

    // Find next lesson in current track
    const currentTrackLessons = lessons.filter(l => l.track === selectedTrack);
    const nextLesson = currentTrackLessons.find(l => !completedLessons.has(l.id));

    // Action 1: Continue current lesson/track
    if (nextLesson) {
      actions.push({
        id: 'continue-current',
        title: 'Continue Learning',
        description: `Resume with ${nextLesson.title}`,
        icon: '▶️',
        priority: 'primary',
        lessonInfo: {
          title: nextLesson.title,
          track: nextLesson.track,
          difficulty: nextLesson.difficulty
        },
        action: () => onStartLesson(nextLesson.id, nextLesson.track)
      });
    }

    // Action 2: Quick practice (algorithms)
    const algorithmLessons = lessons.filter(l => 
      l.track === 'algorithms' && !completedLessons.has(l.id)
    );
    if (algorithmLessons.length > 0 && completedCount >= 2) {
      const practiceLesson = algorithmLessons[0];
      actions.push({
        id: 'quick-practice',
        title: '5-Min Challenge',
        description: 'Quick coding challenge to sharpen skills',
        icon: '⚡',
        priority: 'secondary',
        lessonInfo: {
          title: practiceLesson.title,
          track: practiceLesson.track,
          difficulty: practiceLesson.difficulty
        },
        action: () => onStartLesson(practiceLesson.id, practiceLesson.track)
      });
    }

    // Action 3: Start new skill area
    const goalBasedTracks = goals.includes('data-science') ? 'data-science' :
                           goals.includes('web-development') ? 'web-development' :
                           goals.includes('ai-ml') ? 'ai-ml' : null;

    if (goalBasedTracks) {
      const goalLessons = lessons.filter(l => 
        l.track === goalBasedTracks && !completedLessons.has(l.id)
      );
      if (goalLessons.length > 0) {
        const goalLesson = goalLessons[0];
        actions.push({
          id: 'goal-based',
          title: 'Work Toward Goal',
          description: `Build skills in ${goalBasedTracks.replace('-', ' ')}`,
          icon: '🎯',
          priority: 'primary',
          lessonInfo: {
            title: goalLesson.title,
            track: goalLesson.track,
            difficulty: goalLesson.difficulty
          },
          action: () => onStartLesson(goalLesson.id, goalLesson.track)
        });
      }
    }

    // Action 4: Review fundamentals (if struggling or new)
    if (completedCount < 5 || skillLevel === 'beginner') {
      const beginnerLessons = lessons.filter(l => 
        l.track === 'beginner' && !completedLessons.has(l.id)
      );
      if (beginnerLessons.length > 0) {
        const reviewLesson = beginnerLessons[0];
        actions.push({
          id: 'review-basics',
          title: 'Strengthen Basics',
          description: 'Review fundamental concepts',
          icon: '🏗️',
          priority: 'secondary',
          lessonInfo: {
            title: reviewLesson.title,
            track: reviewLesson.track,
            difficulty: reviewLesson.difficulty
          },
          action: () => onStartLesson(reviewLesson.id, reviewLesson.track)
        });
      }
    }

    // Action 5: Explore something new
    const exploredTracks = new Set(
      lessons.filter(l => completedLessons.has(l.id)).map(l => l.track)
    );
    const unexploredTracks = ['algorithms', 'data-science', 'web-development', 'ai-ml']
      .filter(track => !exploredTracks.has(track));

    if (unexploredTracks.length > 0 && completedCount >= 3) {
      const randomTrack = unexploredTracks[Math.floor(Math.random() * unexploredTracks.length)];
      const exploreLessons = lessons.filter(l => l.track === randomTrack);
      if (exploreLessons.length > 0) {
        const exploreLesson = exploreLessons[0];
        actions.push({
          id: 'explore-new',
          title: 'Try Something New',
          description: `Explore ${randomTrack.replace('-', ' ')} concepts`,
          icon: '🌟',
          priority: 'secondary',
          lessonInfo: {
            title: exploreLesson.title,
            track: exploreLesson.track,
            difficulty: exploreLesson.difficulty
          },
          action: () => onStartLesson(exploreLesson.id, exploreLesson.track)
        });
      }
    }

    // Action 6: Daily challenge (if advanced enough)
    if (completedCount >= 10) {
      const challengeLessons = lessons.filter(l => 
        l.difficulty === 'hard' && !completedLessons.has(l.id)
      );
      if (challengeLessons.length > 0) {
        const challengeLesson = challengeLessons[0];
        actions.push({
          id: 'daily-challenge',
          title: 'Daily Challenge',
          description: 'Push your limits with a hard problem',
          icon: '🔥',
          priority: 'secondary',
          lessonInfo: {
            title: challengeLesson.title,
            track: challengeLesson.track,
            difficulty: challengeLesson.difficulty
          },
          action: () => onStartLesson(challengeLesson.id, challengeLesson.track)
        });
      }
    }

    return actions.slice(0, 6); // Limit to 6 actions
  };

  const quickActions = getQuickActions();

  if (quickActions.length === 0) {
    return (
      <div className="quick-actions">
        <h2>🚀 Quick Actions</h2>
        <div className="no-actions">
          <p>🎉 Congratulations! You've completed all available lessons. More content coming soon!</p>
        </div>
      </div>
    );
  }

  const primaryActions = quickActions.filter(a => a.priority === 'primary');
  const secondaryActions = quickActions.filter(a => a.priority === 'secondary');

  return (
    <div className="quick-actions">
      <div className="actions-header">
        <h2>🚀 Quick Actions</h2>
        <p>Jump right into learning with these personalized actions.</p>
      </div>

      {/* Primary Actions - Large Cards */}
      {primaryActions.length > 0 && (
        <div className="primary-actions">
          {primaryActions.map((action) => (
            <div key={action.id} className="action-card primary">
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                {action.lessonInfo && (
                  <div className="lesson-preview">
                    <strong>{action.lessonInfo.title}</strong>
                    <div className="lesson-meta">
                      <span className={`difficulty ${action.lessonInfo.difficulty}`}>
                        {action.lessonInfo.difficulty}
                      </span>
                      <span className="track">{action.lessonInfo.track}</span>
                    </div>
                  </div>
                )}
              </div>
              <button className="action-button primary" onClick={action.action}>
                Start Now →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Secondary Actions - Compact Grid */}
      {secondaryActions.length > 0 && (
        <div className="secondary-actions">
          <h3>More Options</h3>
          <div className="actions-grid">
            {secondaryActions.map((action) => (
              <div key={action.id} className="action-card secondary" onClick={action.action}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-info">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                  {action.lessonInfo && (
                    <div className="compact-lesson-info">
                      <span className={`difficulty ${action.lessonInfo.difficulty}`}>
                        {action.lessonInfo.difficulty}
                      </span>
                      <span className="lesson-title">{action.lessonInfo.title}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions-footer">
        <div className="motivation-message">
          <p>💪 <strong>You've got this!</strong> Every lesson brings you closer to your goals.</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;