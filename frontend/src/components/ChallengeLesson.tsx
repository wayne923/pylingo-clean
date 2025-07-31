import React, { useState } from 'react';
import { Lesson } from '../data/lessons';
import { ApiLesson } from '../services/api';
import { testRunnerService, TestSuiteResult } from '../services/testRunner';
import { usePyodide } from '../hooks/usePyodide';
import Editor from '@monaco-editor/react';
import './ChallengeLesson.css';

interface ChallengeLessonProps {
  lesson: Lesson | ApiLesson;
  onComplete: (lessonId: number) => void;
}

const ChallengeLesson: React.FC<ChallengeLessonProps> = ({ lesson, onComplete }) => {
  const [code, setCode] = useState(lesson.initialCode);
  const [testResults, setTestResults] = useState<TestSuiteResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'examples' | 'constraints'>('description');
  const { pyodide, isLoading: pyodideLoading, runPython } = usePyodide();

  const handleRunTests = async () => {
    if (!lesson.testCases || !lesson.functionName || !pyodide) return;
    
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await runSimpleTestSuite(
        code,
        lesson.testCases,
        lesson.functionName
      );
      
      setTestResults(results);
      
      // Mark as complete if all tests pass
      if (results.allPassed) {
        onComplete(lesson.id);
      }
    } catch (error: any) {
      console.error('Test execution failed:', error);
      setTestResults({
        allPassed: false,
        results: [],
        hiddenTestsPassed: 0,
        hiddenTestsTotal: lesson.testCases.filter(tc => tc.hidden).length,
        score: 0,
        executionSummary: { totalTime: 0, averageTime: 0, maxMemory: 0 }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runSimpleTestSuite = async (userCode: string, testCases: any[], functionName: string): Promise<TestSuiteResult> => {
    const results = [];
    let hiddenTestsPassed = 0;
    let hiddenTestsTotal = 0;

    for (const testCase of testCases) {
      if (testCase.hidden) {
        hiddenTestsTotal++;
      }

      try {
        // Generate test code
        const testCode = `
${userCode}

# Test execution
import json
result = ${functionName}(${formatTestInput(testCase.input)})
print(json.dumps(result))
`;

        const { output, error } = await runPython(testCode);
        
        if (error) {
          results.push({
            passed: false,
            actualOutput: null,
            expectedOutput: testCase.expectedOutput,
            error: error
          });
        } else {
          try {
            const actualOutput = JSON.parse(output.trim());
            const passed = JSON.stringify(actualOutput) === JSON.stringify(testCase.expectedOutput);
            
            results.push({
              passed,
              actualOutput,
              expectedOutput: testCase.expectedOutput
            });

            if (testCase.hidden && passed) {
              hiddenTestsPassed++;
            }
          } catch (parseError) {
            results.push({
              passed: false,
              actualOutput: output.trim(),
              expectedOutput: testCase.expectedOutput,
              error: 'Failed to parse output'
            });
          }
        }
      } catch (testError: any) {
        results.push({
          passed: false,
          actualOutput: null,
          expectedOutput: testCase.expectedOutput,
          error: testError.message
        });
      }
    }

    const allPassed = results.every(r => r.passed);
    const score = Math.round((results.filter(r => r.passed).length / results.length) * 100);

    return {
      allPassed,
      results,
      hiddenTestsPassed,
      hiddenTestsTotal,
      score,
      executionSummary: {
        totalTime: 0,
        averageTime: 0,
        maxMemory: 0
      }
    };
  };

  const formatTestInput = (input: any): string => {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      // Handle multiple arguments passed as object (e.g., {nums: [2,7,11,15], target: 9})
      return Object.values(input).map(val => JSON.stringify(val)).join(', ');
    }
    return JSON.stringify(input);
  };

  const getStatusIcon = (passed: boolean) => passed ? '✅' : '❌';
  const getStatusColor = (passed: boolean) => passed ? '#22c55e' : '#ef4444';

  return (
    <div className="challenge-lesson">
      <div className="challenge-header">
        <div className="challenge-title">
          <h1>{lesson.title}</h1>
          <div className="challenge-meta">
            <span className={`difficulty ${lesson.difficulty}`}>
              {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
            </span>
            <span className="concepts">
              {lesson.concepts.map(concept => (
                <span key={concept} className="concept-tag">{concept}</span>
              ))}
            </span>
          </div>
        </div>
        
        {lesson.timeLimit && lesson.memoryLimit && (
          <div className="challenge-limits">
            <div className="limit">
              <span className="limit-label">Time Limit:</span>
              <span className="limit-value">{lesson.timeLimit}ms</span>
            </div>
            <div className="limit">
              <span className="limit-label">Memory Limit:</span>
              <span className="limit-value">{lesson.memoryLimit}MB</span>
            </div>
          </div>
        )}
      </div>

      <div className="challenge-content">
        <div className="challenge-left">
          <div className="challenge-tabs">
            <button 
              className={`tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              Examples
            </button>
            <button 
              className={`tab ${activeTab === 'constraints' ? 'active' : ''}`}
              onClick={() => setActiveTab('constraints')}
            >
              Constraints
            </button>
          </div>

          <div className="challenge-details">
            {activeTab === 'description' && (
              <div className="description-content">
                <p>{lesson.description}</p>
                
                {lesson.examples && lesson.examples.length > 0 && (
                  <div className="quick-examples">
                    <h4>Example:</h4>
                    <div className="example">
                      <div className="example-io">
                        <strong>Input:</strong> {lesson.examples[0].input}
                      </div>
                      <div className="example-io">
                        <strong>Output:</strong> {lesson.examples[0].output}
                      </div>
                      {lesson.examples[0].explanation && (
                        <div className="example-explanation">
                          <strong>Explanation:</strong> {lesson.examples[0].explanation}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'examples' && lesson.examples && (
              <div className="examples-content">
                {lesson.examples.map((example, index) => (
                  <div key={index} className="example">
                    <h4>Example {index + 1}:</h4>
                    <div className="example-io">
                      <strong>Input:</strong> {example.input}
                    </div>
                    <div className="example-io">
                      <strong>Output:</strong> {example.output}
                    </div>
                    {example.explanation && (
                      <div className="example-explanation">
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'constraints' && lesson.constraints && (
              <div className="constraints-content">
                <h4>Constraints:</h4>
                <ul>
                  {lesson.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="hints-section">
            <button 
              className="hints-toggle"
              onClick={() => setShowHints(!showHints)}
            >
              💡 {showHints ? 'Hide' : 'Show'} Hints ({lesson.hints.length})
            </button>
            
            {showHints && (
              <div className="hints-content">
                {lesson.hints.map((hint, index) => (
                  <div key={index} className="hint">
                    <span className="hint-number">{index + 1}.</span>
                    <span className="hint-text">{hint}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="challenge-right">
          <div className="code-section">
            <div className="code-header">
              <h3>Solution</h3>
              <button 
                className="run-tests-button"
                onClick={handleRunTests}
                disabled={isRunning || pyodideLoading || !pyodide}
              >
                {pyodideLoading ? '🔄 Loading Python...' : 
                 isRunning ? '⏳ Running Tests...' : 
                 !pyodide ? '❌ Python Not Ready' :
                 '▶️ Run Tests'}
              </button>
            </div>
            
            <Editor
              height="400px"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
              }}
            />
          </div>

          {testResults && (
            <div className="test-results">
              <div className="results-header">
                <h3>Test Results</h3>
                <div className="score">
                  Score: {testResults.score}% 
                  ({testResults.results.filter(r => r.passed).length}/{testResults.results.length} passed)
                </div>
              </div>

              <div className="visible-tests">
                {testResults.results.map((result, index) => {
                  const testCase = lesson.testCases![index];
                  if (testCase.hidden) return null;
                  
                  return (
                    <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                      <div className="test-case-header">
                        <span className="test-status">
                          {getStatusIcon(result.passed)} Test Case {index + 1}
                          {testCase.description && ` (${testCase.description})`}
                        </span>
                        {result.executionTime && (
                          <span className="execution-time">{result.executionTime.toFixed(2)}ms</span>
                        )}
                      </div>
                      
                      <div className="test-case-details">
                        <div className="test-input">
                          <strong>Input:</strong> {JSON.stringify(testCase.input)}
                        </div>
                        <div className="test-expected">
                          <strong>Expected:</strong> {JSON.stringify(result.expectedOutput)}
                        </div>
                        <div className="test-actual" style={{ color: getStatusColor(result.passed) }}>
                          <strong>Got:</strong> {JSON.stringify(result.actualOutput)}
                        </div>
                        {result.error && (
                          <div className="test-error">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {testResults.hiddenTestsTotal > 0 && (
                <div className="hidden-tests-summary">
                  <h4>Hidden Test Cases</h4>
                  <p>
                    {testResults.hiddenTestsPassed} / {testResults.hiddenTestsTotal} passed
                  </p>
                </div>
              )}

              <div className="execution-summary">
                <h4>Performance</h4>
                <div className="perf-stats">
                  <span>Total Time: {testResults.executionSummary.totalTime.toFixed(2)}ms</span>
                  <span>Average Time: {testResults.executionSummary.averageTime.toFixed(2)}ms</span>
                  <span>Max Memory: {testResults.executionSummary.maxMemory}MB</span>
                </div>
              </div>

              {testResults.allPassed && (
                <div className="success-message">
                  🎉 Congratulations! All test cases passed!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeLesson;