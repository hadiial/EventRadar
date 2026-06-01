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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/bottom-nav';
import { database } from '../database';
import { ref, get, child, set } from 'firebase/database';

/**
 * EventForm Component
 * Handles the multi-step event submission process.
 */
export default function EventFormScreen() {
  const router = useRouter();

  // State to manage form transition (Step 1 or Step 2)
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // ---- STEP 1 FIELDS ----
  const [title, setTitle] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  // ---- STEP 2 FIELDS ----
  const [createdAt, setCreatedAt] = useState('');   // Periode Mulai
  const [date, setDate] = useState('');              // Periode Akhir
  const [location, setLocation] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [phone, setPhone] = useState(''); // Nomor telepon

  /**
   * Hitung event_id_(n) berdasarkan jumlah data yang sudah ada di /events
   */
  const getNextEventKey = async (): Promise<string> => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'events'));
    const existingCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    return `event_id_${existingCount + 1}`;
  };

  /**
   * Kirim data event ke Firebase Realtime Database
   */
  const submitToFirebase = async () => {
    setIsLoading(true);
    try {
      const eventKey = await getNextEventKey();
      const eventsRef = ref(database, `events/${eventKey}`);

      const eventData = {
        'Nama Event': title,
        'Nama penyelenggara': createdBy,
        'Kategori Event': category,
        'Deskripsi event': description,
        'upload poster': posterUrl,
        'Periode mulai': createdAt,
        'periode akhir': date,
        'lokasi': location,
        'Link pendaftaran': registrationLink,
        'phone': phone,
      };

      await set(eventsRef, eventData);

      Alert.alert('Berhasil!', 'Event berhasil dikirim.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error) {
      console.error('Error submitting event:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim event. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the 'Next' button logic
   */
  const handleNext = () => {
    if (currentStep === 1) {
      // Validasi step 1
      if (!title.trim() || !createdBy.trim() || !category.trim()) {
        Alert.alert('Lengkapi Form', 'Mohon isi Nama Event, Nama Penyelenggara, dan Kategori Event.');
        return;
      }
      setCurrentStep(2);
    } else {
      // Final submission
      submitToFirebase();
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
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Masukkan nama event"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nama Penyelenggara</Text>
                <TextInput
                  style={styles.textInput}
                  value={createdBy}
                  onChangeText={setCreatedBy}
                  placeholder="Masukkan nama penyelenggara"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Kategori Event</Text>
                <TextInput
                  style={styles.textInput}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Masukkan kategori event"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Deskripsi Event</Text>
                <TextInput 
                  style={[styles.textInput, styles.textArea]} 
                  multiline 
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Masukkan deskripsi event"
                  placeholderTextColor="#A0A0A0"
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Upload Poster (URL / Max 4 item)</Text>
                <TextInput
                  style={styles.textInput}
                  value={posterUrl}
                  onChangeText={setPosterUrl}
                  placeholder="Masukkan URL poster"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="none"
                />
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
                <TextInput
                  style={styles.textInput}
                  placeholder="DD MM, YY"
                  placeholderTextColor="#A0A0A0"
                  value={createdAt}
                  onChangeText={setCreatedAt}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Periode Akhir</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="DD MM, YY"
                  placeholderTextColor="#A0A0A0"
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Lokasi</Text>
                <TextInput
                  style={styles.textInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Masukkan lokasi event"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nomor Telepon</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Masukkan nomor telepon"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Link Pendaftaran</Text>
                <TextInput
                  style={styles.textInput}
                  autoCapitalize="none"
                  value={registrationLink}
                  onChangeText={setRegistrationLink}
                  placeholder="https://..."
                  placeholderTextColor="#A0A0A0"
                />
              </View>
            </View>
          )}

          {/* ACTION BUTTON */}
          <View style={styles.footerButton}>
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {currentStep === 1 ? 'Next' : 'Submit'}
                </Text>
              )}
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
  disabledInput: {
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
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
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});