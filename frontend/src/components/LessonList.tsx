import React from 'react';
import { Lesson } from '../data/lessons';
import './LessonList.css';

interface LessonListProps {
  lessons: Lesson[];
  currentLessonId: number;
  completedLessons: Set<number>;
  onSelectLesson: (lessonId: number) => void;
}

const LessonList: React.FC<LessonListProps> = ({ 
  lessons, 
  currentLessonId, 
  completedLessons, 
  onSelectLesson 
}) => {
  const getDifficultyIcon = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';  
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="lesson-list">
      <h3>Lessons</h3>
      <div className="lessons">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id}
            className={`lesson-item ${
              lesson.id === currentLessonId ? 'active' : ''
            } ${
              completedLessons.has(lesson.id) ? 'completed' : ''
            }`}
            onClick={() => onSelectLesson(lesson.id)}
          >
            <div className="lesson-status">
              {completedLessons.has(lesson.id) ? '✅' : 
               lesson.id === currentLessonId ? '▶️' : '⭕'}
            </div>
            <div className="lesson-info">
              <div className="lesson-title">
                {getDifficultyIcon(lesson.difficulty)} {lesson.title}
              </div>
              <div className="lesson-concepts">
                {lesson.concepts.join(' • ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonList;