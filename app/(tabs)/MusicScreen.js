import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BACKEND_URL = 'http://localhost:4000'; // change for production

export default function MusicScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [activeTab, setActiveTab] = useState('generate');
  
  // Lyria RealTime states
  const [isLyriaActive, setIsLyriaActive] = useState(false);
  const [lyriaPrompt, setLyriaPrompt] = useState('minimal techno');
  const [lyriaBPM, setLyriaBPM] = useState(90);
  const [lyriaTemperature, setLyriaTemperature] = useState(1.0);
  const [showLyriaModal, setShowLyriaModal] = useState(false);
  const [lyriaStatus, setLyriaStatus] = useState('idle');
  
  const soundRef = useRef(null);
  const pollRef = useRef(null);
  const positionRef = useRef(null);
  const lyriaSessionRef = useRef(null);

  // Sample tracks for demonstration
  const sampleTracks = [
    { title: 'Lofi Study Beats', artist: 'Chill Vibes', duration: '3:45', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    { title: 'Piano Melody', artist: 'Classical Dreams', duration: '4:20', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    { title: 'Ambient Space', artist: 'Cosmic Sounds', duration: '5:15', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  ];

  useEffect(() => {
    // Set up audio mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Load sample tracks
    setTracks(sampleTracks);

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      if (positionRef.current) {
        clearInterval(positionRef.current);
      }
      // Clean up Lyria session
      if (lyriaSessionRef.current) {
        lyriaSessionRef.current.close();
      }
    };
  }, []);

  const startPositionTracking = () => {
    if (positionRef.current) clearInterval(positionRef.current);
    positionRef.current = setInterval(async () => {
      if (soundRef.current && isPlaying) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis / 1000);
          setDuration(status.durationMillis / 1000);
        }
      }
    }, 1000);
  };

  const stopPositionTracking = () => {
    if (positionRef.current) {
      clearInterval(positionRef.current);
      positionRef.current = null;
    }
  };

  const playTrack = async (index) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const track = tracks[index];
      if (!track?.url) {
        Alert.alert('Error', 'No audio URL available for this track');
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true, volume: volume },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      startPositionTracking();
    } catch (error) {
      console.warn('Error playing track:', error);
      Alert.alert('Error', 'Failed to play track');
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);
      
      if (status.didJustFinish) {
        // Auto-play next track
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(nextIndex);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        stopPositionTracking();
      } else {
        await soundRef.current.playAsync();
        startPositionTracking();
      }
    } catch (error) {
      console.warn('Error toggling play/pause:', error);
    }
  };

  const seekTo = async (value) => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.setPositionAsync(value * 1000);
      setPosition(value);
    } catch (error) {
      console.warn('Error seeking:', error);
    }
  };

  const setVolumeLevel = async (value) => {
    setVolume(value);
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(value);
      } catch (error) {
        console.warn('Error setting volume:', error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Lyria RealTime Functions
  const initializeLyriaSession = async () => {
    try {
      setLyriaStatus('connecting');
      
      // This would typically be done through your backend
      // For now, we'll simulate the connection
      const response = await fetch(`${BACKEND_URL}/api/lyria/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lyriaPrompt,
          bpm: lyriaBPM,
          temperature: lyriaTemperature
        })
      });

      if (response.ok) {
        const data = await response.json();
        lyriaSessionRef.current = data.session;
        setIsLyriaActive(true);
        setLyriaStatus('active');
        
        // Add a new track for the live generation
        const newTrack = {
          title: `Live: ${lyriaPrompt}`,
          artist: 'Lyria RealTime',
          duration: '∞',
          url: null,
          isLive: true
        };
        setTracks(prev => [newTrack, ...prev]);
        setCurrentTrackIndex(0);
        setIsPlaying(true);
        
        Alert.alert('Success', 'Lyria RealTime session started!');
      } else {
        throw new Error('Failed to connect to Lyria');
      }
    } catch (error) {
      console.error('Lyria connection error:', error);
      setLyriaStatus('error');
      Alert.alert('Error', 'Failed to connect to Lyria RealTime');
    }
  };

  const stopLyriaSession = async () => {
    try {
      if (lyriaSessionRef.current) {
        await fetch(`${BACKEND_URL}/api/lyria/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: lyriaSessionRef.current })
        });
        
        lyriaSessionRef.current = null;
        setIsLyriaActive(false);
        setLyriaStatus('idle');
        setIsPlaying(false);
        setCurrentTrackIndex(-1);
      }
    } catch (error) {
      console.error('Error stopping Lyria session:', error);
    }
  };

  const updateLyriaPrompt = async (newPrompt) => {
    if (!lyriaSessionRef.current) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/lyria/update-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: lyriaSessionRef.current,
          prompt: newPrompt
        })
      });
      setLyriaPrompt(newPrompt);
    } catch (error) {
      console.error('Error updating Lyria prompt:', error);
    }
  };



  const createSong = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStatus('creating');
    try {
      const payload = {
        model: 'music-u',
        task_type: 'generate_music',
        input: {
          gpt_description_prompt: 'calm lofi study beats, soft piano, light vinyl crackle',
          lyrics_type: 'instrumental',
          seed: Math.floor(Math.random() * 1e9),
        },
      };
      const res = await fetch(`${BACKEND_URL}/api/piapi/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      const id = json?.id || json?.task_id || json?.taskId;
      if (!id) throw new Error('No task id returned');
      setTaskId(id);
      setStatus('processing');
      startPolling(id);
    } catch (e) {
      console.warn('Create task error:', e);
      setIsLoading(false);
      setStatus('error');
    }
  };

  const startPolling = (id) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/piapi/tasks/${id}`);
        const json = await res.json();
        const s = json?.status || json?.state;
        if (s) setStatus(s);
        const done = s === 'succeeded' || s === 'completed' || s === 'finished';
        const failed = s === 'failed' || s === 'error';
        if (done) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setIsLoading(false);
          const audioUrl = json?.result?.audio_url || json?.result?.outputs?.[0]?.url || json?.audio_url;
          if (audioUrl) {
            const newTrack = { title: 'Generated Track', artist: 'PiAPI', duration: '—', url: audioUrl };
            setTracks(prev => [newTrack, ...prev]);
            await playTrack(0); // Play the newly generated track
          }
        } else if (failed) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setIsLoading(false);
          setStatus('error');
        }
      } catch (e) {
        console.warn('Polling error:', e);
        clearInterval(pollRef.current);
        pollRef.current = null;
        setIsLoading(false);
        setStatus('error');
      }
    }, 3000);
  };

  const renderPlayerControls = () => {
    if (currentTrackIndex === -1) return null;

    const currentTrack = tracks[currentTrackIndex];

    return (
      <View style={styles.playerContainer}>
        <View style={styles.playerHeader}>
          <Text style={styles.nowPlaying}>Now Playing</Text>
          <Text style={styles.trackTitle}>{currentTrack?.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack?.artist}</Text>
          {currentTrack?.isLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {!currentTrack?.isLive && (
          <>
                    <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(position / (duration || 1)) * 100}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={() => {
                const prevIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
                playTrack(prevIndex);
              }}>
                <Ionicons name="play-skip-back" size={24} color="#3478F6" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={() => {
                const nextIndex = (currentTrackIndex + 1) % tracks.length;
                playTrack(nextIndex);
              }}>
                <Ionicons name="play-skip-forward" size={24} color="#3478F6" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {currentTrack?.isLive && (
          <View style={styles.lyriaControls}>
            <TouchableOpacity style={styles.lyriaStopButton} onPress={stopLyriaSession}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.lyriaStopText}>Stop Live Generation</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.volumeContainer}>
          <Ionicons name="volume-low" size={20} color="#6C7A93" />
          <TouchableOpacity 
            style={styles.volumeButton} 
            onPress={() => setVolumeLevel(Math.max(0, volume - 0.1))}
          >
            <Text style={styles.volumeText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
          <TouchableOpacity 
            style={styles.volumeButton} 
            onPress={() => setVolumeLevel(Math.min(1, volume + 0.1))}
          >
            <Text style={styles.volumeText}>+</Text>
          </TouchableOpacity>
          <Ionicons name="volume-high" size={20} color="#6C7A93" />
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <>
            {isLoading && (
              <View style={{ marginHorizontal: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator />
                <Text>Status: {status || 'processing'}</Text>
                {!!taskId && <Text> | Task: {taskId}</Text>}
              </View>
            )}
            
            <TouchableOpacity style={styles.generateButton} onPress={createSong} disabled={isLoading}>
              <Ionicons name="musical-notes" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generate New Track</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.generateButton, styles.lyriaButton]} 
              onPress={() => setShowLyriaModal(true)}
              disabled={isLyriaActive}
            >
              <Ionicons name="radio" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>
                {isLyriaActive ? 'Lyria Active' : 'Start Lyria RealTime'}
              </Text>
            </TouchableOpacity>
          </>
        );
      case 'play':
        return (
          <FlatList
            data={tracks}
            keyExtractor={(item, idx) => `${item.title}-${idx}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={[
                  styles.trackItem, 
                  currentTrackIndex === index && styles.trackItemActive
                ]} 
                onPress={() => playTrack(index)}
              >
                <Ionicons 
                  name={item.isLive ? "radio" : (currentTrackIndex === index && isPlaying ? "pause-circle" : "play-circle")} 
                  size={28} 
                  color={currentTrackIndex === index ? "#3478F6" : "#6C7A93"} 
                  style={styles.trackIcon} 
                />
                <View style={styles.trackInfo}>
                  <Text style={[
                    styles.trackTitle,
                    currentTrackIndex === index && styles.trackTitleActive
                  ]}>{item.title}</Text>
                  <Text style={styles.trackArtist}>{item.artist}</Text>
                </View>
                <Text style={styles.trackDuration}>{item.duration}</Text>
              </TouchableOpacity>
            )}
            style={styles.trackList}
          />
        );
      case 'history':
        return (
          <View style={styles.historyContainer}>
            <Text style={styles.historyText}>Your music generation history will appear here</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Music</Text>
      <Text style={styles.subheader}>Generate with PiAPI & Lyria RealTime</Text>

      <View style={styles.segmentedControl}>
        <TouchableOpacity 
          style={[styles.segment, activeTab === 'generate' && styles.segmentActive]} 
          onPress={() => setActiveTab('generate')}
        >
          <Ionicons name="musical-notes" size={18} color={activeTab === 'generate' ? "#fff" : "#6C7A93"} />
          <Text style={activeTab === 'generate' ? styles.segmentTextActive : styles.segmentText}> Generate</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segment, activeTab === 'play' && styles.segmentActive]} 
          onPress={() => setActiveTab('play')}
        >
          <Ionicons name="play" size={18} color={activeTab === 'play' ? "#fff" : "#6C7A93"} />
          <Text style={activeTab === 'play' ? styles.segmentTextActive : styles.segmentText}> Play</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segment, activeTab === 'history' && styles.segmentActive]} 
          onPress={() => setActiveTab('history')}
        >
          <Ionicons name="list-outline" size={18} color={activeTab === 'history' ? "#fff" : "#6C7A93"} />
          <Text style={activeTab === 'history' ? styles.segmentTextActive : styles.segmentText}> History</Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}

      {renderPlayerControls()}

      {/* Lyria Configuration Modal */}
      <Modal
        visible={showLyriaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLyriaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lyria RealTime Configuration</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Music Style Prompt:</Text>
              <TextInput
                style={styles.textInput}
                value={lyriaPrompt}
                onChangeText={setLyriaPrompt}
                placeholder="e.g., minimal techno, jazz fusion, ambient"
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>BPM: {lyriaBPM}</Text>
              <View style={styles.bpmControls}>
                <TouchableOpacity 
                  style={styles.bpmButton} 
                  onPress={() => setLyriaBPM(Math.max(60, lyriaBPM - 10))}
                >
                  <Text style={styles.bpmButtonText}>-10</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.bpmButton} 
                  onPress={() => setLyriaBPM(Math.max(60, lyriaBPM - 1))}
                >
                  <Text style={styles.bpmButtonText}>-1</Text>
                </TouchableOpacity>
                <Text style={styles.bpmValue}>{lyriaBPM}</Text>
                <TouchableOpacity 
                  style={styles.bpmButton} 
                  onPress={() => setLyriaBPM(Math.min(200, lyriaBPM + 1))}
                >
                  <Text style={styles.bpmButtonText}>+1</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.bpmButton} 
                  onPress={() => setLyriaBPM(Math.min(200, lyriaBPM + 10))}
                >
                  <Text style={styles.bpmButtonText}>+10</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Creativity: {lyriaTemperature.toFixed(1)}</Text>
              <View style={styles.bpmControls}>
                <TouchableOpacity 
                  style={styles.bpmButton} 
                  onPress={() => setLyriaTemperature(Math.max(0.1, lyriaTemperature - 0.1))}
                >
                  <Text style={styles.bpmButtonText}>-0.1</Text>
                </TouchableOpacity>
                <Text style={styles.bpmValue}>{lyriaTemperature.toFixed(1)}</Text>
                <TouchableOpacity 
                  style={styles.bpmButton} 
                  onPress={() => setLyriaTemperature(Math.min(2.0, lyriaTemperature + 0.1))}
                >
                  <Text style={styles.bpmButtonText}>+0.1</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setShowLyriaModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]} 
                onPress={() => {
                  setShowLyriaModal(false);
                  initializeLyriaSession();
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Start Generation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  generateButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#3478F6', 
    marginHorizontal: 24, 
    marginBottom: 12, 
    paddingVertical: 16, 
    borderRadius: 12, 
    gap: 8 
  },
  lyriaButton: {
    backgroundColor: '#FF6B35',
  },
  generateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  trackList: { marginHorizontal: 0, flex: 1 },
  trackItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginHorizontal: 24, 
    marginBottom: 12, 
    padding: 16, 
    elevation: 1 
  },
  trackItemActive: { 
    backgroundColor: '#F0F4FF', 
    borderColor: '#3478F6', 
    borderWidth: 1 
  },
  trackIcon: { marginRight: 16 },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  trackTitleActive: { color: '#3478F6' },
  trackArtist: { fontSize: 14, color: '#6C7A93' },
  trackDuration: { fontSize: 14, color: '#6C7A93', fontWeight: 'bold' },
  historyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 24 
  },
  historyText: { 
    fontSize: 16, 
    color: '#6C7A93', 
    textAlign: 'center' 
  },
  playerContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nowPlaying: {
    fontSize: 12,
    color: '#6C7A93',
    fontWeight: '600',
    marginBottom: 4,
  },
  liveIndicator: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E8EF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3478F6',
    borderRadius: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6C7A93',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    backgroundColor: '#3478F6',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyriaControls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lyriaStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  lyriaStopText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeButton: {
    backgroundColor: '#E5E8EF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3478F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E8EF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bpmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bpmButton: {
    backgroundColor: '#E5E8EF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bpmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3478F6',
  },
  bpmValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    minWidth: 40,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E8EF',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#3478F6',
    borderColor: '#3478F6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C7A93',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
}); 