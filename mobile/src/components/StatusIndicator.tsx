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
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default StatusIndicator;

