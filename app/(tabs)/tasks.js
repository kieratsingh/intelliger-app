import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { tasksContext } from './tasksContext';

export default function TasksScreen() {
  const [taskInput, setTaskInput] = React.useState('');
  const { tasks, setTasks } = React.useContext(tasksContext);

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { title: taskInput.trim(), completed: false }]);
      setTaskInput('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tasks</Text>
      <Text style={styles.subheader}>{tasks.filter(t => t.completed).length} of {tasks.length} completed</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="#B0B8C7"
          value={taskInput}
          onChangeText={setTaskInput}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#B0B8C7" />
          <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={styles.todoCategory}>To-dos</Text>
          <FlatList
            data={tasks}
            keyExtractor={(item, idx) => item.title + idx}
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <Ionicons name="ellipse-outline" size={22} color="#3478F6" style={{ marginRight: 8 }} />
                <Text style={styles.taskTitle}>{item.title}</Text>
              </View>
            )}
          />
        </View>
      )}
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
  todoCategory: { fontSize: 18, fontWeight: 'bold', color: '#3478F6', marginLeft: 24, marginBottom: 8 },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  taskTitle: { fontSize: 16, color: '#222' },
}); 