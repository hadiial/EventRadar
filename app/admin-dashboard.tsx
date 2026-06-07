// File: app/admin-dashboard.tsx

import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, database } from "../database";
import AdminBottomNav from "@/components/admin-bottom-nav";

/**
 * AdminDashboardScreen
 * Landing page untuk admin dengan data real-time dari Firebase
 */
export default function AdminDashboardScreen() {
  const router = useRouter();
  const [adminName, setAdminName]     = useState("Admin");
  const [currentDate, setCurrentDate] = useState("");

  // State untuk menyimpan jumlah event
  const [pendingCount, setPendingCount]   = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  // Event approved yang masih berjalan (periode akhir belum lewat)
  const [runningCount, setRunningCount]   = useState(0);

  // State untuk views aggregate semua event
  const [allHourlyViews, setAllHourlyViews] = useState<{ hour: string; count: number }[]>([]);

  // Animated value untuk scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set Tanggal
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    setCurrentDate(new Date().toLocaleDateString("id-ID", dateOptions));

    // Get Admin Profile
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, "User/" + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data?.fullname)       setAdminName(data.fullname);
          else if (data?.username)  setAdminName(data.username);
        });
        return () => unsubscribeDb();
      }
    });

    // Helper parse tanggal "DD MM, YY" atau "DD Mon, YY"
    const parsePeriodDate = (dateStr: string): Date | null => {
      if (!dateStr || dateStr.trim() === '') return null;
      const numMatch = dateStr.match(/^(\d{1,2})\s+(\d{1,2}),?\s*(\d{2,4})$/);
      if (numMatch) {
        const day = parseInt(numMatch[1], 10);
        const month = parseInt(numMatch[2], 10) - 1;
        const yr = numMatch[3];
        const year = yr.length === 2 ? 2000 + parseInt(yr, 10) : parseInt(yr, 10);
        return new Date(year, month, day);
      }
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        mei: 4, agu: 7, okt: 9, des: 11,
      };
      const textMatch = dateStr.match(/^(\d{1,2})\s+([a-zA-Z]{3}),?\s*(\d{2,4})$/);
      if (textMatch) {
        const day = parseInt(textMatch[1], 10);
        const monthIdx = months[textMatch[2].toLowerCase()];
        if (monthIdx !== undefined) {
          const yr = textMatch[3];
          const year = yr.length === 2 ? 2000 + parseInt(yr, 10) : parseInt(yr, 10);
          return new Date(year, monthIdx, day);
        }
      }
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    // Get Event Counts dari Firebase
    const eventsRef = ref(database, 'events');
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let pCount = 0;
        let aCount = 0;
        let rCount = 0;
        let runCount = 0;
        const now = new Date();
        // Awal hari ini (00:00:00) agar event yang berakhir hari ini masih terhitung
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        Object.values(data).forEach((evt: any) => {
          const status = evt.status?.toLowerCase() || 'pending';
          if (status === 'pending') {
            pCount++;
          } else if (status === 'approved') {
            aCount++;
            // Hitung sebagai "masih berjalan" jika periode akhir >= hari ini
            const endDate = parsePeriodDate(evt['periode akhir'] || '');
            if (!endDate || endDate >= today) {
              runCount++;
            }
          } else if (status === 'rejected') {
            rCount++;
          }
        });

        setPendingCount(pCount);
        setApprovedCount(aCount);
        setRejectedCount(rCount);
        setRunningCount(runCount);
      } else {
        setPendingCount(0);
        setApprovedCount(0);
        setRejectedCount(0);
        setRunningCount(0);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeEvents();
    };
  }, []);

  // Subscribe ke semua views dari Firebase dan aggregate per jam
  useEffect(() => {
    const viewsRef = ref(database, 'views');
    const unsub = onValue(viewsRef, (snap) => {
      if (!snap.exists()) {
        setAllHourlyViews([]);
        return;
      }
      // Struktur: views/{eventKey}/{YYYY-MM-DD_HH}: count
      const allEvents = snap.val() as Record<string, Record<string, number>>;
      // Aggregate: jumlahkan semua event per slot jam
      const hourMap: Record<string, number> = {};
      Object.values(allEvents).forEach((eventSlots) => {
        if (!eventSlots || typeof eventSlots !== 'object') return;
        Object.entries(eventSlots).forEach(([hour, cnt]) => {
          hourMap[hour] = (hourMap[hour] ?? 0) + (typeof cnt === 'number' ? cnt : 0);
        });
      });
      // Konversi ke array dan sort
      const slots = Object.entries(hourMap)
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour));
      setAllHourlyViews(slots);
    });
    return () => unsub();
  }, []);

  // ---------------------------------------------------------------------------
  // Interpolated circle sizes — mengecil seiring scroll turun
  // ---------------------------------------------------------------------------
  const circleOuterSize = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [320, 160],
    extrapolate: "clamp",
  });
  const circleMiddleSize = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [220, 110],
    extrapolate: "clamp",
  });
  const circleInnerSize = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [120, 60],
    extrapolate: "clamp",
  });
  const circleOuterTop = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [-80, -40],
    extrapolate: "clamp",
  });
  const circleOuterRight = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [-80, -40],
    extrapolate: "clamp",
  });
  const logoFontSize = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [14, 8],
    extrapolate: "clamp",
  });

  // ---------------------------------------------------------------------------
  // Chart data: 12 batang untuk 12 jam terakhir berviews
  //  - Jika jam berviews >= 12: ambil 12 terakhir
  //  - Jika < 12: tampilkan yang ada + pad slot kosong ke kanan
  // ---------------------------------------------------------------------------
  const dashboardChartData = useMemo(() => {
    const BARS = 12;
    const withViews = allHourlyViews.filter((s) => s.count > 0);

    let slots: { label: string; count: number }[];
    if (withViews.length >= BARS) {
      slots = withViews.slice(-BARS).map((s) => ({
        label: s.hour.slice(-2),
        count: s.count,
      }));
    } else {
      const existing = withViews.map((s) => ({
        label: s.hour.slice(-2),
        count: s.count,
      }));
      const lastHour =
        withViews.length > 0
          ? parseInt(withViews[withViews.length - 1].hour.slice(-2), 10)
          : new Date().getHours();
      const padding = Array.from({ length: BARS - existing.length }, (_, i) => ({
        label: String((lastHour + 1 + i) % 24).padStart(2, '0'),
        count: 0,
      }));
      slots = [...existing, ...padding];
    }
    const maxCount = Math.max(...slots.map((s) => s.count), 1);
    return { slots, maxCount };
  }, [allHourlyViews]);

  // Persentase approved dari total kurasi (approved + rejected)
  const totalKurasi = approvedCount + rejectedCount;
  const approvedPct = totalKurasi > 0 ? Math.round((approvedCount / totalKurasi) * 100) : 0;

  // Logic untuk render lingkaran antrean secara dinamis
  const renderPendingAvatars = () => {
    if (pendingCount === 0) {
      return <Text style={styles.noPendingText}>Hore! Tidak ada antrean kurasi saat ini.</Text>;
    }

    const circles = [];
    const displayCount = Math.min(pendingCount, 3);

    for (let i = 0; i < displayCount; i++) {
      circles.push(
        <TouchableOpacity
          key={i}
          style={styles.avatarCircle}
          onPress={() => router.push("/admin-event-request" as any)}
        />
      );
    }

    if (pendingCount > 3) {
      circles.push(
        <TouchableOpacity
          key="more"
          style={styles.avatarMore}
          onPress={() => router.push("/admin-event-request" as any)}
        >
          <Text style={styles.avatarMoreText}>{pendingCount - 3}+</Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.avatarRow}>{circles}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* TOP BACKGROUND GRAPHICS — Concentric Circles (Animated) */}
      <Animated.View
        style={[
          styles.circleOuter,
          {
            width:        circleOuterSize,
            height:       circleOuterSize,
            borderRadius: Animated.divide(circleOuterSize, 2) as any,
            top:          circleOuterTop,
            right:        circleOuterRight,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.circleMiddle,
            {
              width:        circleMiddleSize,
              height:       circleMiddleSize,
              borderRadius: Animated.divide(circleMiddleSize, 2) as any,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.circleInner,
              {
                width:        circleInnerSize,
                height:       circleInnerSize,
                borderRadius: Animated.divide(circleInnerSize, 2) as any,
              },
            ]}
          >
            <Animated.Text style={[styles.logoTextSmall, { fontSize: logoFontSize }]}>
              EVENT
            </Animated.Text>
            <Animated.Text style={[styles.logoTextSmall, { fontSize: logoFontSize }]}>
              RADAR
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* HEADER SECTION */}
        <View style={styles.headerContainer}>
          <Text style={styles.greetingText}>Halo {adminName}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* PENDING REQUESTS SECTION */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Cek Permintaan Sekarang!</Text>
          {renderPendingAvatars()}
        </View>

        {/* METRICS GRID */}
        <View style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <View style={styles.chartArea}>
              <View style={styles.barChartContainer}>
                {dashboardChartData.slots.map((slot, index) => {
                  const MIN_H = 3;
                  const barH = slot.count === 0
                    ? MIN_H
                    : Math.max(MIN_H, (slot.count / dashboardChartData.maxCount) * 80);
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barH,
                            backgroundColor: slot.count === 0
                              ? '#8FA7BA'
                              : index % 2 === 0 ? '#6D8299' : '#2F4454',
                          },
                        ]}
                      />
                      <Text style={styles.barLabel}>{slot.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <Text style={styles.cardLabel}>Perkembangan Views</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.chartArea}>
              {/* Donut chart: approved (dark) vs rejected (grey) */}
              <View style={styles.donutWrapper}>
                <View style={styles.donutTrack} />
                <View
                  style={[
                    styles.donutArc,
                    {
                      borderTopColor: approvedPct > 0 ? '#2F4454' : 'transparent',
                      borderRightColor: approvedPct > 25 ? '#2F4454' : 'transparent',
                      borderBottomColor: approvedPct > 50 ? '#2F4454' : 'transparent',
                      borderLeftColor: approvedPct > 75 ? '#2F4454' : 'transparent',
                      transform: [{ rotate: `${(approvedPct / 100) * 360 - 90}deg` }],
                    },
                  ]}
                />
                <Text style={styles.donutText}>{approvedPct}%</Text>
              </View>
            </View>
            <Text style={styles.cardLabel}>
              Hasil kurasi terakhir kelayakan Event
            </Text>
          </View>

          {/* Kotak Event Berjalan */}
          <View style={styles.gridCard}>
            <View style={styles.numberArea}>
              <Text style={styles.bigNumber}>{runningCount}</Text>
            </View>
            <Text style={styles.cardLabel}>Event yang berjalan di bulan ini</Text>
          </View>

          {/* Kotak Permintaan Event (Tidak Bisa Diklik) */}
          <View style={styles.gridCard}>
            <View style={styles.numberArea}>
              <Text style={styles.bigNumber}>{pendingCount}</Text>
            </View>
            <Text style={styles.cardLabel}>Permintaan event (masa pending)</Text>
          </View>
        </View>
      </Animated.ScrollView>

      <AdminBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5CC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  circleOuter: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#7A8B99",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  circleMiddle: {
    borderWidth: 1,
    borderColor: "#7A8B99",
    justifyContent: "center",
    alignItems: "center",
  },
  circleInner: {
    borderWidth: 1,
    borderColor: "#7A8B99",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5CC",
  },
  logoTextSmall: {
    color: "#2F4454",
    fontWeight: "900",
    letterSpacing: 1,
    lineHeight: 16,
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 40,
    zIndex: 1,
  },
  greetingText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#2F4454",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: "#A2B09F",
    fontWeight: "500",
  },
  requestsSection: {
    marginBottom: 35,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F4454",
    marginBottom: 15,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#6D8299",
    borderWidth: 3,
    borderColor: "#2F4454",
    marginRight: 10,
  },
  avatarMore: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#2F4454",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarMoreText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  noPendingText: {
    color: "#7A8B99",
    fontSize: 14,
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    zIndex: 1,
  },
  gridCard: {
    width: "47%",
    backgroundColor: "#A9D08E",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    aspectRatio: 0.85,
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2F4454",
    marginTop: 10,
  },
  chartArea: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    height: 90,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 90,
  },
  bar: {
    width: '80%',
    borderRadius: 2,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 6,
    color: '#2F4454',
    marginTop: 2,
    textAlign: 'center',
  },
  donutWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutTrack: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: '#6D8299',
  },
  donutArc: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderTopColor: '#2F4454',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  donutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4454',
  },
  numberArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bigNumber: {
    fontSize: 65,
    fontWeight: "900",
    color: "#2F4454",
  },
});