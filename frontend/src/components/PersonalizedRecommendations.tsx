import React from 'react';
import { UserPreferences } from '../services/authService';
import { Lesson } from '../data/lessons';
import './PersonalizedRecommendations.css';

interface PersonalizedRecommendationsProps {
  userPreferences: UserPreferences | null;
  completedLessons: Set<number>;
  onStartLesson: (lessonId: number, track: string) => void;
  lessons: Lesson[];
}

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  lessons: Lesson[];
  priority: 'high' | 'medium' | 'low';
  type: 'continue' | 'new_skill' | 'review' | 'challenge';
  icon: string;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  userPreferences,
  completedLessons,
  onStartLesson,
  lessons
}) => {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const completedCount = completedLessons.size;
    const skillLevel = userPreferences?.skill_level || 'beginner';
    const goals = userPreferences?.goals || [];
    const experience = userPreferences?.experience || 'no-programming';

    // Recommendation 1: Continue current track
    const incompleteLessons = lessons.filter(l => !completedLessons.has(l.id));
    if (incompleteLessons.length > 0) {
      const nextLesson = incompleteLessons[0];
      recommendations.push({
        id: 'continue-learning',
        title: 'Continue Your Journey',
        reason: `Pick up where you left off with ${nextLesson.title}`,
        lessons: [nextLesson],
        priority: 'high',
        type: 'continue',
        icon: '🎯'
      });
    }

    // Recommendation 2: Based on goals
    if (goals.includes('data-science') || goals.includes('ai-ml')) {
      const dataLessons = lessons.filter(l => 
        l.track === 'data-science' || l.track === 'ai-ml'
      ).filter(l => !completedLessons.has(l.id)).slice(0, 3);
      
      if (dataLessons.length > 0) {
        recommendations.push({
          id: 'goal-based-ds',
          title: 'Master Data Science',
          reason: 'Based on your learning goals',
          lessons: dataLessons,
          priority: 'high',
          type: 'new_skill',
          icon: '📊'
        });
      }
    }

    if (goals.includes('web-development')) {
      const webLessons = lessons.filter(l => l.track === 'web-development')
        .filter(l => !completedLessons.has(l.id)).slice(0, 3);
      
      if (webLessons.length > 0) {
        recommendations.push({
          id: 'goal-based-web',
          title: 'Build Web Applications',
          reason: 'Perfect for your web development goals',
          lessons: webLessons,
          priority: 'high',
          type: 'new_skill',
          icon: '🌐'
        });
      }
    }

    // Recommendation 3: Skill level appropriate challenges
    if (completedCount >= 5 && skillLevel !== 'beginner') {
      const challengeLessons = lessons.filter(l => 
        l.track === 'algorithms' && l.difficulty === 'intermediate'
      ).filter(l => !completedLessons.has(l.id)).slice(0, 2);
      
      if (challengeLessons.length > 0) {
        recommendations.push({
          id: 'challenge-yourself',
          title: 'Challenge Yourself',
          reason: 'Ready for more complex problems',
          lessons: challengeLessons,
          priority: 'medium',
          type: 'challenge',
          icon: '⚡'
        });
      }
    }

    // Recommendation 4: Foundation strengthening
    if (experience === 'no-programming' && completedCount < 10) {
      const foundationLessons = lessons.filter(l => 
        l.track === 'beginner' && l.difficulty === 'beginner'
      ).filter(l => !completedLessons.has(l.id)).slice(0, 3);
      
      if (foundationLessons.length > 0) {
        recommendations.push({
          id: 'strengthen-foundation',
          title: 'Strengthen Your Foundation',
          reason: 'Build solid Python fundamentals',
          lessons: foundationLessons,
          priority: 'medium',
          type: 'continue',
          icon: '🏗️'
        });
      }
    }

    // Recommendation 5: Explore new areas
    const exploredTracks = new Set(
      lessons.filter(l => completedLessons.has(l.id)).map(l => l.track)
    );
    const unexploredTracks = ['algorithms', 'data-science', 'web-development', 'ai-ml']
      .filter(track => !exploredTracks.has(track));
    
    if (unexploredTracks.length > 0 && completedCount >= 3) {
      const randomTrack = unexploredTracks[Math.floor(Math.random() * unexploredTracks.length)];
      const exploreLessons = lessons.filter(l => l.track === randomTrack)
        .filter(l => !completedLessons.has(l.id)).slice(0, 2);
      
      if (exploreLessons.length > 0) {
        recommendations.push({
          id: 'explore-new',
          title: `Explore ${randomTrack.replace('-', ' ').toUpperCase()}`,
          reason: 'Expand your programming horizons',
          lessons: exploreLessons,
          priority: 'low',
          type: 'new_skill',
          icon: '🌟'
        });
      }
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getTypeDescription = (type: string): string => {
    switch (type) {
      case 'continue': return 'Continue Progress';
      case 'new_skill': return 'New Skill';
      case 'review': return 'Review & Practice';
      case 'challenge': return 'Challenge Mode';
      default: return 'Recommended';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="personalized-recommendations">
        <h2>🎯 Personalized for You</h2>
        <div className="no-recommendations">
          <p>🎉 You're doing great! Keep exploring the skill tree to discover new challenges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="personalized-recommendations">
      <div className="recommendations-header">
        <h2>🎯 Personalized for You</h2>
        <p>Smart recommendations based on your goals, progress, and learning style.</p>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((rec) => (
          <div key={rec.id} className={`recommendation-card ${rec.type}`}>
            <div className="card-header">
              <div className="card-icon">{rec.icon}</div>
              <div className="card-title-section">
                <h3>{rec.title}</h3>
                <div className="card-meta">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(rec.priority) }}
                  >
                    {getTypeDescription(rec.type)}
                  </span>
                  <span className="lesson-count">
                    {rec.lessons.length} lesson{rec.lessons.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <p className="recommendation-reason">{rec.reason}</p>

            <div className="recommended-lessons">
              {rec.lessons.slice(0, 2).map((lesson) => (
                <div key={lesson.id} className="lesson-preview">
                  <div className="lesson-info">
                    <strong>{lesson.title}</strong>
                    <div className="lesson-meta">
                      <span className={`difficulty ${lesson.difficulty}`}>
                        {lesson.difficulty}
                      </span>
                      <span className="lesson-track">{lesson.track}</span>
                    </div>
                  </div>
                  <button
                    className="start-lesson-btn"
                    onClick={() => onStartLesson(lesson.id, lesson.track)}
                  >
                    Start →
                  </button>
                </div>
              ))}
              
              {rec.lessons.length > 2 && (
                <div className="more-lessons">
                  +{rec.lessons.length - 2} more lessons in this track
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations-footer">
        <p>💡 <strong>Tip:</strong> These recommendations update based on your progress and preferences.</p>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;