export interface DeviceState {
  motor: 'on' | 'off';
  led: 'on' | 'off';
  ledBrightness: number;
  connected: boolean;
}

export interface MotorControlRequest {
  state: 'on' | 'off';
}

export interface LedControlRequest {
  state: 'on' | 'off';
  brightness?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

