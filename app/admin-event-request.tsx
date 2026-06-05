// File: app/admin-event-request.tsx
// Halaman Event Request untuk admin — menampilkan daftar event dari Firebase
// Admin bisa tap untuk masuk ke halaman kurasi (admin-curation)

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type EventItem = {
  key:       string;
  title:     string;
  startDate: string;
  status:    string;   // 'pending' | 'approved' | 'rejected' | undefined
  posterUrl: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalizeStatus(raw: string | undefined): string {
  if (!raw) return 'Pending';
  const s = raw.toLowerCase();
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Approved': return '#10B981'; // Green
    case 'Rejected': return '#EF4444'; // Red
    default:         return '#F59E0B'; // Amber/Pending
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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

  // Fetch all events dari Firebase
  useEffect(() => {
    const eventsRef = ref(database, 'events');
    const unsubDb = onValue(eventsRef, (snap) => {
      setLoading(false);
      if (!snap.exists()) { setEvents([]); return; }

      const raw = snap.val() as Record<string, any>;
      const list: EventItem[] = Object.entries(raw).map(([key, val]) => ({
        key,
        title:     val['Nama Event']        || 'Tanpa Judul',
        startDate: val['Periode mulai']     || '-',
        status:    normalizeStatus(val.status),
        posterUrl: val['upload poster']      || '',
      }));

      // Urutkan: Pending dulu, lalu Approved, lalu Rejected
      list.sort((a, b) => {
        const order: Record<string, number> = { Pending: 0, Approved: 1, Rejected: 2 };
        return (order[a.status] ?? 0) - (order[b.status] ?? 0);
      });

      setEvents(list);
    });
    return () => unsubDb();
  }, []);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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

        {/* PAGE TITLE */}
        <View style={styles.titleContainer}>
          <Ionicons name="bookmark" size={26} color="#2F4454" />
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
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#2F4454" />
            <Text style={styles.centerText}>Memuat data event...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="calendar-outline" size={48} color="#A9D08E" />
            <Text style={styles.centerText}>
              {events.length === 0
                ? 'Belum ada event yang diajukan.'
                : 'Tidak ada event yang sesuai pencarian.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((item) => {
              const hasPoster = item.posterUrl.startsWith('http');
              const statusLabel = item.status;
              const statusColor = getStatusColor(statusLabel);

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
                  {/* Poster thumbnail */}
                  <View style={styles.imagePlaceholder}>
                    {hasPoster && (
                      <Image
                        source={{ uri: item.posterUrl }}
                        style={styles.posterImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>

                  {/* Event info */}
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventDate}>{item.startDate}</Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.eventStatus, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Action icon */}
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="search" size={20} color="#2F4454" />
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5CC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
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
    backgroundColor: '#C4C4C4',
    marginRight: 15,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4454',
    marginLeft: 10,
  },
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
    fontSize: 14,
    color: '#2F4454',
  },
  searchIcon: {
    marginLeft: 10,
  },
  centerState: {
    alignItems: 'center',
    marginTop: 50,
    gap: 12,
  },
  centerText: {
    fontSize: 14,
    color: '#7A8B99',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContainer: {
    gap: 15,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#A9D08E',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    minHeight: 90,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#2F4454',
    borderRadius: 8,
    marginRight: 15,
    overflow: 'hidden',
    flexShrink: 0,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 3,
  },
  eventDate: {
    fontSize: 12,
    color: '#2F4454',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventStatus: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionIconContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    paddingBottom: 4,
    paddingRight: 4,
    flexShrink: 0,
  },
});
