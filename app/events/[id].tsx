import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import { auth, database } from '../../database';
import { bookmarkStore } from '../../store/bookmarkStore';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ fullname: string; fakultas: string } | null>(null);

  // Cek apakah event ini sudah di-bookmark
  const [isBookmarked, setIsBookmarked] = useState(() =>
    bookmarkStore.isBookmarkedByEvtId(id ?? '')
  );

  // Subscribe ke perubahan store
  useEffect(() => {
    const unsubscribe = bookmarkStore.subscribe(() => {
      setIsBookmarked(bookmarkStore.isBookmarkedByEvtId(id ?? ''));
    });
    return unsubscribe;
  }, [id]);

  // Fetch user profile dari Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'User/' + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserProfile({
              fullname: data.fullname || data.username || 'User',
              fakultas: data.fakultas || '',
            });
          }
        });
        return () => unsubscribeDb();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleBookmark = () => {
    bookmarkStore.toggleByEvtId(id ?? '');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* Header Info */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.userName}>{userProfile?.fullname || 'Memuat...'}</Text>
            <Text style={styles.userMajor}>{userProfile?.fakultas || 'Memuat...'}</Text>
          </View>
        </View>
      </View>

      {/* Event Poster */}
      {id === 'EVT-001' ? (
        <Image
          source={require('../../assets/images/itFair.png')}
          style={styles.posterImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.posterContainer} />
      )}

      {/* Description Card */}
      <View style={styles.descriptionCard}>
        {/* WRAP DESCRIPTION CONTENT WITH SCROLLVIEW */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.descriptionTitle}>Deskripsi event</Text>
          <Text style={styles.descriptionText}>
            Menampilkan detail informasi untuk Event ID: {id}
          </Text>
        </ScrollView>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isBookmarked && styles.bookmarkedButton]}
          onPress={handleBookmark}
        >
          <Text style={styles.buttonText}>
            {isBookmarked ? '✓ Bookmarked' : 'Bookmark'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E8F5CC', 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#2F4454', fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D9D9D9', marginRight: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#2F4454' },
  userMajor: { fontSize: 12, color: '#556B7D' },
  posterContainer: { backgroundColor: '#A9D08E', height: 200, borderRadius: 15, marginBottom: 20 },
  posterImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 20 },
  descriptionCard: { flex: 1, backgroundColor: '#F8FAF8', borderRadius: 15, borderWidth: 2, borderColor: '#2F4454', padding: 20, marginBottom: 20 },
  descriptionTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  descriptionText: { fontSize: 14, color: '#2F4454', lineHeight: 22 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionButton: { backgroundColor: '#2F4454', flex: 0.48, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  bookmarkedButton: { backgroundColor: '#4A8060' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});