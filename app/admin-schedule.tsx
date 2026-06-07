// File: app/admin-schedule.tsx

import AdminBottomNav from "@/components/admin-bottom-nav";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
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
// Types
// ---------------------------------------------------------------------------
interface ScheduleItem {
  key: string; // Firebase event key (e.g., 'event_id_1')
  dateNum: string; // Day number from 'Periode mulai'
  year: string;
  month: string;
  eventName: string;
  posterUrl: string;
  status: string;
  description: string;
  endDate: string; // periode akhir
  startDate: string; // periode mulai (raw)
}

const ITEMS_PER_PAGE = 8; 

// ---------------------------------------------------------------------------
// Helper: parse "DD MM, YY" or "DD Mon, YY" -> { day, month, year }
// ---------------------------------------------------------------------------
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

  if (!dateStr || dateStr === "-")
    return { day: "??", month: "???", year: "????" };

  // Numeric format: "05 06, 26"
  const numMatch = dateStr.match(/^(\d{1,2})\s+(\d{1,2}),?\s*(\d{2,4})$/);
  if (numMatch) {
    const day = numMatch[1].padStart(2, "0");
    const mNum = parseInt(numMatch[2], 10);
    const yr = numMatch[3].length === 2 ? `20${numMatch[3]}` : numMatch[3];
    return { day, month: MONTHS_ID[mNum] ?? `Bln ${mNum}`, year: yr };
  }

  // Text format: "05 Jun, 26"
  const txtMatch = dateStr.match(/^(\d{1,2})\s+([a-zA-Z]{3}),?\s*(\d{2,4})$/);
  if (txtMatch) {
    const day = txtMatch[1].padStart(2, "0");
    const abbr = txtMatch[2].toLowerCase();
    const yr = txtMatch[3].length === 2 ? `20${txtMatch[3]}` : txtMatch[3];
    return { day, month: ABBR_ID[abbr] ?? txtMatch[2], year: yr };
  }

  // Fallback: use the text as-is
  return { day: "??", month: dateStr, year: "" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminScheduleScreen() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [adminFakultas, setAdminFakultas] = useState("");

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Subscribe to bookmarkStore to re-render when bookmarks change
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = bookmarkStore.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  // Fetch admin profile
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, "User/" + user.uid);
        const unsubDb = onValue(userRef, (snap) => {
          const data = snap.val();
          if (data?.fullname) setAdminName(data.fullname);
          else if (data?.username) setAdminName(data.username);

          if (data?.fakultas) setAdminFakultas(data.fakultas);
        });
        return () => unsubDb();
      }
    });
    return () => unsubAuth();
  }, []);

  // Fetch approved events from Firebase
  useEffect(() => {
    const eventsRef = ref(database, "events");
    const unsubDb = onValue(eventsRef, (snap) => {
      if (!snap.exists()) {
        setScheduleItems([]);
        return;
      }
      const raw = snap.val() as Record<string, any>;
      const items: ScheduleItem[] = Object.entries(raw)
        .filter(([, val]) => val?.status === "approved")
        .map(([key, val]) => {
          const { day, month, year } = parseDateParts(
            val["Periode mulai"] || "",
          );
          return {
            key,
            dateNum: day,
            year,
            month,
            eventName: val["Nama Event"] || "Event",
            posterUrl: val["upload poster"] || "",
            status: val.status || "approved",
            description: val["Deskripsi event"] || "",
            endDate: val["periode akhir"] || "",
            startDate: val["Periode mulai"] || "",
          };
        });

      setScheduleItems(items);
      setCurrentPage(1); // Reset to the first page when data changes
    });
    return () => unsubDb();
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(scheduleItems.length / ITEMS_PER_PAGE),
  );

  const pagedItems = scheduleItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A9D08E" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.userName}>{adminName}</Text>
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
          <Text style={styles.sectionTitle}>Jadwal Kegiatan Terdekat</Text>
        </View>

        {/* GRID */}
        {scheduleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#A9D08E" />
            <Text style={styles.emptyText}>
              Belum ada event terjadwal yang disetujui.
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {pagedItems.map((item) => {
              const isBookmarked = bookmarkStore.isBookmarked(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.gridItem,
                    isBookmarked && styles.gridItemBookmarked,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/admin-schedule-detail" as any,
                      params: {
                        id: item.key,
                        name: item.eventName,
                        day: item.dateNum,
                        month: item.month,
                        year: item.year,
                        status: item.status,
                        eventKey: item.key,
                        posterUrl: item.posterUrl,
                        description: item.description,
                        endDate: item.endDate,
                        startDate: item.startDate,
                      },
                    })
                  }
                >
                  {/* Top: tanggal + thumbnail box */}
                  <View style={styles.gridItemTop}>
                    <View>
                      <View style={styles.gridItemDayRow}>
                        <Text style={styles.gridItemDay}>{item.dateNum}</Text>
                        <Text style={styles.gridItemYear}>{item.year}</Text>
                      </View>
                      <Text style={styles.gridItemMonth}>{item.month}</Text>
                    </View>

                    <View style={styles.gridItemImageBox}>
                      {item.posterUrl && item.posterUrl.startsWith("http") ? (
                        <Image
                          source={{ uri: item.posterUrl }}
                          style={styles.gridItemImage}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                  </View>

                  {/* Event name */}
                  <Text style={styles.gridItemName} numberOfLines={1}>
                    {item.eventName}
                  </Text>

                  {/* Ubah setelan event */}
                  <TouchableOpacity
                    style={styles.editLinkContainer}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      Alert.alert(
                        "Ubah Setelan Event",
                        `Event: ${item.eventName}\n\nApa yang ingin Anda lakukan?`,
                        [
                          { text: "Batal", style: "cancel" },
                          {
                            text: "Hapus Event",
                            style: "destructive",
                            onPress: () => {
                              Alert.alert(
                                "Konfirmasi Hapus",
                                `Apakah Anda yakin ingin menghapus "${item.eventName}"? Event akan ditandai sebagai ditolak.`,
                                [
                                  { text: "Batal", style: "cancel" },
                                  {
                                    text: "Hapus",
                                    style: "destructive",
                                    onPress: async () => {
                                      try {
                                        await update(
                                          ref(database, `events/${item.key}`),
                                          { status: "rejected" },
                                        );
                                        bookmarkStore.remove(item.key);
                                      } catch (err) {
                                        console.error(
                                          "Error removing event:",
                                          err,
                                        );
                                      }
                                    },
                                  },
                                ],
                              );
                            },
                          },
                          {
                            text: "Biarkan",
                            onPress: () => {
                              /* no action */
                            },
                          },
                        ],
                      );
                    }}
                  >
                    <Text style={styles.editLinkText}>Ubah setelan event</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FIXED PAGINATION CONTAINER */}
      <View style={styles.fixedPaginationContainer}>
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
      </View>

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
  header: {
    backgroundColor: "#A9D08E",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
  scrollContent: {
    paddingBottom: 20,
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
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#7A8B99",
    textAlign: "center",
    fontStyle: "italic",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  gridItem: {
    width: "48%",
    minHeight: 115, 
    backgroundColor: "#A9D08E",
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  gridItemBookmarked: {
    borderWidth: 2,
    borderColor: "#2F4454",
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
  editLinkContainer: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  editLinkText: {
    fontSize: 10,
    color: "#2F4454",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  fixedPaginationContainer: {
    backgroundColor: "#E8F5CC",
    paddingTop: 10,
    paddingBottom: 120, 
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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