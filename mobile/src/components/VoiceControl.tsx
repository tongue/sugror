import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import ApiService from '../services/api';

interface VoiceControlProps {
  onMotorToggle: (state: 'on' | 'off') => void;
  disabled?: boolean;
  loading?: boolean;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  onMotorToggle,
  disabled = false,
  loading = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startListening = async () => {
    try {
      setError('');
      setRecognizedText('');
      setIsListening(true);

      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission denied');
        setIsListening(false);
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording (backend will convert format)
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setRecognizedText('Listening...');
    } catch (err) {
      console.error('Error starting recording:', err);
      setIsListening(false);
      setError('Failed to start recording');
      setTimeout(() => setError(''), 3000);
    }
  };

  const stopListening = async () => {
    try {
      if (!recording) {
        setIsListening(false);
        return;
      }

      setIsListening(false);
      setIsProcessing(true);
      setRecognizedText('Processing...');

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Send audio to backend for transcription
      const result = await ApiService.transcribeAudio(uri);

      if (result.success && result.transcript) {
        setRecognizedText(result.transcript);

        // Execute command if recognized
        if (result.command === 'on') {
          setRecognizedText('✓ Drinker On');
          onMotorToggle('on');
        } else if (result.command === 'off') {
          setRecognizedText('✓ Drinker Off');
          onMotorToggle('off');
        } else {
          setError('Say "drinker on" or "drinker off"');
          setTimeout(() => setError(''), 3000);
        }
      } else {
        setError('Could not understand audio');
        setTimeout(() => setError(''), 3000);
      }

      // Clear recognized text after 2 seconds
      setTimeout(() => {
        setRecognizedText('');
      }, 2000);

    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsProcessing(false);
      setRecording(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ Voice Control ✨</Text>
        {(loading || isProcessing) && <ActivityIndicator size="small" color="#8b5cf6" />}
      </View>

      <Text style={styles.instructions}>
        ✨ Hold button and say "drinker on" or "drinker off" ✨
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          isListening && styles.buttonListening,
          (disabled || loading || isProcessing) && styles.buttonDisabled,
        ]}
        onPressIn={startListening}
        onPressOut={stopListening}
        disabled={disabled || loading || isProcessing}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          {isListening ? (
            <>
              <View style={styles.listeningIndicator}>
                <View style={styles.pulse} />
              </View>
              <Text style={styles.buttonText}>🔥 LISTENING 🔥</Text>
            </>
          ) : isProcessing ? (
            <>
              <ActivityIndicator size="large" color="#fbbf24" />
              <Text style={styles.buttonText}>✨ PROCESSING ✨</Text>
            </>
          ) : (
            <>
              <Text style={styles.micIcon}>🎤</Text>
              <Text style={styles.buttonText}>
                {disabled ? '❌ NOT CONNECTED' : 'DRINKR'}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {recognizedText !== '' && !isListening && !isProcessing && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Recognized:</Text>
          <Text style={styles.resultText}>{recognizedText}</Text>
        </View>
      )}

      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0e27',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#1e1b4b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#a5b4fc',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4c1d95',
    borderRadius: 100,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 224,
    minWidth: 224,
    alignSelf: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#6366f1',
  },
  buttonListening: {
    backgroundColor: '#dc2626',
    borderColor: '#fbbf24',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.9,
    shadowRadius: 32,
  },
  buttonDisabled: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    opacity: 0.5,
    shadowOpacity: 0.2,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 80,
    marginBottom: 12,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  listeningIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  pulse: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  resultLabel: {
    fontSize: 12,
    color: '#a5b4fc',
    marginBottom: 6,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 16,
    color: '#fca5a5',
    fontWeight: 'bold',
  },
});

export default VoiceControl;
