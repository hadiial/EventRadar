// File: app/admin-dashboard.tsx

import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { useEffect, useRef, useState } from "react";
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

    // Get Event Counts dari Firebase
    const eventsRef = ref(database, 'events');
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let pCount = 0;
        let aCount = 0;
        
        Object.values(data).forEach((evt: any) => {
          const status = evt.status?.toLowerCase() || 'pending';
          if (status === 'pending') {
            pCount++;
          } else if (status === 'approved') {
            aCount++;
          }
        });
        
        setPendingCount(pCount);
        setApprovedCount(aCount);
      } else {
        setPendingCount(0);
        setApprovedCount(0);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeEvents();
    };
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

  const renderBarChart = () => {
    const barHeights = [20, 30, 25, 45, 65, 40, 55, 45, 60, 50, 80, 90, 70, 45];
    return (
      <View style={styles.barChartContainer}>
        {barHeights.map((height, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: `${height}%` as any,
                backgroundColor: index % 2 === 0 ? "#6D8299" : "#2F4454",
              },
            ]}
          />
        ))}
      </View>
    );
  };

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
            <View style={styles.chartArea}>{renderBarChart()}</View>
            <Text style={styles.cardLabel}>Perkembangan Views</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.chartArea}>
              <View style={styles.pieChartBase}>
                <View style={styles.pieChartCutout} />
              </View>
            </View>
            <Text style={styles.cardLabel}>
              Hasil kurasi terakhir kelayakan Event
            </Text>
          </View>

          {/* Kotak Event Berjalan */}
          <View style={styles.gridCard}>
            <View style={styles.numberArea}>
              <Text style={styles.bigNumber}>{approvedCount}</Text>
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
    height: "80%",
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  pieChartBase: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2F4454",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  pieChartCutout: {
    width: 45,
    height: 45,
    backgroundColor: "#6D8299",
    borderTopRightRadius: 45,
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