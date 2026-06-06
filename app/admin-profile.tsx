// File: app/admin-profile.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  Image, StatusBar, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../database';

import AdminBottomNav from '@/components/admin-bottom-nav';

export default function AdminProfileScreen() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'User/' + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setAdminName(data.fullname || data.username || 'Admin');
          }
        });
        return () => unsubscribeDb();
      } else {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
            try { await signOut(auth); router.replace('/login'); } 
            catch (error) { Alert.alert('Error', 'Gagal melakukan logout.'); }
        }
      }
    ]);
  };

  const handleFeatureClick = (featureName: string) => {
    Alert.alert('Info', `Fitur ${featureName} akan segera hadir.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: 'https://via.placeholder.com/150/2F4454/FFFFFF?text=Admin' }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editImageBtn} activeOpacity={0.8}>
            <Ionicons name="pencil" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{adminName}</Text>
              <TouchableOpacity onPress={() => handleFeatureClick('Edit Username')}>
                <Ionicons name="pencil" size={18} color="#2F4454" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Setelan Umum</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow} onPress={() => handleFeatureClick('Bahasa')}>
              <Text style={styles.settingText}>Bahasa</Text>
              <Ionicons name="chevron-forward" size={18} color="#2F4454" />
            </TouchableOpacity>

            {/* MENGGANTI "HUBUNGI KAMI" MENJADI "RIWAYAT KURASI" */}
            <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/admin-curation-history')}>
              <Text style={styles.settingText}>Riwayat Kurasi</Text>
              <Ionicons name="chevron-forward" size={18} color="#2F4454" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => handleFeatureClick('Lisensi')}>
              <Text style={styles.settingText}>Lisensi</Text>
              <Ionicons name="chevron-forward" size={18} color="#2F4454" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => handleFeatureClick('Syarat dan Ketentuan')}>
              <Text style={styles.settingText}>Syarat dan Ketentuan</Text>
              <Ionicons name="chevron-forward" size={18} color="#2F4454" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => handleFeatureClick('Tentang Kami')}>
              <Text style={styles.settingText}>Tentang Kami</Text>
              <Ionicons name="chevron-forward" size={18} color="#2F4454" />
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Versi</Text>
              <Text style={styles.versionText}>0.0.1</Text>
            </View>

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <AdminBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5CC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 110 },
  profileImageContainer: { alignSelf: 'center', marginBottom: 30, position: 'relative' },
  profileImage: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#C4C4C4', borderWidth: 2, borderColor: '#2F4454' },
  editImageBtn: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#2F4454', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E8F5CC' },
  formSection: { marginBottom: 25 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#2F4454', marginBottom: 5, marginLeft: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 25, height: 45, paddingHorizontal: 20 },
  inputText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  settingsSection: { marginBottom: 20 },
  settingsTitle: { fontSize: 14, fontWeight: 'bold', color: '#2F4454', marginBottom: 10, marginLeft: 5 },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 15, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  settingText: { fontSize: 15, fontWeight: 'bold', color: '#000' },
  versionText: { fontSize: 15, fontWeight: 'bold', color: '#2F4454' },
  logoutRow: { paddingVertical: 15, paddingHorizontal: 20 },
  logoutText: { fontSize: 15, fontWeight: 'bold', color: '#D32F2F' },
});