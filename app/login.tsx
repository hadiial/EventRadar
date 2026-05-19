import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* SECTION 1: TITLE / LOGO */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>EVENT</Text>
          <Text style={styles.logoText}>RADAR</Text>
        </View>

        {/* SECTION 2: FORM INPUT */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username/Email</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#7A8B99"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#7A8B99"
              secureTextEntry={true}
            />
          </View>

          {/* SECTION 3: LINKS */}
          <View style={styles.linksContainer}>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <View style={styles.registerRow}>
              <Text style={styles.normalText}>Don't Have Account? </Text>
              <TouchableOpacity>
                <Text style={styles.registerText}>Register Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION 4: LOGIN BUTTON */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>MASUK</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC', // Pale yellow-green background color
  },
  keyboardAvoid: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 50,
    fontWeight: '900',
    color: '#A9D08E', // Green text fill color
    letterSpacing: 2,
    // Hack to create a text outline (stroke) in React Native
    textShadowColor: '#2F4454', 
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    elevation: 2, // Shadow for Android
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#2F4454',
    marginBottom: 5,
    marginLeft: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 25, // Create rounded corners (pill shape)
    borderWidth: 1.5,
    borderColor: '#2F4454', // Dark blue border
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#2F4454',
  },
  linksContainer: {
    marginTop: 10,
    marginLeft: 5,
  },
  forgotPassword: {
    fontSize: 12,
    color: '#2F4454',
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  registerRow: {
    flexDirection: 'row',
  },
  normalText: {
    fontSize: 12,
    color: '#2F4454',
  },
  registerText: {
    fontSize: 12,
    color: '#2F4454',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 50, // Distance of the button from the bottom of the screen
  },
  loginButton: {
    backgroundColor: '#2F4454', // Dark blue color
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Shadow for Android
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});