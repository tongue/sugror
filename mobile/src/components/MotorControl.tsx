import React from 'react';
import { View, Text, Switch, StyleSheet, ActivityIndicator } from 'react-native';

interface MotorControlProps {
  motorState: 'on' | 'off';
  onToggle: (state: 'on' | 'off') => void;
  disabled?: boolean;
  loading?: boolean;
}

const MotorControl: React.FC<MotorControlProps> = ({
  motorState,
  onToggle,
  disabled = false,
  loading = false,
}) => {
  const handleToggle = (value: boolean) => {
    onToggle(value ? 'on' : 'off');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Motor Control</Text>
        {loading && <ActivityIndicator size="small" color="#2196F3" />}
      </View>
      <View style={styles.controlRow}>
        <Text style={styles.label}>
          Status: <Text style={motorState === 'on' ? styles.statusOn : styles.statusOff}>
            {motorState.toUpperCase()}
          </Text>
        </Text>
        <Switch
          value={motorState === 'on'}
          onValueChange={handleToggle}
          disabled={disabled || loading}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={motorState === 'on' ? '#2196F3' : '#f4f3f4'}
          ios_backgroundColor="#767577"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0e27',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#a5b4fc',
    fontWeight: '600',
  },
  statusOn: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textShadowColor: '#4CAF50',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  statusOff: {
    color: '#64748b',
    fontWeight: 'bold',
  },
});

export default MotorControl;

