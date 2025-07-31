const API_BASE_URL = 'https://pylingo-clean-production.up.railway.app';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface UserPreferences {
  id?: number;
  user_id?: number;
  skill_level?: string;
  experience?: string;
  goals?: string[];
  time_commitment?: string;
  preferred_style?: string;
  current_track?: string;
  current_lesson_id?: number;
  completed_assessment?: boolean;
  created_at?: string;
  updated_at?: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    this.token = localStorage.getItem('pylingo_token');
    const userStr = localStorage.getItem('pylingo_user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user from storage');
        this.logout();
      }
    }
  }

  private saveToStorage() {
    if (this.token) {
      localStorage.setItem('pylingo_token', this.token);
    } else {
      localStorage.removeItem('pylingo_token');
    }
    
    if (this.user) {
      localStorage.setItem('pylingo_user', JSON.stringify(this.user));
    } else {
      localStorage.removeItem('pylingo_user');
    }
  }

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const result: LoginResponse = await response.json();
    
    // Store token and user
    this.token = result.access_token;
    this.user = result.user;
    this.saveToStorage();

    return result;
  }

  logout() {
    this.token = null;
    this.user = null;
    this.saveToStorage();
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, logout and redirect
    if (response.status === 401) {
      this.logout();
      window.location.href = '/login';
    }

    return response;
  }

  // User Preferences methods
  async saveUserPreferences(preferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserPreferences> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/api/preferences`, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save preferences');
    }

    return response.json();
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/api/preferences`);
      
      if (response.status === 404) {
        // No preferences found
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to load preferences');
      }

      return response.json();
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/api/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update preferences');
    }

    return response.json();
  }
}

export const authService = new AuthService();