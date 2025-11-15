import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface LedControlProps {
  ledState: 'on' | 'off';
  onToggle: (state: 'on' | 'off') => void;
  disabled?: boolean;
  loading?: boolean;
}

const LedControl: React.FC<LedControlProps> = ({
  ledState,
  onToggle,
  disabled = false,
  loading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LED Control</Text>
        {loading && <ActivityIndicator size="small" color="#FF9800" />}
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.label}>
          Status: <Text style={ledState === 'on' ? styles.statusOn : styles.statusOff}>
            {ledState.toUpperCase()}
          </Text>
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonOn,
            ledState === 'on' && styles.buttonActive,
            (disabled || loading) && styles.buttonDisabled,
          ]}
          onPress={() => onToggle('on')}
          disabled={disabled || loading}
        >
          <Text style={[styles.buttonText, ledState === 'on' && styles.buttonTextActive]}>
            ON
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonOff,
            ledState === 'off' && styles.buttonActive,
            (disabled || loading) && styles.buttonDisabled,
          ]}
          onPress={() => onToggle('off')}
          disabled={disabled || loading}
        >
          <Text style={[styles.buttonText, ledState === 'off' && styles.buttonTextActive]}>
            OFF
          </Text>
        </TouchableOpacity>
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
  statusRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#a5b4fc',
    fontWeight: '600',
  },
  statusOn: {
    color: '#FF9800',
    fontWeight: 'bold',
    textShadowColor: '#FF9800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  statusOff: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
  },
  buttonOn: {
    backgroundColor: '#1e1b4b',
    borderColor: '#FF9800',
  },
  buttonOff: {
    backgroundColor: '#1e1b4b',
    borderColor: '#64748b',
  },
  buttonActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a5b4fc',
  },
  buttonTextActive: {
    color: '#fff',
  },
});

export default LedControl;

