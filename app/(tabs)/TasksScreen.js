import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { db } from '../../config/firebase';
import { useAnalytics } from './analyticsContext';

export default function TasksScreen() {
  const [taskInput, setTaskInput] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [priority, setPriority] = useState('');
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('date');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  
  const { updateTaskData } = useAnalytics();

  useEffect(() => {
    const q =
      sortBy === 'priority'
        ? query(collection(db, 'tasks'), orderBy('priority'))
        : query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setTasks(tasksList);
    });

    return () => unsubscribe();
  }, [sortBy]);

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;

    const newTask = {
      title: taskInput.trim(),
      description,
      date: date ? date.toISOString().split('T')[0] : '',
      reminder: reminder ? reminder.toISOString() : '',
      priority,
      completed: false,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, 'tasks'), newTask);
      setTaskInput('');
      setDescription('');
      setDate(null);
      setReminder(null);
      setPriority('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const toggleComplete = async (task) => {
    const ref = doc(db, 'tasks', task.id);
    await updateDoc(ref, { completed: !task.completed });
  };

  // Update analytics when tasks change
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    updateTaskData(tasks.length, completedTasks);
  }, [tasks, updateTaskData]);

  const deleteTask = async (taskId) => {
    const ref = doc(db, 'tasks', taskId);
    await deleteDoc(ref);
  };

  const renderRightActions = (taskId) => (
    <TouchableOpacity
      onPress={() =>
        Alert.alert('Delete Task', 'Are you sure?', [
          { text: 'Cancel' },
          { text: 'Delete', onPress: () => deleteTask(taskId), style: 'destructive' },
        ])
      }
      style={styles.deleteButton}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.taskItem}>
        <Checkbox value={item.completed} onValueChange={() => toggleComplete(item)} />
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.taskTitle, item.completed && { textDecorationLine: 'line-through', color: '#999' }]}>
            {item.title}
          </Text>
          {item.description ? <Text style={styles.taskSub}>{item.description}</Text> : null}
          {item.date ? <Text style={styles.taskSub}>Due: {item.date}</Text> : null}
          {item.reminder ? (
            <Text style={styles.taskSub}>Reminder: {new Date(item.reminder).toLocaleString()}</Text>
          ) : null}
          {item.priority ? <Text style={styles.taskSub}>Priority: {item.priority}</Text> : null}
        </View>
      </View>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tasks</Text>
      <Text style={styles.subheader}>
        {tasks.filter((t) => t.completed).length} of {tasks.length} completed
      </Text>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a new task title..."
            placeholderTextColor="#B0B8C7"
            value={taskInput}
            onChangeText={setTaskInput}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.multiInput}
          placeholder="Description (optional)"
          placeholderTextColor="#B0B8C7"
          value={description}
          onChangeText={setDescription}
        />

        {/* Priority Dropdown */}
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={priority}
            onValueChange={(itemValue) => setPriority(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Priority" value="" />
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="High" value="High" />
          </Picker>
        </View>

        {/* Date Picker */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={18} color="#444" />
          <Text style={styles.dateText}>
            {date ? `Due Date: ${date.toDateString()}` : 'Pick Due Date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={(e, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Reminder Picker */}
        <TouchableOpacity onPress={() => setShowReminderPicker(true)} style={styles.dateButton}>
          <Ionicons name="alarm-outline" size={18} color="#444" />
          <Text style={styles.dateText}>
            {reminder ? `Reminder: ${reminder.toLocaleString()}` : 'Set Reminder'}
          </Text>
        </TouchableOpacity>
        {showReminderPicker && (
          <DateTimePicker
            value={reminder || new Date()}
            mode="datetime"
            display="default"
            onChange={(e, selectedDate) => {
              setShowReminderPicker(false);
              if (selectedDate) setReminder(selectedDate);
            }}
          />
        )}
      </KeyboardAvoidingView>

      <View style={{ marginHorizontal: 24, marginVertical: 10 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Sort by:</Text>
        <Picker selectedValue={sortBy} onValueChange={(val) => setSortBy(val)} style={styles.picker}>
          <Picker.Item label="Date Created" value="date" />
          <Picker.Item label="Priority" value="priority" />
        </Picker>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#B0B8C7" />
            <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#222', marginTop: 24, marginLeft: 24 },
  subheader: { fontSize: 16, color: '#6C7A93', marginBottom: 18, marginLeft: 24 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E8EF',
  },
  addButton: { backgroundColor: '#3478F6', borderRadius: 24, padding: 8 },
  multiInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E5E8EF',
    marginHorizontal: 24,
    marginBottom: 12,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E8EF',
    marginHorizontal: 24,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#222',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#E5E8EF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#444',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  emptyText: { fontSize: 18, color: '#6C7A93', marginTop: 16 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  taskTitle: { fontSize: 16, color: '#222', fontWeight: 'bold' },
  taskSub: { fontSize: 13, color: '#6C7A93' },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});