// File: app/admin-curation.tsx

import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import AdminBottomNav from '@/components/admin-bottom-nav';

/**
 * AdminCurationScreen Component
 * A 3-step wizard for admins to review, check eligibility, and approve/reject events.
 */
export default function AdminCurationScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // States for Step 1 Checkboxes (Kelengkapan)
  const [completenessChecks, setCompletenessChecks] = useState([
    false, false, false, false, false, // Left column
    false, false, false, false, false  // Right column
  ]);

  // States for Step 2 Checkboxes (Kelayakan)
  const [eligibilityChecks, setEligibilityChecks] = useState([
    false, false, false, false, false, // Left column
    false, false, false, false, false  // Right column
  ]);

  const completenessLabels = [
    "Nama event", "Penyelenggara", "Kategori", "Deskripsi", "Poster",
    "Periode Event", "Lokasi", "Link Pendaftaran", "Info User Lengkap", "Contact Person"
  ];

  const eligibilityLabels = [
    "Sesi akademik", "Target Peserta jelas", "Struktur event jelas", "Dilarang merokok", "Kelayakan poster",
    "Sesi non-akademik", "Lokasi strategis", "Struktur Panitia jelas", "Sesuai aturan kampus", "Tidak melanggar hukum"
  ];

  /**
   * Helper to toggle a specific checkbox array
   */
  const toggleCheck = (index: number, type: 'completeness' | 'eligibility') => {
    if (type === 'completeness') {
      const newChecks = [...completenessChecks];
      newChecks[index] = !newChecks[index];
      setCompletenessChecks(newChecks);
    } else {
      const newChecks = [...eligibilityChecks];
      newChecks[index] = !newChecks[index];
      setEligibilityChecks(newChecks);
    }
  };

  // --- LOGIKA DINAMIS UNTUK STEP 3 ---
  // Mengumpulkan semua parameter yang sudah diceklis
  const getCheckedParameters = () => {
    const checked: string[] = [];
    completenessChecks.forEach((isChecked, index) => {
      if (isChecked) checked.push(completenessLabels[index]);
    });
    eligibilityChecks.forEach((isChecked, index) => {
      if (isChecked) checked.push(eligibilityLabels[index]);
    });
    return checked;
  };

  const checkedParams = getCheckedParameters();
  // Menghitung persentase dari total 20 parameter (10 kelengkapan + 10 kelayakan)
  const eligibilityPercentage = Math.round((checkedParams.length / 20) * 100);

  /**
   * Final Action Handlers
   */
  const handleApprove = () => {
    const uncheckedItems: string[] = [];

    completenessChecks.forEach((isChecked, index) => {
      if (!isChecked) uncheckedItems.push(completenessLabels[index]);
    });
    eligibilityChecks.forEach((isChecked, index) => {
      if (!isChecked) uncheckedItems.push(eligibilityLabels[index]);
    });

    if (uncheckedItems.length > 0) {
      const listString = uncheckedItems.map(item => `- ${item}`).join('\n');
      
      Alert.alert(
        'Peringatan!',
        `Apakah anda yakin ingin approve event ini? Kriteria berikut belum diceklis:\n\n${listString}`,
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Tetap Approve', 
            style: 'destructive',
            onPress: () => {
              Alert.alert('Sukses', 'Event berhasil di-Approve.', [
                { text: 'OK', onPress: () => router.replace('/admin-dashboard') }
              ]);
            }
          }
        ]
      );
    } else {
      Alert.alert('Sukses', 'Event berhasil di-Approve secara menyeluruh.', [
        { text: 'OK', onPress: () => router.replace('/admin-dashboard') }
      ]);
    }
  };

  const handleReject = () => {
    Alert.alert('Ditolak', 'Event telah di-Reject.', [
      { text: 'OK', onPress: () => router.replace('/admin-dashboard') }
    ]);
  };

  /**
   * Reusable Checkbox Component
   */
  const CheckboxItem = ({ 
    label, 
    isChecked, 
    onToggle, 
    isRedText = false 
  }: { 
    label: string, 
    isChecked: boolean, 
    onToggle: () => void, 
    isRedText?: boolean 
  }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkboxSquare, isChecked && styles.checkboxChecked]}>
        {isChecked && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </View>
      <Text style={[styles.checkboxLabel, isRedText && styles.textRed]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
      
      {/* HEADER: BACK BUTTON & LOGO */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeftContainer}>
          {/* TOMBOL BACK HEADER HANYA MUNCUL DI STEP 1 */}
          {currentStep === 1 && (
            <TouchableOpacity 
              style={styles.headerBackButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.headerBackText}>{"< Back"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.logoHeader}>
          <Text style={styles.logoText}>EVENT</Text>
          <Text style={styles.logoText}>RADAR</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PAGE TITLE */}
        <Text style={styles.pageTitle}>Kurasi Event</Text>

        {/* STEP 1 & 2 SHARED HEADER: POSTER & DESCRIPTION */}
        {currentStep < 3 && (
          <View>
            <View style={styles.eventInfoHeader}>
              <View style={styles.posterPlaceholder} />
              <Text style={styles.eventTitleText}>Judul Event{'\n'}yang diajukan</Text>
            </View>

            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>Deskripsi event</Text>
            </View>
          </View>
        )}

        {/* --- STEP 1: KELENGKAPAN EVENT --- */}
        {currentStep === 1 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Kelengkapan Event</Text>
            <View style={styles.checkboxGrid}>
              <View style={styles.checkboxColumn}>
                <CheckboxItem label="Nama event" isChecked={completenessChecks[0]} onToggle={() => toggleCheck(0, 'completeness')} />
                <CheckboxItem label="Penyelenggara" isChecked={completenessChecks[1]} onToggle={() => toggleCheck(1, 'completeness')} />
                <CheckboxItem label="Kategori" isChecked={completenessChecks[2]} onToggle={() => toggleCheck(2, 'completeness')} />
                <CheckboxItem label="Deskripsi" isChecked={completenessChecks[3]} onToggle={() => toggleCheck(3, 'completeness')} />
                <CheckboxItem label="Poster" isChecked={completenessChecks[4]} onToggle={() => toggleCheck(4, 'completeness')} />
              </View>
              <View style={styles.checkboxColumn}>
                <CheckboxItem label="Periode Event" isChecked={completenessChecks[5]} onToggle={() => toggleCheck(5, 'completeness')} />
                <CheckboxItem label="Lokasi" isChecked={completenessChecks[6]} onToggle={() => toggleCheck(6, 'completeness')} />
                <CheckboxItem label="Link Pendaftaran" isChecked={completenessChecks[7]} onToggle={() => toggleCheck(7, 'completeness')} />
                <CheckboxItem label="Info User Lengkap" isChecked={completenessChecks[8]} onToggle={() => toggleCheck(8, 'completeness')} />
                <CheckboxItem label="Contact Person" isChecked={completenessChecks[9]} onToggle={() => toggleCheck(9, 'completeness')} />
              </View>
            </View>
            
            <View style={[styles.stepNavigationRow, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(2)}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* --- STEP 2: KELAYAKAN EVENT --- */}
        {currentStep === 2 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Kelayakan Event</Text>
            <View style={styles.checkboxGrid}>
              <View style={styles.checkboxColumn}>
                <CheckboxItem label="Sesi akademik" isChecked={eligibilityChecks[0]} onToggle={() => toggleCheck(0, 'eligibility')} />
                <CheckboxItem label="Target Peserta jelas" isChecked={eligibilityChecks[1]} onToggle={() => toggleCheck(1, 'eligibility')} />
                <CheckboxItem label="Struktur event jelas" isChecked={eligibilityChecks[2]} onToggle={() => toggleCheck(2, 'eligibility')} />
                <CheckboxItem label="Dilarang merokok" isChecked={eligibilityChecks[3]} onToggle={() => toggleCheck(3, 'eligibility')} />
                <CheckboxItem label="Kelayakan poster" isChecked={eligibilityChecks[4]} onToggle={() => toggleCheck(4, 'eligibility')} />
              </View>
              <View style={styles.checkboxColumn}>
                <CheckboxItem label="Sesi non-akademik" isChecked={eligibilityChecks[5]} onToggle={() => toggleCheck(5, 'eligibility')} />
                <CheckboxItem label="Lokasi strategis" isChecked={eligibilityChecks[6]} onToggle={() => toggleCheck(6, 'eligibility')} />
                <CheckboxItem label="Struktur Panitia jelas" isChecked={eligibilityChecks[7]} onToggle={() => toggleCheck(7, 'eligibility')} />
                <CheckboxItem label="Sesuai aturan kampus" isChecked={eligibilityChecks[8]} onToggle={() => toggleCheck(8, 'eligibility')} />
                <CheckboxItem label="Tidak melanggar hukum" isChecked={eligibilityChecks[9]} onToggle={() => toggleCheck(9, 'eligibility')} isRedText={true} />
              </View>
            </View>

            <View style={styles.stepNavigationRow}>
              {/* TOMBOL BACK DI BAWAH UNTUK STEP 2 */}
              <TouchableOpacity style={styles.backStepButton} onPress={() => setCurrentStep(1)}>
                <Text style={styles.backStepButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep(3)}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* --- STEP 3: KEPUTUSAN KURASI --- */}
        {currentStep === 3 && (
          <View style={styles.step3Container}>
            
            {/* Mockup visual Pie Chart statis, persentase teks dinamis */}
            <View style={styles.pieContainer}>
              <View style={styles.pieBase} />
              <View style={styles.pieQuadrant} />
            </View>

            {/* TEKS PERSENTASE DINAMIS */}
            <Text style={styles.pieChartLabel}>Event memenuhi {eligibilityPercentage}%{'\n'}Kelayakan</Text>

            {/* DAFTAR PARAMETER DINAMIS */}
            <View style={styles.parameterBox}>
              <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.parameterScroll}>
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
              {/* TOMBOL BACK DI BAWAH UNTUK STEP 3 */}
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
  
  /* HEADER ROW STYLES */
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
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  posterPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#A9D08E',
    borderRadius: 10,
    marginRight: 20,
  },
  eventTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
  },
  descriptionBox: {
    backgroundColor: '#F8FAF8',
    borderWidth: 2,
    borderColor: '#2F4454',
    borderRadius: 10,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionContainer: {
    flex: 1,
  },
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
  checkboxColumn: {
    width: '48%',
  },
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
  checkboxChecked: {
    backgroundColor: '#2F4454',
  },
  checkboxLabel: {
    fontSize: 11,
    color: '#556B7D',
    flexShrink: 1,
  },
  textRed: {
    color: '#B22222',
    fontWeight: 'bold',
  },
  
  /* STEP NAVIGATION STYLES */
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
  
  /* STEP 3 STYLES */
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
    height: 160, // Sedikit dilebarkan biar muat banyak list
    marginBottom: 30,
    overflow: 'hidden',
  },
  parameterScroll: {
    padding: 15,
  },
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
    paddingHorizontal: 0,
  },
  actionBtn: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#7A8B99',
  },
  rejectBtn: {
    backgroundColor: '#8B0000',
  },
  approveBtn: {
    backgroundColor: '#2F4454',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});