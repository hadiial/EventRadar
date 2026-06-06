// File: app/user-profile.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { auth, database } from '../database';
import BottomNav from '@/components/bottom-nav';

/**
 * UserProfile Component
 * Renders the user profile screen with account details and general settings.
 */
export default function UserProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    fullname: string;
    faculty: string;
    major: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'User/' + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserProfile({
              fullname: data.fullname || data.username || 'User',
              faculty: data.fakultas || '',
              major: data.jurusan || '',
            });
          }
        });
        return () => unsubscribeDb();
      } else {
        setUserProfile(null);
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.replace('/login');
      })
      .catch((error) => {
        Alert.alert('Logout Gagal', 'Terjadi kesalahan saat logout.');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFILE PICTURE SECTION ONLY */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder} />
            <TouchableOpacity 
              style={styles.editAvatarButton} 
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={16} color="#2F4454" />
            </TouchableOpacity>
          </View>
        </View>

        {/* USER ACCOUNT INFORMATION FIELDS */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Nama Lengkap</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>{userProfile?.fullname || 'Memuat...'}</Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Fakultas</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>{userProfile?.faculty || 'Memuat...'}</Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Jurusan</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>{userProfile?.major || 'Memuat...'}</Text>
          </View>
        </View>

        {/* GENERAL SETTINGS CARD SECTION */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsLabel}>Setelan Umum</Text>
          <View style={styles.settingsCard}>
            
            <TouchableOpacity style={styles.settingItem} accessibilityRole="button">
              <Text style={styles.settingText}>Bahasa</Text>
              <Text style={styles.settingChevron}>&gt;</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} accessibilityRole="button">
              <Text style={styles.settingText}>Hubungi Kami</Text>
              <Text style={styles.settingChevron}>&gt;</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} accessibilityRole="button">
              <Text style={styles.settingText}>Lisensi</Text>
              <Text style={styles.settingChevron}>&gt;</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} accessibilityRole="button">
              <Text style={styles.settingText}>Syarat dan Ketentuan</Text>
              <Text style={styles.settingChevron}>&gt;</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} accessibilityRole="button">
              <Text style={styles.settingText}>Tentang Kami</Text>
              <Text style={styles.settingChevron}>&gt;</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Versi</Text>
              <Text style={styles.versionText}>0.0.1</Text>
            </View>
            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem} 
              accessibilityRole="button"
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </ScrollView>

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
    paddingBottom: 120, 
    paddingHorizontal: 20,
    paddingTop: 30, // Adjusted top padding
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    marginBottom: 0,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#7A8B99', 
    borderWidth: 3,
    borderColor: '#354A5F',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2F4454',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  settingsSection: {
    marginTop: 15,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 5,
    marginLeft: 5,
  },
  settingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 5,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  settingText: {
    fontSize: 15,
    color: '#000',
    fontWeight: 'bold',
  },
  settingChevron: {
    fontSize: 18,
    color: '#2F4454',
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 15,
    color: '#2F4454',
  },
  logoutText: {
    fontSize: 15,
    color: '#D32F2F', 
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E8E8',
    marginHorizontal: 15,
  },
});