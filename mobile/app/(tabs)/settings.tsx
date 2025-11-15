import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import StatusIndicator from '../../src/components/StatusIndicator';
import MotorControl from '../../src/components/MotorControl';
import LedControl from '../../src/components/LedControl';
import { AppContext } from './_layout';

export default function SettingsScreen() {
  const { deviceState, loading, handleMotorToggle, handleLedToggle } = useContext(AppContext);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your device controls</Text>
        </View>

        <StatusIndicator connected={deviceState.connected} />

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

        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={() => router.push('/onboarding')}
          activeOpacity={0.8}
        >
          <Text style={styles.onboardingButtonText}>✨ Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e1b4b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a5b4fc',
    fontWeight: '500',
  },
  onboardingButton: {
    backgroundColor: '#0a0e27',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#1e1b4b',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  onboardingButtonText: {
    color: '#a5b4fc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

