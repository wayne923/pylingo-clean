// Spaced Repetition Service - Based on SuperMemo 2 Algorithm with modern learning science
export interface ReviewItem {
  id: string;
  lessonId: number;
  conceptName: string;
  difficulty: number; // 0.1 (easy) to 1.0 (hard)
  interval: number; // Days until next review
  repetition: number; // Number of successful reviews
  easeFactor: number; // How easy the concept is (1.3 - 2.5)
  lastReviewed: Date;
  nextReview: Date;
  quality: number; // Last response quality (0-5)
  totalReviews: number;
  successfulReviews: number;
  averageResponseTime: number; // milliseconds
  conceptMastery: number; // 0-100%
}

export interface LearningMetrics {
  retentionRate: number;
  averageInterval: number;
  conceptsMastered: number;
  totalConcepts: number;
  streakDays: number;
  weakConcepts: ReviewItem[];
  strongConcepts: ReviewItem[];
  suggestedReviewTime: number; // minutes per day
}

class SpacedRepetitionService {
  private readonly EASE_FACTOR_MIN = 1.3;
  private readonly EASE_FACTOR_MAX = 2.5;
  private readonly INITIAL_INTERVAL = 1;
  private readonly MASTERY_THRESHOLD = 85; // % mastery to consider concept learned

  // Initialize a new concept for spaced repetition
  initializeConcept(lessonId: number, conceptName: string, difficulty: number = 0.5): ReviewItem {
    const now = new Date();
    const nextReview = new Date(now.getTime() + this.INITIAL_INTERVAL * 24 * 60 * 60 * 1000);

    return {
      id: `${lessonId}-${conceptName}-${Date.now()}`,
      lessonId,
      conceptName,
      difficulty,
      interval: this.INITIAL_INTERVAL,
      repetition: 0,
      easeFactor: 2.5,
      lastReviewed: now,
      nextReview,
      quality: 0,
      totalReviews: 0,
      successfulReviews: 0,
      averageResponseTime: 0,
      conceptMastery: 0
    };
  }

  // Calculate next review based on performance (SuperMemo 2 with enhancements)
  calculateNextReview(
    item: ReviewItem, 
    quality: number, 
    responseTime: number,
    contextualFactors: {
      timeOfDay: number; // 0-23 hours
      studySessionLength: number; // minutes
      previousPerformance: number; // 0-1 recent session average
    }
  ): ReviewItem {
    const updatedItem = { ...item };
    
    // Update response time tracking
    updatedItem.averageResponseTime = updatedItem.totalReviews === 0 
      ? responseTime 
      : (updatedItem.averageResponseTime * updatedItem.totalReviews + responseTime) / (updatedItem.totalReviews + 1);
    
    updatedItem.totalReviews++;
    updatedItem.quality = quality;
    updatedItem.lastReviewed = new Date();

    // Quality adjustment based on response time
    let adjustedQuality = quality;
    const expectedTime = this.getExpectedResponseTime(item.difficulty);
    if (responseTime > expectedTime * 2) {
      adjustedQuality = Math.max(0, adjustedQuality - 1); // Penalize slow responses
    } else if (responseTime < expectedTime * 0.5) {
      adjustedQuality = Math.min(5, adjustedQuality + 0.5); // Reward quick correct responses
    }

    // Contextual adjustments
    const contextualMultiplier = this.calculateContextualMultiplier(contextualFactors);
    adjustedQuality = Math.max(0, Math.min(5, adjustedQuality * contextualMultiplier));

    if (adjustedQuality >= 3) {
      // Successful review
      updatedItem.successfulReviews++;
      updatedItem.repetition++;

      // Update ease factor (SuperMemo 2)
      updatedItem.easeFactor = Math.max(
        this.EASE_FACTOR_MIN,
        updatedItem.easeFactor + (0.1 - (5 - adjustedQuality) * (0.08 + (5 - adjustedQuality) * 0.02))
      );

      // Calculate new interval
      if (updatedItem.repetition === 1) {
        updatedItem.interval = 1;
      } else if (updatedItem.repetition === 2) {
        updatedItem.interval = 6;
      } else {
        updatedItem.interval = Math.round(updatedItem.interval * updatedItem.easeFactor);
      }

      // Apply difficulty adjustment
      const difficultyMultiplier = 1 - (updatedItem.difficulty * 0.3);
      updatedItem.interval = Math.max(1, Math.round(updatedItem.interval * difficultyMultiplier));

    } else {
      // Failed review - reset interval but keep ease factor information
      updatedItem.repetition = 0;
      updatedItem.interval = 1;
      updatedItem.easeFactor = Math.max(this.EASE_FACTOR_MIN, updatedItem.easeFactor - 0.2);
    }

    // Calculate concept mastery
    updatedItem.conceptMastery = this.calculateConceptMastery(updatedItem);

    // Set next review date
    const nextReviewTime = new Date();
    nextReviewTime.setDate(nextReviewTime.getDate() + updatedItem.interval);
    updatedItem.nextReview = nextReviewTime;

    return updatedItem;
  }

  // Get expected response time based on difficulty
  private getExpectedResponseTime(difficulty: number): number {
    // Base time: 5 seconds for easy, up to 30 seconds for hard
    return 5000 + (difficulty * 25000);
  }

  // Calculate contextual multiplier for performance adjustment
  private calculateContextualMultiplier(factors: {
    timeOfDay: number;
    studySessionLength: number;
    previousPerformance: number;
  }): number {
    let multiplier = 1.0;

    // Time of day adjustment (people learn better at different times)
    if (factors.timeOfDay >= 9 && factors.timeOfDay <= 11) {
      multiplier += 0.1; // Morning peak
    } else if (factors.timeOfDay >= 14 && factors.timeOfDay <= 16) {
      multiplier += 0.05; // Afternoon peak
    } else if (factors.timeOfDay >= 22 || factors.timeOfDay <= 6) {
      multiplier -= 0.15; // Late night/early morning penalty
    }

    // Study session length (optimal around 25-45 minutes)
    if (factors.studySessionLength >= 25 && factors.studySessionLength <= 45) {
      multiplier += 0.1;
    } else if (factors.studySessionLength > 60) {
      multiplier -= 0.2; // Fatigue penalty
    }

    // Previous performance momentum
    multiplier += (factors.previousPerformance - 0.5) * 0.2;

    return Math.max(0.7, Math.min(1.3, multiplier));
  }

  // Calculate concept mastery percentage
  private calculateConceptMastery(item: ReviewItem): number {
    if (item.totalReviews === 0) return 0;

    const successRate = item.successfulReviews / item.totalReviews;
    const intervalStrength = Math.min(1, item.interval / 30); // Max at 30 days
    const easeStrength = (item.easeFactor - this.EASE_FACTOR_MIN) / (this.EASE_FACTOR_MAX - this.EASE_FACTOR_MIN);
    const repetitionStrength = Math.min(1, item.repetition / 5); // Max at 5 repetitions

    return Math.round(
      (successRate * 40 + intervalStrength * 25 + easeStrength * 20 + repetitionStrength * 15) * 100
    ) / 100;
  }

  // Get items due for review
  getItemsDueForReview(items: ReviewItem[]): ReviewItem[] {
    const now = new Date();
    return items
      .filter(item => item.nextReview <= now)
      .sort((a, b) => {
        // Prioritize by urgency and difficulty
        const urgencyA = (now.getTime() - a.nextReview.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyB = (now.getTime() - b.nextReview.getTime()) / (1000 * 60 * 60 * 24);
        const priorityA = urgencyA + a.difficulty;
        const priorityB = urgencyB + b.difficulty;
        return priorityB - priorityA;
      });
  }

  // Generate personalized review session
  generateReviewSession(
    items: ReviewItem[], 
    availableTime: number, // minutes
    userPreferences: {
      maxNewConcepts: number;
      focusOnWeakAreas: boolean;
      preferredDifficulty?: number;
    }
  ): ReviewItem[] {
    const dueItems = this.getItemsDueForReview(items);
    const estimatedTimePerItem = 2; // minutes per review
    const maxItems = Math.floor(availableTime / estimatedTimePerItem);

    let sessionItems = dueItems.slice(0, maxItems);

    // Focus on weak areas if requested
    if (userPreferences.focusOnWeakAreas) {
      const weakItems = dueItems.filter(item => item.conceptMastery < 70);
      sessionItems = [
        ...weakItems.slice(0, Math.floor(maxItems * 0.7)),
        ...dueItems.filter(item => item.conceptMastery >= 70).slice(0, Math.floor(maxItems * 0.3))
      ].slice(0, maxItems);
    }

    // Add difficulty preference filtering
    if (userPreferences.preferredDifficulty !== undefined) {
      sessionItems = sessionItems.sort((a, b) => {
        const diffA = Math.abs(a.difficulty - userPreferences.preferredDifficulty!);
        const diffB = Math.abs(b.difficulty - userPreferences.preferredDifficulty!);
        return diffA - diffB;
      });
    }

    return sessionItems;
  }

  // Calculate learning metrics and insights
  calculateLearningMetrics(items: ReviewItem[]): LearningMetrics {
    if (items.length === 0) {
      return {
        retentionRate: 0,
        averageInterval: 0,
        conceptsMastered: 0,
        totalConcepts: 0,
        streakDays: 0,
        weakConcepts: [],
        strongConcepts: [],
        suggestedReviewTime: 15
      };
    }

    const totalReviews = items.reduce((sum, item) => sum + item.totalReviews, 0);
    const successfulReviews = items.reduce((sum, item) => sum + item.successfulReviews, 0);
    const retentionRate = totalReviews > 0 ? (successfulReviews / totalReviews) * 100 : 0;

    const averageInterval = items.reduce((sum, item) => sum + item.interval, 0) / items.length;
    
    const conceptsMastered = items.filter(item => item.conceptMastery >= this.MASTERY_THRESHOLD).length;
    
    const weakConcepts = items
      .filter(item => item.conceptMastery < 60 && item.totalReviews > 0)
      .sort((a, b) => a.conceptMastery - b.conceptMastery);
      
    const strongConcepts = items
      .filter(item => item.conceptMastery >= this.MASTERY_THRESHOLD)
      .sort((a, b) => b.conceptMastery - a.conceptMastery);

    // Calculate streak (simplified - would need daily review data)
    const streakDays = this.calculateStreakDays(items);

    // Suggest optimal review time based on due items and performance
    const dueItems = this.getItemsDueForReview(items);
    const suggestedReviewTime = Math.max(10, Math.min(45, dueItems.length * 2));

    return {
      retentionRate: Math.round(retentionRate),
      averageInterval: Math.round(averageInterval * 10) / 10,
      conceptsMastered,
      totalConcepts: items.length,
      streakDays,
      weakConcepts: weakConcepts.slice(0, 5),
      strongConcepts: strongConcepts.slice(0, 5),
      suggestedReviewTime
    };
  }

  // Calculate learning streak
  private calculateStreakDays(items: ReviewItem[]): number {
    // Simplified streak calculation
    // In a real implementation, this would check daily review history
    const recentReviews = items.filter(item => {
      const daysSinceReview = (Date.now() - item.lastReviewed.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReview <= 7; // Reviews in last week
    });

    return Math.min(7, recentReviews.length);
  }

  // Get personalized learning recommendations
  getPersonalizedRecommendations(metrics: LearningMetrics, items: ReviewItem[]): string[] {
    const recommendations: string[] = [];

    if (metrics.retentionRate < 70) {
      recommendations.push("🎯 Focus on understanding over speed - take time to really grasp concepts");
      recommendations.push("📚 Consider reviewing fundamentals before advancing to new topics");
    }

    if (metrics.weakConcepts.length > 3) {
      recommendations.push(`🔄 Spend extra time on: ${metrics.weakConcepts.slice(0, 3).map(c => c.conceptName).join(', ')}`);
    }

    if (metrics.averageInterval < 3) {
      recommendations.push("⚡ Great job! Your concepts are being reinforced frequently");
    } else if (metrics.averageInterval > 14) {
      recommendations.push("🔁 Some concepts need more frequent review to strengthen memory");
    }

    if (metrics.streakDays >= 5) {
      recommendations.push("🔥 Amazing streak! Consistency is the key to mastery");
    } else if (metrics.streakDays < 2) {
      recommendations.push("📅 Try to review a little bit every day for better retention");
    }

    const dueItems = this.getItemsDueForReview(items);
    if (dueItems.length > 10) {
      recommendations.push("⏰ You have many concepts due for review - consider shorter, more frequent sessions");
    }

    return recommendations;
  }

  // Export/import for data persistence
  exportReviewData(items: ReviewItem[]): string {
    return JSON.stringify(items, null, 2);
  }

  importReviewData(jsonData: string): ReviewItem[] {
    try {
      const items = JSON.parse(jsonData);
      return items.map((item: any) => ({
        ...item,
        lastReviewed: new Date(item.lastReviewed),
        nextReview: new Date(item.nextReview)
      }));
    } catch (error) {
      console.error('Failed to import review data:', error);
      return [];
    }
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();