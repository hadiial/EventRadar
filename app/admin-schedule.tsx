// File: app/admin-schedule.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  FlatList,
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
 * Interface for Event Schedule Data
 */
interface ScheduleItem {
  id: string;
  dateNum: string;
  year: string;
  month: string;
  eventName: string;
  isHighlighted?: boolean; // Determines if the card has a thick blue border
}

// Dummy data for initial UI setup.
const DUMMY_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    dateNum: "12",
    year: "2025",
    month: "Desember",
    eventName: "Nama Event",
  },
  {
    id: "2",
    dateNum: "12",
    year: "2025",
    month: "Desember",
    eventName: "Nama Event",
  },
  {
    id: "3",
    dateNum: "12",
    year: "2025",
    month: "Desember",
    eventName: "Nama Event",
  },
  {
    id: "4",
    dateNum: "12",
    year: "2025",
    month: "Desember",
    eventName: "Nama Event",
    isHighlighted: true,
  },
  {
    id: "5",
    dateNum: "12",
    year: "2025",
    month: "Desember",
    eventName: "Nama Event",
    isHighlighted: true,
  },
  {
    id: "6",
    dateNum: "12",
    year: "2025",
    month: "Desember",
    eventName: "Nama Event",
  },
];

/**
 * AdminScheduleScreen Component
 * Displays a grid of scheduled events for the admin to manage.
 * Includes a pagination UI at the bottom.
 */
export default function AdminScheduleScreen() {
  const router = useRouter();

  // State for Admin Name
  const [adminName, setAdminName] = useState("Admin");
  // State for Pagination (Simulated)
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Fetch Admin Profile from Firebase
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, "User/" + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.fullname) {
            setAdminName(data.fullname);
          } else if (data && data.username) {
            setAdminName(data.username);
          }
        });
        return () => unsubscribeDb();
      }
    });
    return () => unsubscribe();
  }, []);

  /**
   * Renders a single event card within the FlatList grid.
   */
  const renderScheduleCard = ({ item }: { item: ScheduleItem }) => (
    <TouchableOpacity
      style={[styles.card, item.isHighlighted && styles.cardHighlighted]}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/admin-schedule-detail" as any,
          params: {
            id: item.id,
            name: item.eventName,
            day: item.dateNum,
            month: item.month,
            year: item.year,
          },
        })
      }
    >
      {/* Top Section: Date & Blue Square */}
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateNum}>{item.dateNum}</Text>
          <View style={styles.yearMonthContainer}>
            <Text style={styles.dateYear}>{item.year}</Text>
            <Text style={styles.dateMonth}>{item.month}</Text>
          </View>
        </View>
        <View style={styles.blueSquare} />
      </View>

      {/* Middle Section: Event Name */}
      <Text style={styles.eventName}>{item.eventName}</Text>

      {/* Bottom Section: Edit Link */}
      <TouchableOpacity
        style={styles.editLinkContainer}
        onPress={(e) => {
          e.stopPropagation?.();
          router.push({
            pathname: "/jadwal-detail" as any,
            params: {
              id: item.id,
              name: item.eventName,
              day: item.dateNum,
              month: item.month,
              year: item.year,
            },
          });
        }}
      >
        <Text style={styles.editLinkText}>Ubah setelan event</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.adminName}>{adminName}</Text>
      </View>

      {/* PAGE TITLE */}
      <View style={styles.titleContainer}>
        <Ionicons name="calendar-outline" size={28} color="#2F4454" />
        <Text style={styles.pageTitle}>Jadwal Kegiatan</Text>
      </View>

      {/* GRID LIST SECTION */}
      <FlatList
        data={DUMMY_SCHEDULE}
        renderItem={renderScheduleCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // PAGINATION FOOTER
        ListFooterComponent={
          <View style={styles.paginationContainer}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={24} color="#2F4454" />
            </TouchableOpacity>

            {[1, 2, 3, 4].map((page) => (
              <TouchableOpacity
                key={page}
                style={[
                  styles.pageDot,
                  currentPage === page && styles.pageDotActive,
                ]}
                onPress={() => setCurrentPage(page)}
              >
                <Text
                  style={[
                    styles.pageDotText,
                    currentPage === page && styles.pageDotTextActive,
                  ]}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={24} color="#2F4454" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* ADMIN BOTTOM NAVIGATION */}
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
  // HEADER STYLES
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#C4C4C4",
    marginRight: 15,
  },
  adminName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F4454",
  },
  // TITLE STYLES
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F4454",
    marginLeft: 10,
  },
  // LIST STYLES
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 110, // Ensure space for BottomNav and Pagination
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  // CARD STYLES
  card: {
    width: "48%",
    backgroundColor: "#A9D08E",
    borderRadius: 15,
    padding: 12,
    justifyContent: "space-between",
    minHeight: 130,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: "#2F4454",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateNum: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2F4454",
    marginRight: 5,
    lineHeight: 32,
  },
  yearMonthContainer: {
    justifyContent: "center",
  },
  dateYear: {
    fontSize: 14,
    color: "#2F4454",
    lineHeight: 16,
  },
  dateMonth: {
    fontSize: 12,
    color: "#2F4454",
    fontWeight: "500",
    lineHeight: 14,
  },
  blueSquare: {
    width: 35,
    height: 35,
    backgroundColor: "#2F4454",
    borderRadius: 6,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F4454",
    marginBottom: 10,
  },
  editLinkContainer: {
    alignSelf: "flex-end",
  },
  editLinkText: {
    fontSize: 10,
    color: "#2F4454",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  // PAGINATION STYLES
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  pageDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#A9D08E",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  pageDotActive: {
    backgroundColor: "#2F4454",
  },
  pageDotText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  pageDotTextActive: {
    color: "#FFF",
  },
});
