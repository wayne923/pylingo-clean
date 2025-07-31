import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { usePyodide } from '../hooks/usePyodide';
import { validateCode } from '../utils/validation';
import './LessonCreator.css';

interface NewLesson {
  title: string;
  description: string;
  initialCode: string;
  expectedOutput: string;
  hints: string[];
  track: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
  validation: {
    requiredKeywords?: string[];
    forbiddenKeywords?: string[];
    mustContain?: string[];
    mustNotContain?: string[];
  };
}

interface LessonCreatorProps {
  onSave: (lesson: NewLesson) => void;
  onCancel: () => void;
}

const LessonCreator: React.FC<LessonCreatorProps> = ({ onSave, onCancel }) => {
  const { runPython, isLoading: pyodideLoading } = usePyodide();
  
  const [lesson, setLesson] = useState<NewLesson>({
    title: '',
    description: '',
    initialCode: '# Write your code here\n',
    expectedOutput: '',
    hints: [''],
    track: 'beginner',
    difficulty: 'beginner',
    concepts: [''],
    validation: {
      requiredKeywords: [''],
      forbiddenKeywords: [''],
      mustContain: [''],
      mustNotContain: ['']
    }
  });

  const [testCode, setTestCode] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string>('');

  const handleInputChange = (field: keyof NewLesson, value: any) => {
    setLesson(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof NewLesson, index: number, value: string) => {
    setLesson(prev => {
      const array = [...(prev[field] as string[])];
      array[index] = value;
      return { ...prev, [field]: array };
    });
  };

  const addArrayItem = (field: keyof NewLesson) => {
    setLesson(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof NewLesson, index: number) => {
    setLesson(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleValidationChange = (field: keyof typeof lesson.validation, index: number, value: string) => {
    setLesson(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: prev.validation[field]?.map((item, i) => i === index ? value : item) || []
      }
    }));
  };

  const addValidationItem = (field: keyof typeof lesson.validation) => {
    setLesson(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: [...(prev.validation[field] || []), '']
      }
    }));
  };

  const testLesson = async () => {
    if (!testCode.trim()) {
      setValidationResult('Please enter test code');
      return;
    }

    setIsValidating(true);
    setValidationResult('');

    try {
      // Test code validation
      const validation = validateCode(testCode, lesson.validation);
      
      if (!validation.isValid) {
        setValidationResult(`❌ Validation failed: ${validation.message}`);
        setIsValidating(false);
        return;
      }

      // Test code execution
      const result = await runPython(testCode);
      
      if (result.error) {
        setTestOutput(`Error: ${result.error}`);
        setValidationResult('❌ Code execution failed');
      } else {
        setTestOutput(result.output);
        
        if (result.output.trim() === lesson.expectedOutput.trim()) {
          setValidationResult('✅ Perfect! Test code produces expected output and passes validation');
        } else {
          setValidationResult(`⚠️ Output mismatch:\nExpected: "${lesson.expectedOutput}"\nGot: "${result.output}"`);
        }
      }
    } catch (error) {
      setValidationResult('❌ Test failed with error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    // Clean up arrays (remove empty items)
    const cleanLesson = {
      ...lesson,
      hints: lesson.hints.filter(h => h.trim()),
      concepts: lesson.concepts.filter(c => c.trim()),
      validation: {
        requiredKeywords: lesson.validation.requiredKeywords?.filter(k => k.trim()),
        forbiddenKeywords: lesson.validation.forbiddenKeywords?.filter(k => k.trim()),
        mustContain: lesson.validation.mustContain?.filter(k => k.trim()),
        mustNotContain: lesson.validation.mustNotContain?.filter(k => k.trim())
      }
    };

    onSave(cleanLesson);
  };

  if (pyodideLoading) {
    return <div className="loading">Loading Python environment...</div>;
  }

  return (
    <div className="lesson-creator">
      <div className="creator-header">
        <h2>Create New Lesson</h2>
        <div className="creator-actions">
          <button onClick={onCancel} className="cancel-button">Cancel</button>
          <button onClick={handleSave} className="save-button">Save Lesson</button>
        </div>
      </div>

      <div className="creator-content">
        <div className="creator-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Working with Variables"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={lesson.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what students will learn..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Track</label>
                <select
                  value={lesson.track}
                  onChange={(e) => handleInputChange('track', e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="data-science">Data Science</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={lesson.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Expected Output</label>
              <input
                type="text"
                value={lesson.expectedOutput}
                onChange={(e) => handleInputChange('expectedOutput', e.target.value)}
                placeholder="e.g., Hello, World!"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Code Setup</h3>
            
            <div className="form-group">
              <label>Initial Code</label>
              <Editor
                height="150px"
                defaultLanguage="python"
                value={lesson.initialCode}
                onChange={(value) => handleInputChange('initialCode', value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Hints & Concepts</h3>
            
            <div className="form-group">
              <label>Hints</label>
              {lesson.hints.map((hint, index) => (
                <div key={index} className="array-input">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => handleArrayChange('hints', index, e.target.value)}
                    placeholder="Hint for students..."
                  />
                  <button 
                    onClick={() => removeArrayItem('hints', index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button onClick={() => addArrayItem('hints')} className="add-button">
                + Add Hint
              </button>
            </div>

            <div className="form-group">
              <label>Concepts</label>
              {lesson.concepts.map((concept, index) => (
                <div key={index} className="array-input">
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => handleArrayChange('concepts', index, e.target.value)}
                    placeholder="e.g., variables, loops, functions"
                  />
                  <button 
                    onClick={() => removeArrayItem('concepts', index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button onClick={() => addArrayItem('concepts')} className="add-button">
                + Add Concept
              </button>
            </div>
          </div>

          <div className="form-section">
            <h3>Validation Rules</h3>
            
            {Object.entries(lesson.validation).map(([key, values]) => (
              <div key={key} className="form-group">
                <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                {(values || []).map((value, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleValidationChange(key as any, index, e.target.value)}
                      placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                    />
                    <button 
                      onClick={() => {
                        setLesson(prev => ({
                          ...prev,
                          validation: {
                            ...prev.validation,
                            [key]: prev.validation[key as keyof typeof prev.validation]?.filter((_, i) => i !== index)
                          }
                        }));
                      }}
                      className="remove-button"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={() => addValidationItem(key as any)} className="add-button">
                  + Add {key.replace(/([A-Z])/g, ' $1')}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="creator-test">
          <h3>Test Your Lesson</h3>
          
          <div className="test-section">
            <label>Test Code</label>
            <Editor
              height="200px"
              defaultLanguage="python"
              value={testCode}
              onChange={(value) => setTestCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
            
            <button 
              onClick={testLesson}
              disabled={isValidating}
              className="test-button"
            >
              {isValidating ? 'Testing...' : 'Test Lesson'}
            </button>
          </div>

          {testOutput && (
            <div className="test-output">
              <h4>Output:</h4>
              <pre>{testOutput}</pre>
            </div>
          )}

          {validationResult && (
            <div className={`validation-result ${
              validationResult.includes('✅') ? 'success' : 
              validationResult.includes('⚠️') ? 'warning' : 'error'
            }`}>
              <pre>{validationResult}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCreator;