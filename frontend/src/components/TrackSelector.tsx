import React from 'react';
import { Lesson } from '../data/lessons';
import './TrackSelector.css';

interface TrackSelectorProps {
  lessons: Lesson[];
  selectedTrack: string;
  onTrackChange: (track: string) => void;
}

const TrackSelector: React.FC<TrackSelectorProps> = ({ lessons, selectedTrack, onTrackChange }) => {
  const tracks = Array.from(new Set(lessons.map(lesson => lesson.track)));
  
  const getTrackStats = (track: string) => {
    const trackLessons = lessons.filter(lesson => lesson.track === track);
    const difficulties = Array.from(new Set(trackLessons.map(lesson => lesson.difficulty)));
    return {
      count: trackLessons.length,
      difficulties: difficulties.join(', ')
    };
  };

  const getTrackIcon = (track: string) => {
    switch(track) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '🎯';
      case 'data-science': return '📊';
      case 'web-development': return '🌐';
      case 'data-processing': return '⚙️';
      case 'ai-ml': return '🤖';
      default: return '📚';
    }
  };

  const getTrackDescription = (track: string) => {
    switch(track) {
      case 'beginner': return 'Perfect for those just starting with Python';
      case 'intermediate': return 'Build on your basics with more complex concepts';
      case 'advanced': return 'Master advanced Python programming techniques';
      case 'data-science': return 'Learn NumPy, Pandas, and data analysis with Python';
      case 'web-development': return 'Build web APIs and applications with Flask';
      case 'data-processing': return 'Work with files, CSV data, and databases';
      case 'ai-ml': return 'PyTorch, transformers, LLMs, and cutting-edge AI development';
      default: return 'Learn Python step by step';
    }
  };

  return (
    <div className="track-selector">
      <h3>Choose Your Learning Path</h3>
      <div className="tracks">
        {tracks.map(track => {
          const stats = getTrackStats(track);
          return (
            <div 
              key={track}
              className={`track-card ${selectedTrack === track ? 'selected' : ''}`}
              onClick={() => onTrackChange(track)}
            >
              <div className="track-icon">{getTrackIcon(track)}</div>
              <div className="track-info">
                <h4>{track.charAt(0).toUpperCase() + track.slice(1)}</h4>
                <p className="track-description">{getTrackDescription(track)}</p>
                <div className="track-stats">
                  <span className="lesson-count">{stats.count} lessons</span>
                  <span className="difficulty-range">{stats.difficulties}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackSelector;