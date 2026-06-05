// File: app/index.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { auth, database } from '../database';
import BottomNav from '@/components/bottom-nav';

const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_ITEMS = 3; // Number of items in the carousel
// Swipe distance = Item width (screenWidth - 40) + Gap between items (20)
const SNAP_INTERVAL = screenWidth - 20; 

export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ fullname: string; fakultas: string } | null>(null);

  // --- STATE FOR SEARCH BAR ---
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- STATE FOR CAROUSEL ---
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<any>(null); // Save timer reference
  
  // Temporary mock event data
  const [mockEvents] = useState([
    { id: 'EVT-001', title: 'IT FAIR XIV', status: 'open' },
    { id: 'EVT-002', title: 'Lomba Futsal', status: 'ongoing' },
    { id: 'EVT-003', title: 'Workshop UI/UX', status: 'finished' },
    { id: 'EVT-004', title: 'Bazar Kampus', status: 'open' },
    { id: 'EVT-005', title: 'Bedah Buku', status: 'ongoing' },
    { id: 'EVT-006', title: 'Pentas Seni', status: 'finished' },
  ]);

  // Filter logic
  const filteredEvents = mockEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to determine high-contrast colors (Color-blind friendly)
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return '#10B981'; // Emerald Green
      case 'ongoing': return '#F59E0B'; // Amber / Orange
      case 'finished': return '#EF4444'; // Crimson Red
      default: return '#7A8B99';
    }
  };

  // --- LOGIC CAROUSEL AUTO-SCROLL ---
  // Function to start and reset timer
  const startAutoScroll = () => {
    // Clear old timer if any
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Create a new timer from 0
    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % CAROUSEL_ITEMS;
        scrollViewRef.current?.scrollTo({ x: nextIndex * SNAP_INTERVAL, animated: true });
        return nextIndex;
      });
    }, 3500);
  };

  useEffect(() => {
    startAutoScroll(); // Run the first time when the page loads
    return () => {
      if (timerRef.current) clearInterval(timerRef.current); // Clean up when switching pages
    };
  }, []);

  // Update dot indicator when carousel is manually swiped by the user
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    
    if (index !== activeIndex && index >= 0 && index < CAROUSEL_ITEMS) {
      setActiveIndex(index);
    }
    
    // ADDITION: Automatically reset timer count every time the user finishes manual sliding
    startAutoScroll();
  };

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
        value={searchQuery} 
        onChangeText={setSearchQuery} 
      />
        <Ionicons name="search" size={20} color="#2F4454" />
      </View>

      {/* FEATURED CAROUSEL */}
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        snapToInterval={SNAP_INTERVAL} 
        decelerationRate="fast" 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.carouselContainer}
        style={styles.carouselWrapper}
        disableIntervalMomentum={true}
        scrollEventThrottle={16}
      >
        <TouchableOpacity 
          style={[styles.featuredCard, { width: screenWidth - 40 }]} 
          onPress={() => router.push('/events/[id]')} 
          activeOpacity={0.9}
        />
        <TouchableOpacity 
          style={[styles.featuredCard, { width: screenWidth - 40 }]} 
          onPress={() => router.push('/events/[id]')} 
          activeOpacity={0.9}
        />
        <TouchableOpacity 
          style={[styles.featuredCard, { width: screenWidth - 40 }]} 
          onPress={() => router.push('/events/[id]')} 
          activeOpacity={0.9}
        />
      </ScrollView>

      {/* DOT INDICATORS DINAMIS */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, activeIndex === i && styles.dotActive]} />
        ))}
      </View>

      {/* RECOMMENDED FOR YOU */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
      </View>

      <View style={styles.gridContainer}>
      {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <TouchableOpacity 
              key={event.id}
              style={styles.gridItem} 
              onPress={() => router.push(`/events/${event.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.gridImageContainer}>
                {event.id === 'EVT-001' ? (
                  <Image
                    source={require('../assets/images/itFair.png')}
                    style={styles.gridItemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage} />
                )}
              </View>

              <View style={styles.gridTextContainer}>
                <Text style={styles.eventTitleText} numberOfLines={1}>
                  {event.title}
                </Text>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(event.status) }
                  ]} 
                />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>Event tidak ditemukan</Text>
        )}
      </View>

      <TouchableOpacity style={styles.moreLink} onPress={() => router.push('/all-events' as any)}>
        <Text style={styles.moreText}>More</Text>
      </TouchableOpacity>

      {/* POPULAR NEAR YOU */}
      <View style={styles.sectionHeader}>
       <Text style={styles.sectionTitle}>Popular Near You</Text>
      </View>

      <View style={styles.popularContainer}>
        {mockEvents.slice(3, 5).map((event) => (
          <TouchableOpacity 
            key={event.id}
            style={styles.gridItem}
            onPress={() => router.push(`/events/${event.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.gridImageContainer}>
              <View style={styles.placeholderImage} />
            </View>

            <View style={styles.gridTextContainer}>
              <Text style={styles.eventTitleText} numberOfLines={1}>
                {event.title}
              </Text>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(event.status) }
                ]} 
              />
            </View>
          </TouchableOpacity>
        ))}
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
  carouselWrapper: {
    marginTop: 20,
  },
  carouselContainer: {
    paddingLeft: 20, 
    paddingRight: 20, 
    gap: 20, 
  },
  featuredCard: {
    backgroundColor: '#A9D08E',
    height: 180,
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
    height: 120, 
    backgroundColor: '#A9D08E',
    borderRadius: 10,
    marginBottom: 15, 
    overflow: 'hidden',
    flexDirection: 'column',
  },
  gridImageContainer: {
    width: '100%',
    height: 90, 
    backgroundColor: '#7A8B99',
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8A9A86',
  },
  gridTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: '#A9D08E',
  },
  eventTitleText: {
    color: '#2F4454',
    fontWeight: 'bold',
    fontSize: 12,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#2F4454', 
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