import { authService } from './authService';

const API_BASE_URL = 'https://pylingo-clean-production.up.railway.app';

export interface NewLessonData {
  title: string;
  description: string;
  initial_code: string;
  expected_output: string;
  hints: string[];
  validation_rules: {
    requiredKeywords?: string[];
    forbiddenKeywords?: string[];
    mustContain?: string[];
    mustNotContain?: string[];
  };
  concepts: string[];
  order_in_track: number;
  track_id: number;
}

export interface LessonResponse {
  id: number;
  title: string;
  description: string;
  initial_code: string;
  expected_output: string;
  hints: string[];
  validation_rules: {
    requiredKeywords?: string[];
    forbiddenKeywords?: string[];
    mustContain?: string[];
    mustNotContain?: string[];
  };
  concepts: string[];
  order_in_track: number;
  track_id: number;
  created_at: string;
}

class LessonService {
  async createLesson(lessonData: NewLessonData): Promise<LessonResponse> {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/api/lessons`, {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create lesson');
    }

    return response.json();
  }

  async getAllLessons(): Promise<LessonResponse[]> {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/api/lessons`);

    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }

    return response.json();
  }

  async deleteLesson(lessonId: number): Promise<void> {
    const response = await authService.fetchWithAuth(`${API_BASE_URL}/api/lessons/${lessonId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete lesson');
    }
  }

  // Helper method to get the next order number for a track
  async getNextOrderInTrack(trackId: number): Promise<number> {
    const lessons = await this.getAllLessons();
    const trackLessons = lessons.filter(lesson => lesson.track_id === trackId);
    return trackLessons.length > 0 ? Math.max(...trackLessons.map(l => l.order_in_track)) + 1 : 1;
  }

  // Helper method to convert track name to track ID
  getTrackId(trackName: string): number {
    const trackMap: Record<string, number> = {
      'beginner': 1,
      'intermediate': 1,
      'advanced': 1,
      'data-science': 2,
    };
    return trackMap[trackName] || 1;
  }
}

export const lessonService = new LessonService();