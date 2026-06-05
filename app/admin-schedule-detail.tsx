// File: app/admin-schedule-detail.tsx
// Detail event untuk admin — menampilkan performa event + tombol Hapus/Biarkan

import AdminBottomNav from "@/components/admin-bottom-nav";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ref, update } from "firebase/database";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { database } from "../database";
import { bookmarkStore } from "../store/bookmarkStore";

const BAR_DATA = [40, 65, 50, 80, 60, 95, 75, 110, 85, 100, 90, 120];
const BAR_MAX = 120;
const BAR_CHART_H = 80;

export default function AdminScheduleDetailScreen() {
  const router = useRouter();
  const { name, eventKey, posterUrl, day, month, year, status } =
    useLocalSearchParams<{
      id: string;
      name: string;
      day: string;
      month: string;
      year: string;
      status?: string;
      eventKey?: string;
      posterUrl?: string;
    }>();

  const eventTitle = name || "Judul Event";
  const eventDate = day && month && year ? `${day} ${month} ${year}` : "-";
  const eventStatus = status ? status : "approved";
  const hasPoster = posterUrl && posterUrl.startsWith("http");
  const isBookmarked = eventKey ? bookmarkStore.isBookmarked(eventKey) : false;

  // -------------------------------------------------------------------------
  // Hapus event: ubah status di Firebase → 'rejected' + un-bookmark
  // -------------------------------------------------------------------------
  const handleHapus = () => {
    Alert.alert(
      "Hapus Event",
      `Apakah Anda yakin ingin menghapus event "${eventTitle}"?\nEvent akan ditandai sebagai ditolak dan tidak lagi tampil di jadwal.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            // Un-bookmark event ini (jika ada)
            if (eventKey) {
              bookmarkStore.remove(eventKey);
              try {
                // Update status di Firebase
                await update(ref(database, `events/${eventKey}`), {
                  status: "rejected",
                });
              } catch (e) {
                console.error("Error updating event status:", e);
              }
            }
            Alert.alert("Berhasil", "Event berhasil dihapus dari jadwal.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ],
    );
  };

  // -------------------------------------------------------------------------
  // Bookmark event: simpan ke bookmark admin dan langsung buka halaman bookmark
  // -------------------------------------------------------------------------
  const handleBookmark = () => {
    if (!eventKey) {
      return;
    }

    if (!isBookmarked) {
      bookmarkStore.toggleDbEvent(eventKey, {
        title: eventTitle,
        date: eventDate,
        status: eventStatus,
        posterUrl: posterUrl || "",
      });
    }

    router.replace("/admin-bookmarks");
  };

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PAGE TITLE */}
        <Text style={styles.pageTitle}>Detail Event</Text>

        {/* EVENT HEADER */}
        <View style={styles.eventHeader}>
          {hasPoster ? (
            <Image
              source={{ uri: posterUrl }}
              style={styles.eventImagePoster}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.eventImagePlaceholder} />
          )}
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
          {/* BAR CHART */}
          <View style={styles.metricCard}>
            <View style={styles.barChart}>
              {BAR_DATA.map((val, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height: (val / BAR_MAX) * BAR_CHART_H,
                      backgroundColor: i % 2 === 0 ? "#6D8299" : "#2F4454",
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.metricLabel}>Perkembangan Views</Text>
            <Text style={styles.metricValue}>1200 Total Views</Text>
          </View>

          {/* RING CHART */}
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

        {/* PROGRESS BAR */}
        <View style={styles.progressCard}>
          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>
          <Text style={styles.progressBarLabel}>Sisa Jangka Waktu Event</Text>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* ACTION BUTTONS: Hapus Event | Bookmark Event                     */}
        {/* ---------------------------------------------------------------- */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.hapusBtn]}
            onPress={handleHapus}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#FFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnText}>Hapus Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.bookmarkBtn]}
            onPress={handleBookmark}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color="#FFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnText}>
              {isBookmarked ? "Sudah Bookmark" : "Bookmark"}
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#E8F5CC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  backBtn: { padding: 5 },
  logoContainer: { marginLeft: 10 },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#A9D08E",
    letterSpacing: 1,
    lineHeight: 20,
    textShadowColor: "#2F4454",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 130,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2F4454",
    textAlign: "center",
    marginBottom: 30,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  eventImagePlaceholder: {
    width: 140,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#A9D08E",
    marginRight: 20,
  },
  eventImagePoster: {
    width: 140,
    height: 120,
    borderRadius: 12,
    marginRight: 20,
  },
  eventTitleBox: { flex: 1 },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F4454",
    lineHeight: 24,
  },
  descriptionCard: {
    backgroundColor: "#F8FAF8",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#2F4454",
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F4454",
    marginBottom: 15,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#A9D08E",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    minHeight: 160,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: BAR_CHART_H,
    width: "100%",
    paddingHorizontal: 5,
  },
  bar: { flex: 1, borderRadius: 2 },
  metricLabel: {
    fontSize: 11,
    color: "#2F4454",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 5,
  },
  metricValue: {
    fontSize: 11,
    color: "#2F4454",
    textAlign: "center",
    fontWeight: "bold",
  },
  ringWrapper: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 5,
  },
  ringBase: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: "#6D8299",
  },
  ringArc: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderTopColor: "#2F4454",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  ringText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F4454",
  },
  progressCard: {
    backgroundColor: "#A9D08E",
    borderRadius: 10,
    padding: 15,
    gap: 10,
    marginBottom: 30,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: "#6D8299",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#2F4454",
    borderRadius: 6,
  },
  progressBarLabel: {
    fontSize: 12,
    color: "#2F4454",
    textAlign: "center",
    fontWeight: "bold",
  },
  // ACTION BUTTONS
  actionRow: {
    flexDirection: "row",
    gap: 15,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  hapusBtn: {
    backgroundColor: "#8B0000", // Dark red
  },
  bookmarkBtn: {
    backgroundColor: "#2F4454", // Dark teal
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
