import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, database } from '../database';

export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ username: string; jurusan: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserProfile({
              username: data.username || data.fullName || 'User',
              jurusan: data.jurusan || 'Mahasiswa',
            });
          }
        });
        return () => unsubscribeDb();
      } else {
        setUserProfile(null);
        // Redirect ditangani oleh _layout.tsx (auth guard)
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
            <Text style={styles.userName}>{userProfile?.username || 'Memuat...'}</Text>
            <Text style={styles.userMajor}>{userProfile?.jurusan || 'Memuat...'}</Text>
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
      {/* 6 Grid Items - Updated to TouchableOpacity for navigation. */}
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/events/[id]')} />
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/events/[id]')} />
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/events/[id]')} />
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/events/[id]')} />
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/events/[id]')} />
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/events/[id]')} />
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

      {/* BOTTOM NAVIGATION (ABSOLUTE) */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navIcon} onPress={() => router.push("/jadwal")}>
            <Ionicons name="calendar" size={28} color="#FFF" />
          </TouchableOpacity>
          
          {/* PENYESUAIAN: Menambahkan fungsi onPress untuk navigasi ke bookmarks */}
          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/bookmarks-page')}>
            <Ionicons name="bookmark" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* CENTER HOME BUTTON */}
          <View style={styles.homeButtonWrapper}>
            <TouchableOpacity style={styles.homeButton}>
              <Ionicons name="home" size={36} color="#2F4454" />
            </TouchableOpacity>
          </View>

          {/* PENYESUAIAN: Menambahkan fungsi onPress untuk navigasi ke event-form */}
          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/event-form' as any)}>
            <Ionicons name="time-outline" size={30} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/user-profile')}>
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
  },
});