import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TasksScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tasks</Text>
      <Text style={styles.subheader}>0 of 0 completed</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Add a new task..." placeholderTextColor="#B0B8C7" />
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="checkmark-circle-outline" size={64} color="#B0B8C7" />
        <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
      </View>
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
  inputRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 24 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#222', marginRight: 12, borderWidth: 1, borderColor: '#E5E8EF' },
  addButton: { backgroundColor: '#3478F6', borderRadius: 24, padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, color: '#6C7A93', marginTop: 16 },
  menuButtonWrapper: { position: 'absolute', left: 16, top: 80, zIndex: 2 },
  menuButton: { backgroundColor: '#FF9C42', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 10, elevation: 2 },
  menuButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
}); 