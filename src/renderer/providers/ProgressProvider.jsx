import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProgressContext = createContext({
  userProgress: {},
  dailyGoal: 30,
  streak: 0,
  totalXP: 0,
  level: 1,
  achievements: [],
  updateProgress: () => {},
  addXP: () => {},
  completeLesson: () => {},
  setDailyGoal: () => {},
  getProgressStats: () => {},
});

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

const INITIAL_PROGRESS = {
  totalXP: 0,
  level: 1,
  streak: 0,
  dailyGoal: 30, // minutes
  dailyProgress: 0,
  lastStudyDate: null,
  lessonsCompleted: 0,
  wordsLearned: 0,
  pronunciationAccuracy: 0,
  chatMessages: 0,
  achievements: [],
  weeklyStats: {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  },
  subjects: {
    vocabulary: { xp: 0, level: 1, progress: 0 },
    grammar: { xp: 0, level: 1, progress: 0 },
    pronunciation: { xp: 0, level: 1, progress: 0 },
    conversation: { xp: 0, level: 1, progress: 0 },
  }
};

const ACHIEVEMENTS = [
  { id: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', xp: 50, icon: '🎯' },
  { id: 'streak_3', name: 'Getting Started', description: 'Maintain a 3-day streak', xp: 100, icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', xp: 200, icon: '⚡' },
  { id: 'streak_30', name: 'Month Master', description: 'Maintain a 30-day streak', xp: 500, icon: '👑' },
  { id: 'words_100', name: 'Word Collector', description: 'Learn 100 new words', xp: 150, icon: '📚' },
  { id: 'words_500', name: 'Vocabulary Expert', description: 'Learn 500 new words', xp: 300, icon: '🧠' },
  { id: 'pronunciation_master', name: 'Perfect Pronunciation', description: 'Achieve 95% accuracy in pronunciation', xp: 250, icon: '🎤' },
  { id: 'chat_enthusiast', name: 'Chat Enthusiast', description: 'Send 100 chat messages', xp: 100, icon: '💬' },
  { id: 'level_10', name: 'Rising Star', description: 'Reach level 10', xp: 300, icon: '⭐' },
  { id: 'level_25', name: 'Language Learner', description: 'Reach level 25', xp: 500, icon: '🌟' },
  { id: 'daily_goal_week', name: 'Consistent Learner', description: 'Meet daily goal for 7 days', xp: 200, icon: '📈' },
];

export function ProgressProvider({ children }) {
  const [userProgress, setUserProgress] = useState(INITIAL_PROGRESS);

  // Load progress from storage on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await window.electronAPI?.loadProgress?.();
        if (savedProgress) {
          setUserProgress(prev => ({ ...prev, ...savedProgress }));
        } else {
          // Fallback to localStorage
          const localProgress = localStorage.getItem('lingo-progress');
          if (localProgress) {
            setUserProgress(prev => ({ ...prev, ...JSON.parse(localProgress) }));
          }
        }
      } catch (error) {
        console.warn('Failed to load progress:', error);
        // Try localStorage as fallback
        const localProgress = localStorage.getItem('lingo-progress');
        if (localProgress) {
          setUserProgress(prev => ({ ...prev, ...JSON.parse(localProgress) }));
        }
      }
    };

    loadProgress();
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await window.electronAPI?.saveProgress?.(userProgress);
      } catch (error) {
        console.warn('Failed to save progress via Electron API:', error);
      }
      // Always save to localStorage as fallback
      localStorage.setItem('lingo-progress', JSON.stringify(userProgress));
    };

    saveProgress();
  }, [userProgress]);

  // Calculate level from XP
  const calculateLevel = useCallback((xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }, []);

  // Calculate XP needed for next level
  const getXPForNextLevel = useCallback((level) => {
    return Math.pow(level, 2) * 100;
  }, []);

  // Update streak based on study activity
  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastStudy = userProgress.lastStudyDate;
    
    if (!lastStudy) {
      return 1; // First day
    }
    
    const lastStudyDate = new Date(lastStudy);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastStudyDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return userProgress.streak + 1; // Continue streak
    } else if (diffDays === 0) {
      return userProgress.streak; // Same day
    } else {
      return 1; // Reset streak
    }
  }, [userProgress.lastStudyDate, userProgress.streak]);

  // Check for new achievements
  const checkAchievements = useCallback((newProgress) => {
    const newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (newProgress.achievements.includes(achievement.id)) return;
      
      let earned = false;
      
      switch (achievement.id) {
        case 'first_lesson':
          earned = newProgress.lessonsCompleted >= 1;
          break;
        case 'streak_3':
          earned = newProgress.streak >= 3;
          break;
        case 'streak_7':
          earned = newProgress.streak >= 7;
          break;
        case 'streak_30':
          earned = newProgress.streak >= 30;
          break;
        case 'words_100':
          earned = newProgress.wordsLearned >= 100;
          break;
        case 'words_500':
          earned = newProgress.wordsLearned >= 500;
          break;
        case 'pronunciation_master':
          earned = newProgress.pronunciationAccuracy >= 95;
          break;
        case 'chat_enthusiast':
          earned = newProgress.chatMessages >= 100;
          break;
        case 'level_10':
          earned = newProgress.level >= 10;
          break;
        case 'level_25':
          earned = newProgress.level >= 25;
          break;
        case 'daily_goal_week':
          // Check if daily goal was met for 7 consecutive days
          const weekValues = Object.values(newProgress.weeklyStats);
          const consecutiveDays = weekValues.reduce((count, minutes) => {
            return minutes >= newProgress.dailyGoal ? count + 1 : 0;
          }, 0);
          earned = consecutiveDays >= 7;
          break;
      }
      
      if (earned) {
        newAchievements.push(achievement);
      }
    });
    
    return newAchievements;
  }, []);

  // Add XP and update level
  const addXP = useCallback((amount, subject = null) => {
    setUserProgress(prev => {
      const newTotalXP = prev.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);
      const newStreak = updateStreak();
      
      let newProgress = {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        streak: newStreak,
        lastStudyDate: new Date().toDateString(),
      };
      
      // Update subject-specific progress
      if (subject && newProgress.subjects[subject]) {
        const subjectXP = newProgress.subjects[subject].xp + amount;
        const subjectLevel = calculateLevel(subjectXP);
        newProgress.subjects[subject] = {
          ...newProgress.subjects[subject],
          xp: subjectXP,
          level: subjectLevel,
        };
      }
      
      // Check for new achievements
      const newAchievements = checkAchievements(newProgress);
      if (newAchievements.length > 0) {
        newProgress.achievements = [...newProgress.achievements, ...newAchievements.map(a => a.id)];
        newProgress.totalXP += newAchievements.reduce((sum, a) => sum + a.xp, 0);
        newProgress.level = calculateLevel(newProgress.totalXP);
        
        // Show achievement notification
        newAchievements.forEach(achievement => {
          window.electronAPI?.showNotification?.(`Achievement Unlocked: ${achievement.name}`, {
            body: achievement.description,
            icon: achievement.icon,
          });
        });
      }
      
      return newProgress;
    });
  }, [calculateLevel, updateStreak, checkAchievements]);

  // Complete a lesson
  const completeLesson = useCallback((lessonData) => {
    setUserProgress(prev => {
      const xpGained = lessonData.xp || 50;
      const newProgress = {
        ...prev,
        lessonsCompleted: prev.lessonsCompleted + 1,
        wordsLearned: prev.wordsLearned + (lessonData.newWords || 0),
        dailyProgress: prev.dailyProgress + (lessonData.duration || 5),
      };
      
      // Update weekly stats
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      if (newProgress.weeklyStats[today] !== undefined) {
        newProgress.weeklyStats[today] += lessonData.duration || 5;
      }
      
      return newProgress;
    });
    
    addXP(lessonData.xp || 50, lessonData.subject);
  }, [addXP]);

  // Update general progress
  const updateProgress = useCallback((updates) => {
    setUserProgress(prev => ({ ...prev, ...updates }));
  }, []);

  // Set daily goal
  const setDailyGoal = useCallback((minutes) => {
    setUserProgress(prev => ({ ...prev, dailyGoal: minutes }));
  }, []);

  // Get progress statistics
  const getProgressStats = useCallback(() => {
    const currentLevel = userProgress.level;
    const currentXP = userProgress.totalXP;
    const xpForCurrentLevel = getXPForNextLevel(currentLevel - 1);
    const xpForNextLevel = getXPForNextLevel(currentLevel);
    const progressToNextLevel = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    
    return {
      level: currentLevel,
      xp: currentXP,
      progressToNextLevel: Math.min(progressToNextLevel, 100),
      xpToNextLevel: xpForNextLevel - currentXP,
      streak: userProgress.streak,
      dailyProgress: userProgress.dailyProgress,
      dailyGoal: userProgress.dailyGoal,
      dailyGoalProgress: (userProgress.dailyProgress / userProgress.dailyGoal) * 100,
      achievements: userProgress.achievements.map(id => 
        ACHIEVEMENTS.find(a => a.id === id)
      ).filter(Boolean),
      weeklyStats: userProgress.weeklyStats,
    };
  }, [userProgress, getXPForNextLevel]);

  const value = {
    userProgress,
    dailyGoal: userProgress.dailyGoal,
    streak: userProgress.streak,
    totalXP: userProgress.totalXP,
    level: userProgress.level,
    achievements: userProgress.achievements,
    updateProgress,
    addXP,
    completeLesson,
    setDailyGoal,
    getProgressStats,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}