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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/bottom-nav';

export default function BookmarksScreen() {
  const router = useRouter();

  // --- ADDITIONAL STATE FOR SEARCH BAR ---
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for the bookmarked events list based on the mockup
  const [bookmarkedEvents, setBookmarkedEvents] = useState([
    { id: '1', title: 'Seminar IT', date: '30 Febuari 2024', status: 'Terdaftar' },
    { id: '2', title: 'Lomba Futsal', date: '3 Maret 2024', status: 'Belum Terdaftar' },
    { id: '3', title: 'Workshop UI/UX', date: '14 Maret 2024', status: 'Belum Terdaftar' },
    { id: '4', title: 'Bazar Kampus', date: '30 Maret 2024', status: 'Terdaftar' },
    { id: '5', title: 'Bedah Buku', date: '30 Febuari 2024', status: 'Terdaftar' },
    { id: '6', title: 'Pentas Seni', date: '30 Febuari 2024', status: 'Terdaftar' },
  ]);

  // Filter logic to match typed text with event titles
  const filteredEvents = bookmarkedEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulated function to handle bookmark deletion
  const handleDelete = (id: string) => {
    const remainingEvents = bookmarkedEvents.filter(event => event.id !== id);
    setBookmarkedEvents(remainingEvents);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER: USER INFO */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.userName}>Salman Hadi</Text>
          <Text style={styles.userMajor}>Teknik Informatika</Text>
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
            value={searchQuery} // Connecting text input value to state
            onChangeText={setSearchQuery} // Updating state every time the user types
          />
          <Ionicons name="search" size={20} color="#2F4454" />
        </View>

        {/* BOOKMARKED EVENTS LIST */}
        <View style={styles.listContainer}>
          {/* Filtered event data loop */}
          {filteredEvents.length > 0 ? (
            filteredEvents.map((item) => (
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
            ))
          ) : (
            <Text style={styles.noDataText}>Bookmark tidak ditemukan</Text>
          )}
        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC', // Pale yellow-green background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  noDataText: {
    width: '100%',
    textAlign: 'center',
    marginTop: 20,
    color: '#7A8B99',
    fontStyle: 'italic',
  },
});