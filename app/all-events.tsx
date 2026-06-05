// File: app/all-events.tsx
// Halaman "More" — menampilkan 6 mock event di atas dan event dari database (approved) di bawah

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, database } from "../database";
import BottomNav from "@/components/bottom-nav";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DbEvent = {
  key: string;
  title: string;
  posterUrl: string;
  endDate: string;
  organizer: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Parse string tanggal "DD MM, YY" atau "DD Mon, YY" ke Date object */
function parsePeriodDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;

  // Format numerik: "05 06, 26"
  const numMatch = dateStr.match(/^(\d{1,2})\s+(\d{1,2}),?\s*(\d{2,4})$/);
  if (numMatch) {
    const day = parseInt(numMatch[1], 10);
    const month = parseInt(numMatch[2], 10) - 1;
    const yr = numMatch[3];
    const year = yr.length === 2 ? 2000 + parseInt(yr, 10) : parseInt(yr, 10);
    return new Date(year, month, day);
  }

  // Format teks: "05 Jun, 26"
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
    // Indonesian abbreviations
    mei: 4,
    agu: 7,
    okt: 9,
    des: 11,
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

  // Fallback — coba parse langsung
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/** Warna dot untuk event DB berdasarkan tanggal akhir */
export function getDateStatusColor(endDateStr: string): string {
  const endDate = parsePeriodDate(endDateStr);
  if (!endDate) return "#10B981"; // Default hijau kalau tanggal tidak bisa di-parse

  const now = new Date();
  const msPerDay = 86_400_000;
  const daysLeft = (endDate.getTime() - now.getTime()) / msPerDay;

  if (daysLeft < 0) return "#EF4444"; // Merah  — sudah lewat
  if (daysLeft <= 3) return "#F59E0B"; // Kuning — H-3
  return "#10B981"; // Hijau  — masih jauh
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AllEventsScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    fullname: string;
    fakultas: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);

  // Fetch user profile
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, "User/" + user.uid);
        const unsubDb = onValue(userRef, (snap) => {
          const data = snap.val();
          if (data) {
            setUserProfile({
              fullname: data.fullname || data.username || "User",
              fakultas: data.fakultas || "Mahasiswa",
            });
          }
        });
        return () => unsubDb();
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // Fetch approved events dari Firebase
  useEffect(() => {
    const eventsRef = ref(database, "events");
    const unsubDb = onValue(eventsRef, (snap) => {
      if (!snap.exists()) {
        setDbEvents([]);
        return;
      }
      const raw = snap.val() as Record<string, any>;
      const approved: DbEvent[] = Object.entries(raw)
        .filter(([, val]) => val?.status === "approved")
        .map(([key, val]) => ({
          key,
          title: val["Nama Event"] || "Event",
          posterUrl: val["upload poster"] || "",
          endDate: val["periode akhir"] || "",
          organizer: val["Nama penyelenggara"] || "",
        }));
      setDbEvents(approved);
    });
    return () => unsubDb();
  }, []);

  // Filter DB events berdasarkan search
  const filteredDb = dbEvents.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ---------------------------------------------------------------------------
  // Render satu grid item
  // ---------------------------------------------------------------------------
  const renderDbCard = (event: DbEvent) => {
    const dotColor = getDateStatusColor(event.endDate);
    const hasImage = event.posterUrl && event.posterUrl.startsWith("http");

    return (
      <TouchableOpacity
        key={event.key}
        style={styles.gridItem}
        onPress={() => router.push(`/events/${event.key}` as any)}
        activeOpacity={0.8}
      >
        <View style={styles.gridImageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: event.posterUrl }}
              style={styles.gridItemImage}
              resizeMode="cover"
              // onError falls back to green placeholder (Image just won't show)
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>
        <View style={styles.gridTextContainer}>
          <Text style={styles.eventTitleText} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A9D08E" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#2F4454" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.userName}>
              {userProfile?.fullname || "Memuat..."}
            </Text>
            <Text style={styles.userMajor}>
              {userProfile?.fakultas || "Memuat..."}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search event..."
            placeholderTextColor="#7A8B99"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#2F4454" />
        </View>

        {/* -------- SECTION: DB EVENTS (approved from database) -------- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Semua Event Terdaftar</Text>
        </View>

        <View style={styles.gridContainer}>
          {filteredDb.length > 0 ? (
            filteredDb.map(renderDbCard)
          ) : (
            <Text style={styles.noDataText}>
              {dbEvents.length === 0
                ? "Belum ada event yang disetujui dari database."
                : "Event tidak ditemukan"}
            </Text>
          )}
        </View>
      </ScrollView>

      <BottomNav />
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
  header: {
    backgroundColor: "#A9D08E",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F4F6F6",
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F4454",
  },
  userMajor: {
    fontSize: 12,
    color: "#2F4454",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#2F4454",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2F4454",
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F4454",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  gridItem: {
    width: "48%",
    height: 120,
    backgroundColor: "#A9D08E",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    flexDirection: "column",
  },
  gridImageContainer: {
    width: "100%",
    height: 90,
    backgroundColor: "#7A8B99",
  },
  gridItemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#8A9A86",
  },
  gridTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#A9D08E",
  },
  eventTitleText: {
    color: "#2F4454",
    fontWeight: "bold",
    fontSize: 12,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "#2F4454",
  },
  noDataText: {
    width: "100%",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    color: "#7A8B99",
    fontStyle: "italic",
  },
});
