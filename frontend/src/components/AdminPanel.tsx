import React, { useState } from 'react';
import LessonCreator from './LessonCreator';
import { lessonService } from '../services/lessonService';
import { authService } from '../services/authService';
import './AdminPanel.css';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveLesson = async (lessonData: any) => {
    setSaving(true);
    setMessage('');

    try {
      // Convert lesson data to API format
      const trackId = lessonService.getTrackId(lessonData.track);
      const orderInTrack = await lessonService.getNextOrderInTrack(trackId);

      const apiLessonData = {
        title: lessonData.title,
        description: lessonData.description,
        initial_code: lessonData.initialCode,
        expected_output: lessonData.expectedOutput,
        hints: lessonData.hints,
        validation_rules: lessonData.validation,
        concepts: lessonData.concepts,
        order_in_track: orderInTrack,
        track_id: trackId
      };

      await lessonService.createLesson(apiLessonData);
      setMessage('✅ Lesson created successfully!');
      
      // Reset form or close panel after a delay
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const user = authService.getUser();

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <div className="admin-title">
            <h2>📚 Lesson Admin Panel</h2>
            <p>Welcome, {user?.username}!</p>
          </div>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ✏️ Create Lesson
          </button>
          <button 
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            📋 Manage Lessons
          </button>
        </div>

        {message && (
          <div className={`admin-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="admin-content">
          {activeTab === 'create' ? (
            <LessonCreator
              onSave={handleSaveLesson}
              onCancel={onClose}
            />
          ) : (
            <div className="manage-lessons">
              <h3>Lesson Management</h3>
              <p>Lesson management features coming soon...</p>
              <ul>
                <li>📝 Edit existing lessons</li>
                <li>🗑️ Delete lessons</li>
                <li>📊 View lesson analytics</li>
                <li>🔄 Reorder lessons in tracks</li>
              </ul>
            </div>
          )}
        </div>

        {saving && (
          <div className="saving-overlay">
            <div className="saving-spinner">
              <div className="spinner"></div>
              <p>Saving lesson...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;