import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  initialCode: string;
  onRun: (code: string) => void;
  output: string;
  isLoading: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, onRun, output, isLoading }) => {
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  return (
    <div className="code-editor">
      <div className="editor-container">
        <Editor
          height="200px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      
      <div className="controls">
        <button 
          onClick={() => onRun(code)}
          disabled={isLoading}
          className="run-button"
        >
          {isLoading ? 'Running...' : 'Run Code'}
        </button>
      </div>
      
      <div className="output-container">
        <h4>Output:</h4>
        <pre className="output">{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;