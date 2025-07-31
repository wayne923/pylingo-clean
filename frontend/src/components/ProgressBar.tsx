import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  completed: number;
  total: number;
  track: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, track }) => {
  const percentage = Math.round((completed / total) * 100);
  
  return (
    <div className="progress-container">
      <div className="progress-header">
        <h4>{track} Track</h4>
        <span className="progress-text">{completed}/{total} lessons completed</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-percentage">{percentage}%</div>
    </div>
  );
};

export default ProgressBar;