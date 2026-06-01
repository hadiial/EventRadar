// File: app/admin-bookmarks.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../database';

import AdminBottomNav from '@/components/admin-bottom-nav';

// Dummy data for initial UI setup. Later, replace this with data from Firebase.
const DUMMY_EVENTS = [
  { id: '1', title: 'Nama event', date: '30 Februari 2024', status: 'Pending' },
  { id: '2', title: 'Nama event', date: '3 Maret 2024', status: 'Approved' },
  { id: '3', title: 'Nama event', date: '14 Maret 2024', status: 'Approved' },
  { id: '4', title: 'Nama event', date: '30 Maret 2024', status: 'Pending' },
  { id: '5', title: 'Nama event', date: '15 April 2024', status: 'Pending' },
];

export default function EventRequestScreen() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Admin Profile from Firebase to display in the header
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'User/' + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.fullname) {
            setAdminName(data.fullname);
          } else if (data && data.username) {
            setAdminName(data.username);
          }
        });
        return () => unsubscribeDb();
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter events based on the search query
  const filteredEvents = DUMMY_EVENTS.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.adminName}>{adminName}</Text>
          <Text style={styles.adminRole}>Teknik Kayu</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PAGE TITLE & ICON */}
        <View style={styles.titleContainer}>
          <Ionicons name="bookmark" size={28} color="#2F4454" />
          <Text style={styles.pageTitle}>Event Request</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#7A8B99"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#2F4454" style={styles.searchIcon} />
        </View>

        {/* EVENT LIST */}
        <View style={styles.listContainer}>
          {filteredEvents.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.eventCard} 
              activeOpacity={0.8}
              onPress={() => router.push('/admin-curation')}
            >
              {/* Image Placeholder */}
              <View style={styles.imagePlaceholder} />
              
              {/* Event Details */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>{item.date}</Text>
                <Text 
                  style={[
                    styles.eventStatus, 
                    item.status === 'Approved' ? styles.statusApproved : styles.statusPending
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              {/* Action Icon (Magnifying Glass) */}
              <View style={styles.actionIconContainer}>
                <Ionicons name="search" size={20} color="#2F4454" />
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State message if search yields no results */}
          {filteredEvents.length === 0 && (
            <Text style={styles.emptyText}>Tidak ada event yang sesuai.</Text>
          )}
        </View>

      </ScrollView>

      {/* ADMIN BOTTOM NAVIGATION */}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for the BottomNav
  },
  // HEADER STYLES
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#C4C4C4', // Grey placeholder color
    marginRight: 15,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  adminName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
  },
  adminRole: {
    fontSize: 12,
    color: '#7A8B99',
  },
  // TITLE STYLES
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4454',
    marginLeft: 10,
  },
  // SEARCH BAR STYLES
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2F4454',
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#2F4454',
  },
  searchIcon: {
    marginLeft: 10,
  },
  // EVENT CARD STYLES
  listContainer: {
    flex: 1,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#A9D08E',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#2F4454',
    borderRadius: 8,
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    color: '#2F4454',
    fontWeight: '500',
    marginBottom: 2,
  },
  eventStatus: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#2F4454', // Match the mockup's color
  },
  statusApproved: {
    color: '#354A5F', // Can be tweaked if approved needs a different tint
  },
  actionIconContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    height: 80,
    paddingBottom: 5,
    paddingRight: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7A8B99',
    marginTop: 20,
  },
});