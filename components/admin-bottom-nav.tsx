import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

/**
 * AdminBottomNav Component
 * A reusable bottom navigation bar specifically for ADMIN screens.
 * Automatically highlights the active screen based on the current route.
 */
export default function AdminBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * handleNavigation
   * Manages routing between admin screens.
   * Includes a temporary lock mechanism to prevent errors when navigating to unfinished pages.
   * * @param {string} route - The target screen route path
   */
  const handleNavigation = (route: string) => {
    // 1. Prevent pushing the same route multiple times if we are already there
    if (pathname === route) return;

    // --- TEMPORARY LOCK MECHANISM ---
    // Array of routes that have been fully developed and are safe to access.
    // ADDED: '/admin-bookmarks' is now unlocked!
    const readyPages = ['/admin-dashboard', '/admin-bookmarks']; 

    // If the requested route is NOT in the readyPages array, show a 'Coming Soon' alert.
    if (!readyPages.includes(route)) {
      Alert.alert(
        '🚧 Coming Soon!', 
        'Please be patient. This page is currently under development and will be available in the next update.'
      );
      return; // Stop execution to prevent routing error
    }
    // ----------------------------------------

    // 2. Navigate to the allowed route
    router.push(route as any);
  };

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        
        {/* SCHEDULE BUTTON */}
        <TouchableOpacity 
          style={[styles.navIcon, pathname === '/admin-jadwal' && styles.activeNavIcon]} 
          onPress={() => handleNavigation('/admin-jadwal')}
          accessibilityLabel="Go to schedule"
        >
          <Ionicons name="calendar" size={28} color="#FFF" />
        </TouchableOpacity>
        
        {/* BOOKMARKS / EVENT REQUEST BUTTON */}
        <TouchableOpacity 
          style={[styles.navIcon, pathname === '/admin-bookmarks' && styles.activeNavIcon]} 
          onPress={() => handleNavigation('/admin-bookmarks')}
          accessibilityLabel="Go to event requests"
        >
          <Ionicons name="bookmark" size={28} color="#FFF" />
        </TouchableOpacity>
        
        {/* CENTER FLOATING HOME DASHBOARD BUTTON */}
        <View style={styles.homeButtonWrapper}>
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => handleNavigation('/admin-dashboard')}
            accessibilityLabel="Go to admin dashboard"
          >
            <Ionicons name="home" size={36} color="#2F4454" />
          </TouchableOpacity>
        </View>

        {/* CREATE EVENT / CURATION BUTTON */}
        <TouchableOpacity 
          style={[styles.navIcon, pathname === '/pengajuan' && styles.activeNavIcon]} 
          onPress={() => handleNavigation('/pengajuan')}
          accessibilityLabel="Go to event curation"
        >
          <Ionicons name="add-circle-outline" size={32} color="#FFF" />
        </TouchableOpacity>
        
        {/* USER PROFILE BUTTON */}
        <TouchableOpacity 
          style={[styles.navIcon, pathname === '/admin-profile' && styles.activeNavIcon]} 
          onPress={() => handleNavigation('/admin-profile')}
          accessibilityLabel="Go to admin profile"
        >
          <Ionicons name="person" size={28} color="#FFF" />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    opacity: 0.5, // Default state is dimmed
  },
  activeNavIcon: {
    opacity: 1.0, // Fully visible when the route matches
  },
  homeButtonWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5CC', // Matches the main app background
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Pushes the button upwards to create the floating effect
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