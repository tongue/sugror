import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import VoiceControl from '../src/components/VoiceControl';
import { AppContext } from './_layout';

export default function VoiceScreen() {
  const { deviceState, loading, handleMotorToggle } = useContext(AppContext);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ DRINKR 🚀</Text>
          <Text style={styles.headerSubtitle}>Voice control for your drinker</Text>
        </View>

        <VoiceControl
          onMotorToggle={handleMotorToggle}
          disabled={!deviceState.connected}
          loading={loading.motor}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e1b4b',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a5b4fc',
    fontWeight: '500',
  },
});

