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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../database';

/**
 * RegisterScreen Component
 * Handles the two-step user registration flow.
 * Step 1: Data akun (email, username, password)
 * Step 2: Data profil (fakultas, jurusan, nomor HP)
 */
export default function RegisterScreen() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Step 1 - Data akun
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Step 2 - Data profil
  const [faculty, setFaculty] = useState<string>('');
  const [major, setMajor] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  /**
   * Validasi Step 1 dan lanjut ke Step 2
   */
  const handleNext = () => {
    if (!email.trim() || !username.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Semua kolom wajib diisi.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Format email tidak valid.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan Konfirmasi Password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal harus 6 karakter.');
      return;
    }
    setCurrentStep(2);
  };

  /**
   * Daftarkan user ke Firebase Authentication + simpan profil ke Realtime Database
   */
  const handleRegister = async () => {
    if (!faculty.trim() || !major.trim() || !phone.trim()) {
      Alert.alert('Error', 'Semua kolom wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // 1. Buat akun di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      // 2. Simpan data profil ke Realtime Database
      const userRef = ref(database, 'users/' + user.uid);
      await set(userRef, {
        uid: user.uid,
        username: username.trim(),
        fullName: username.trim(),
        email: email.trim(),
        jurusan: major.trim(),
        fakultas: faculty.trim(),
        phone: phone.trim(),
        role: 'user',
        createdAt: Math.floor(Date.now() / 1000),
      });

      setLoading(false);
      Alert.alert(
        'Registrasi Berhasil! 🎉',
        'Akun Anda berhasil dibuat. Silakan login.',
        [{ text: 'Login Sekarang', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      setLoading(false);
      let errorMessage = 'Gagal mendaftarkan akun. Coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar. Gunakan email lain atau login.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah (minimal 6 karakter).';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Tidak ada koneksi internet. Periksa jaringan Anda.';
      }
      Alert.alert('Registrasi Gagal', errorMessage);
    }
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

          {/* PROGRESS INDICATOR */}
          <View style={styles.stepContainer}>
            <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
          </View>
          <Text style={styles.stepLabel}>
            {currentStep === 1 ? 'Step 1: Data Akun' : 'Step 2: Data Profil'}
          </Text>

          {/* STEP 1: Data Akun */}
          {currentStep === 1 && (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Masukkan email Anda"
                  placeholderTextColor="#7A8B99"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholder="Pilih username Anda"
                  placeholderTextColor="#7A8B99"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#7A8B99"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Konfirmasi Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Ulangi password Anda"
                  placeholderTextColor="#7A8B99"
                />
              </View>

              <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkContainer}>
                <Text style={styles.linkText}>Sudah punya akun? Login di sini</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.buttonText}>Lanjut →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Data Profil */}
          {currentStep === 2 && (
            <View style={styles.formContainer}>
              
              {/* Tombol kembali ke Step 1 */}
              <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#2F4454" />
                <Text style={styles.backText}>Kembali</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fakultas</Text>
                <TextInput
                  style={styles.input}
                  value={faculty}
                  onChangeText={setFaculty}
                  placeholder="Contoh: Fakultas Teknik"
                  placeholderTextColor="#7A8B99"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jurusan / Program Studi</Text>
                <TextInput
                  style={styles.input}
                  value={major}
                  onChangeText={setMajor}
                  placeholder="Contoh: Teknik Informatika"
                  placeholderTextColor="#7A8B99"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nomor HP</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Contoh: 08123456789"
                  placeholderTextColor="#7A8B99"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Daftar Sekarang</Text>
                )}
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
    backgroundColor: '#E8F5CC',
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
    marginBottom: 20,
  },
  titleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#A9D08E',
    textShadowColor: '#2F4454',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
    elevation: 2,
    letterSpacing: 2,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#C5D9B8',
    borderWidth: 2,
    borderColor: '#2F4454',
  },
  stepDotActive: {
    backgroundColor: '#2F4454',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#C5D9B8',
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: '#2F4454',
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 13,
    color: '#2F4454',
    fontWeight: '600',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#2F4454',
    marginBottom: 8,
    marginLeft: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#2F4454',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  linkContainer: {
    marginBottom: 20,
    marginLeft: 5,
  },
  linkText: {
    color: '#2F4454',
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#2F4454',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
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