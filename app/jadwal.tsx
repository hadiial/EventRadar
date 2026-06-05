import BottomNav from "@/components/bottom-nav";
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
    TouchableOpacity,
    View,
} from "react-native";
import { auth, database } from "../database";
import { bookmarkStore } from "../store/bookmarkStore";

interface ScheduleEvent {
  key: string;
  day: string;
  month: string;
  year: string;
  name: string;
  posterUrl?: string;
}

function parseDateParts(dateStr: string): {
  day: string;
  month: string;
  year: string;
} {
  const MONTHS_ID: Record<number, string> = {
    1: "Januari",
    2: "Februari",
    3: "Maret",
    4: "April",
    5: "Mei",
    6: "Juni",
    7: "Juli",
    8: "Agustus",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Desember",
  };
  const ABBR_ID: Record<string, string> = {
    jan: "Januari",
    feb: "Februari",
    mar: "Maret",
    apr: "April",
    mei: "Mei",
    may: "Mei",
    jun: "Juni",
    jul: "Juli",
    agu: "Agustus",
    aug: "Agustus",
    sep: "September",
    okt: "Oktober",
    oct: "Oktober",
    nov: "November",
    des: "Desember",
    dec: "Desember",
  };

  if (!dateStr || dateStr.trim() === "") {
    return { day: "??", month: "Unknown", year: "????" };
  }

  const numMatch = dateStr.match(/^(\d{1,2})\s+(\d{1,2}),?\s*(\d{2,4})$/);
  if (numMatch) {
    const day = numMatch[1].padStart(2, "0");
    const monthNum = parseInt(numMatch[2], 10);
    const year = numMatch[3].length === 2 ? `20${numMatch[3]}` : numMatch[3];
    return { day, month: MONTHS_ID[monthNum] ?? `Bln ${monthNum}`, year };
  }

  const txtMatch = dateStr.match(/^(\d{1,2})\s+([a-zA-Z]{3}),?\s*(\d{2,4})$/);
  if (txtMatch) {
    const day = txtMatch[1].padStart(2, "0");
    const abbr = txtMatch[2].toLowerCase();
    const year = txtMatch[3].length === 2 ? `20${txtMatch[3]}` : txtMatch[3];
    return { day, month: ABBR_ID[abbr] ?? txtMatch[2], year };
  }

  return { day: "??", month: dateStr, year: "" };
}

const ITEMS_PER_PAGE = 8;

export default function JadwalScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [userProfile, setUserProfile] = useState<{
    fullname: string;
    fakultas: string;
  } | null>(null);

  // Subscribe ke bookmarkStore agar outline biru update real-time
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsubscribe = bookmarkStore.subscribe(() =>
      forceUpdate((n) => n + 1),
    );
    return unsubscribe;
  }, []);

  // Fetch user profile dari Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, "User/" + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserProfile({
              fullname: data.fullname || data.username || "User",
              fakultas: data.fakultas || "",
            });
          }
        });
        return () => unsubscribeDb();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    const eventsRef = ref(database, "events");
    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setScheduleEvents([]);
        return;
      }

      const raw = snapshot.val() as Record<string, any>;
      const approvedEvents: ScheduleEvent[] = Object.entries(raw)
        .filter(([, value]) => value?.status === "approved")
        .map(([key, value]) => {
          const { day, month, year } = parseDateParts(
            value?.["Periode mulai"] || "",
          );
          return {
            key,
            day,
            month,
            year,
            name: value?.["Nama Event"] || "Event",
            posterUrl: value?.["upload poster"] || "",
          };
        });

      setScheduleEvents(approvedEvents);
      setCurrentPage(1);
    });

    return () => unsubscribeEvents();
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(scheduleEvents.length / ITEMS_PER_PAGE),
  );
  const pagedEvents = scheduleEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A9D08E" />

      {/* HEADER */}
      <View style={styles.header}>
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
        {/* SECTION TITLE */}
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={18} color="#2F4454" />
          <Text style={styles.sectionTitle}>Jadwal Kegiatan terdekat</Text>
        </View>

        {/* GRID */}
        {scheduleEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#A9D08E" />
            <Text style={styles.emptyText}>
              Belum ada jadwal event yang disetujui.
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {pagedEvents.map((event) => {
              const isBookmarked = bookmarkStore.isBookmarked(event.key);
              const hasPoster =
                !!event.posterUrl && event.posterUrl.startsWith("http");

              return (
                <TouchableOpacity
                  key={event.key}
                  style={[
                    styles.gridItem,
                    isBookmarked && styles.gridItemBookmarked,
                  ]}
                  onPress={() => router.push(`/events/${event.key}`)}
                >
                  <View style={styles.gridItemTop}>
                    <View>
                      <View style={styles.gridItemDayRow}>
                        <Text style={styles.gridItemDay}>{event.day}</Text>
                        <Text style={styles.gridItemYear}>{event.year}</Text>
                      </View>
                      <Text style={styles.gridItemMonth}>{event.month}</Text>
                    </View>
                    <View style={styles.gridItemImageBox}>
                      {hasPoster ? (
                        <Image
                          source={{ uri: event.posterUrl! }}
                          style={styles.gridItemImage}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.gridItemName} numberOfLines={1}>
                    {event.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* PAGINATION */}
        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <Text
              style={[
                styles.pageArrowText,
                currentPage === 1 && styles.pageArrowDisabled,
              ]}
            >
              {"<"}
            </Text>
          </TouchableOpacity>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <TouchableOpacity
              key={page}
              style={[
                styles.pageBtn,
                page === currentPage && styles.pageBtnActive,
              ]}
              onPress={() => setCurrentPage(page)}
            >
              <Text
                style={[
                  styles.pageBtnText,
                  page === currentPage && styles.pageBtnTextActive,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <Text
              style={[
                styles.pageArrowText,
                currentPage === totalPages && styles.pageArrowDisabled,
              ]}
            >
              {">"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomNav />
    </SafeAreaView>
  );
}

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
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 13,
    color: "#2F4454",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F4F6F6",
    marginRight: 15,
  },
  userName: {
    fontSize: 18,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    height: 110,
    backgroundColor: "#A9D08E",
    borderRadius: 10,
    marginBottom: 10,
    padding: 8,
    justifyContent: "space-between",
    // Tidak ada border/outline secara default
  },
  // Outline biru muncul hanya jika event di-bookmark
  gridItemBookmarked: {
    borderWidth: 2,
    borderColor: "#1565C0",
  },
  gridItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gridItemDayRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  gridItemDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F4454",
  },
  gridItemYear: {
    fontSize: 11,
    color: "#2F4454",
  },
  gridItemMonth: {
    fontSize: 11,
    color: "#2F4454",
    marginTop: 1,
  },
  gridItemImageBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#2F4454",
    overflow: "hidden",
  },
  gridItemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  gridItemName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2F4454",
  },
  emptyState: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 36,
  },
  emptyText: {
    marginTop: 14,
    color: "#7A8B99",
    fontSize: 14,
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  pageArrow: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  pageArrowText: {
    fontSize: 16,
    color: "#2F4454",
    fontWeight: "bold",
  },
  pageArrowDisabled: {
    color: "#B0BEC5",
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#A9D08E",
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnActive: {
    backgroundColor: "#2F4454",
  },
  pageBtnText: {
    fontSize: 12,
    color: "#2F4454",
    fontWeight: "bold",
  },
  pageBtnTextActive: {
    color: "#FFF",
  },
});
