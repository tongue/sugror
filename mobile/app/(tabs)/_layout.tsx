import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Alert, Text } from 'react-native';
import ApiService from '../../src/services/api';
import { DeviceState } from '../../src/types';

// Create a context to share state across tabs
export const AppContext = React.createContext<{
  deviceState: DeviceState;
  loading: { motor: boolean; led: boolean };
  handleMotorToggle: (state: 'on' | 'off') => Promise<void>;
  handleLedToggle: (state: 'on' | 'off') => Promise<void>;
}>({
  deviceState: { motor: 'off', led: 'off', connected: false },
  loading: { motor: false, led: false },
  handleMotorToggle: async () => {},
  handleLedToggle: async () => {},
});

export default function TabsLayout() {
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
    <AppContext.Provider
      value={{
        deviceState,
        loading,
        handleMotorToggle,
        handleLedToggle,
      }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#8b5cf6',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#0a0e27',
            borderTopWidth: 2,
            borderTopColor: '#1e1b4b',
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Voice',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size }}>🎤</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size }}>⚙️</Text>
            ),
          }}
        />
      </Tabs>
    </AppContext.Provider>
  );
}

