const API_BASE_URL = 'https://pylingo-clean-production.up.railway.app';

export interface Track {
  id: number;
  name: string;
  description: string;
  difficulty: string;
}

export interface ApiLesson {
  id: number;
  title: string;
  description: string;
  initialCode: string;
  expectedOutput: string;
  hints: string[];
  validation: {
    requiredKeywords?: string[];
    forbiddenKeywords?: string[];
    mustContain?: string[];
    mustNotContain?: string[];
  };
  concepts: string[];
  track: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const apiService = {
  async getTracks(): Promise<{ tracks: Track[] }> {
    const response = await fetch(`${API_BASE_URL}/api/tracks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tracks');
    }
    return response.json();
  },

  async getTrackLessons(trackId: number): Promise<{ lessons: ApiLesson[] }> {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${trackId}/lessons`);
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    return response.json();
  },

  async seedTrack(trackId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/tracks/${trackId}/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to seed track');
    }
    return response.json();
  },
};