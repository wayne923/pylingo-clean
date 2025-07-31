import { TestCase } from '../data/lessons';

export interface TestResult {
  passed: boolean;
  actualOutput: any;
  expectedOutput: any;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
}

export interface TestSuiteResult {
  allPassed: boolean;
  results: TestResult[];
  hiddenTestsPassed: number;
  hiddenTestsTotal: number;
  score: number;
  executionSummary: {
    totalTime: number;
    averageTime: number;
    maxMemory: number;
  };
}

class TestRunnerService {
  private pyodide: any = null;

  async initializePyodide(): Promise<void> {
    if (this.pyodide) return;

    // Wait for Pyodide to be available in global scope
    if (typeof window !== 'undefined' && (window as any).loadPyodide) {
      this.pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });
    } else {
      throw new Error('Pyodide is not available');
    }
  }

  async runTestSuite(
    code: string, 
    testCases: TestCase[], 
    functionName: string,
    timeLimit: number = 5000,
    memoryLimit: number = 50
  ): Promise<TestSuiteResult> {
    // Initialize Pyodide if not already done
    await this.initializePyodide();

    const results: TestResult[] = [];
    let hiddenTestsPassed = 0;
    let hiddenTestsTotal = 0;
    let totalTime = 0;
    let maxMemory = 0;

    for (const testCase of testCases) {
      if (testCase.hidden) {
        hiddenTestsTotal++;
      }

      const result = await this.runSingleTest(
        code, 
        testCase, 
        functionName, 
        timeLimit, 
        memoryLimit
      );
      
      results.push(result);
      
      if (result.executionTime) {
        totalTime += result.executionTime;
      }
      
      if (result.memoryUsed && result.memoryUsed > maxMemory) {
        maxMemory = result.memoryUsed;
      }

      if (testCase.hidden && result.passed) {
        hiddenTestsPassed++;
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
        totalTime,
        averageTime: totalTime / results.length,
        maxMemory
      }
    };
  }

  async runSingleTest(
    code: string,
    testCase: TestCase,
    functionName: string,
    timeLimit: number,
    memoryLimit: number
  ): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      // Create a safe execution environment
      const testCode = this.generateTestCode(code, testCase, functionName);
      
      // Execute the code (this will use Pyodide or send to backend)
      const result = await this.executeCode(testCode, timeLimit);
      
      const executionTime = performance.now() - startTime;
      
      // Parse and compare results
      const actualOutput = this.parseOutput(result.output);
      const expectedOutput = testCase.expectedOutput;
      
      const passed = this.compareOutputs(actualOutput, expectedOutput);
      
      return {
        passed,
        actualOutput,
        expectedOutput,
        executionTime,
        memoryUsed: 0 // TODO: Implement memory tracking
      };
      
    } catch (error: any) {
      return {
        passed: false,
        actualOutput: null,
        expectedOutput: testCase.expectedOutput,
        error: error.message || 'Execution failed',
        executionTime: performance.now() - startTime
      };
    }
  }

  private generateTestCode(userCode: string, testCase: TestCase, functionName: string): string {
    // Extract the function definition from user code
    const functionMatch = userCode.match(new RegExp(`def ${functionName}\\([^)]*\\):[\\s\\S]*?(?=\\n\\S|\\n$|$)`, 'm'));
    
    if (!functionMatch) {
      throw new Error(`Function ${functionName} not found in code`);
    }

    const functionDef = functionMatch[0];
    
    // Generate test execution code
    const inputArgs = this.formatInputArgs(testCase.input);
    
    return `
${functionDef}

# Test execution
import json
import sys
from io import StringIO

try:
    result = ${functionName}(${inputArgs})
    print(json.dumps(result) if result is not None else "None")
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
`;
  }

  private formatInputArgs(input: any): string {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      // Handle multiple arguments passed as object
      return Object.values(input).map(val => JSON.stringify(val)).join(', ');
    }
    // Handle single argument or array
    return JSON.stringify(input);
  }

  private async executeCode(code: string, timeLimit: number): Promise<{ output: string; error?: string }> {
    if (!this.pyodide) {
      return { output: "", error: "Pyodide not initialized" };
    }

    try {
      // Set up output capture
      this.pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Execute the code
      this.pyodide.runPython(code);

      // Get the output
      const output = this.pyodide.runPython('sys.stdout.getvalue()');
      return { output: output || '' };
    } catch (error: any) {
      return { output: "", error: error.message || 'Execution failed' };
    }
  }

  private parseOutput(output: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(output.trim());
    } catch {
      // If not JSON, return as string
      return output.trim();
    }
  }

  private compareOutputs(actual: any, expected: any): boolean {
    // Deep comparison for arrays and objects
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((val, index) => this.compareOutputs(val, expected[index]));
    }
    
    if (typeof actual === 'object' && typeof expected === 'object' && 
        actual !== null && expected !== null) {
      const actualKeys = Object.keys(actual).sort();
      const expectedKeys = Object.keys(expected).sort();
      
      if (actualKeys.length !== expectedKeys.length) return false;
      if (!actualKeys.every(key => expectedKeys.includes(key))) return false;
      
      return actualKeys.every(key => this.compareOutputs(actual[key], expected[key]));
    }
    
    // For primitive types
    return actual === expected;
  }

  // Helper method to generate test case display
  formatTestCase(testCase: TestCase, index: number): string {
    const input = typeof testCase.input === 'object' 
      ? Object.entries(testCase.input).map(([key, val]) => `${key} = ${JSON.stringify(val)}`).join(', ')
      : JSON.stringify(testCase.input);
    
    return `Test Case ${index + 1}${testCase.description ? ` (${testCase.description})` : ''}:
Input: ${input}
Expected: ${JSON.stringify(testCase.expectedOutput)}`;
  }
}

export const testRunnerService = new TestRunnerService();