// File: app/admin-event-request.tsx

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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import { auth, database } from '../database';
import AdminBottomNav from '@/components/admin-bottom-nav';

type EventItem = {
  key:       string;
  title:     string;
  startDate: string;
  status:    string;
  posterUrl: string;
};

function normalizeStatus(raw: string | undefined): string {
  if (!raw) return 'Pending';
  const s = raw.toLowerCase();
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
}

export default function AdminEventRequestScreen() {
  const router = useRouter();

  const [adminProfile, setAdminProfile] = useState<{ fullname: string; fakultas: string } | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [events, setEvents]             = useState<EventItem[]>([]);
  const [loading, setLoading]           = useState(true);

  // Fetch admin profile
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'User/' + user.uid);
        const unsubDb = onValue(userRef, (snap) => {
          const data = snap.val();
          if (data) {
            setAdminProfile({
              fullname: data.fullname || data.username || 'Admin',
              fakultas: data.fakultas || '',
            });
          }
        });
        return () => unsubDb();
      }
    });
    return () => unsubAuth();
  }, []);

  // Fetch ONLY events with status PENDING
  useEffect(() => {
    const eventsRef = ref(database, 'events');
    const unsubDb = onValue(eventsRef, (snap) => {
      setLoading(false);
      if (!snap.exists()) { setEvents([]); return; }

      const raw = snap.val() as Record<string, any>;
      const list: EventItem[] = [];
      
      Object.entries(raw).forEach(([key, val]) => {
        const status = normalizeStatus(val.status);
        // Only insert into the list if the status is Pending
        if (status === 'Pending') {
          list.push({
            key,
            title:     val['Nama Event']        || 'Tanpa Judul',
            startDate: val['Periode mulai']     || '-',
            status,
            posterUrl: val['upload poster']      || '',
          });
        }
      });

      setEvents(list);
    });
    return () => unsubDb();
  }, []);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.adminName}>{adminProfile?.fullname || 'Memuat...'}</Text>
          <Text style={styles.adminRole}>{adminProfile?.fakultas  || 'Admin'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.titleContainer}>
          <Ionicons name="document-text" size={26} color="#2F4454" />
          <Text style={styles.pageTitle}>Event Request</Text>
        </View>

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

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#2F4454" />
            <Text style={styles.centerText}>Memuat antrean event...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#A9D08E" />
            <Text style={styles.centerText}>
              {events.length === 0
                ? 'Hore! Tidak ada event yang menunggu kurasi.'
                : 'Tidak ada event yang sesuai pencarian.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((item) => {
              const hasPoster = item.posterUrl.startsWith('http');

              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.eventCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/admin-curation' as any,
                      params: { eventKey: item.key },
                    })
                  }
                >
                  <View style={styles.imagePlaceholder}>
                    {hasPoster && (
                      <Image source={{ uri: item.posterUrl }} style={styles.posterImage} resizeMode="cover" />
                    )}
                  </View>

                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventDate}>{item.startDate}</Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={[styles.eventStatus, { color: '#F59E0B' }]}>Pending</Text>
                    </View>
                  </View>

                  <View style={styles.actionIconContainer}>
                    <Ionicons name="chevron-forward" size={20} color="#2F4454" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <AdminBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5CC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#C4C4C4', marginRight: 15 },
  adminName: { fontSize: 16, fontWeight: 'bold', color: '#2F4454' },
  adminRole: { fontSize: 12, color: '#7A8B99' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 15 },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#2F4454', marginLeft: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#2F4454', borderRadius: 25, height: 45, paddingHorizontal: 15, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 14, color: '#2F4454' },
  searchIcon: { marginLeft: 10 },
  centerState: { alignItems: 'center', marginTop: 50, gap: 12 },
  centerText: { fontSize: 14, color: '#7A8B99', textAlign: 'center', fontStyle: 'italic' },
  listContainer: { gap: 15 },
  eventCard: { flexDirection: 'row', backgroundColor: '#A9D08E', borderRadius: 15, padding: 12, alignItems: 'center', minHeight: 90 },
  imagePlaceholder: { width: 80, height: 80, backgroundColor: '#2F4454', borderRadius: 8, marginRight: 15, overflow: 'hidden', flexShrink: 0 },
  posterImage: { width: '100%', height: '100%' },
  eventInfo: { flex: 1, justifyContent: 'center' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#2F4454', marginBottom: 3 },
  eventDate: { fontSize: 12, color: '#2F4454', fontWeight: '500', marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  eventStatus: { fontSize: 13, fontWeight: 'bold' },
  actionIconContainer: { justifyContent: 'flex-end', alignItems: 'flex-end', alignSelf: 'flex-end', paddingBottom: 4, paddingRight: 4, flexShrink: 0 },
});