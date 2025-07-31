import { useState, useEffect } from 'react';

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPyodideInstance = async () => {
      try {
        // Check if Pyodide is already loaded
        if (window.loadPyodide) {
          const pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
          });
          
          // Install data science packages
          console.log('Installing data science packages...');
          try {
            await pyodideInstance.loadPackage(['numpy', 'pandas', 'matplotlib']);
            console.log('Data science packages loaded!');
          } catch (packageError) {
            console.warn('Some packages failed to load:', packageError);
            // Continue without data science packages
          }
          
          setPyodide(pyodideInstance);
          setIsLoading(false);
          return;
        }

        // Load Pyodide script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        
        script.onload = async () => {
          try {
            if (!window.loadPyodide) {
              throw new Error('Pyodide failed to load properly');
            }

            const pyodideInstance = await window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
            });
            
            // Install data science packages
            console.log('Installing data science packages...');
            try {
              await pyodideInstance.loadPackage(['numpy', 'pandas', 'matplotlib']);
              console.log('Data science packages loaded!');
            } catch (packageError) {
              console.warn('Some packages failed to load:', packageError);
              // Continue without data science packages
            }
            
            setPyodide(pyodideInstance);
            setIsLoading(false);
          } catch (loadError) {
            console.error('Failed to initialize Pyodide:', loadError);
            setError('Failed to initialize Pyodide');
            setIsLoading(false);
          }
        };

        script.onerror = () => {
          console.error('Failed to load Pyodide script');
          setError('Failed to load Pyodide script');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error in loadPyodideInstance:', err);
        setError('Failed to load Pyodide');
        setIsLoading(false);
      }
    };

    loadPyodideInstance();
  }, []);

  const runPython = async (code: string): Promise<{ output: string; error?: string }> => {
    if (!pyodide) {
      return { output: '', error: 'Pyodide not loaded' };
    }

    try {
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);
      
      pyodide.runPython(code);
      
      const output = pyodide.runPython('sys.stdout.getvalue()');
      return { output: output || 'Code executed successfully' };
    } catch (err: any) {
      return { output: '', error: err.message };
    }
  };

  return { pyodide, isLoading, error, runPython };
};