import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { tasksContext } from './tasksContext';

export default function PomodoroScreen() {
  // Timer settings state
  const [settings, setSettings] = useState({
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    aiAidedActiveRecall: false,
    activeRecallTimed: true,
    activeRecallDuration: 10
  });

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(settings.pomodoroDuration * 60);
  const [currentPhase, setCurrentPhase] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak', 'activeRecall'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetOptions, setShowResetOptions] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [validationErrors, setValidationErrors] = useState({});
  const [fluidProgress, setFluidProgress] = useState(0); // 0-1 for SVG arc
  const [activeRecallSummary, setActiveRecallSummary] = useState('');
  const [activeRecallTopic, setActiveRecallTopic] = useState('your recent work');

  const intervalRef = useRef(null);
  const animationRef = useRef(null);
  const animationStart = useRef(null);
  const lastSecond = useRef(currentTime);
  const { tasks = [] } = React.useContext(tasksContext) || {};
  const [selectedTitle, setSelectedTitle] = useState('Work Time');

  // Load default settings on app start
  useEffect(() => {
    loadDefaultSettings();
  }, []);

  const loadDefaultSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('pomodoroDefaultSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setCurrentTime(parsedSettings.pomodoroDuration * 60);
      }
    } catch (error) {
      console.log('Error loading default settings:', error);
    }
  };

  const saveAsDefault = async () => {
    try {
      await AsyncStorage.setItem('pomodoroDefaultSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Settings saved as default!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save default settings');
    }
  };

  const validateSettings = () => {
    const errors = {};
    if (!tempSettings.pomodoroDuration || tempSettings.pomodoroDuration <= 0) {
      errors.pomodoroDuration = true;
    }
    if (!tempSettings.shortBreakDuration || tempSettings.shortBreakDuration <= 0) {
      errors.shortBreakDuration = true;
    }
    if (!tempSettings.longBreakDuration || tempSettings.longBreakDuration <= 0) {
      errors.longBreakDuration = true;
    }
    if (!tempSettings.pomodorosUntilLongBreak || tempSettings.pomodorosUntilLongBreak <= 0) {
      errors.pomodorosUntilLongBreak = true;
    }
    return errors;
  };

  const handleSaveSettings = () => {
    const errors = validateSettings();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert('Validation Error', 'Please fill in all required fields with valid values.');
      return;
    }

    setValidationErrors({});
    setSettings(tempSettings);
    // Reset cycle with new settings
    setIsRunning(false);
    setCurrentTime(tempSettings.pomodoroDuration * 60);
    setCurrentPhase('pomodoro');
    setPomodoroCount(0);
    setCompletedPomodoros(0);
    setShowSettings(false);
  };

  const openSettings = () => {
    setTempSettings(settings);
    setValidationErrors({});
    setShowSettings(true);
  };

  // Fluid progress animation
  useEffect(() => {
    if (!isRunning || currentPhase === 'activeRecall') {
      setFluidProgress((getPhaseDuration() - currentTime) / getPhaseDuration());
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    let startTimestamp = null;
    let prevTime = currentTime;
    const totalDuration = getPhaseDuration();
    function animate(ts) {
      if (!startTimestamp) startTimestamp = ts;
      if (!animationStart.current) animationStart.current = ts;
      const elapsed = (ts - animationStart.current) / 1000;
      let progress = (totalDuration - (prevTime - elapsed)) / totalDuration;
      progress = Math.max(0, Math.min(1, progress));
      setFluidProgress(progress);
      if (isRunning && prevTime - elapsed > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationStart.current = null;
    };
    // eslint-disable-next-line
  }, [isRunning, currentPhase, currentTime]);

  // Timer logic (update time every second)
  useEffect(() => {
    if (isRunning && currentPhase !== 'activeRecall') {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime <= 1) {
            handlePhaseComplete();
            return getPhaseDuration();
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentPhase]);

  const getPhaseDuration = () => {
    switch (currentPhase) {
      case 'pomodoro':
        return settings.pomodoroDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      case 'activeRecall':
        return settings.activeRecallTimed ? settings.activeRecallDuration * 60 : 0;
      default:
        return settings.pomodoroDuration * 60;
    }
  };

  const handlePhaseComplete = () => {
    if (currentPhase === 'pomodoro') {
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      setCompletedPomodoros(prev => prev + 1);
      
      if (newPomodoroCount >= settings.pomodorosUntilLongBreak) {
        setCurrentPhase('longBreak');
        setPomodoroCount(0);
      } else {
        setCurrentPhase('shortBreak');
      }
    } else if (currentPhase === 'shortBreak') {
      setCurrentPhase('pomodoro');
    } else if (currentPhase === 'longBreak') {
      if (settings.aiAidedActiveRecall) {
        setCurrentPhase('activeRecall');
        setActiveRecallSummary('');
        setActiveRecallTopic('your recent work');
      } else {
        setCurrentPhase('pomodoro');
        setPomodoroCount(0);
      }
    } else if (currentPhase === 'activeRecall') {
      setCurrentPhase('pomodoro');
      setPomodoroCount(0);
    }
  };

  const handleActiveRecallSubmit = () => {
    if (activeRecallSummary.trim()) {
      // Here you could save the summary or send it to an AI service
      Alert.alert('Summary Submitted!', 'Great job on your active recall session!');
      setActiveRecallSummary('');
      // Move to next phase
      setCurrentPhase('pomodoro');
      setPomodoroCount(0);
    } else {
      Alert.alert('Empty Summary', 'Please enter a summary before submitting.');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentTime(getPhaseDuration());
    setShowResetOptions(false);
  };

  const resetCycle = () => {
    setIsRunning(false);
    setCurrentTime(settings.pomodoroDuration * 60);
    setCurrentPhase('pomodoro');
    setPomodoroCount(0);
    setCompletedPomodoros(0);
    setShowResetOptions(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'pomodoro':
        return `Pomodoro ${pomodoroCount + 1} of ${settings.pomodorosUntilLongBreak}`;
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      case 'activeRecall':
        return 'AI-Aided Active Recall';
      default:
        return 'Work Time';
    }
  };

  const getProgressPercentage = () => {
    const totalDuration = getPhaseDuration();
    const remaining = currentTime;
    return ((totalDuration - remaining) / totalDuration) * 100;
  };

  const getCycleProgress = () => {
    if (currentPhase === 'pomodoro') {
      return (pomodoroCount / settings.pomodorosUntilLongBreak) * 100;
    } else if (currentPhase === 'shortBreak') {
      return ((pomodoroCount + 1) / settings.pomodorosUntilLongBreak) * 100;
    } else if (currentPhase === 'longBreak' || currentPhase === 'activeRecall') {
      return 100;
    }
    return 0;
  };

  // Helper to build the progress steps array
  const buildProgressSteps = () => {
    const steps = [];
    for (let i = 0; i < settings.pomodorosUntilLongBreak; i++) {
      steps.push({
        key: `pomodoro-${i + 1}`,
        label: `Pomodoro ${i + 1}`,
        type: 'pomodoro',
        index: i
      });
      if (i < settings.pomodorosUntilLongBreak - 1) {
        steps.push({
          key: `shortbreak-${i + 1}`,
          label: 'Short Break',
          type: 'shortBreak',
          index: i
        });
      }
    }
    steps.push({ key: 'longbreak', label: 'Long Break', type: 'longBreak' });
    if (settings.aiAidedActiveRecall) {
      steps.push({ key: 'activeRecall', label: 'AI-Aided Active Recall', type: 'activeRecall' });
    }
    return steps;
  };

  // Find the current step index
  const getCurrentStepIndex = () => {
    const steps = buildProgressSteps();
    let idx = 0;
    let pCount = pomodoroCount;
    if (currentPhase === 'pomodoro') {
      idx = pCount * 2;
    } else if (currentPhase === 'shortBreak') {
      idx = pCount * 2 - 1;
    } else if (currentPhase === 'longBreak') {
      idx = steps.findIndex(s => s.type === 'longBreak');
    } else if (currentPhase === 'activeRecall') {
      idx = steps.findIndex(s => s.type === 'activeRecall');
    }
    return Math.max(0, idx);
  };

  // Timer circle constants
  const CIRCLE_SIZE = 260;
  const STROKE_WIDTH = 10;
  const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progressPercent = fluidProgress * 100;
  const progressStrokeDashoffset = CIRCUMFERENCE * (1 - fluidProgress);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Edit Button */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.editButton} onPress={openSettings}>
          <Ionicons name="create-outline" size={28} color="#3478F6" />
        </TouchableOpacity>
      </View>

      {/* Main Timer Content */}
      <View style={styles.centerContent}>
        {currentPhase === 'activeRecall' ? (
          // Active Recall UI
          <View style={styles.activeRecallContainer}>
            {settings.activeRecallTimed && (
              <View style={styles.activeRecallTimer}>
                <Text style={styles.activeRecallTimerText}>{formatTime(currentTime)}</Text>
              </View>
            )}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Enter 50-word summary on</Text>
              <Text style={styles.summaryTopic}>{activeRecallTopic}</Text>
              <TextInput
                style={styles.summaryInput}
                value={activeRecallSummary}
                onChangeText={setActiveRecallSummary}
                placeholder="Type your summary here..."
                placeholderTextColor="#B0B8C7"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={styles.wordCount}>{activeRecallSummary.length}/200 characters</Text>
              <TouchableOpacity style={styles.submitButton} onPress={handleActiveRecallSubmit}>
                <Text style={styles.submitButtonText}>Submit Summary</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Regular Timer UI
          <>
            <Text style={styles.title}>{getPhaseTitle()}</Text>
            <Text style={styles.subtitle}>{completedPomodoros} pomodoros completed</Text>
            
            {/* Timer Circle with Progress */}
            <View style={styles.timerCircleWrap}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.timerSvg}>
                <G rotation="-90" origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}>
                  {/* Background (gray) */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke="#E5E8EF"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  {/* Progress (blue) */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke="#3478F6"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={progressStrokeDashoffset}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              <View style={styles.timerTextWrap}>
                <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
                <Text style={styles.timerSubText}>{formatTime(getPhaseDuration())}</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlButton} onPress={() => setShowResetOptions(true)}>
                <Ionicons name="refresh" size={28} color="#6C7A93" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.controlButton, isRunning && styles.pauseButton]} onPress={toggleTimer}>
                <Ionicons name={isRunning ? "pause" : "play"} size={32} color={isRunning ? "#fff" : "#6C7A93"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={() => setShowProgress(true)}>
                <Ionicons name="list" size={28} color="#6C7A93" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.statusText}>
              {isRunning ? 'Timer is running' : 'Timer is paused'}
            </Text>
          </>
        )}
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Timer Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color="#6C7A93" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Pomodoro Duration (minutes)</Text>
              <TextInput
                style={[styles.settingInput, validationErrors.pomodoroDuration && styles.errorInput]}
                value={tempSettings.pomodoroDuration ? tempSettings.pomodoroDuration.toString() : ''}
                onChangeText={(text) => {
                  const value = text === '' ? '' : parseInt(text) || '';
                  setTempSettings(prev => ({ ...prev, pomodoroDuration: value }));
                  if (validationErrors.pomodoroDuration) {
                    setValidationErrors(prev => ({ ...prev, pomodoroDuration: false }));
                  }
                }}
                keyboardType="numeric"
                placeholder="25"
              />
              {validationErrors.pomodoroDuration && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>Required</Text>
                </View>
              )}
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Short Break Duration (minutes)</Text>
              <TextInput
                style={[styles.settingInput, validationErrors.shortBreakDuration && styles.errorInput]}
                value={tempSettings.shortBreakDuration ? tempSettings.shortBreakDuration.toString() : ''}
                onChangeText={(text) => {
                  const value = text === '' ? '' : parseInt(text) || '';
                  setTempSettings(prev => ({ ...prev, shortBreakDuration: value }));
                  if (validationErrors.shortBreakDuration) {
                    setValidationErrors(prev => ({ ...prev, shortBreakDuration: false }));
                  }
                }}
                keyboardType="numeric"
                placeholder="5"
              />
              {validationErrors.shortBreakDuration && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>Required</Text>
                </View>
              )}
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Long Break Duration (minutes)</Text>
              <TextInput
                style={[styles.settingInput, validationErrors.longBreakDuration && styles.errorInput]}
                value={tempSettings.longBreakDuration ? tempSettings.longBreakDuration.toString() : ''}
                onChangeText={(text) => {
                  const value = text === '' ? '' : parseInt(text) || '';
                  setTempSettings(prev => ({ ...prev, longBreakDuration: value }));
                  if (validationErrors.longBreakDuration) {
                    setValidationErrors(prev => ({ ...prev, longBreakDuration: false }));
                  }
                }}
                keyboardType="numeric"
                placeholder="15"
              />
              {validationErrors.longBreakDuration && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>Required</Text>
                </View>
              )}
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Pomodoros until Long Break</Text>
              <TextInput
                style={[styles.settingInput, validationErrors.pomodorosUntilLongBreak && styles.errorInput]}
                value={tempSettings.pomodorosUntilLongBreak ? tempSettings.pomodorosUntilLongBreak.toString() : ''}
                onChangeText={(text) => {
                  const value = text === '' ? '' : parseInt(text) || '';
                  setTempSettings(prev => ({ ...prev, pomodorosUntilLongBreak: value }));
                  if (validationErrors.pomodorosUntilLongBreak) {
                    setValidationErrors(prev => ({ ...prev, pomodorosUntilLongBreak: false }));
                  }
                }}
                keyboardType="numeric"
                placeholder="4"
              />
              {validationErrors.pomodorosUntilLongBreak && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>Required</Text>
                </View>
              )}
            </View>

            <View style={styles.settingItem}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.settingLabel}>AI-Aided Active Recall</Text>
                  <Ionicons name="sparkles" size={16} color="#3478F6" style={{ marginLeft: 4 }} />
                </View>
                <Switch
                  value={tempSettings.aiAidedActiveRecall}
                  onValueChange={(value) => setTempSettings(prev => ({ ...prev, aiAidedActiveRecall: value }))}
                  trackColor={{ false: "#E5E8EF", true: "#3478F6" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {tempSettings.aiAidedActiveRecall && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.switchContainer}>
                    <View style={styles.switchLabelContainer}>
                      <Text style={styles.settingLabel}>Timed Active Recall</Text>
                    </View>
                    <Switch
                      value={tempSettings.activeRecallTimed}
                      onValueChange={(value) => setTempSettings(prev => ({ ...prev, activeRecallTimed: value }))}
                      trackColor={{ false: "#E5E8EF", true: "#3478F6" }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>

                {tempSettings.activeRecallTimed && (
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Active Recall Duration (minutes)</Text>
                    <TextInput
                      style={[styles.settingInput, validationErrors.activeRecallDuration && styles.errorInput]}
                      value={tempSettings.activeRecallDuration ? tempSettings.activeRecallDuration.toString() : ''}
                      onChangeText={(text) => {
                        const value = text === '' ? '' : parseInt(text) || '';
                        setTempSettings(prev => ({ ...prev, activeRecallDuration: value }));
                        if (validationErrors.activeRecallDuration) {
                          setValidationErrors(prev => ({ ...prev, activeRecallDuration: false }));
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="10"
                    />
                    {validationErrors.activeRecallDuration && (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                        <Text style={styles.errorText}>Required</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.setDefaultButton} onPress={saveAsDefault}>
              <Text style={styles.setDefaultButtonText}>Set as Default</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.saveButtonText}>Save Changes & Reset Cycle</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Reset Options Modal */}
      <Modal
        visible={showResetOptions}
        transparent
        animationType="fade"
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowResetOptions(false)}>
          <View style={styles.resetModal}>
            <Text style={styles.resetModalTitle}>Reset Options</Text>
            <TouchableOpacity style={styles.resetOption} onPress={resetSession}>
              <Text style={styles.resetOptionText}>Reset This Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetOption} onPress={resetCycle}>
              <Text style={styles.resetOptionText}>Reset Pomodoro Cycle</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Progress Modal */}
      <Modal
        visible={showProgress}
        transparent
        animationType="slide"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pomodoro Progress</Text>
            <TouchableOpacity onPress={() => setShowProgress(false)}>
              <Ionicons name="close" size={24} color="#6C7A93" />
            </TouchableOpacity>
          </View>
          <View style={styles.progressTimelineContainer}>
            {buildProgressSteps().map((step, idx, arr) => {
              const currentIdx = getCurrentStepIndex();
              const isCompleted = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isLast = idx === arr.length - 1;
              // Progress for the current step (0-1)
              let stepProgress = 0;
              if (isCurrent) {
                stepProgress = fluidProgress;
              } else if (isCompleted) {
                stepProgress = 1;
              }
              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineIconCol}>
                    {/* Vertical line above */}
                    {idx > 0 && (
                      <Svg height={32} width={4} style={{ alignSelf: 'center' }}>
                        <Line
                          x1={2}
                          y1={0}
                          x2={2}
                          y2={32}
                          stroke={stepProgress > 0 ? '#3478F6' : '#E5E8EF'}
                          strokeWidth={4}
                          strokeLinecap="round"
                        />
                        {isCurrent && stepProgress > 0 && (
                          <Line
                            x1={2}
                            y1={0}
                            x2={2}
                            y2={32 * stepProgress}
                            stroke="#3478F6"
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                        )}
                      </Svg>
                    )}
                    {/* Step icon */}
                    <View style={[styles.timelineIconWrap, isCurrent && styles.timelineIconCurrentWrap]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark-circle" size={28} color="#3478F6" />
                      ) : isCurrent ? (
                        <View style={styles.timelineCurrentCircle}>
                          <Ionicons name="ellipse" size={18} color="#fff" />
                        </View>
                      ) : (
                        <Ionicons name="ellipse-outline" size={28} color="#B0B8C7" />
                      )}
                    </View>
                    {/* Vertical line below */}
                    {!isLast && (
                      <Svg height={32} width={4} style={{ alignSelf: 'center' }}>
                        <Line
                          x1={2}
                          y1={0}
                          x2={2}
                          y2={32}
                          stroke={isCompleted ? '#3478F6' : '#E5E8EF'}
                          strokeWidth={4}
                          strokeLinecap="round"
                        />
                        {isCurrent && stepProgress > 0 && (
                          <Line
                            x1={2}
                            y1={0}
                            x2={2}
                            y2={32 * stepProgress}
                            stroke="#3478F6"
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                        )}
                      </Svg>
                    )}
                  </View>
                  <View style={styles.timelineLabelCol}>
                    <Text style={[styles.timelineLabel, isCurrent && styles.timelineLabelCurrent]}>{step.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed Pomodoros</Text>
              <Text style={styles.statValue}>{completedPomodoros}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current Phase</Text>
              <Text style={styles.statValue}>{currentPhase.replace(/([A-Z])/g, ' $1').trim()}</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 24, paddingHorizontal: 24 },
  editButton: { padding: 4 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6C7A93', marginBottom: 18 },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  timerCircleWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  timerSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerTextWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerText: { fontSize: 64, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  timerSubText: { fontSize: 24, color: '#6C7A93', marginTop: -8, textAlign: 'center' },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  controlButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0F2F7', alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 },
  pauseButton: { backgroundColor: '#3478F6' },
  statusText: { fontSize: 16, color: '#6C7A93', textAlign: 'center' },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#F8F9FB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#E5E8EF' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  modalContent: { flex: 1, padding: 24 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  
  // Settings Styles
  settingItem: { marginBottom: 24 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8 },
  settingInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E8EF' },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  
  // Reset Modal Styles
  resetModal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, margin: 24, minWidth: 280 },
  resetModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 16, textAlign: 'center' },
  resetOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E8EF' },
  resetOptionText: { fontSize: 16, color: '#222', textAlign: 'center' },
  
  // Progress Styles
  progressContainer: { marginBottom: 24 },
  progressBar: { height: 8, backgroundColor: '#E5E8EF', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#3478F6', borderRadius: 4 },
  progressText: { fontSize: 16, color: '#6C7A93', textAlign: 'center' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#6C7A93', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  
  // Save Button Styles
  saveButtonContainer: { padding: 24, borderTopWidth: 1, borderTopColor: '#E5E8EF' },
  saveButton: { backgroundColor: '#3478F6', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // Action Buttons
  actionButtonsContainer: { padding: 24, borderTopWidth: 1, borderTopColor: '#E5E8EF', gap: 12 },
  setDefaultButton: { backgroundColor: '#F0F2F7', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  setDefaultButtonText: { color: '#3478F6', fontSize: 16, fontWeight: '600' },
  
  // Error Styles
  errorInput: { borderColor: '#FF3B30' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  errorText: { color: '#FF3B30', fontSize: 14, marginLeft: 4 },
  // Progress Timeline Styles
  progressTimelineContainer: { padding: 24, paddingTop: 32 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  timelineIconCol: { alignItems: 'center', width: 36 },
  timelineIconWrap: { backgroundColor: '#fff', borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineIconCurrentWrap: { borderWidth: 2, borderColor: '#3478F6', backgroundColor: '#E5E8EF' },
  timelineCurrentCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3478F6', alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 4, height: 16, backgroundColor: '#E5E8EF', alignSelf: 'center', borderRadius: 2 },
  timelineLabelCol: { justifyContent: 'center', marginLeft: 12 },
  timelineLabel: { fontSize: 16, color: '#6C7A93' },
  timelineLabelCurrent: { color: '#3478F6', fontWeight: 'bold' },

  // Active Recall Styles
  activeRecallContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  activeRecallTimer: { marginBottom: 32 },
  activeRecallTimerText: { fontSize: 32, fontWeight: 'bold', color: '#3478F6', textAlign: 'center' },
  summaryContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    width: '100%', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryTitle: { fontSize: 18, color: '#6C7A93', textAlign: 'center', marginBottom: 4 },
  summaryTopic: { fontSize: 20, fontWeight: 'bold', color: '#3478F6', textAlign: 'center', marginBottom: 24 },
  summaryInput: { 
    backgroundColor: '#F8F9FB', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    color: '#222',
    borderWidth: 1,
    borderColor: '#E5E8EF',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  wordCount: { fontSize: 14, color: '#6C7A93', textAlign: 'right', marginTop: 8, marginBottom: 16 },
  submitButton: { 
    backgroundColor: '#3478F6', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center',
    shadowColor: '#3478F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
}); 