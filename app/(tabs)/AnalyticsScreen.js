import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAnalytics } from './analyticsContext';
import { tasksContext } from './tasksContext';

export default function AnalyticsScreen() {
  const { sessionData, taskData, getInsights, updateTaskData } = useAnalytics();
  const { tasks = [] } = React.useContext(tasksContext) || {};

  // Update task data when tasks change
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    updateTaskData(tasks.length, completedTasks);
  }, [tasks, updateTaskData]);

  // Utility function to format time
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Calculate total time
  const totalTime = sessionData.totalFocusTime + sessionData.totalBreakTime + sessionData.totalLongBreakTime + sessionData.totalActiveRecallTime;

  // Get insights
  const insights = getInsights();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Analytics</Text>
        <Text style={styles.subheader}>Your productivity overview</Text>
        
        <Text style={styles.sectionTitle}>Pomodoro Statistics</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <Ionicons name="time-outline" size={28} color="#3478F6" />
            <Text style={styles.statValue}>{sessionData.totalSessions}</Text>
            <Text style={styles.statLabel}>Completed Sessions</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Ionicons name="timer-outline" size={28} color="#1DBF73" />
            <Text style={styles.statValue}>{formatTime(sessionData.totalFocusTime)}</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxPurple]}>
            <Ionicons name="cafe-outline" size={28} color="#A259FF" />
            <Text style={styles.statValue}>{formatTime(sessionData.totalBreakTime + sessionData.totalLongBreakTime)}</Text>
            <Text style={styles.statLabel}>Break Time</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxYellow]}>
            <Ionicons name="time" size={28} color="#FFB800" />
            <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <Ionicons name="today-outline" size={28} color="#3478F6" />
            <Text style={styles.statValue}>{sessionData.todaySessions}</Text>
            <Text style={styles.statLabel}>Today's Sessions</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Ionicons name="trending-up-outline" size={28} color="#1DBF73" />
            <Text style={styles.statValue}>{formatTime(sessionData.todayFocusTime)}</Text>
            <Text style={styles.statLabel}>Today's Focus</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Task Statistics</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <Ionicons name="list-outline" size={28} color="#3478F6" />
            <Text style={styles.statValue}>{taskData.totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#1DBF73" />
            <Text style={styles.statValue}>{taskData.completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxPurple]}>
            <Ionicons name="trending-up-outline" size={28} color="#A259FF" />
            <Text style={styles.statValue}>{taskData.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxYellow]}>
            <Ionicons name="calendar-outline" size={28} color="#FFB800" />
            <Text style={styles.statValue}>{taskData.todayTasks}</Text>
            <Text style={styles.statLabel}>Today's Tasks</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightBox}>
            <Ionicons name={insight.icon} size={22} color={insight.color} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          </View>
        ))}

        {/* Weekly Progress Section */}
        {sessionData.weeklyData.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <View style={styles.weeklyContainer}>
              {sessionData.weeklyData.map((day, index) => (
                <View key={index} style={styles.weeklyDay}>
                  <Text style={styles.weeklyDayLabel}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <View style={styles.weeklyBar}>
                    <View 
                      style={[
                        styles.weeklyBarFill, 
                        { 
                          height: Math.max(4, (day.sessions / Math.max(...sessionData.weeklyData.map(d => d.sessions))) * 40) 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.weeklyValue}>{day.sessions}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { paddingBottom: 32 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#222', marginTop: 24, marginLeft: 24 },
  subheader: { fontSize: 16, color: '#6C7A93', marginBottom: 18, marginLeft: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginTop: 24, marginBottom: 12, marginLeft: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center', elevation: 1 },
  statBoxBlue: { borderWidth: 1, borderColor: '#B0D0FF' },
  statBoxGreen: { borderWidth: 1, borderColor: '#B0FFD0' },
  statBoxPurple: { borderWidth: 1, borderColor: '#D0B0FF' },
  statBoxYellow: { borderWidth: 1, borderColor: '#FFE5B0' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#222', marginTop: 8 },
  statLabel: { fontSize: 14, color: '#6C7A93', marginTop: 2, textAlign: 'center' },
  insightBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 24, marginBottom: 12, elevation: 1 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  insightText: { fontSize: 14, color: '#6C7A93' },
  weeklyContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'flex-end', 
    marginHorizontal: 24, 
    marginTop: 12,
    height: 80,
    paddingBottom: 8
  },
  weeklyDay: { alignItems: 'center', flex: 1 },
  weeklyDayLabel: { fontSize: 12, color: '#6C7A93', marginBottom: 4 },
  weeklyBar: { 
    width: 20, 
    height: 40, 
    backgroundColor: '#E5E8EF', 
    borderRadius: 10, 
    justifyContent: 'flex-end',
    marginBottom: 4
  },
  weeklyBarFill: { 
    backgroundColor: '#3478F6', 
    borderRadius: 10, 
    minHeight: 4
  },
  weeklyValue: { fontSize: 12, color: '#222', fontWeight: 'bold' },
}); 