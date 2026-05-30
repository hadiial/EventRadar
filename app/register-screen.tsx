import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/**
 * RegisterScreen Component
 * Handles the two-step user registration flow as depicted in the mockups.
 */
export default function RegisterScreen() {
  const router = useRouter();
  
  // State to manage which step of the registration is currently active (1 or 2)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form data state
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [faculty, setFaculty] = useState<string>('');
  const [major, setMajor] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [code, setCode] = useState<string>('');

  /**
   * Proceeds to the second step of registration
   */
  const handleNext = () => {
    // Add validation logic here if needed before moving to next step
    setCurrentStep(2);
  };

  /**
   * Submits the registration form to the backend/Firebase
   */
  const handleRegister = () => {
    // Add Firebase authentication and Firestore document creation logic here
    console.log('Registering user...', { email, username, faculty, major });
    
    // Redirect to login or home screen after successful registration
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* HEADER TITLE */}
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>EVENT</Text>
            <Text style={styles.titleText}>RADAR</Text>
          </View>

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Enter Your Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Your Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkContainer}>
                <Text style={styles.linkText}>Already Have a Account?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Additional Information */}
          {currentStep === 2 && (
            <View style={styles.formContainer}>
              
              {/* Back button to return to Step 1 */}
              <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#2F4454" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Choose Your Faculty</Text>
                <TouchableOpacity style={styles.dropdownInput}>
                  <Text style={styles.dropdownText}>{faculty || 'Select Faculty'}</Text>
                  <Ionicons name="caret-down" size={20} color="#7A8B99" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Choose Your Major</Text>
                <TouchableOpacity style={styles.dropdownInput}>
                  <Text style={styles.dropdownText}>{major || 'Select Major'}</Text>
                  <Ionicons name="caret-down" size={20} color="#7A8B99" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Your Code</Text>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={styles.codeLinkContainer}>
                  <Text style={styles.codeLinkText}>Send code!</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC', // Light yellowish-green background
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#E8F5CC',
    textShadowColor: '#4A645C', // Creates the outline effect based on mockup
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
    elevation: 2,
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#2F4454',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  dropdownInput: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#2F4454',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#7A8B99',
  },
  linkContainer: {
    marginBottom: 30,
    marginLeft: 5,
  },
  linkText: {
    color: '#1F2937',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  codeLinkContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginRight: 10,
  },
  codeLinkText: {
    color: '#1F2937',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#2F4454',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#2F4454',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});