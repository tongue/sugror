import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'onboarding_complete';
const USER_NAME_KEY = 'user_name';

export const StorageService = {
  // Check if onboarding is complete
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  // Mark onboarding as complete
  async setOnboardingComplete(): Promise<void> {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  },

  // Save user name
  async setUserName(name: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_NAME_KEY, name);
    } catch (error) {
      console.error('Error saving user name:', error);
    }
  },

  // Get user name
  async getUserName(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(USER_NAME_KEY);
    } catch (error) {
      console.error('Error getting user name:', error);
      return null;
    }
  },

  // Clear all data (for testing or reset)
  async clearAll(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ONBOARDING_KEY);
      await SecureStore.deleteItemAsync(USER_NAME_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

