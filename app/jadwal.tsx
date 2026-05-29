import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DUMMY_EVENTS = [
  { id: "1",  day: "12", month: "Desember",  year: "2025", name: "Workshop UI/UX Design" },
  { id: "2",  day: "15", month: "Januari",   year: "2026", name: "Seminar Kecerdasan Buatan" },
  { id: "3",  day: "20", month: "Februari",  year: "2026", name: "Hackathon Nasional" },
  { id: "4",  day: "03", month: "Maret",     year: "2026", name: "Lomba Desain Grafis" },
  { id: "5",  day: "08", month: "April",     year: "2026", name: "Tech Talk 2026" },
  { id: "6",  day: "25", month: "Mei",       year: "2026", name: "Career Fair ITB" },
  { id: "7",  day: "10", month: "Juni",      year: "2026", name: "Olimpiade Sains" },
  { id: "8",  day: "17", month: "Juli",      year: "2026", name: "Festival Budaya" },
  { id: "9",  day: "02", month: "Agustus",   year: "2026", name: "Konferensi Teknologi" },
  { id: "10", day: "14", month: "September", year: "2026", name: "Expo Startup Muda" },
  { id: "11", day: "21", month: "Oktober",   year: "2026", name: "Webinar Data Science" },
  { id: "12", day: "05", month: "November",  year: "2026", name: "Pelatihan React Native" },
  { id: "13", day: "11", month: "Desember",  year: "2026", name: "Kompetisi Robotika" },
  { id: "14", day: "19", month: "Januari",   year: "2027", name: "Forum Inovasi Digital" },
  { id: "15", day: "27", month: "Februari",  year: "2027", name: "Bootcamp UI/UX" },
  { id: "16", day: "09", month: "Maret",     year: "2027", name: "Seminar Keamanan Siber" },
];

const ITEMS_PER_PAGE = 8;

export default function JadwalScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(DUMMY_EVENTS.length / ITEMS_PER_PAGE);
  const pagedEvents = DUMMY_EVENTS.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A9D08E" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>jadwal</Text>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.userName}>Salman HAdi</Text>
            <Text style={styles.userMajor}>Teknik Kayu</Text>
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
        <View style={styles.gridContainer}>
          {pagedEvents.map((event, index) => (
            <TouchableOpacity
              key={event.id}
              style={[styles.gridItem, index === 3 && styles.gridItemActive]}
              onPress={() => router.push("/events/[id]")}
            >
              <View style={styles.gridItemTop}>
                <View>
                  <View style={styles.gridItemDayRow}>
                    <Text style={styles.gridItemDay}>{event.day}</Text>
                    <Text style={styles.gridItemYear}>{event.year}</Text>
                  </View>
                  <Text style={styles.gridItemMonth}>{event.month}</Text>
                </View>
                <View style={styles.gridItemImage} />
              </View>
              <Text style={styles.gridItemName} numberOfLines={1}>
                {event.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PAGINATION */}
        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <Text style={[styles.pageArrowText, currentPage === 1 && styles.pageArrowDisabled]}>
              {"<"}
            </Text>
          </TouchableOpacity>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <TouchableOpacity
              key={page}
              style={[styles.pageBtn, page === currentPage && styles.pageBtnActive]}
              onPress={() => setCurrentPage(page)}
            >
              <Text style={[styles.pageBtnText, page === currentPage && styles.pageBtnTextActive]}>
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.pageArrow}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <Text style={[styles.pageArrowText, currentPage === totalPages && styles.pageArrowDisabled]}>
              {">"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navIcon}>
            <Ionicons name="calendar" size={28} color="#A9D08E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/bookmarks-page')}>
            <Ionicons name="bookmark" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.homeButtonWrapper}>
            <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
              <Ionicons name="home" size={36} color="#2F4454" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/event-form' as any)}>
            <Ionicons name="time-outline" size={30} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navIcon} onPress={() => router.push('/user-profile')}>
            <Ionicons name="person" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5CC",
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
  },

  gridItemActive: {
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

  gridItemImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#2F4454",
  },

  gridItemName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2F4454",
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

  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#354A5F",
    height: 65,
    borderRadius: 20,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  navIcon: {
    padding: 10,
  },

  homeButtonWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8F5CC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
  },

  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
