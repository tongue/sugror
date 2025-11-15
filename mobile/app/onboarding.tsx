import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { StorageService, OnboardingData } from '../src/services/storage';

interface Question {
  id: keyof OnboardingData;
  question: string;
  type: 'choice' | 'text';
  options?: string[];
}

const questions: Question[] = [
  {
    id: 'ageRange',
    question: 'What is your age range?',
    type: 'choice',
    options: ['Young', 'Middle age', 'Old'],
  },
  {
    id: 'homeAddress',
    question: 'What is your home address?',
    type: 'text',
  },
  {
    id: 'hydrationReminders',
    question: 'How often do you need hydration reminders?',
    type: 'choice',
    options: ['Real time', '1 an hour', '2 an hour'],
  },
  {
    id: 'dailyHydrationGoal',
    question: 'What is your daily hydration goal?',
    type: 'choice',
    options: ['2L', '3L', '6L'],
  },
  {
    id: 'bottleGripStyle',
    question: 'What is your preferred bottle grip style?',
    type: 'choice',
    options: ['Double', 'Single'],
  },
  {
    id: 'mouthSizePreference',
    question: 'What is your mouth size preference?',
    type: 'choice',
    options: ['Small', 'Medium', 'Large'],
  },
  {
    id: 'batteryUsagePriority',
    question: 'What is your battery usage priority?',
    type: 'choice',
    options: ['Low', 'Medium', 'High'],
  },
  {
    id: 'socialSharingPreference',
    question: 'What is your social sharing preference?',
    type: 'choice',
    options: ['All platforms', 'Some platforms'],
  },
  {
    id: 'peeingEnjoyment',
    question: 'How much do you enjoy peeing?',
    type: 'choice',
    options: ['Much', 'Very much', 'Incredibly much'],
  },
  {
    id: 'numberOfSiblings',
    question: 'How many siblings do you have?',
    type: 'choice',
    options: ['Less than 2', '2', 'More than 2'],
  },
  {
    id: 'bitcoinWallet',
    question: 'Enter your Bitcoin wallet for rewards and bonuses',
    type: 'text',
  },
  {
    id: 'idealPocketNumber',
    question: 'What is your ideal number of pockets on pants?',
    type: 'choice',
    options: ['2', '4', '8'],
  },
  {
    id: 'favoriteCloudShape',
    question: 'What is your favorite cloud shape?',
    type: 'text',
  },
  {
    id: 'privacySettings',
    question: 'Choose your privacy settings',
    type: 'choice',
    options: ['Low privacy', 'No privacy'],
  },
  {
    id: 'acceptGod',
    question: 'Do you accept us as your one and only God?',
    type: 'choice',
    options: ['Yes'],
  },
  {
    id: 'name',
    question: "What's your name?",
    type: 'text',
  },
];

export default function OnboardingScreen() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({});
  const [textInput, setTextInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(callback, 150);
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      animateTransition(() => {
        setCurrentStep(currentStep + 1);
        setTextInput('');
      });
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      Alert.alert('Required', 'Please enter an answer to continue.');
      return;
    }
    handleAnswer(textInput.trim());
  };

  const handleSubmit = async (finalAnswers: Partial<OnboardingData>) => {
    setIsSubmitting(true);
    try {
      await StorageService.setOnboardingData(finalAnswers as OnboardingData);
      await StorageService.setOnboardingComplete();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Saving your preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showWelcome) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeTitle}>Welcome to DRINKR</Text>
              <Text style={styles.welcomeSubtitle}>Let's get you set up</Text>
            </View>

            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeDescription}>
                We'll ask you a few questions to personalize your experience.
              </Text>
              <Text style={styles.welcomeDescription}>
                This will only take a minute!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                animateTransition(() => setShowWelcome(false));
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>GET STARTED</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Your information is stored securely (publicly) in the WIKILEAKS Cloud.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {questions.length}
            </Text>
          </View>

          {/* Question Content */}
          <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.questionNumber}>Question {currentStep + 1}</Text>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              {currentQuestion.type === 'choice' ? (
                <View style={styles.optionsContainer}>
                  {currentQuestion.options?.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => handleAnswer(option)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Type your answer..."
                    placeholderTextColor="#64748b"
                    value={textInput}
                    onChangeText={setTextInput}
                    autoCapitalize={currentQuestion.id === 'bitcoinWallet' ? 'none' : 'sentences'}
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleTextSubmit}
                    multiline={currentQuestion.id === 'homeAddress'}
                    numberOfLines={currentQuestion.id === 'homeAddress' ? 3 : 1}
                  />
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleTextSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentStep === questions.length - 1 ? 'FINISH' : 'NEXT'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your information is stored securely (publicly) in the WIKILEAKS Cloud.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  progressContainer: {
    marginBottom: 32,
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#1e1b4b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#a5b4fc',
    textAlign: 'center',
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  questionNumber: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    lineHeight: 36,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#0a0e27',
    borderWidth: 2,
    borderColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  textInputContainer: {
    gap: 16,
  },
  textInput: {
    backgroundColor: '#0a0e27',
    borderWidth: 2,
    borderColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: '#fff',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    textAlignVertical: 'top',
  },
  nextButton: {
    backgroundColor: '#4c1d95',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  loadingText: {
    color: '#a5b4fc',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#a5b4fc',
    fontWeight: '500',
    textAlign: 'center',
  },
  welcomeContent: {
    marginBottom: 48,
    gap: 16,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4c1d95',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
