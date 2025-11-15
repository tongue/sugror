import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StorageService } from '../src/services/storage';

export default function RootLayout() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await StorageService.isOnboardingComplete();
    setIsOnboardingComplete(completed);
  };

  useEffect(() => {
    if (isOnboardingComplete === null) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!isOnboardingComplete && !inOnboarding) {
      // Redirect to onboarding if not completed
      router.replace('/onboarding');
    }
    // Allow users to access onboarding screen even after completion (for editing profile)
  }, [isOnboardingComplete, segments]);

  if (isOnboardingComplete === null) {
    // Loading state - you could show a splash screen here
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
