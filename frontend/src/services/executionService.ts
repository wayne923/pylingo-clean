import { authService } from './authService';

const API_BASE_URL = 'https://pylingo-clean-production.up.railway.app';

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
}

export interface DockerExecutionRequest {
  code: string;
  requirements?: string[];
  timeout?: number;
}

export interface WebAppExecutionRequest {
  code: string;
  app_type?: 'flask' | 'fastapi';
}

class ExecutionService {
  async checkDockerStatus(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/docker/status`);
      if (!response.ok) {
        throw new Error('Failed to check Docker status');
      }
      return response.json();
    } catch (error) {
      return {
        available: false,
        message: 'Could not connect to execution service'
      };
    }
  }

  async executeWithDocker(request: DockerExecutionRequest): Promise<ExecutionResult> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/api/execute/docker`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          output: '',
          error: error.detail || 'Execution failed'
        };
      }

      return response.json();
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message || 'Network error during execution'
      };
    }
  }

  async executeWebApp(request: WebAppExecutionRequest): Promise<ExecutionResult> {
    try {
      const response = await authService.fetchWithAuth(`${API_BASE_URL}/api/execute/webapp`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          output: '',
          error: error.detail || 'Web app execution failed'
        };
      }

      return response.json();
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message || 'Network error during web app execution'
      };
    }
  }

  // Determine if a lesson should use Docker based on its concepts
  shouldUseDocker(concepts: string[]): boolean {
    const dockerRequiredConcepts = [
      // Web frameworks that definitely need Docker
      'flask',
      'fastapi', 
      'web-apis',
      'sqlite',
      'databases',
      'http-requests',
      'file-processing',
      // Advanced AI/ML concepts that need full ecosystem
      'fine-tuning',
      'scikit-learn',
      'isolation-forest',
      'anomaly-detection',
      // Advanced visualization
      'seaborn',
      'plotly',
      'interactive-visualization'
    ];

    // For now, make basic AI/ML concepts browser-compatible
    // These can use mock implementations or simplified versions
    const browserCompatibleConcepts = [
      'pytorch',
      'tensors',
      'deep-learning',
      'transformers',
      'multi-head-attention',
      'transformer-block',
      'gpt',
      'numpy',
      'arrays',
      'data-structures'
    ];

    return concepts.some(concept => dockerRequiredConcepts.includes(concept));
  }

  // Get required packages for a lesson
  getRequiredPackages(concepts: string[]): string[] {
    const packages: string[] = [];

    // Web frameworks
    if (concepts.includes('flask')) packages.push('flask');
    if (concepts.includes('fastapi')) packages.push('fastapi', 'uvicorn');
    if (concepts.includes('http-requests')) packages.push('requests');
    if (concepts.includes('csv')) packages.push('pandas');

    // AI/ML packages
    if (concepts.includes('pytorch') || concepts.includes('tensors') || concepts.includes('deep-learning')) {
      packages.push('torch', 'torchvision', 'torchaudio');
    }
    if (concepts.includes('transformers') || concepts.includes('gpt') || concepts.includes('fine-tuning')) {
      packages.push('torch', 'transformers', 'tokenizers');
    }
    if (concepts.includes('scikit-learn') || concepts.includes('isolation-forest') || concepts.includes('anomaly-detection')) {
      packages.push('scikit-learn', 'pandas', 'numpy');
    }

    // Visualization packages
    if (concepts.includes('seaborn') || concepts.includes('heatmap')) {
      packages.push('seaborn', 'matplotlib', 'pandas', 'numpy');
    }
    if (concepts.includes('plotly') || concepts.includes('interactive-visualization')) {
      packages.push('plotly', 'pandas', 'numpy');
    }
    if (concepts.includes('matplotlib') || concepts.includes('visualization') || concepts.includes('plotting')) {
      packages.push('matplotlib', 'numpy');
    }

    // Data science fundamentals
    if (concepts.includes('statistical-analysis') || concepts.includes('insights')) {
      packages.push('pandas', 'numpy', 'scipy', 'matplotlib');
    }

    // Remove duplicates
    return [...new Set(packages)];
  }
}

export const executionService = new ExecutionService();