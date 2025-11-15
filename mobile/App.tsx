import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import StatusIndicator from './src/components/StatusIndicator';
import MotorControl from './src/components/MotorControl';
import LedControl from './src/components/LedControl';
import VoiceControl from './src/components/VoiceControl';
import ApiService from './src/services/api';
import { DeviceState } from './src/types';

export default function App() {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    motor: 'off',
    led: 'off',
    connected: false,
  });
  const [loading, setLoading] = useState<{ motor: boolean; led: boolean }>({
    motor: false,
    led: false,
  });

  useEffect(() => {
    // Initial status fetch
    fetchStatus();

    // Connect to WebSocket for real-time updates
    ApiService.connectWebSocket(handleStatusUpdate);

    // Cleanup on unmount
    return () => {
      ApiService.disconnectWebSocket();
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const status = await ApiService.getStatus();
      setDeviceState(status);
    } catch (error) {
      console.error('Error fetching status:', error);
      setDeviceState(prev => ({ ...prev, connected: false }));
    }
  };

  const handleStatusUpdate = (state: DeviceState) => {
    setDeviceState(state);
  };

  const handleMotorToggle = async (state: 'on' | 'off') => {
    setLoading(prev => ({ ...prev, motor: true }));
    try {
      await ApiService.controlMotor(state);
      // State will be updated via WebSocket
    } catch (error) {
      console.error('Error controlling motor:', error);
      Alert.alert('Error', 'Failed to control motor. Please check connection.');
    } finally {
      setLoading(prev => ({ ...prev, motor: false }));
    }
  };

  const handleLedToggle = async (state: 'on' | 'off') => {
    setLoading(prev => ({ ...prev, led: true }));
    try {
      await ApiService.controlLed(state);
      // State will be updated via WebSocket
    } catch (error) {
      console.error('Error controlling LED:', error);
      Alert.alert('Error', 'Failed to control LED. Please check connection.');
    } finally {
      setLoading(prev => ({ ...prev, led: false }));
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Arduino Controller</Text>
          <Text style={styles.headerSubtitle}>Control your Arduino devices</Text>
        </View>

        <StatusIndicator connected={deviceState.connected} />

        <VoiceControl
          onMotorToggle={handleMotorToggle}
          disabled={!deviceState.connected}
          loading={loading.motor}
        />

        <MotorControl
          motorState={deviceState.motor}
          onToggle={handleMotorToggle}
          disabled={!deviceState.connected}
          loading={loading.motor}
        />

        <LedControl
          ledState={deviceState.led}
          onToggle={handleLedToggle}
          disabled={!deviceState.connected}
          loading={loading.led}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
