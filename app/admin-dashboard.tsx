// File: app/admin-dashboard.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../database';

// Import the Admin specific bottom navigation component
import AdminBottomNav from '@/components/admin-bottom-nav'; 

/**
 * AdminDashboardScreen Component
 * Serves as the main landing page for users with the 'admin' role.
 * Displays a personalized greeting, current date, pending request shortcuts, and performance metrics.
 */
export default function AdminDashboardScreen() {
  const router = useRouter();
  
  // State for dynamically displaying the admin's name
  const [adminName, setAdminName] = useState('Admin 1');
  // State for displaying the current real-time date
  const [currentDate, setCurrentDate] = useState('');

  /**
   * useEffect Hook
   * 1. Generates and sets the current date in Indonesian format on component mount.
   * 2. Listens to Firebase Auth state to fetch the logged-in admin's profile data from the Realtime Database.
   */
  useEffect(() => {
    // 1. Generate current date (e.g., "Senin, 1 Juni")
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = new Date().toLocaleDateString('id-ID', dateOptions);
    setCurrentDate(formattedDate);

    // 2. Fetch Admin Profile from Firebase Realtime Database
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'User/' + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          
          // Prioritize fullname, fallback to username if fullname is empty
          if (data && data.fullname) {
            setAdminName(data.fullname);
          } else if (data && data.username) {
             setAdminName(data.username);
          }
        });
        
        // Cleanup database listener on unmount
        return () => unsubscribeDb();
      }
    });
    
    // Cleanup auth listener on unmount
    return () => unsubscribe();
  }, []);

  /**
   * renderBarChart
   * Helper function to render a simulated bar chart using pure React Native Views.
   * Used inside the "Perkembangan Views" metrics card to avoid heavy third-party chart libraries.
   * * @returns {JSX.Element} The bar chart UI component
   */
  const renderBarChart = () => {
    // Array representing the relative percentage heights of the bars
    const barHeights = [20, 30, 25, 45, 65, 40, 55, 45, 60, 50, 80, 90, 70, 45];
    return (
      <View style={styles.barChartContainer}>
        {barHeights.map((height, index) => (
          <View 
            key={index} 
            style={[
              styles.bar, 
              { height: `${height}%`, backgroundColor: index % 2 === 0 ? '#6D8299' : '#2F4454' }
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* TOP BACKGROUND GRAPHICS (Concentric Circles) */}
      <View style={styles.circleOuter}>
        <View style={styles.circleMiddle}>
          <View style={styles.circleInner}>
            <Text style={styles.logoTextSmall}>EVENT</Text>
            <Text style={styles.logoTextSmall}>RADAR</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER SECTION: Greeting & Date */}
        <View style={styles.headerContainer}>
          <Text style={styles.greetingText}>Halo {adminName}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* PENDING REQUESTS SECTION: Quick access avatars */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Cek Permintaan Sekarang!</Text>
          <View style={styles.avatarRow}>
            {/* Navigates to the approval/request curation page */}
            <TouchableOpacity style={styles.avatarCircle} onPress={() => router.push('/pengajuan' as any)} />
            <TouchableOpacity style={styles.avatarCircle} onPress={() => router.push('/pengajuan' as any)} />
            <TouchableOpacity style={styles.avatarCircle} onPress={() => router.push('/pengajuan' as any)} />
            <TouchableOpacity style={styles.avatarMore} onPress={() => router.push('/pengajuan' as any)}>
              <Text style={styles.avatarMoreText}>3+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* METRICS GRID SECTION: 2x2 Grid for Dashboard Stats */}
        <View style={styles.gridContainer}>
          
          {/* Card 1: Views Development Chart */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.chartArea}>
              {renderBarChart()}
            </View>
            <Text style={styles.cardLabel}>Perkembangan Views</Text>
          </TouchableOpacity>

          {/* Card 2: Curation Result Pie Chart */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.chartArea}>
               {/* Simulated Pie Chart using pure React Native Views */}
               <View style={styles.pieChartBase}>
                 <View style={styles.pieChartCutout} />
               </View>
            </View>
            <Text style={styles.cardLabel}>Hasil kurasi terakhir kelayakan Event</Text>
          </TouchableOpacity>

          {/* Card 3: Active Events Counter */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.numberArea}>
              <Text style={styles.bigNumber}>25</Text>
            </View>
            <Text style={styles.cardLabel}>Event yang berjalan di bulan ini</Text>
          </TouchableOpacity>

          {/* Card 4: Pending Requests Counter */}
          <TouchableOpacity 
            style={styles.gridCard} 
            activeOpacity={0.8}
            onPress={() => router.push('/pengajuan' as any)}
          >
            <View style={styles.numberArea}>
              <Text style={styles.bigNumber}>25</Text>
            </View>
            <Text style={styles.cardLabel}>Permintaan event (masa pending)</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <AdminBottomNav />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  // CONCENTRIC CIRCLES STYLING
  circleOuter: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: '#7A8B99',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  circleMiddle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: '#7A8B99',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#7A8B99',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5CC', // Matches main background
  },
  logoTextSmall: {
    color: '#2F4454',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 16,
  },
  scrollContent: {
    paddingTop: 80, // Leaves space for the top circle graphics
    paddingHorizontal: 25,
    paddingBottom: 100, // Leaves space for the BottomNav
  },
  // HEADER STYLING
  headerContainer: {
    marginBottom: 40,
    zIndex: 1,
  },
  greetingText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#A2B09F', // Faint green/grey color
    fontWeight: '500',
  },
  // REQUESTS SECTION STYLING
  requestsSection: {
    marginBottom: 35,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 15,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#6D8299',
    borderWidth: 3,
    borderColor: '#2F4454',
    marginRight: 10,
  },
  avatarMore: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#2F4454',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // METRICS GRID STYLING
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  gridCard: {
    width: '47%',
    backgroundColor: '#A9D08E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    aspectRatio: 0.85, // Adjusts height relative to width dynamically
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2F4454',
    marginTop: 10,
  },
  chartArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  // BAR CHART STYLING (Card 1)
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: '80%',
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  // PIE CHART STYLING (Card 2)
  pieChartBase: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2F4454',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  pieChartCutout: {
    width: 45,
    height: 45,
    backgroundColor: '#6D8299',
    borderTopRightRadius: 45,
  },
  // BIG NUMBER STYLING (Cards 3 & 4)
  numberArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 65,
    fontWeight: '900',
    color: '#2F4454',
  },
});