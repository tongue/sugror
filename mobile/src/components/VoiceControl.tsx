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
        <Text style={styles.title}>Voice Control</Text>
        {(loading || isProcessing) && <ActivityIndicator size="small" color="#2196F3" />}
      </View>

      <Text style={styles.instructions}>
        Hold button and say "drinker on" or "drinker off"
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
              <Text style={styles.buttonText}>Listening...</Text>
            </>
          ) : isProcessing ? (
            <>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.buttonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Text style={styles.micIcon}>🎤</Text>
              <Text style={styles.buttonText}>
                {disabled ? 'Not Connected' : 'Hold to Speak'}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  buttonListening: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  listeningIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3f3',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '500',
  },
});

export default VoiceControl;
