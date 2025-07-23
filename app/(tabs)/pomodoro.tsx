import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PomodoroScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Removed vibecode logo */}
      <View style={styles.menuButtonWrapper}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>MENU</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Work Time</Text>
        <Text style={styles.subtitle}>5 pomodoros completed</Text>
        <View style={styles.timerCircle}>
          {/* Placeholder for circular progress */}
          <Text style={styles.timerText}>24:47</Text>
          <Text style={styles.timerSubText}>25:00</Text>
        </View>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="refresh" size={28} color="#6C7A93" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.pauseButton]}>
            <Ionicons name="pause" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play" size={28} color="#6C7A93" />
          </TouchableOpacity>
        </View>
        <Text style={styles.statusText}>Timer is running</Text>
      </View>
      {/* Removed custom tab bar at the bottom */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  // Removed header and vibecodeBadge styles
  menuButtonWrapper: { position: 'absolute', left: 12, top: 84, zIndex: 2 },
  menuButton: { backgroundColor: '#FF9C42', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, elevation: 2 },
  menuButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6C7A93', marginBottom: 18 },
  timerCircle: { width: 260, height: 260, borderRadius: 130, borderWidth: 10, borderColor: '#E5E8EF', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderStyle: 'solid' },
  timerText: { fontSize: 54, fontWeight: '600', color: '#222' },
  timerSubText: { fontSize: 20, color: '#6C7A93', marginTop: -8 },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  controlButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0F2F7', alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 },
  pauseButton: { backgroundColor: '#3478F6' },
  statusText: { fontSize: 16, color: '#6C7A93', textAlign: 'center' },
  // Removed tabBarPlaceholder, tabBar, tabItem, tabItemActive, tabLabel, tabLabelActive styles
}); 