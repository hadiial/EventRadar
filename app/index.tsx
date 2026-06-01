import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { auth, database } from '../database';
import BottomNav from '@/components/bottom-nav';

export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ fullname: string; fakultas: string } | null>(null);

  // --- ADDITIONAL STATE FOR SEARCH BAR ---
  const [searchQuery, setSearchQuery] = useState('');
  
  // DTemporary mock event data
  const [mockEvents] = useState([
    { id: 'EVT-001', title: 'Seminar IT' },
    { id: 'EVT-002', title: 'Lomba Futsal' },
    { id: 'EVT-003', title: 'Workshop UI/UX' },
    { id: 'EVT-004', title: 'Bazar Kampus' },
    { id: 'EVT-005', title: 'Bedah Buku' },
    { id: 'EVT-006', title: 'Pentas Seni' },
  ]);

  // Filter logic to match typed text with event titles
  const filteredEvents = mockEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'User/' + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserProfile({
              fullname: data.fullname || data.username || 'User',
              fakultas: data.fakultas || 'Mahasiswa',
            });
          }
        });
        return () => unsubscribeDb();
      } else {
        setUserProfile(null);
        // Redirect is handled by _layout.tsx (auth guard)
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A9D08E"/>

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.userName}>{userProfile?.fullname || 'Memuat...'}</Text>
            <Text style={styles.userMajor}>{userProfile?.fakultas || 'Memuat...'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search event..."
        placeholderTextColor="#7A8B99"
        value={searchQuery} // Connecting text input value to state
        onChangeText={setSearchQuery} // Updating state every time the user types
      />
        <Ionicons name="search" size={20} color="#2F4454" />
      </View>

      {/* FEATURED CAROUSEL (MOCKUP) */}
      <TouchableOpacity 
        style={styles.featuredCard} 
        onPress={() => router.push('/events/[id]')} 
        activeOpacity={0.9}
      />

      {/* DOT INDICATORS */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* CATEGORIZED FOR YOU */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categorized for you!</Text>
      </View>

      <View style={styles.gridContainer}>
      {/* Filtered event data loop */}
      {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <TouchableOpacity 
              key={event.id}
              style={styles.gridItem} 
              onPress={() => router.push(`/events/${event.id}`)}
            >
              {event.id === 'EVT-001' ? (
                <Image
                  source={require('../assets/images/itFair.png')}
                  style={styles.gridItemImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.eventTitleText}>{event.title}</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>Event tidak ditemukan</Text>
        )}
      </View>

      <TouchableOpacity style={styles.moreLink}>
        <Text style={styles.moreText}>More</Text>
      </TouchableOpacity>

      {/* POPULAR NEAR YOU */}
      <View style={styles.sectionHeader}>
       <Text style={styles.sectionTitle}>Popular Near You</Text>
      </View>

      <View style={styles.popularContainer}>
      {/* Popular Items - Updated to TouchableOpacity for navigation. */}
        <TouchableOpacity style={styles.popularItem} onPress={() => router.push('/events/[id]')} />
        <TouchableOpacity style={styles.popularItem} onPress={() => router.push('/events/[id]')} />
      </View>

      {/* FOOTER LINKS */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Send feedback</Text>
          <Text style={styles.footerText}>Call Us</Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNav/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#A9D08E',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4F6F6',
    marginRight: 15,
  },
    userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4454',
  },
  userMajor: {
    fontSize: 12,
    color: '#2F4454',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2F4454',
  },
    searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2F4454',
  },
  featuredCard: {
    backgroundColor: '#A9D08E',
    height: 180,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A9D08E',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#2F4454',
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F4454',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  gridItem: {
    width: '48%',
    height: 90,
    backgroundColor: '#A9D08E',
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridItemImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  eventTitleText: {
    color: '#2F4454',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  noDataText: {
    width: '100%',
    textAlign: 'center',
    marginTop: 20,
    color: '#7A8B99',
    fontStyle: 'italic',
  },
  moreLink: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  moreText: {
    color: '#2F4454',
    fontWeight: 'bold',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  popularContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  popularItem: {
    width: '48%',
    height: 100,
    backgroundColor: '#7A8B99',
    borderRadius: 10,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    color: '#556B7D',
    fontSize: 12,
    marginBottom: 5,
  },
});