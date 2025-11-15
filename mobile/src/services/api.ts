import { DeviceState, MotorControlRequest, LedControlRequest } from '../types';

// Configuration
// For iOS Simulator, use localhost
// For physical device, use your Mac's IP address (e.g., '192.168.1.100')
const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private statusCallback: ((state: DeviceState) => void) | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get current device status
   */
  async getStatus(): Promise<DeviceState> {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching status:', error);
      throw error;
    }
  }

  /**
   * Control motor on/off
   */
  async controlMotor(state: 'on' | 'off'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/motor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state } as MotorControlRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Motor control failed');
      }
    } catch (error) {
      console.error('Error controlling motor:', error);
      throw error;
    }
  }

  /**
   * Control LED on/off and brightness
   */
  async controlLed(state: 'on' | 'off', brightness?: number): Promise<void> {
    try {
      const body: LedControlRequest = { state };
      if (brightness !== undefined) {
        body.brightness = brightness;
      }

      const response = await fetch(`${this.baseUrl}/api/led`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'LED control failed');
      }
    } catch (error) {
      console.error('Error controlling LED:', error);
      throw error;
    }
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  connectWebSocket(onStatusUpdate: (state: DeviceState) => void): void {
    this.statusCallback = onStatusUpdate;
    
    const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'status' && this.statusCallback) {
            this.statusCallback(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (this.statusCallback) {
            this.connectWebSocket(this.statusCallback);
          }
        }, 3000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.statusCallback = null;
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if backend is reachable
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();

