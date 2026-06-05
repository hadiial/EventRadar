// File: app/admin-bookmarks.tsx
// Admin bookmark page — sama persis seperti user bookmarks-page.tsx
// menggunakan bookmarkStore yang sama (persist ke Firebase)

import AdminBottomNav from "@/components/admin-bottom-nav";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
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
import { BookmarkedEvent, bookmarkStore } from "../store/bookmarkStore";

export default function AdminBookmarksScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    fullname: string;
    fakultas: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State bookmark dari singleton store
  const [bookmarkedEvents, setBookmarkedEvents] = useState<BookmarkedEvent[]>(
    () => bookmarkStore.getBookmarked(),
  );

  // Subscribe ke perubahan store
  useEffect(() => {
    const unsubscribe = bookmarkStore.subscribe(() => {
      setBookmarkedEvents(bookmarkStore.getBookmarked());
    });
    setBookmarkedEvents(bookmarkStore.getBookmarked());
    return unsubscribe;
  }, []);

  // Fetch admin profile dari Firebase
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, "User/" + user.uid);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserProfile({
              fullname: data.fullname || data.username || "Admin",
              fakultas: data.fakultas || "",
            });
          }
        });
        return () => unsubscribeDb();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const filteredEvents = bookmarkedEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    bookmarkStore.remove(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* HEADER: USER INFO */}
      <View style={styles.header}>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TITLE & ICON */}
        <View style={styles.titleContainer}>
          <Ionicons name="bookmark" size={24} color="#2F4454" />
          <Text style={styles.titleText}>Bookmark</Text>
        </View>

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

        {/* BOOKMARKED EVENTS LIST */}
        <View style={styles.listContainer}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((item) => {
              const handlePress = () => {
                if ((item as any).isDbEvent) {
                  // Navigate to admin detail page for DB events
                  router.push({
                    pathname: "/admin-schedule-detail",
                    params: {
                      eventKey: item.id,
                      name: item.title,
                      status: item.status,
                    },
                  } as any);
                } else if (/^\d+$/.test(item.id)) {
                  const num = Number(item.id);
                  const evtId = `EVT-${String(num).padStart(3, "0")}`;
                  router.push(`/events/${evtId}`);
                } else {
                  router.push(`/events/${item.id}`);
                }
              };

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={handlePress}
                  activeOpacity={0.85}
                >
                  {/* Image Placeholder */}
                  <View style={styles.cardImagePlaceholder} />

                  {/* Event Details */}
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDate}>{item.date}</Text>
                    <Text style={styles.cardStatus}>{item.status}</Text>
                  </View>

                  {/* Delete Icon (stop propagation) */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleDelete(item.id);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#2F4454" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noDataText}>
              {bookmarkedEvents.length === 0
                ? "Belum ada bookmark. Tambahkan event dari halaman utama!"
                : "Bookmark tidak ditemukan"}
            </Text>
          )}
        </View>
      </ScrollView>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 30,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#D1D5DB",
    marginRight: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F4454",
  },
  userMajor: {
    fontSize: 12,
    color: "#556B7D",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginLeft: 5,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F4454",
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F6",
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#2F4454",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2F4454",
  },
  listContainer: {
    flexDirection: "column",
    gap: 15,
  },
  card: {
    backgroundColor: "#A9D08E",
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    position: "relative",
    height: 110,
  },
  cardImagePlaceholder: {
    width: 90,
    height: "100%",
    backgroundColor: "#2F4454",
    borderRadius: 10,
    marginRight: 15,
  },
  cardDetails: {
    justifyContent: "center",
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F4454",
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 12,
    color: "#2F4454",
    marginBottom: 2,
  },
  cardStatus: {
    fontSize: 12,
    color: "#2F4454",
    fontWeight: "600",
  },
  deleteButton: {
    position: "absolute",
    bottom: 10,
    right: 15,
    padding: 5,
  },
  noDataText: {
    width: "100%",
    textAlign: "center",
    marginTop: 20,
    color: "#7A8B99",
    fontStyle: "italic",
  },
});
