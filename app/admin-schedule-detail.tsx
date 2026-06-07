// File: app/admin-schedule-detail.tsx

import AdminBottomNav from "@/components/admin-bottom-nav";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import React, { useEffect, useMemo, useState } from "react";
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
import { auth, database } from "../database";
import { bookmarkStore } from "../store/bookmarkStore";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BAR_CHART_H = 80;
const MIN_BAR_HEIGHT = 4; // garis pendek untuk nilai 0

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "DD MM, YYYY" atau "DD Mon, YY" → Date object (set ke tengah malam) */
function parseDateString(dateStr: string): Date | null {
  if (!dateStr || dateStr === "-") return null;

  const MONTH_MAP: Record<string, number> = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  // Format numerik: "05 06, 2026"
  const numMatch = dateStr.match(/^(\d{1,2})\s+(\d{1,2}),?\s*(\d{2,4})$/);
  if (numMatch) {
    const day = parseInt(numMatch[1], 10);
    const month = parseInt(numMatch[2], 10) - 1;
    const yr = numMatch[3].length === 2 ? 2000 + parseInt(numMatch[3], 10) : parseInt(numMatch[3], 10);
    return new Date(yr, month, day, 23, 59, 59);
  }

  // Format teks: "05 Jun, 2026"
  const txtMatch = dateStr.match(/^(\d{1,2})\s+([a-zA-Z]+),?\s*(\d{2,4})$/);
  if (txtMatch) {
    const day = parseInt(txtMatch[1], 10);
    const abbr = txtMatch[2].toLowerCase();
    const month = MONTH_MAP[abbr] ?? 0;
    const yr = txtMatch[3].length === 2 ? 2000 + parseInt(txtMatch[3], 10) : parseInt(txtMatch[3], 10);
    return new Date(yr, month, day, 23, 59, 59);
  }

  return null;
}

/**
 * Hitung persentase sisa waktu event
 * - Returns nilai antara 0..1 (0 = sudah habis, 1 = baru mulai)
 */
function calcTimeRemaining(startDate: string, endDate: string): {
  pct: number;
  label: string;
} {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  const now = new Date();

  if (!end) return { pct: 0, label: "Tanggal akhir tidak tersedia" };

  if (now > end) return { pct: 0, label: "Event telah berakhir" };

  const totalMs = start ? end.getTime() - start.getTime() : null;
  const remainMs = end.getTime() - now.getTime();

  // pct = sisa / total (jika ada start), else sisa hari dari sekarang ke akhir
  let pct = 1;
  if (totalMs && totalMs > 0) {
    pct = Math.min(1, Math.max(0, remainMs / totalMs));
  }

  // Format label
  const days = Math.floor(remainMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) {
    return { pct, label: `Sisa ${days} hari ${hours} jam lagi` };
  } else if (hours > 0) {
    const mins = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));
    return { pct, label: `Sisa ${hours} jam ${mins} menit lagi` };
  } else {
    const mins = Math.floor(remainMs / (1000 * 60));
    return { pct, label: `Sisa ${Math.max(0, mins)} menit lagi` };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminScheduleDetailScreen() {
  const router = useRouter();
  const {
    name,
    eventKey,
    posterUrl,
    day,
    month,
    year,
    status,
    description: descParam,
    endDate: endDateParam,
    startDate: startDateParam,
  } = useLocalSearchParams<{
    id: string;
    name: string;
    day: string;
    month: string;
    year: string;
    status?: string;
    eventKey?: string;
    posterUrl?: string;
    description?: string;
    endDate?: string;
    startDate?: string;
  }>();

  const eventTitle = name || "Judul Event";
  const eventDate = day && month && year ? `${day} ${month} ${year}` : "-";
  const eventStatus = status ? status : "approved";
  const hasPoster = posterUrl && posterUrl.startsWith("http");
  const isBookmarked = eventKey ? bookmarkStore.isBookmarked(eventKey) : false;

  // -------------------------------------------------------------------------
  // State: hourly views data dari Firebase
  // -------------------------------------------------------------------------
  const [hourlyViews, setHourlyViews] = useState<{ hour: string; count: number }[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  // -------------------------------------------------------------------------
  // Subscribe ke data views dan daftar-clicks dari Firebase
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!eventKey) return;

    // views/{eventKey}/{YYYY-MM-DD_HH}: count
    const viewsRef = ref(database, `views/${eventKey}`);
    const unsubViews = onValue(viewsRef, (snap) => {
      if (!snap.exists()) {
        setHourlyViews([]);
        setTotalViews(0);
        return;
      }
      const raw = snap.val() as Record<string, number>;
      // Kumpulkan semua slot jam → { hour: "YYYY-MM-DD_HH", count }
      const slots = Object.entries(raw).map(([key, count]) => ({
        hour: key,
        count: typeof count === "number" ? count : 0,
      }));
      // Sort ascending by key (ISO string order works)
      slots.sort((a, b) => a.hour.localeCompare(b.hour));
      setHourlyViews(slots);
      setTotalViews(slots.reduce((s, v) => s + v.count, 0));
    });

    // clicks/{eventKey}: total klik tombol daftar
    const clicksRef = ref(database, `clicks/${eventKey}`);
    const unsubClicks = onValue(clicksRef, (snap) => {
      setTotalClicks(snap.exists() ? (snap.val() as number) : 0);
    });

    return () => {
      unsubViews();
      unsubClicks();
    };
  }, [eventKey]);

  // -------------------------------------------------------------------------
  // Proses data grafik: selalu 6 batang
  //  - Jika jam berviews >= 6  → ambil 6 jam terakhir yang ada views
  //  - Jika jam berviews < 6   → tampilkan yang ada + pad slot kosong ke kanan
  // -------------------------------------------------------------------------
  const chartData = useMemo(() => {
    const CHART_BARS = 6;

    // Jam yang punya views (count > 0), sudah sorted ascending
    const withViews = hourlyViews.filter((s) => s.count > 0);

    let displaySlots: { label: string; count: number }[];

    if (withViews.length >= CHART_BARS) {
      // Sudah cukup: ambil 6 jam terakhir yang berviews
      displaySlots = withViews.slice(-CHART_BARS).map((s) => ({
        label: s.hour.slice(-2), // "HH"
        count: s.count,
      }));
    } else {
      // Belum cukup: pakai semua jam berviews + tambahkan slot kosong ke kanan
      const existing = withViews.map((s) => ({
        label: s.hour.slice(-2),
        count: s.count,
      }));
      const padCount = CHART_BARS - existing.length;
      // Hitung label jam berikutnya setelah jam terakhir yang ada
      const lastHour =
        withViews.length > 0
          ? parseInt(withViews[withViews.length - 1].hour.slice(-2), 10)
          : new Date().getHours();
      const padding = Array.from({ length: padCount }, (_, i) => ({
        label: String((lastHour + 1 + i) % 24).padStart(2, "0"),
        count: 0,
      }));
      displaySlots = [...existing, ...padding];
    }

    const maxCount = Math.max(...displaySlots.map((s) => s.count), 1);
    return { slots: displaySlots, maxCount };
  }, [hourlyViews]);

  // -------------------------------------------------------------------------
  // Valuasi pendaftaran (persentase klik daftar / total views)
  // -------------------------------------------------------------------------
  const valuasiPct = totalViews > 0
    ? Math.min(100, Math.round((totalClicks / totalViews) * 100))
    : 0;

  // -------------------------------------------------------------------------
  // Sisa jangka waktu
  // -------------------------------------------------------------------------
  const [timeRemaining, setTimeRemaining] = useState(() =>
    calcTimeRemaining(startDateParam || "", endDateParam || ""),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calcTimeRemaining(startDateParam || "", endDateParam || ""));
    }, 60000); // update tiap menit
    return () => clearInterval(interval);
  }, [startDateParam, endDateParam]);

  // -------------------------------------------------------------------------
  // Delete event
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
            if (eventKey) {
              bookmarkStore.remove(eventKey);
              try {
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
  // Bookmark event
  // -------------------------------------------------------------------------
  const handleBookmark = () => {
    if (!eventKey) return;
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

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
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

        {/* ================================================================ */}
        {/* 1. DESCRIPTION CARD                                              */}
        {/* ================================================================ */}
        <View style={styles.descriptionCard}>
          {descParam && descParam.trim().length > 0 ? (
            <Text style={styles.descriptionContent}>{descParam}</Text>
          ) : (
            <Text style={styles.descriptionPlaceholder}>
              Deskripsi event tidak tersedia.
            </Text>
          )}
        </View>

        {/* PERFORMANCE SECTION */}
        <Text style={styles.sectionTitle}>Peforma Event</Text>

        <View style={styles.metricsRow}>
          {/* ============================================================== */}
          {/* 2. BAR CHART – HOURLY VIEWS                                     */}
          {/* ============================================================== */}
          <View style={styles.metricCard}>
            <View style={styles.barChart}>
              {chartData.slots.map((slot, i) => {
                const heightRatio = slot.count / chartData.maxCount;
                const barH =
                  slot.count === 0
                    ? MIN_BAR_HEIGHT
                    : Math.max(MIN_BAR_HEIGHT, heightRatio * BAR_CHART_H);
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barH,
                          backgroundColor:
                            slot.count === 0
                              ? "#8FA7BA" // warna lebih pucat untuk nol
                              : i % 2 === 0
                              ? "#6D8299"
                              : "#2F4454",
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{slot.label}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.metricLabel}>Perkembangan Views</Text>
            <Text style={styles.metricValue}>{totalViews} Total Views</Text>
          </View>

          {/* ============================================================== */}
          {/* 3. RING CHART – VALUASI PENDAFTARAN                             */}
          {/* ============================================================== */}
          <View style={styles.metricCard}>
            <ValuasiRing pct={valuasiPct} />
            <Text style={styles.metricLabel}>
              Valuasi Pendaftaran{"\n"}Setelah klik
            </Text>
          </View>
        </View>

        {/* ================================================================ */}
        {/* 4. SISA JANGKA WAKTU – PROGRESS BAR                              */}
        {/* ================================================================ */}
        <View style={styles.progressCard}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(timeRemaining.pct * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>{timeRemaining.label}</Text>
          <Text style={styles.progressBarSubLabel}>Sisa Jangka Waktu Event</Text>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* ACTION BUTTONS                                                    */}
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
// Sub-component: Valuasi Ring Chart
// ---------------------------------------------------------------------------
function ValuasiRing({ pct }: { pct: number }) {
  // Gunakan pendekatan arc sederhana seperti semula, tetapi dengan rotasi
  // yang dihitung dari persentase.
  // 0% → tidak ada arc, 100% → arc penuh (360 deg ≈ semua border berwarna)
  // Kita bagi 4 kuadran: setiap 25% mengisi 1 border.
  const fill = pct / 100;

  // Warna arc berdasar nilai
  const arcColor = pct >= 50 ? "#2F4454" : pct >= 25 ? "#4A7A60" : "#8B0000";

  return (
    <View style={styles.ringWrapper}>
      {/* Track */}
      <View style={styles.ringBase} />
      {/* Arc overlay – rotasi disesuaikan persentase */}
      <View
        style={[
          styles.ringArc,
          {
            borderTopColor: fill > 0 ? arcColor : "transparent",
            borderRightColor: fill > 0.25 ? arcColor : "transparent",
            borderBottomColor: fill > 0.5 ? arcColor : "transparent",
            borderLeftColor: fill > 0.75 ? arcColor : "transparent",
            transform: [{ rotate: `${fill * 360 - 90}deg` }],
          },
        ]}
      />
      <Text style={styles.ringText}>{pct}%</Text>
    </View>
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
  // Description card
  descriptionCard: {
    backgroundColor: "#F8FAF8",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#2F4454",
    padding: 18,
    marginBottom: 25,
    minHeight: 80,
    justifyContent: "center",
  },
  descriptionContent: {
    fontSize: 14,
    color: "#2F4454",
    lineHeight: 22,
  },
  descriptionPlaceholder: {
    fontSize: 14,
    color: "#9AAA99",
    fontStyle: "italic",
    textAlign: "center",
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
    gap: 6,
    minHeight: 160,
  },
  // Bar chart
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: BAR_CHART_H + 16, // extra for labels
    width: "100%",
    paddingHorizontal: 5,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: BAR_CHART_H + 16,
  },
  bar: {
    width: "100%",
    borderRadius: 2,
    minHeight: MIN_BAR_HEIGHT,
  },
  barLabel: {
    fontSize: 7,
    color: "#2F4454",
    marginTop: 2,
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#2F4454",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 2,
  },
  metricValue: {
    fontSize: 11,
    color: "#2F4454",
    textAlign: "center",
    fontWeight: "bold",
  },
  // Ring chart
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
  },
  ringText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F4454",
  },
  // Progress bar
  progressCard: {
    backgroundColor: "#A9D08E",
    borderRadius: 10,
    padding: 15,
    gap: 8,
    marginBottom: 30,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: "#6D8299",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
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
  progressBarSubLabel: {
    fontSize: 11,
    color: "#2F4454",
    textAlign: "center",
    fontStyle: "italic",
  },
  // Action buttons
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
    backgroundColor: "#8B0000",
  },
  bookmarkBtn: {
    backgroundColor: "#2F4454",
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
