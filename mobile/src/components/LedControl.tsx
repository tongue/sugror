import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Slider,
} from 'react-native';

interface LedControlProps {
  ledState: 'on' | 'off';
  ledBrightness: number;
  onToggle: (state: 'on' | 'off') => void;
  onBrightnessChange: (brightness: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

const LedControl: React.FC<LedControlProps> = ({
  ledState,
  ledBrightness,
  onToggle,
  onBrightnessChange,
  disabled = false,
  loading = false,
}) => {
  const [sliderValue, setSliderValue] = useState(ledBrightness);

  const handleBrightnessComplete = (value: number) => {
    const brightness = Math.round(value);
    onBrightnessChange(brightness);
  };

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

      <View style={styles.brightnessContainer}>
        <Text style={styles.brightnessLabel}>
          Brightness: {Math.round(sliderValue)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={sliderValue}
          onValueChange={setSliderValue}
          onSlidingComplete={handleBrightnessComplete}
          minimumTrackTintColor="#FF9800"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#FF9800"
          disabled={disabled || loading}
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
  statusRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  statusOn: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  statusOff: {
    color: '#999',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
  },
  buttonOn: {
    backgroundColor: '#fff',
    borderColor: '#FF9800',
  },
  buttonOff: {
    backgroundColor: '#fff',
    borderColor: '#999',
  },
  buttonActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  buttonTextActive: {
    color: '#fff',
  },
  brightnessContainer: {
    marginTop: 8,
  },
  brightnessLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default LedControl;

