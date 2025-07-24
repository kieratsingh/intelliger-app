import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tracks = [
  { title: 'Deep Focus', artist: 'Ambient Collective', duration: '3:45' },
  { title: 'Productivity Flow', artist: 'Study Sounds', duration: '4:12' },
  { title: 'Calm Waters', artist: 'Nature Sounds', duration: '2:58' },
];

export default function MusicScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Music</Text>
      <Text style={styles.subheader}>Focus sounds and break music</Text>
      <View style={styles.segmentedControl}>
        <TouchableOpacity style={[styles.segment, styles.segmentActive]}><Ionicons name="headset" size={18} color="#fff" /><Text style={styles.segmentTextActive}> Focus</Text></TouchableOpacity>
        <TouchableOpacity style={styles.segment}><Ionicons name="cafe-outline" size={18} color="#6C7A93" /><Text style={styles.segmentText}> Break</Text></TouchableOpacity>
        <TouchableOpacity style={styles.segment}><Ionicons name="leaf-outline" size={18} color="#6C7A93" /><Text style={styles.segmentText}> Ambient</Text></TouchableOpacity>
      </View>
      <FlatList
        data={tracks}
        keyExtractor={item => item.title}
        renderItem={({ item }) => (
          <View style={styles.trackItem}>
            <Ionicons name="play" size={28} color="#6C7A93" style={styles.trackIcon} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackArtist}>{item.artist}</Text>
            </View>
            <Text style={styles.trackDuration}>{item.duration}</Text>
          </View>
        )}
        style={styles.trackList}
      />
      <View style={styles.menuButtonWrapper}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>MENU</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB', paddingHorizontal: 0 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#222', marginTop: 24, marginLeft: 24 },
  subheader: { fontSize: 16, color: '#6C7A93', marginBottom: 18, marginLeft: 24 },
  segmentedControl: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 18 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: '#E5E8EF', marginHorizontal: 2 },
  segmentActive: { backgroundColor: '#3478F6' },
  segmentText: { color: '#6C7A93', fontWeight: 'bold', fontSize: 16 },
  segmentTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  trackList: { marginHorizontal: 0 },
  trackItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 24, marginBottom: 12, padding: 16, elevation: 1 },
  trackIcon: { marginRight: 16 },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  trackArtist: { fontSize: 14, color: '#6C7A93' },
  trackDuration: { fontSize: 14, color: '#6C7A93', fontWeight: 'bold' },
  menuButtonWrapper: { position: 'absolute', left: 16, top: 80, zIndex: 2 },
  menuButton: { backgroundColor: '#FF9C42', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 10, elevation: 2 },
  menuButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
}); 