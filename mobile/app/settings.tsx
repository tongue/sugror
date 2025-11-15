import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StatusIndicator from '../src/components/StatusIndicator';
import MotorControl from '../src/components/MotorControl';
import LedControl from '../src/components/LedControl';
import { AppContext } from './_layout';

export default function SettingsScreen() {
  const { deviceState, loading, handleMotorToggle, handleLedToggle } = useContext(AppContext);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
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
  scrollContent: {
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

