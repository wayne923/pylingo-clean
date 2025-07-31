interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export const calculateAchievements = (
  completedLessons: Set<number>,
  currentStreak: number,
  totalLessons: number
): Achievement[] => {
  const completedCount = completedLessons.size;
  
  return [
    {
      id: 'first_lesson',
      title: 'First Steps',
      description: 'Complete your first Python lesson',
      icon: '🎯',
      unlocked: completedCount >= 1,
      progress: Math.min(completedCount, 1),
      maxProgress: 1
    },
    {
      id: 'five_lessons',
      title: 'Getting Started',
      description: 'Complete 5 lessons',
      icon: '🚀',
      unlocked: completedCount >= 5,
      progress: Math.min(completedCount, 5),
      maxProgress: 5
    },
    {
      id: 'ten_lessons',
      title: 'Python Explorer',
      description: 'Complete 10 lessons',
      icon: '🐍',
      unlocked: completedCount >= 10,
      progress: Math.min(completedCount, 10),
      maxProgress: 10
    },
    {
      id: 'streak_3',
      title: '3-Day Streak',
      description: 'Learn for 3 days in a row',
      icon: '🔥',
      unlocked: currentStreak >= 3,
      progress: Math.min(currentStreak, 3),
      maxProgress: 3
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Learn for 7 days in a row',
      icon: '⚡',
      unlocked: currentStreak >= 7,
      progress: Math.min(currentStreak, 7),
      maxProgress: 7
    },
    {
      id: 'track_complete',
      title: 'Track Master',
      description: 'Complete an entire learning track',
      icon: '🏆',
      unlocked: completedCount === totalLessons && totalLessons > 0,
      progress: completedCount,
      maxProgress: totalLessons
    },
    {
      id: 'functions_master',
      title: 'Function Expert',
      description: 'Complete all function-related lessons',
      icon: '⚙️',
      unlocked: false, // This would need lesson tracking by concept
      progress: 0,
      maxProgress: 3
    },
    {
      id: 'error_handler',
      title: 'Bug Squasher',
      description: 'Complete error handling lessons',
      icon: '🐛',
      unlocked: false,
      progress: 0,
      maxProgress: 2
    }
  ];
};