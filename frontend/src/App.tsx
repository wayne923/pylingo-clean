import React, { useState, useEffect } from 'react';
import './App.css';
import Lesson from './components/Lesson';
import LessonList from './components/LessonList';
import ProgressBar from './components/ProgressBar';
import TrackSelector from './components/TrackSelector';
import AchievementPanel from './components/AchievementPanel';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import ModernLandingPage from './components/ModernLandingPage';
import EnhancedAuthModal from './components/EnhancedAuthModal';
import ProgressVisualization from './components/ProgressVisualization';
import { lessons } from './data/lessons';
import { apiService, ApiLesson } from './services/api';
import { authService, User } from './services/authService';

function App() {
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [apiLessons, setApiLessons] = useState<ApiLesson[]>([]);
  const [useApi, setUseApi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('ai-ml');
  const [currentStreak] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEnhancedAuth, setShowEnhancedAuth] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [userLevel, setUserLevel] = useState('Beginner');

  const currentLessons = useApi ? apiLessons : lessons;
  const filteredLessons = currentLessons.filter(lesson => lesson.track === selectedTrack);
  const currentLesson = filteredLessons.find(lesson => lesson.id === currentLessonId);

  const handleLessonComplete = (lessonId: number) => {
    setCompletedLessons(prev => new Set([...Array.from(prev), lessonId]));
    
    // Auto-advance to next lesson if available in current track
    const nextLesson = filteredLessons.find(lesson => lesson.id === lessonId + 1);
    if (nextLesson && !completedLessons.has(nextLesson.id)) {
      setTimeout(() => setCurrentLessonId(nextLesson.id), 1500);
    }
  };

  const handleSelectLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
  };

  const handleTrackChange = (track: string) => {
    setSelectedTrack(track);
    // Set to first lesson of the new track
    const trackLessons = currentLessons.filter(lesson => lesson.track === track);
    if (trackLessons.length > 0) {
      setCurrentLessonId(trackLessons[0].id);
    }
  };

  const loadApiLessons = async () => {
    setLoading(true);
    try {
      // First seed the track
      await apiService.seedTrack(1);
      // Then load lessons
      const response = await apiService.getTrackLessons(1);
      setApiLessons(response.lessons);
      setUseApi(true);
    } catch (error) {
      console.error('Failed to load API lessons:', error);
      setUseApi(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    setShowLandingPage(false);
    if (!user) {
      setShowEnhancedAuth(true);
    }
  };

  const handleShowAuth = () => {
    setShowEnhancedAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowLandingPage(false);
    setShowEnhancedAuth(false);
    
    // Get the authenticated user from authService
    const authenticatedUser = authService.getUser();
    if (authenticatedUser) {
      setUser(authenticatedUser);
    }
    
    // Update user level based on assessment results
    const userData = localStorage.getItem('userPreferences');
    if (userData) {
      const preferences = JSON.parse(userData);
      if (preferences.skillLevel === 'advanced') {
        setUserLevel('Expert');
      } else if (preferences.skillLevel === 'intermediate') {
        setUserLevel('Intermediate');
      } else {
        setUserLevel('Beginner');
      }
    }
  };

  // Check authentication on load
  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      setShowLandingPage(false); // Hide landing page if already logged in
      
      // Load user preferences for level
      const userData = localStorage.getItem('userPreferences');
      if (userData) {
        const preferences = JSON.parse(userData);
        if (preferences.skillLevel === 'advanced') {
          setUserLevel('Expert');
        } else if (preferences.skillLevel === 'intermediate') {
          setUserLevel('Intermediate');
        } else {
          setUserLevel('Beginner');
        }
      }
    }
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pylingo-progress');
    if (saved) {
      const progress = JSON.parse(saved);
      setCompletedLessons(new Set(progress.completed));
      setCurrentLessonId(progress.currentLesson || 1);
      setUseApi(progress.useApi || false);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const progress = {
      completed: Array.from(completedLessons),
      currentLesson: currentLessonId,
      useApi,
      selectedTrack
    };
    localStorage.setItem('pylingo-progress', JSON.stringify(progress));
  }, [completedLessons, currentLessonId, useApi, selectedTrack]);

  const handleAuthSuccessLegacy = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    // Optionally clear progress or keep it local
  };

  // Show landing page for new users
  if (showLandingPage && !user) {
    return (
      <>
        <ModernLandingPage 
          onStartLearning={handleStartLearning}
          onShowAuth={handleShowAuth}
          onSelectTrack={(track: string) => setSelectedTrack(track)}
        />
        <EnhancedAuthModal
          isOpen={showEnhancedAuth}
          onClose={() => setShowEnhancedAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (!currentLesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <h1>🐍 PyLingo</h1>
          <p>Learn Python step by step</p>
        </div>
        
        <div className="header-center">
          <div className="api-controls">
            <button 
              onClick={loadApiLessons}
              disabled={loading || useApi}
              className="api-button"
            >
              {loading ? 'Loading...' : useApi ? 'Using API' : 'Load from API'}
            </button>
            <button 
              onClick={() => setUseApi(false)}
              disabled={!useApi}
              className="api-button"
            >
              Use Local Data
            </button>
          </div>
        </div>
        
        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <span className="welcome-text">Welcome, {user.username}!</span>
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="admin-button"
              >
                📚 Create Lesson
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowEnhancedAuth(true)}
              className="login-button"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </header>

      {/* Enhanced Progress Visualization */}
      <ProgressVisualization
        completedLessons={completedLessons}
        currentStreak={currentStreak}
        totalLessons={filteredLessons.length}
        userLevel={userLevel}
      />

      <main className="main-content">
        <div className="sidebar">
          <TrackSelector
            lessons={currentLessons}
            selectedTrack={selectedTrack}
            onTrackChange={handleTrackChange}
          />
          <ProgressBar 
            completed={filteredLessons.filter(lesson => completedLessons.has(lesson.id)).length}
            total={filteredLessons.length}
            track={`${selectedTrack.charAt(0).toUpperCase() + selectedTrack.slice(1)} Track`}
          />
          <AchievementPanel
            completedLessons={completedLessons}
            totalLessons={filteredLessons.length}
            currentStreak={currentStreak}
          />
          <LessonList
            lessons={filteredLessons}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            onSelectLesson={handleSelectLesson}
          />
        </div>
        <div className="lesson-content">
          <Lesson 
            key={currentLesson.id}
            lesson={currentLesson}
            onComplete={() => handleLessonComplete(currentLesson.id)}
            isCompleted={completedLessons.has(currentLesson.id)}
          />
        </div>
      </main>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccessLegacy}
      />

      <EnhancedAuthModal
        isOpen={showEnhancedAuth}
        onClose={() => setShowEnhancedAuth(false)}
        onSuccess={handleAuthSuccess}
      />
      
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
}

export default App;
