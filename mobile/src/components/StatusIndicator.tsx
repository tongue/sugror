import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusIndicatorProps {
  connected: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ connected }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, connected ? styles.connected : styles.disconnected]} />
      <Text style={styles.text}>
        {connected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0a0e27',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1e1b4b',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  connected: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default StatusIndicator;

