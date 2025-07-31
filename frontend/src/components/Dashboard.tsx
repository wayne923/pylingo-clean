import React, { useState, useEffect } from 'react';
import { authService, UserPreferences } from '../services/authService';
import { lessons } from '../data/lessons';
import KnowledgeGraph from './KnowledgeGraph';
import PersonalizedRecommendations from './PersonalizedRecommendations';
import QuickActions from './QuickActions';
import ProgressOverview from './ProgressOverview';
import GamificationStats from './GamificationStats';
import { StreakUpdate } from '../services/gamificationService';
import './Dashboard.css';

interface DashboardProps {
  user: any;
  completedLessons: Set<number>;
  currentLessonId: number;
  onStartLesson: (lessonId: number, track: string) => void;
  selectedTrack: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  completedLessons, 
  currentLessonId, 
  onStartLesson,
  selectedTrack 
}) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'skillTree' | 'recommendations'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastStreakUpdate, setLastStreakUpdate] = useState<StreakUpdate | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const preferences = await authService.getUserPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    if (!userPreferences) return `${timeGreeting}, ${user.username}!`;
    
    const primaryGoal = userPreferences.goals?.[0] || 'general learning';
    
    return `${timeGreeting}, ${user.username}! Ready to level up your ${primaryGoal} skills?`;
  };

  const getNextAction = () => {
    if (!userPreferences) return null;
    
    const completedCount = completedLessons.size;
    const skillLevel = userPreferences.skill_level || 'beginner';
    
    if (completedCount === 0) {
      return {
        title: "Start Your Journey",
        description: `Begin with your first ${skillLevel} lesson`,
        action: "Start Learning",
        urgent: true
      };
    } else if (completedCount < 5) {
      return {
        title: "Build Momentum",
        description: `Complete ${5 - completedCount} more lessons to unlock new features`,
        action: "Continue Learning",
        urgent: false
      };
    } else {
      return {
        title: "Explore New Territory",
        description: "You've built solid foundations. Ready for a challenge?",
        action: "Unlock Advanced Content",
        urgent: false
      };
    }
  };

  const handleStreakUpdate = (update: StreakUpdate) => {
    setLastStreakUpdate(update);
    
    // Show level up notification if applicable
    if (update.level_up && update.new_level) {
      // Could add a toast notification here
      console.log(`Level up! Welcome to level ${update.new_level}!`);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Personalizing your learning experience...</p>
      </div>
    );
  }

  const nextAction = getNextAction();

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{getPersonalizedGreeting()}</h1>
            {nextAction && (
              <div className={`next-action ${nextAction.urgent ? 'urgent' : ''}`}>
                <h2>{nextAction.title}</h2>
                <p>{nextAction.description}</p>
                <button 
                  className="primary-action-btn"
                  onClick={() => setActiveView('skillTree')}
                >
                  {nextAction.action} →
                </button>
              </div>
            )}
          </div>
          
          <GamificationStats onStreakUpdate={handleStreakUpdate} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeView === 'skillTree' ? 'active' : ''}`}
          onClick={() => setActiveView('skillTree')}
        >
          🌌 Learning Universe
        </button>
        <button 
          className={`nav-tab ${activeView === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveView('recommendations')}
        >
          🎯 For You
        </button>
      </div>

      {/* Content Views */}
      <div className="dashboard-content">
        {activeView === 'overview' && (
          <div className="overview-view">
            <QuickActions 
              userPreferences={userPreferences}
              completedLessons={completedLessons}
              onStartLesson={onStartLesson}
              selectedTrack={selectedTrack}
            />
            <ProgressOverview 
              userPreferences={userPreferences}
              completedLessons={completedLessons}
              lessons={lessons}
              onStartLesson={onStartLesson}
            />
          </div>
        )}
        
        {activeView === 'skillTree' && (
          <KnowledgeGraph 
            userPreferences={userPreferences}
            completedLessons={completedLessons}
            onStartLesson={onStartLesson}
            lessons={lessons}
          />
        )}
        
        {activeView === 'recommendations' && (
          <PersonalizedRecommendations 
            userPreferences={userPreferences}
            completedLessons={completedLessons}
            onStartLesson={onStartLesson}
            lessons={lessons}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;