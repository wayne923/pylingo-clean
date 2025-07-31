import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import ChallengeLesson from './ChallengeLesson';
import { usePyodide } from '../hooks/usePyodide';
import { validateCode } from '../utils/validation';
import { executionService } from '../services/executionService';
import { authService } from '../services/authService';
import { Lesson as LessonType } from '../data/lessons';
import './Lesson.css';

interface LessonProps {
  lesson: LessonType;
  onComplete: () => void;
  isCompleted: boolean;
}

const Lesson: React.FC<LessonProps> = ({ lesson, onComplete, isCompleted }) => {
  // All hooks must be called at the top level
  const { runPython, isLoading: pyodideLoading, error: pyodideError } = usePyodide();
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [useDocker, setUseDocker] = useState(false);
  const [dockerAvailable, setDockerAvailable] = useState(false);

  // If this is a challenge lesson, render the ChallengeLesson component
  if (lesson.type === 'challenge') {
    return (
      <ChallengeLesson
        lesson={lesson}
        onComplete={(lessonId: number) => onComplete()}
      />
    );
  }

  // Check if lesson should use Docker
  useEffect(() => {
    const shouldUseDockerForLesson = executionService.shouldUseDocker(lesson.concepts);
    setUseDocker(shouldUseDockerForLesson);

    if (shouldUseDockerForLesson) {
      // Check Docker availability
      executionService.checkDockerStatus().then(status => {
        setDockerAvailable(status.available);
      });
    }
  }, [lesson.concepts]);

  const handleRunCode = async (code: string) => {
    // Check if user is authenticated for Docker lessons
    if (useDocker && !authService.getUser()) {
      setValidationMessage('Please log in to access advanced lessons with Docker execution.');
      return;
    }

    setIsRunning(true);
    setValidationMessage('');
    
    // First validate the code structure
    const validation = validateCode(code, lesson.validation);
    
    if (!validation.isValid) {
      setOutput('');
      setValidationMessage(validation.message);
      setIsRunning(false);
      return;
    }
    
    // Choose execution method
    let result;
    
    if (useDocker && dockerAvailable) {
      // Use Docker execution for advanced lessons
      const requirements = executionService.getRequiredPackages(lesson.concepts);
      result = await executionService.executeWithDocker({
        code,
        requirements,
        timeout: 30
      });
    } else if (useDocker && !dockerAvailable) {
      // Docker required but not available
      setOutput('');
      setValidationMessage('This lesson requires Docker for execution, but Docker is not available on this server.');
      setIsRunning(false);
      return;
    } else {
      // Use Pyodide for regular lessons
      result = await runPython(code);
    }
    
    if (result.error) {
      setOutput(`Error: ${result.error}`);
    } else {
      setOutput(result.output);
      
      // Check if output matches expected AND code validation passed
      if (result.output.trim() === lesson.expectedOutput.trim() && validation.isValid && !isCompleted) {
        setValidationMessage('🎉 Perfect! Your solution is correct!');
        setTimeout(() => onComplete(), 1000);
      }
    }
    setIsRunning(false);
  };

  if (pyodideLoading && !useDocker) {
    return <div className="loading">Loading Python environment...</div>;
  }

  if (pyodideError && !useDocker) {
    return (
      <div className="lesson">
        <div className="error-state">
          <h3>⚠️ Python Environment Error</h3>
          <p>Failed to load the Python environment. Please refresh the page to try again.</p>
          <p className="error-details">Error: {pyodideError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson">
      <div className="lesson-header">
        <h2>{lesson.title}</h2>
        {isCompleted && <span className="completed">✅ Completed!</span>}
      </div>
      
      <div className="lesson-content">
        <div className="description">
          <p>{lesson.description}</p>
          <p><strong>Expected output:</strong> <code>{lesson.expectedOutput}</code></p>
          {useDocker && (
            <div className="execution-info">
              <span className={`execution-badge ${dockerAvailable ? 'docker' : 'docker-unavailable'}`}>
                {dockerAvailable ? '🐳 Docker Execution' : '⚠️ Docker Required (Unavailable)'}
              </span>
              <p className="execution-note">
                {dockerAvailable 
                  ? 'This advanced lesson runs in a secure Docker container with full Python ecosystem access.'
                  : 'This lesson requires Docker for web frameworks and external libraries.'
                }
              </p>
            </div>
          )}
          {!useDocker && (
            <div className="execution-info">
              <span className="execution-badge browser">🌐 Browser Execution</span>
              <p className="execution-note">
                This lesson runs directly in your browser using Pyodide.
              </p>
            </div>
          )}
        </div>
        
        <CodeEditor
          initialCode={lesson.initialCode}
          onRun={handleRunCode}
          output={output}
          isLoading={isRunning}
        />
        
        {validationMessage && (
          <div className={`validation-message ${validationMessage.includes('🎉') ? 'success' : 'error'}`}>
            {validationMessage}
          </div>
        )}
        
        <div className="lesson-actions">
          <button 
            onClick={() => setShowHints(!showHints)}
            className="hint-button"
          >
            {showHints ? 'Hide Hints' : 'Show Hints'}
          </button>
        </div>
        
        {showHints && (
          <div className="hints">
            <h4>Hints:</h4>
            <ul>
              {lesson.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lesson;