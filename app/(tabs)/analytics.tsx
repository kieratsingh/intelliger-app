import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Analytics</Text>
        <Text style={styles.subheader}>Your productivity overview</Text>
        <Text style={styles.sectionTitle}>Pomodoro Statistics</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <Ionicons name="time-outline" size={28} color="#3478F6" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Completed Sessions</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Ionicons name="timer-outline" size={28} color="#1DBF73" />
            <Text style={styles.statValue}>2h 5m</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxPurple]}>
            <Ionicons name="cafe-outline" size={28} color="#A259FF" />
            <Text style={styles.statValue}>1h 15m</Text>
            <Text style={styles.statLabel}>Break Time</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxYellow]}>
            <Ionicons name="time" size={28} color="#FFB800" />
            <Text style={styles.statValue}>3h 20m</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Task Statistics</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <Ionicons name="list-outline" size={28} color="#3478F6" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGreen]}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#1DBF73" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxPurple]}>
            <Ionicons name="trending-up-outline" size={28} color="#A259FF" />
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxYellow]}>
            <Ionicons name="calendar-outline" size={28} color="#FFB800" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Today's Tasks</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightBox}>
          <Ionicons name="bulb-outline" size={22} color="#FFB800" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.insightTitle}>Focus Performance</Text>
            <Text style={styles.insightText}>Excellent focus! You're building great productivity habits.</Text>
          </View>
        </View>
        <View style={styles.insightBox}>
          <Ionicons name="trending-up-outline" size={22} color="#1DBF73" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.insightTitle}>Task Completion</Text>
            <Text style={styles.insightText}>No tasks completed yet. Add tasks to get started!</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.menuButtonWrapper}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>MENU</Text>
        </TouchableOpacity>
      </View>
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
  menuButtonWrapper: { position: 'absolute', left: 16, top: 80, zIndex: 2 },
  menuButton: { backgroundColor: '#FF9C42', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 10, elevation: 2 },
  menuButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
}); 