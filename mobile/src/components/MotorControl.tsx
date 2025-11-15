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
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  statusOn: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusOff: {
    color: '#999',
    fontWeight: 'bold',
  },
});

export default MotorControl;

