// File: app/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from "react-native";
import { auth, database } from "../database";
import BottomNav from "@/components/bottom-nav";

const { width: screenWidth } = Dimensions.get("window");
const CAROUSEL_ITEMS = 3;
const SNAP_INTERVAL = screenWidth - 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DbEvent = {
  key: string;
  title: string;
  posterUrl: string;
  endDate: string;
  createdAt: number; // timestamp ms, bisa 0 jika tidak ada
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Parse string tanggal "DD MM, YY" atau "DD Mon, YY" ke Date object */
function parsePeriodDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;

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
}

/** Warna dot berdasarkan tanggal akhir event */
function getDateStatusColor(endDateStr: string): string {
  const endDate = parsePeriodDate(endDateStr);
  if (!endDate) return "#10B981";
  const now = new Date();
  const daysLeft = (endDate.getTime() - now.getTime()) / 86_400_000;
  if (daysLeft < 0) return "#EF4444";
  if (daysLeft <= 3) return "#F59E0B";
  return "#10B981";
}

/** Label sisa waktu singkat, misal "3 hari lagi", "Berakhir hari ini" */
function getTimeLeftLabel(endDateStr: string): string {
  const endDate = parsePeriodDate(endDateStr);
  if (!endDate) return "";
  const now = new Date();
  const msLeft = endDate.getTime() - now.getTime();
  if (msLeft < 0) return "Sudah berakhir";
  const daysLeft = Math.floor(msLeft / 86_400_000);
  if (daysLeft === 0) return "Berakhir hari ini";
  if (daysLeft === 1) return "1 hari lagi";
  return `${daysLeft} hari lagi`;
}

// ---------------------------------------------------------------------------
// EventCard — kartu 2 kolom sama seperti all-events
// ---------------------------------------------------------------------------
function EventCard({
  event,
  onPress,
}: {
  event: DbEvent;
  onPress: () => void;
}) {
  const dotColor = getDateStatusColor(event.endDate);
  const timeLabel = getTimeLeftLabel(event.endDate);
  const hasImage = event.posterUrl && event.posterUrl.startsWith("http");

  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.gridImageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: event.posterUrl }}
            style={styles.gridItemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>
      <View style={styles.gridTextContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitleText} numberOfLines={1}>
            {event.title}
          </Text>
          {timeLabel ? (
            <Text style={styles.timeLabelText} numberOfLines={1}>
              {timeLabel}
            </Text>
          ) : null}
        </View>
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    fullname: string;
    fakultas: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Semua event approved dari Firebase
  const [allEvents, setAllEvents] = useState<DbEvent[]>([]);

  // Views per event: { eventKey: totalViews }
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});

  // Carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<any>(null);

  // ---------------------------------------------------------------------------
  // Auto-scroll carousel
  // ---------------------------------------------------------------------------
  const startAutoScroll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % CAROUSEL_ITEMS;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * SNAP_INTERVAL,
          animated: true,
        });
        return nextIndex;
      });
    }, 3500);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    if (index !== activeIndex && index >= 0 && index < CAROUSEL_ITEMS) {
      setActiveIndex(index);
    }
    startAutoScroll();
  };

  // ---------------------------------------------------------------------------
  // Fetch user profile
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, "User/" + user.uid);
        const unsubDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
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
    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch approved events
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const eventsRef = ref(database, "events");
    const unsub = onValue(eventsRef, (snap) => {
      if (!snap.exists()) {
        setAllEvents([]);
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
          createdAt: val["createdAt"] || 0,
        }));
      setAllEvents(approved);
    });
    return () => unsub();
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch views semua event dan aggregate per event
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const viewsRef = ref(database, "views");
    const unsub = onValue(viewsRef, (snap) => {
      if (!snap.exists()) {
        setViewsMap({});
        return;
      }
      const allViews = snap.val() as Record<string, Record<string, number>>;
      const map: Record<string, number> = {};
      Object.entries(allViews).forEach(([eventKey, slots]) => {
        if (!slots || typeof slots !== "object") return;
        const total = Object.values(slots).reduce(
          (sum, cnt) => sum + (typeof cnt === "number" ? cnt : 0),
          0
        );
        map[eventKey] = total;
      });
      setViewsMap(map);
    });
    return () => unsub();
  }, []);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  // 4 event terbaru berdasarkan createdAt (atau urutan key jika tidak ada)
  const recommendedEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 4);
  }, [allEvents]);

  // 2 event paling banyak views
  const popularEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => (viewsMap[b.key] || 0) - (viewsMap[a.key] || 0))
      .slice(0, 2);
  }, [allEvents, viewsMap]);

  // Banner carousel:
  // - banner[0] = event paling baru
  // - banner[1] = event views terbanyak (rank 1)
  // - banner[2] = event views terbanyak (rank 2)
  const bannerEvents = useMemo(() => {
    const newest = [...allEvents].sort((a, b) => b.createdAt - a.createdAt)[0] || null;
    const topViews = [...allEvents]
      .sort((a, b) => (viewsMap[b.key] || 0) - (viewsMap[a.key] || 0))
      .slice(0, 2);
    return [newest, topViews[0] || null, topViews[1] || null];
  }, [allEvents, viewsMap]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A9D08E" />

      {/* HEADER SECTION */}
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
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#7A8B99"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#2F4454" />
        </View>

        {/* FEATURED CAROUSEL */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={styles.carouselContainer}
          style={styles.carouselWrapper}
          disableIntervalMomentum={true}
          scrollEventThrottle={16}
        >
          {bannerEvents.map((event, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.featuredCard, { width: screenWidth - 40 }]}
              onPress={() =>
                event ? router.push(`/events/${event.key}` as any) : undefined
              }
              activeOpacity={0.9}
            >
              {event && event.posterUrl && event.posterUrl.startsWith("http") ? (
                <Image
                  source={{ uri: event.posterUrl }}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.featuredPlaceholder} />
              )}
              {event ? (
                <View style={styles.featuredOverlay}>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  {idx === 0 && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>Terbaru</Text>
                    </View>
                  )}
                  {idx > 0 && (
                    <View style={[styles.featuredBadge, { backgroundColor: "#6D8299" }]}>
                      <Text style={styles.featuredBadgeText}>
                        👁 {viewsMap[event.key] || 0} views
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DOT INDICATORS */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, activeIndex === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* RECOMMENDED FOR YOU */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
        </View>

        <View style={styles.gridContainer}>
          {recommendedEvents.length > 0 ? (
            recommendedEvents.map((event) => (
              <EventCard
                key={event.key}
                event={event}
                onPress={() => router.push(`/events/${event.key}` as any)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>
              Rekomendasi event belum tersedia
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.moreLink}
          onPress={() => router.push("/all-events" as any)}
        >
          <Text style={styles.moreText}>More</Text>
        </TouchableOpacity>

        {/* POPULAR NEAR YOU */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
        </View>

        <View style={styles.gridContainer}>
          {popularEvents.length > 0 ? (
            popularEvents.map((event) => (
              <EventCard
                key={event.key}
                event={event}
                onPress={() => router.push(`/events/${event.key}` as any)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>Popular event belum tersedia</Text>
          )}
        </View>

        {/* FOOTER LINKS */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Send feedback</Text>
          <Text style={styles.footerText}>Call Us</Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
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
  // ---- Carousel ----
  carouselWrapper: {
    marginTop: 20,
  },
  carouselContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 20,
  },
  featuredCard: {
    height: 180,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#A9D08E",
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#A9D08E",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(47, 68, 84, 0.55)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featuredTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
    marginRight: 8,
  },
  featuredBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featuredBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  // ---- Dots ----
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#A9D08E",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#2F4454",
  },
  // ---- Sections ----
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F4454",
  },
  // ---- Grid cards ----
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  gridItem: {
    width: "48%",
    height: 130,
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
    paddingTop: 3,
    backgroundColor: "#A9D08E",
  },
  eventTitleText: {
    color: "#2F4454",
    fontWeight: "bold",
    fontSize: 11,
  },
  timeLabelText: {
    color: "#556B7D",
    fontSize: 9,
    marginTop: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "#2F4454",
    flexShrink: 0,
  },
  noDataText: {
    width: "100%",
    textAlign: "center",
    marginTop: 20,
    color: "#7A8B99",
    fontStyle: "italic",
  },
  moreLink: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  moreText: {
    color: "#2F4454",
    fontWeight: "bold",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    color: "#556B7D",
    fontSize: 12,
    marginBottom: 5,
  },
});
