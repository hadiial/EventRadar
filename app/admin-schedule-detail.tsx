import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import AdminBottomNav from "@/components/admin-bottom-nav";

const BAR_DATA = [40, 65, 50, 80, 60, 95, 75, 110, 85, 100, 90, 120];
const BAR_MAX = 120;
const BAR_CHART_HEIGHT = 80;

export default function AdminScheduleDetailScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{
    id: string;
    name: string;
    day: string;
    month: string;
    year: string;
  }>();

  const eventTitle = name ? name : "Judul Event\nyang didetail";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#2F4454" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>EVENT</Text>
          <Text style={styles.logoText}>RADAR</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PAGE TITLE */}
        <Text style={styles.pageTitle}>Detail Event</Text>

        {/* EVENT HEADER */}
        <View style={styles.eventHeader}>
          <View style={styles.eventImagePlaceholder} />
          <View style={styles.eventTitleBox}>
            <Text style={styles.eventTitle}>{eventTitle}</Text>
          </View>
        </View>

        {/* DESCRIPTION CARD */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>Deskripsi event</Text>
        </View>

        {/* PERFORMANCE SECTION */}
        <Text style={styles.sectionTitle}>Peforma Event</Text>
        
        <View style={styles.metricsRow}>
          {/* BAR CHART CARD */}
          <View style={styles.metricCard}>
            <View style={styles.barChart}>
              {BAR_DATA.map((val, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    { 
                      height: (val / BAR_MAX) * BAR_CHART_HEIGHT,
                      backgroundColor: i % 2 === 0 ? "#6D8299" : "#2F4454"
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.metricLabel}>Perkembangan Views</Text>
            <Text style={styles.metricValue}>1200 Total Views</Text>
          </View>

          {/* CIRCULAR PROGRESS CARD */}
          <View style={styles.metricCard}>
            <View style={styles.ringWrapper}>
              <View style={styles.ringBase} />
              <View style={styles.ringArc} />
              <Text style={styles.ringText}>25%</Text>
            </View>
            <Text style={styles.metricLabel}>
              Valuasi Pendaftaran{"\n"}Setelah klik
            </Text>
          </View>
        </View>

        {/* PROGRESS BAR SECTION */}
        <View style={styles.progressCard}>
          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>
          <Text style={styles.progressBarLabel}>Sisa Jangka Waktu Event</Text>
        </View>

      </ScrollView>

      {/* ADMIN BOTTOM NAVIGATION */}
      <AdminBottomNav />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5CC", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  topHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 15, paddingTop: 15 },
  backBtn: { padding: 5 },
  logoContainer: { marginLeft: 10 },
  logoText: { fontSize: 18, fontWeight: "900", color: "#A9D08E", letterSpacing: 1, lineHeight: 20, textShadowColor: "#2F4454", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 1 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 120 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#2F4454", textAlign: "center", marginBottom: 30 },
  eventHeader: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  eventImagePlaceholder: { width: 140, height: 120, borderRadius: 12, backgroundColor: "#A9D08E", marginRight: 20 },
  eventTitleBox: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "bold", color: "#2F4454", lineHeight: 24 },
  descriptionCard: { backgroundColor: "#F8FAF8", borderRadius: 10, borderWidth: 3, borderColor: "#2F4454", paddingVertical: 50, alignItems: "center", justifyContent: 'center', marginBottom: 25 },
  descriptionText: { fontSize: 16, fontWeight: 'bold', color: "#000" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2F4454", marginBottom: 15 },
  metricsRow: { flexDirection: "row", gap: 15, marginBottom: 15 },
  metricCard: { flex: 1, backgroundColor: "#A9D08E", borderRadius: 10, padding: 12, alignItems: "center", justifyContent: "flex-end", gap: 8, minHeight: 160 },
  barChart: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: BAR_CHART_HEIGHT, width: "100%", paddingHorizontal: 5 },
  bar: { flex: 1, borderRadius: 2 },
  metricLabel: { fontSize: 11, color: "#2F4454", textAlign: "center", fontWeight: "bold", marginTop: 5 },
  metricValue: { fontSize: 11, color: "#2F4454", textAlign: "center", fontWeight: "bold" },
  ringWrapper: { width: 80, height: 80, justifyContent: "center", alignItems: "center", position: 'relative', marginBottom: 5 },
  ringBase: { position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 10, borderColor: "#6D8299" },
  ringArc: { position: "absolute", width: 80, height: 80, borderRadius: 40, borderWidth: 10, borderTopColor: "#2F4454", borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "transparent", transform: [{ rotate: "45deg" }] },
  ringText: { fontSize: 20, fontWeight: "bold", color: "#2F4454" },
  progressCard: { backgroundColor: "#A9D08E", borderRadius: 10, padding: 15, gap: 10 },
  progressBarTrack: { height: 12, backgroundColor: "#6D8299", borderRadius: 6, overflow: "hidden" },
  progressBarFill: { width: "60%", height: "100%", backgroundColor: "#2F4454", borderRadius: 6 },
  progressBarLabel: { fontSize: 12, color: "#2F4454", textAlign: "center", fontWeight: "bold" },
});