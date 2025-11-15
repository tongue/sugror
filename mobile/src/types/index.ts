export interface DeviceState {
  motor: 'on' | 'off';
  led: 'on' | 'off';
  connected: boolean;
}

export interface MotorControlRequest {
  state: 'on' | 'off';
}

export interface LedControlRequest {
  state: 'on' | 'off';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

