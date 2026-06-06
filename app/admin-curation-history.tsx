// File: app/admin-curation-history.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput,
  StatusBar, Platform, Image, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import { database } from '../database';

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

function getStatusColor(status: string): string {
  if (status === 'Approved') return '#10B981'; // Green
  if (status === 'Rejected') return '#EF4444'; // Red
  return '#F59E0B';
}

export default function AdminCurationHistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [historyEvents, setHistoryEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch event dari Firebase yang HANYA berstatus Approved/Rejected
  useEffect(() => {
    const eventsRef = ref(database, 'events');
    const unsubDb = onValue(eventsRef, (snap) => {
      setLoading(false);
      if (!snap.exists()) { setHistoryEvents([]); return; }

      const raw = snap.val() as Record<string, any>;
      const list: EventItem[] = [];
      
      Object.entries(raw).forEach(([key, val]) => {
        const status = normalizeStatus(val.status);
        // Masukkan ke history kalau sudah tidak pending
        if (status === 'Approved' || status === 'Rejected') {
          list.push({
            key,
            title:     val['Nama Event']        || 'Tanpa Judul',
            startDate: val['Periode mulai']     || '-',
            status,
            posterUrl: val['upload poster']      || '',
          });
        }
      });

      setHistoryEvents(list);
    });
    return () => unsubDb();
  }, []);

  const filtered = historyEvents.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER TOP (Back Button) */}
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2F4454" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* PAGE TITLE */}
        <View style={styles.titleContainer}>
          <Ionicons name="time" size={28} color="#2F4454" />
          <Text style={styles.pageTitle}>Riwayat Kurasi</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search (title/status)..."
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
            <Text style={styles.centerText}>Memuat riwayat...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="folder-open-outline" size={48} color="#A9D08E" />
            <Text style={styles.centerText}>
              {historyEvents.length === 0
                ? 'Belum ada riwayat kurasi event.'
                : 'Tidak ada riwayat yang sesuai pencarian.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((item) => {
              const hasPoster = item.posterUrl.startsWith('http');
              const statusColor = getStatusColor(item.status);

              return (
                <View key={item.key} style={styles.eventCard}>
                  {/* Poster thumbnail */}
                  <View style={styles.imagePlaceholder}>
                    {hasPoster && (
                      <Image source={{ uri: item.posterUrl }} style={styles.posterImage} resizeMode="cover" />
                    )}
                  </View>

                  {/* Event info */}
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventDate}>{item.startDate}</Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.eventStatus, { color: statusColor }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5CC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, fontWeight: 'bold', color: '#2F4454', marginLeft: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F4454', marginLeft: 10 },
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
  eventDate: { fontSize: 12, color: '#7A8B99', fontWeight: '500', marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  eventStatus: { fontSize: 13, fontWeight: 'bold' },
});