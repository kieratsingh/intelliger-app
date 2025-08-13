import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState({
    totalSessions: 0,
    totalFocusTime: 0, // in minutes
    totalBreakTime: 0, // in minutes
    totalLongBreakTime: 0, // in minutes
    totalActiveRecallTime: 0, // in minutes
    completedCycles: 0,
    currentStreak: 0,
    longestStreak: 0,
    todaySessions: 0,
    todayFocusTime: 0,
    weeklyData: [], // Array of daily data for the last 7 days
  });

  const [taskData, setTaskData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    todayTasks: 0,
    todayCompletedTasks: 0,
    completionRate: 0,
  });

  // Load analytics data on app start
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const savedSessionData = await AsyncStorage.getItem('analyticsSessionData');
      const savedTaskData = await AsyncStorage.getItem('analyticsTaskData');
      
      if (savedSessionData) {
        setSessionData(JSON.parse(savedSessionData));
      }
      if (savedTaskData) {
        setTaskData(JSON.parse(savedTaskData));
      }
    } catch (error) {
      console.log('Error loading analytics data:', error);
    }
  };

  const saveAnalyticsData = async () => {
    try {
      await AsyncStorage.setItem('analyticsSessionData', JSON.stringify(sessionData));
      await AsyncStorage.setItem('analyticsTaskData', JSON.stringify(taskData));
    } catch (error) {
      console.log('Error saving analytics data:', error);
    }
  };

  // Update session data when a Pomodoro session is completed
  const recordSession = (sessionType, duration, isCompleted = true) => {
    const today = new Date().toDateString();
    
    setSessionData(prev => {
      const newData = { ...prev };
      
      if (isCompleted) {
        newData.totalSessions += 1;
        
        switch (sessionType) {
          case 'pomodoro':
            newData.totalFocusTime += duration;
            newData.todayFocusTime += duration;
            break;
          case 'shortBreak':
            newData.totalBreakTime += duration;
            break;
          case 'longBreak':
            newData.totalLongBreakTime += duration;
            break;
          case 'activeRecall':
            newData.totalActiveRecallTime += duration;
            break;
        }
        
        // Update today's sessions
        newData.todaySessions += 1;
        
        // Update weekly data
        const weekIndex = newData.weeklyData.findIndex(day => day.date === today);
        if (weekIndex >= 0) {
          newData.weeklyData[weekIndex].sessions += 1;
          newData.weeklyData[weekIndex].focusTime += sessionType === 'pomodoro' ? duration : 0;
        } else {
          // Add new day to weekly data
          newData.weeklyData.push({
            date: today,
            sessions: 1,
            focusTime: sessionType === 'pomodoro' ? duration : 0,
          });
          
          // Keep only last 7 days
          if (newData.weeklyData.length > 7) {
            newData.weeklyData = newData.weeklyData.slice(-7);
          }
        }
      }
      
      return newData;
    });
    
    saveAnalyticsData();
  };

  // Update task data
  const updateTaskData = (totalTasks, completedTasks) => {
    setTaskData(prev => {
      const newData = { ...prev };
      newData.totalTasks = totalTasks;
      newData.completedTasks = completedTasks;
      newData.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Update today's tasks (this would need to be tracked separately)
      // For now, we'll use the current task count
      newData.todayTasks = totalTasks;
      newData.todayCompletedTasks = completedTasks;
      
      return newData;
    });
    
    saveAnalyticsData();
  };

  // Reset daily data (call this at midnight or app start)
  const resetDailyData = () => {
    setSessionData(prev => ({
      ...prev,
      todaySessions: 0,
      todayFocusTime: 0,
    }));
    
    setTaskData(prev => ({
      ...prev,
      todayTasks: 0,
      todayCompletedTasks: 0,
    }));
    
    saveAnalyticsData();
  };

  // Reset all analytics data (for testing/demo purposes)
  const resetAllData = async () => {
    const initialSessionData = {
      totalSessions: 0,
      totalFocusTime: 0,
      totalBreakTime: 0,
      totalLongBreakTime: 0,
      totalActiveRecallTime: 0,
      completedCycles: 0,
      currentStreak: 0,
      longestStreak: 0,
      todaySessions: 0,
      todayFocusTime: 0,
      weeklyData: [],
    };

    const initialTaskData = {
      totalTasks: 0,
      completedTasks: 0,
      todayTasks: 0,
      todayCompletedTasks: 0,
      completionRate: 0,
    };

    setSessionData(initialSessionData);
    setTaskData(initialTaskData);
    
    try {
      await AsyncStorage.removeItem('analyticsSessionData');
      await AsyncStorage.removeItem('analyticsTaskData');
    } catch (error) {
      console.log('Error resetting analytics data:', error);
    }
  };

  // Get insights based on current data
  const getInsights = () => {
    const insights = [];
    
    // Focus performance insight
    if (sessionData.todayFocusTime > 120) { // More than 2 hours
      insights.push({
        type: 'focus',
        title: 'Focus Performance',
        text: 'Excellent focus! You\'re building great productivity habits.',
        icon: 'bulb-outline',
        color: '#FFB800'
      });
    } else if (sessionData.todayFocusTime > 60) { // More than 1 hour
      insights.push({
        type: 'focus',
        title: 'Focus Performance',
        text: 'Good progress! Keep up the consistent work sessions.',
        icon: 'bulb-outline',
        color: '#FFB800'
      });
    } else if (sessionData.todayFocusTime > 0) {
      insights.push({
        type: 'focus',
        title: 'Focus Performance',
        text: 'Getting started! Every session counts toward building better habits.',
        icon: 'bulb-outline',
        color: '#FFB800'
      });
    } else {
      insights.push({
        type: 'focus',
        title: 'Focus Performance',
        text: 'No sessions today. Start a Pomodoro to begin tracking your productivity!',
        icon: 'bulb-outline',
        color: '#FFB800'
      });
    }
    
    // Task completion insight
    if (taskData.totalTasks === 0) {
      insights.push({
        type: 'tasks',
        title: 'Task Completion',
        text: 'No tasks added yet. Add tasks to get started!',
        icon: 'trending-up-outline',
        color: '#1DBF73'
      });
    } else if (taskData.completionRate >= 80) {
      insights.push({
        type: 'tasks',
        title: 'Task Completion',
        text: `Amazing! You've completed ${taskData.completionRate}% of your tasks.`,
        icon: 'trending-up-outline',
        color: '#1DBF73'
      });
    } else if (taskData.completionRate >= 50) {
      insights.push({
        type: 'tasks',
        title: 'Task Completion',
        text: `Good progress! You've completed ${taskData.completionRate}% of your tasks.`,
        icon: 'trending-up-outline',
        color: '#1DBF73'
      });
    } else {
      insights.push({
        type: 'tasks',
        title: 'Task Completion',
        text: `You've completed ${taskData.completionRate}% of your tasks. Keep pushing forward!`,
        icon: 'trending-up-outline',
        color: '#1DBF73'
      });
    }
    
    return insights;
  };

  const value = {
    sessionData,
    taskData,
    recordSession,
    updateTaskData,
    resetDailyData,
    resetAllData,
    getInsights,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
