import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'onboarding_complete';
const USER_NAME_KEY = 'user_name';
const ONBOARDING_DATA_KEY = 'onboarding_data';

export interface OnboardingData {
  ageRange: string;
  homeAddress: string;
  hydrationReminders: string;
  dailyHydrationGoal: string;
  bottleGripStyle: string;
  mouthSizePreference: string;
  batteryUsagePriority: string;
  socialSharingPreference: string;
  peeingEnjoyment: string;
  numberOfSiblings: string;
  bitcoinWallet: string;
  idealPocketNumber: string;
  favoriteCloudShape: string;
  privacySettings: string;
  acceptGod: string;
  name: string;
}

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

  // Save full onboarding data
  async setOnboardingData(data: OnboardingData): Promise<void> {
    try {
      await SecureStore.setItemAsync(ONBOARDING_DATA_KEY, JSON.stringify(data));
      await this.setUserName(data.name);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  },

  // Get full onboarding data
  async getOnboardingData(): Promise<OnboardingData | null> {
    try {
      const data = await SecureStore.getItemAsync(ONBOARDING_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting onboarding data:', error);
      return null;
    }
  },

  // Clear all data (for testing or reset)
  async clearAll(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ONBOARDING_KEY);
      await SecureStore.deleteItemAsync(USER_NAME_KEY);
      await SecureStore.deleteItemAsync(ONBOARDING_DATA_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

