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
import BottomNav from '@/components/bottom-nav';

/**
 * EventForm Component
 * Handles the multi-step event submission process.
 */
export default function EventFormScreen() {
  const router = useRouter();
  
  // State to manage form transition (Step 1 or Step 2)
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * Handles the 'Next' button logic
   */
  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Final submission logic would go here
      console.log('Event submitted successfully');
      router.replace('/'); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* LOGO HEADER */}
          <View style={styles.logoHeader}>
            <Text style={styles.logoGreen}>EVENT</Text>
            <Text style={styles.logoGreen}>RADAR</Text>
          </View>

          <Text style={styles.mainTitle}>Ajukan Event</Text>

          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <View style={styles.formWrapper}>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nama Event</Text>
                <TextInput style={styles.textInput} />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nama Penyelenggara</Text>
                <TextInput style={styles.textInput} />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Kategori Event</Text>
                <TextInput style={styles.textInput} />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Deskripsi Event</Text>
                <TextInput 
                  style={[styles.textInput, styles.textArea]} 
                  multiline 
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Upload Poster (Max 4 item)</Text>
                <TouchableOpacity style={styles.uploadContainer}>
                  <Ionicons name="push-outline" size={36} color="#4A645C" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 2: LOGISTICS & CONTACT */}
          {currentStep === 2 && (
            <View style={styles.formWrapper}>
              {/* Back to Step 1 Button */}
              <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.backLink}>
                <Ionicons name="arrow-back" size={18} color="#2F4454" />
                <Text style={styles.backLinkText}>Edit Basic Info</Text>
              </TouchableOpacity>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Periode Mulai</Text>
                <TextInput style={styles.textInput} placeholder="DD MM, YY" placeholderTextColor="#A0A0A0" />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Periode Akhir</Text>
                <TextInput style={styles.textInput} placeholder="DD MM, YY" placeholderTextColor="#A0A0A0" />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Lokasi</Text>
                <TextInput style={styles.textInput} />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nomor Telepon</Text>
                <TextInput style={styles.textInput} keyboardType="phone-pad" />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Link Pendaftaran</Text>
                <TextInput style={styles.textInput} autoCapitalize="none" />
              </View>
            </View>
          )}

          {/* ACTION BUTTON */}
          <View style={styles.footerButton}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleNext}>
              <Text style={styles.submitBtnText}>Next</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 120, 
  },
  logoHeader: {
    marginBottom: 15,
  },
  logoGreen: {
    fontSize: 24,
    fontWeight: '900',
    color: '#A9D08E',
    textShadowColor: '#2F4454',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    lineHeight: 26,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 25,
    textAlign: 'center',
  },
  formWrapper: {
    width: '100%',
  },
  inputBox: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2F4454',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4A645C',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 48,
    fontSize: 14,
    color: '#2F4454',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  uploadContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4A645C',
    borderRadius: 12,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backLinkText: {
    marginLeft: 6,
    color: '#2F4454',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtn: {
    backgroundColor: '#2F4454',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});