const API_BASE_URL = 'https://pylingo-clean-production.up.railway.app';

export interface UserGamification {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  current_level: number;
  last_activity_date: string | null;
  streak_freeze_count: number;
  created_at: string;
  updated_at: string;
}

export interface StreakUpdate {
  current_streak: number;
  longest_streak: number;
  xp_earned: number;
  level_up: boolean;
  new_level: number | null;
}

class GamificationService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getUserGamification(): Promise<UserGamification> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/user/gamification`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch gamification data');
    }

    return response.json();
  }

  async updateStreak(): Promise<StreakUpdate> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/user/update-streak`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to update streak');
    }

    return response.json();
  }

  // Calculate XP needed for next level
  calculateXpForNextLevel(currentLevel: number): number {
    let xpNeeded = 0;
    for (let level = 1; level <= currentLevel; level++) {
      xpNeeded += 50 + (level * 50);
    }
    return xpNeeded;
  }

  // Calculate progress to next level
  calculateLevelProgress(totalXp: number, currentLevel: number): { current: number; needed: number; percentage: number } {
    const currentLevelXp = currentLevel > 1 ? this.calculateXpForNextLevel(currentLevel - 1) : 0;
    const nextLevelXp = this.calculateXpForNextLevel(currentLevel);
    const progressXp = totalXp - currentLevelXp;
    const neededXp = nextLevelXp - currentLevelXp;
    
    return {
      current: Math.max(0, progressXp),
      needed: neededXp,
      percentage: Math.min(100, Math.max(0, (progressXp / neededXp) * 100))
    };
  }

  // Get streak status message
  getStreakMessage(streak: number): string {
    if (streak === 0) return "Start your learning streak today! 🔥";
    if (streak === 1) return "Great start! Keep it going! 🎯";
    if (streak < 7) return `${streak} day streak! You're on fire! 🔥`;
    if (streak < 30) return `Amazing ${streak} day streak! 🏆`;
    return `Incredible ${streak} day streak! You're a legend! 👑`;
  }

  // Get level title
  getLevelTitle(level: number): string {
    if (level === 1) return "Newbie Coder";
    if (level < 5) return "Junior Developer";
    if (level < 10) return "Software Developer";
    if (level < 20) return "Senior Developer";
    if (level < 50) return "Expert Programmer";
    return "Python Master";
  }
}

export const gamificationService = new GamificationService();