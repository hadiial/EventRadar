// File: app/bookmarks.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BookmarksScreen() {
  const router = useRouter();

  // Mock data for the bookmarked events list based on the mockup
  const [bookmarkedEvents, setBookmarkedEvents] = useState([
    { id: '1', title: 'Nama event', date: '30 Febuari 2024', status: 'Terdaftar' },
    { id: '2', title: 'Nama event', date: '3 Maret 2024', status: 'Belum Terdaftar' },
    { id: '3', title: 'Nama event', date: '14 Maret 2024', status: 'Belum Terdaftar' },
    { id: '4', title: 'Nama event', date: '30 Maret 2024', status: 'Terdaftar' },
    { id: '5', title: 'Nama event', date: '30 Febuari 2024', status: 'Terdaftar' },
    { id: '6', title: 'Nama event', date: '30 Febuari 2024', status: 'Terdaftar' },
  ]);

  // Simulated function to handle bookmark deletion
  const handleDelete = (id: string) => {
    const filteredEvents = bookmarkedEvents.filter(event => event.id !== id);
    setBookmarkedEvents(filteredEvents);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER: USER INFO */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.userName}>Salman HAdi</Text>
          <Text style={styles.userMajor}>Teknik Kayu</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* TITLE & ICON */}
        <View style={styles.titleContainer}>
          <Ionicons name="bookmark" size={24} color="#2F4454" />
          <Text style={styles.titleText}>Bookmarked</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#7A8B99"
          />
          <Ionicons name="search" size={20} color="#2F4454" />
        </View>

        {/* BOOKMARKED EVENTS LIST */}
        <View style={styles.listContainer}>
          {bookmarkedEvents.map((item) => (
            <View key={item.id} style={styles.card}>
              
              {/* Image Placeholder */}
              <View style={styles.cardImagePlaceholder} />
              
              {/* Event Details */}
              <View style={styles.cardDetails}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
                <Text style={styles.cardStatus}>{item.status}</Text>
              </View>

              {/* Delete Icon */}
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash" size={20} color="#2F4454" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION (ABSOLUTE) */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/calendar' as any)}>
            <Ionicons name="calendar" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.navIcon, { opacity: 1 }]}>
            <Ionicons name="bookmark" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.homeButtonWrapper}>
            <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')}>
              <Ionicons name="home" size={36} color="#2F4454" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/event-form' as any)}>
            <Ionicons name="add-circle-outline" size={32} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/user-profile' as any)}>
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
    backgroundColor: '#E8F5CC', // Pale yellow-green background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 30,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#D1D5DB', // Light gray for avatar placeholder
    marginRight: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
  },
  userMajor: {
    fontSize: 12,
    color: '#556B7D',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 130, // Extra padding to prevent overlap with the bottom navigation bar
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 5,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F6',
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#2F4454',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2F4454',
  },
  listContainer: {
    flexDirection: 'column',
    gap: 15, // Gap between cards
  },
  card: {
    backgroundColor: '#A9D08E', // Light green for the card background
    borderRadius: 15,
    padding: 10,
    flexDirection: 'row',
    position: 'relative',
    height: 110,
  },
  cardImagePlaceholder: {
    width: 90,
    height: '100%',
    backgroundColor: '#2F4454', // Dark blue for the image placeholder box
    borderRadius: 10,
    marginRight: 15,
  },
  cardDetails: {
    justifyContent: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 12,
    color: '#2F4454',
    marginBottom: 2,
  },
  cardStatus: {
    fontSize: 12,
    color: '#2F4454',
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    padding: 5,
  },
  // BOTTOM NAVIGATION (Consistent with other screens)
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});