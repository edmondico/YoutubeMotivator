export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedDuration: number; // minutos
  actualDuration?: number; // minutos
  dueDate?: Date;
  scheduledDate?: Date; // Nueva propiedad para el calendario
  createdAt: Date;
  completedAt?: Date;
  category: 'video-creation' | 'editing' | 'research' | 'marketing' | 'other';
  xpReward: number;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  targetVideos: number;
  currentVideos: number;
  xpReward: number;
  isCompleted: boolean;
}

export interface YouTubeStats {
  subscriberCount: number;
  lastVideoDate: Date;
  daysSinceLastVideo: number;
  dailySubGrowth: number;
  lastVideoSubGrowth: number;
  totalViews: number;
  averageViewsPerVideo: number;
  channelId: string;
  customUrl: string;
  weeklySubGrowth?: number;
  videoCount?: number;
}

export interface UserStats {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  completedTasks: number;
  streak: number; // días consecutivos completando tareas
  totalVideosMade: number;
}

export interface UserGoals {
  id: string;
  dailyViewsTarget: number;
  subscribersTarget: number;
  subscribersTargetDate: Date;
  weeklySubscribersTarget: number;
  videosPerWeek: number;
  dailyTasksTarget: number;
  streakTarget: number;
}

export interface AppConfig {
  userId?: string;
  channelId?: string;
  channelName?: string;
  apiKey?: string;
  goals: UserGoals;
  notifications: {
    enabled: boolean;
    reminderTimes: string[]; // ["09:00", "18:00"]
    taskReminders: boolean;
    youtubeReminders: boolean;
  };
  theme: {
    primaryColor: string;
    darkMode: boolean;
  };
}

export type ViewMode = 'dashboard' | 'calendar' | 'analytics' | 'youtube-analytics' | 'config';

export interface WeekDay {
  date: Date;
  day: string;
  dayNumber: number;
  tasks: Task[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string | React.ReactElement;
  unlocked: boolean;
  category: 'tasks' | 'youtube' | 'general';
  getProgress?: () => number; // Devuelve un valor de 0 a 100
}

export interface OnboardingGoals {
  weeklySubscribers: number;
  weeklyViews: number;
  weeklyVideos: number;
  dailyTasks: number;
  streakTarget: number;
  subscribersTarget: number;
  subscribersTargetDate: string; // ISO date string
}