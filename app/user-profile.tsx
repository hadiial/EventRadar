import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/**
 * UserProfile Component
 * Renders the user profile screen with account details, general settings,
 * and a fully functional bottom navigation layer mapped via Expo Router.
 */
export default function UserProfile() {
  const router = useRouter();

  // Mock data utilizing the unified data schema defined in the coding guidelines
  const userData = {
    username: 'Salman Hadi',
    faculty: 'Sains dan Teknologi',
    major: 'Teknik Informatika',
    version: '0.0.1',
  };

  /**
   * Handles navigation routing for the bottom navigation bar items
   * @param {string} route - The target route destination path
   */
    const handleNavigation = (route: any) => {
        if (route === '/user-profile') return; 
        router.push(route as any);
    };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFILE PICTURE SECTION (BLANK PLACEHOLDER) */}
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder} />
          <TouchableOpacity 
            style={styles.editAvatarButton} 
            activeOpacity={0.8}
            accessibilityLabel="Edit profile picture"
          >
            <Ionicons name="pencil" size={16} color="#2F4454" />
          </TouchableOpacity>
        </View>

        {/* USER ACCOUNT INFORMATION FIELDS */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Username</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>{userData.username}</Text>
            <TouchableOpacity accessibilityLabel="Edit username">
              <Ionicons name="pencil" size={18} color="#2F4454" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Fakultas</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>{userData.faculty}</Text>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Jurusan</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>{userData.major}</Text>
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
              <Text style={styles.versionText}>{userData.version}</Text>
            </View>
            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem} 
              accessibilityRole="button"
              onPress={() => handleNavigation('/login')}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </ScrollView>

      {/* ABSOLUTE BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navIcon} 
            onPress={() => handleNavigation('/calendar')}
            accessibilityLabel="Go to calendar"
          >
            <Ionicons name="calendar" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navIcon} 
            onPress={() => handleNavigation('/bookmarks')}
            accessibilityLabel="Go to bookmarks"
          >
            <Ionicons name="bookmark" size={28} color="#FFF" />
          </TouchableOpacity>
          
          {/* FLOATING ACTION CENTER HOME BUTTON */}
          <View style={styles.homeButtonWrapper}>
            <TouchableOpacity 
              style={styles.homeButton} 
              onPress={() => handleNavigation('/')}
              accessibilityLabel="Go to home screen"
            >
              <Ionicons name="home" size={36} color="#2F4454" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.navIcon} 
            onPress={() => handleNavigation('/create-event')}
            accessibilityLabel="Go to create event"
          >
            <Ionicons name="add-circle-outline" size={32} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navIcon, styles.activeNavIcon]} 
            onPress={() => handleNavigation('/user-profile')}
            accessibilityLabel="Current screen, profile"
          >
            <Ionicons name="person" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC', 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#354A5F', 
  },
  headerTitle: {
    fontSize: 16,
    color: '#8B9B9B',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 120, 
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
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
    bottom: 5,
    right: '32%', 
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
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#354A5F', 
    height: 65,
    borderRadius: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navIcon: {
    padding: 10,
    opacity: 0.7,
  },
  activeNavIcon: {
    opacity: 1.0,
  },
  homeButtonWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5CC', 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, 
  },
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});