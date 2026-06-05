// File: app/admin-curation.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AdminBottomNav from '@/components/admin-bottom-nav';
import { database } from '../database';
import { onValue, ref, update } from 'firebase/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type EventData = {
  key:              string;
  title:            string;
  organizer:        string;
  category:         string;
  description:      string;
  posterUrl:        string;
  startDate:        string;
  endDate:          string;
  location:         string;
  registrationLink: string;
  phone:            string;
};

/**
 * AdminCurationScreen
 * 3-step wizard untuk admin mereview, mengecek kelayakan, dan menyetujui/menolak event.
 * Mengambil event pending pertama dari Firebase jika tidak ada eventKey dari params.
 */
export default function AdminCurationScreen() {
  const router = useRouter();
  const { eventKey } = useLocalSearchParams<{ eventKey?: string }>();

  const [currentStep, setCurrentStep] = useState(1);
  const [pendingEvent, setPendingEvent] = useState<EventData | null>(null);
  const [loading, setLoading]          = useState(true);
  const [posterError, setPosterError]  = useState(false);

  // Checkboxes Step 1
  const [completenessChecks, setCompletenessChecks] = useState(
    Array(10).fill(false)
  );
  // Checkboxes Step 2
  const [eligibilityChecks, setEligibilityChecks] = useState(
    Array(10).fill(false)
  );

  const completenessLabels = [
    "Nama event", "Penyelenggara", "Kategori", "Deskripsi", "Poster",
    "Periode Event", "Lokasi", "Link Pendaftaran", "Info User Lengkap", "Contact Person",
  ];

  const eligibilityLabels = [
    "Sesi akademik", "Target Peserta jelas", "Struktur event jelas", "Dilarang merokok", "Kelayakan poster",
    "Sesi non-akademik", "Lokasi strategis", "Struktur Panitia jelas", "Sesuai aturan kampus", "Tidak melanggar hukum",
  ];

  // ---------------------------------------------------------------------------
  // Fetch pending event dari Firebase
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setLoading(true);
    const eventsRef = ref(database, 'events');
    const unsubDb = onValue(eventsRef, (snapshot) => {
      setLoading(false);
      if (!snapshot.exists()) { setPendingEvent(null); return; }

      const raw = snapshot.val() as Record<string, any>;
      const entries = Object.entries(raw);

      // Jika ada eventKey dari params, pakai itu. Kalau tidak, ambil pending pertama.
      let targetEntry: [string, any] | undefined;

      if (eventKey) {
        targetEntry = entries.find(([k]) => k === eventKey);
      } else {
        // Cari event yang status-nya bukan 'approved' dan bukan 'rejected'
        targetEntry = entries.find(([, val]) => {
          const s = val?.status;
          return !s || (s !== 'approved' && s !== 'rejected');
        });
      }

      if (!targetEntry) {
        setPendingEvent(null);
        return;
      }

      const [key, val] = targetEntry;
      setPendingEvent({
        key,
        title:            val['Nama Event']          || 'Tanpa Judul',
        organizer:        val['Nama penyelenggara']   || '-',
        category:         val['Kategori Event']       || '-',
        description:      val['Deskripsi event']      || '-',
        posterUrl:        val['upload poster']         || '',
        startDate:        val['Periode mulai']         || '-',
        endDate:          val['periode akhir']         || '-',
        location:         val['lokasi']               || '-',
        registrationLink: val['Link pendaftaran']     || '',
        phone:            val['phone']                || '-',
      });
    });
    return () => unsubDb();
  }, [eventKey]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const toggleCheck = (index: number, type: 'completeness' | 'eligibility') => {
    if (type === 'completeness') {
      const n = [...completenessChecks];
      n[index] = !n[index];
      setCompletenessChecks(n);
    } else {
      const n = [...eligibilityChecks];
      n[index] = !n[index];
      setEligibilityChecks(n);
    }
  };

  const getCheckedParameters = () => {
    const checked: string[] = [];
    completenessChecks.forEach((v, i) => { if (v) checked.push(completenessLabels[i]); });
    eligibilityChecks.forEach((v, i)  => { if (v) checked.push(eligibilityLabels[i]); });
    return checked;
  };

  const checkedParams         = getCheckedParameters();
  const eligibilityPercentage = Math.round((checkedParams.length / 20) * 100);

  // ---------------------------------------------------------------------------
  // Write status ke Firebase
  // ---------------------------------------------------------------------------
  const writeStatus = async (status: 'approved' | 'rejected') => {
    if (!pendingEvent?.key) return;
    try {
      await update(ref(database, `events/${pendingEvent.key}`), { status });
    } catch (e) {
      console.error('Error updating event status:', e);
    }
  };

  const handleApprove = () => {
    const unchecked: string[] = [];
    completenessChecks.forEach((v, i) => { if (!v) unchecked.push(completenessLabels[i]); });
    eligibilityChecks.forEach((v, i)  => { if (!v) unchecked.push(eligibilityLabels[i]); });

    if (unchecked.length > 0) {
      const list = unchecked.map((item) => `- ${item}`).join('\n');
      Alert.alert(
        'Peringatan!',
        `Apakah anda yakin ingin approve event ini? Kriteria berikut belum diceklis:\n\n${list}`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Tetap Approve',
            style: 'destructive',
            onPress: async () => {
              await writeStatus('approved');
              Alert.alert('Sukses', 'Event berhasil di-Approve.', [
                { text: 'OK', onPress: () => router.replace('/admin-dashboard') },
              ]);
            },
          },
        ]
      );
    } else {
      Alert.alert('Konfirmasi', 'Approve event ini?', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            await writeStatus('approved');
            Alert.alert('Sukses', 'Event berhasil di-Approve secara menyeluruh.', [
              { text: 'OK', onPress: () => router.replace('/admin-dashboard') },
            ]);
          },
        },
      ]);
    }
  };

  const handleReject = () => {
    Alert.alert('Konfirmasi', 'Reject event ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await writeStatus('rejected');
          Alert.alert('Ditolak', 'Event telah di-Reject.', [
            { text: 'OK', onPress: () => router.replace('/admin-dashboard') },
          ]);
        },
      },
    ]);
  };

  // ---------------------------------------------------------------------------
  // Reusable checkbox component
  // ---------------------------------------------------------------------------
  const CheckboxItem = ({
    label, isChecked, onToggle, isRedText = false,
  }: {
    label: string; isChecked: boolean; onToggle: () => void; isRedText?: boolean;
  }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkboxSquare, isChecked && styles.checkboxChecked]}>
        {isChecked && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </View>
      <Text style={[styles.checkboxLabel, isRedText && styles.textRed]}>{label}</Text>
    </TouchableOpacity>
  );

  // ---------------------------------------------------------------------------
  // Poster area — tampilkan gambar dari URL jika valid, fallback ke kotak hijau
  // ---------------------------------------------------------------------------
  const hasPosterUrl = pendingEvent?.posterUrl && pendingEvent.posterUrl.startsWith('http');

  const PosterArea = () => {
    if (!pendingEvent) return <View style={styles.posterPlaceholder} />;
    if (hasPosterUrl && !posterError) {
      return (
        <Image
          source={{ uri: pendingEvent.posterUrl }}
          style={styles.posterImage}
          resizeMode="cover"
          onError={() => setPosterError(true)}
        />
      );
    }
    return <View style={styles.posterPlaceholder} />;
  };

  // ---------------------------------------------------------------------------
  // Loading / no pending events
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2F4454" />
          <Text style={styles.centerText}>Memuat event...</Text>
        </View>
        <AdminBottomNav />
      </SafeAreaView>
    );
  }

  if (!pendingEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle-outline" size={60} color="#4A8060" />
          <Text style={[styles.centerText, { marginTop: 16 }]}>
            Tidak ada event yang perlu dikurasi saat ini.
          </Text>
          <TouchableOpacity
            style={styles.backDashBtn}
            onPress={() => router.replace('/admin-dashboard')}
          >
            <Text style={styles.backDashBtnText}>← Dashboard</Text>
          </TouchableOpacity>
        </View>
        <AdminBottomNav />
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeftContainer}>
          {currentStep === 1 && (
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <Text style={styles.headerBackText}>{'< Back'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.logoHeader}>
          <Text style={styles.logoText}>EVENT</Text>
          <Text style={styles.logoText}>RADAR</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Text style={styles.pageTitle}>Kurasi Event</Text>

        {/* EVENT INFO HEADER (Step 1 & 2) */}
        {currentStep < 3 && (
          <View>
            <View style={styles.eventInfoHeader}>
              <PosterArea />
              <View style={styles.eventInfoText}>
                <Text style={styles.eventTitleText} numberOfLines={2}>{pendingEvent.title}</Text>
                <Text style={styles.eventOrgText} numberOfLines={1}>{pendingEvent.organizer}</Text>
                <Text style={styles.eventCatText} numberOfLines={1}>{pendingEvent.category}</Text>
              </View>
            </View>

            <View style={styles.descriptionBox}>
              <ScrollView style={{ maxHeight: 90 }} nestedScrollEnabled>
                <Text style={styles.descriptionText}>{pendingEvent.description}</Text>
              </ScrollView>
            </View>
          </View>
        )}

        {/* STEP 1: KELENGKAPAN */}
        {currentStep === 1 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Kelengkapan Event</Text>
            <View style={styles.checkboxGrid}>
              <View style={styles.checkboxColumn}>
                {completenessLabels.slice(0, 5).map((label, i) => (
                  <CheckboxItem
                    key={i}
                    label={label}
                    isChecked={completenessChecks[i]}
                    onToggle={() => toggleCheck(i, 'completeness')}
                  />
                ))}
              </View>
              <View style={styles.checkboxColumn}>
                {completenessLabels.slice(5).map((label, i) => (
                  <CheckboxItem
                    key={i + 5}
                    label={label}
                    isChecked={completenessChecks[i + 5]}
                    onToggle={() => toggleCheck(i + 5, 'completeness')}
                  />
                ))}
              </View>
            </View>
            <View style={[styles.stepNavigationRow, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(2)}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 2: KELAYAKAN */}
        {currentStep === 2 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Kelayakan Event</Text>
            <View style={styles.checkboxGrid}>
              <View style={styles.checkboxColumn}>
                {eligibilityLabels.slice(0, 5).map((label, i) => (
                  <CheckboxItem
                    key={i}
                    label={label}
                    isChecked={eligibilityChecks[i]}
                    onToggle={() => toggleCheck(i, 'eligibility')}
                  />
                ))}
              </View>
              <View style={styles.checkboxColumn}>
                {eligibilityLabels.slice(5).map((label, i) => (
                  <CheckboxItem
                    key={i + 5}
                    label={label}
                    isChecked={eligibilityChecks[i + 5]}
                    onToggle={() => toggleCheck(i + 5, 'eligibility')}
                    isRedText={i + 5 === 9}
                  />
                ))}
              </View>
            </View>
            <View style={styles.stepNavigationRow}>
              <TouchableOpacity style={styles.backStepButton} onPress={() => setCurrentStep(1)}>
                <Text style={styles.backStepButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(3)}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: KEPUTUSAN */}
        {currentStep === 3 && (
          <View style={styles.step3Container}>
            <View style={styles.pieContainer}>
              <View style={styles.pieBase} />
              <View style={styles.pieQuadrant} />
            </View>

            <Text style={styles.pieChartLabel}>
              Event memenuhi {eligibilityPercentage}%{'\n'}Kelayakan
            </Text>

            <View style={styles.parameterBox}>
              <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.parameterScroll}>
                {checkedParams.length > 0 ? (
                  checkedParams.map((param, index) => (
                    <Text key={index} style={styles.parameterItemText}>
                      ✓ {param} telah diverifikasi
                    </Text>
                  ))
                ) : (
                  <Text style={[styles.parameterItemText, { fontStyle: 'italic', color: '#7A8B99' }]}>
                    Belum ada parameter yang diverifikasi.
                  </Text>
                )}
              </ScrollView>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.backBtn]} onPress={() => setCurrentStep(2)}>
                <Text style={styles.actionBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={handleReject}>
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={handleApprove}>
                <Text style={styles.actionBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  centerText: {
    fontSize: 16,
    color: '#2F4454',
    textAlign: 'center',
  },
  backDashBtn: {
    marginTop: 20,
    backgroundColor: '#2F4454',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backDashBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 25,
    paddingTop: 15,
  },
  headerLeftContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerBackButton: {
    paddingVertical: 5,
    paddingRight: 15,
  },
  headerBackText: {
    fontSize: 16,
    color: '#2F4454',
    fontWeight: 'bold',
  },
  logoHeader: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8A9A86',
    letterSpacing: 1,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 110,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F4454',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  eventInfoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  posterPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#A9D08E',
    borderRadius: 10,
    marginRight: 16,
    flexShrink: 0,
  },
  posterImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 16,
    flexShrink: 0,
  },
  eventInfoText: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 4,
  },
  eventOrgText: {
    fontSize: 13,
    color: '#556B7D',
    marginBottom: 2,
  },
  eventCatText: {
    fontSize: 12,
    color: '#7A8B99',
    fontStyle: 'italic',
  },
  descriptionBox: {
    backgroundColor: '#F8FAF8',
    borderWidth: 2,
    borderColor: '#2F4454',
    borderRadius: 10,
    minHeight: 80,
    padding: 15,
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 14,
    color: '#2F4454',
    lineHeight: 20,
  },
  sectionContainer: { flex: 1 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 15,
  },
  checkboxGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkboxColumn: { width: '48%' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    backgroundColor: '#C4C4C4',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#2F4454' },
  checkboxLabel: {
    fontSize: 11,
    color: '#556B7D',
    flexShrink: 1,
  },
  textRed: {
    color: '#B22222',
    fontWeight: 'bold',
  },
  stepNavigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backStepButton: {
    backgroundColor: '#7A8B99',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backStepButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#2F4454',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  step3Container: {
    alignItems: 'center',
    marginTop: 10,
  },
  pieContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    marginBottom: 20,
  },
  pieBase: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#2F4454',
  },
  pieQuadrant: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    backgroundColor: '#6D8299',
    borderTopRightRadius: 100,
  },
  pieChartLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F4454',
    textAlign: 'center',
    marginBottom: 25,
  },
  parameterBox: {
    backgroundColor: '#F8FAF8',
    borderWidth: 2,
    borderColor: '#2F4454',
    borderRadius: 10,
    width: '100%',
    height: 160,
    marginBottom: 30,
    overflow: 'hidden',
  },
  parameterScroll: { padding: 15 },
  parameterItemText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2F4454',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionBtn: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backBtn:    { backgroundColor: '#7A8B99' },
  rejectBtn:  { backgroundColor: '#8B0000' },
  approveBtn: { backgroundColor: '#2F4454' },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});