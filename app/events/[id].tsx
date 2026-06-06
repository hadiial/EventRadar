// File: app/events/[id].tsx
// Detail page untuk event — mendukung mock event (EVT-xxx) maupun event dari database (event_id_N)

import { useLocalSearchParams, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, database } from "../../database";
import { bookmarkStore } from "../../store/bookmarkStore";
import { getDateStatusColor } from "../all-events";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DbEventData = {
  title: string;
  organizer: string;
  category: string;
  description: string;
  posterUrl: string;
  startDate: string;
  endDate: string;
  location: string;
  registrationLink: string;
  phone: string;
  status: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<{
    fullname: string;
    fakultas: string;
  } | null>(null);
  const [dbEvent, setDbEvent] = useState<DbEventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Apakah ini event dari database (bukan mock EVT-xxx)?
  const isDbEvent = !!id && !id.startsWith("EVT-");

  // State bookmark
  const [isBookmarked, setIsBookmarked] = useState(() =>
    bookmarkStore.isBookmarkedByEvtId(id ?? ""),
  );

  // Subscribe ke perubahan store
  useEffect(() => {
    const unsubscribe = bookmarkStore.subscribe(() => {
      setIsBookmarked(bookmarkStore.isBookmarkedByEvtId(id ?? ""));
    });
    return unsubscribe;
  }, [id]);

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

  // Fetch event dari database jika ini adalah DB event
  useEffect(() => {
    if (!isDbEvent || !id) return;
    setLoading(true);
    const eventRef = ref(database, `events/${id}`);
    const unsubDb = onValue(eventRef, (snapshot) => {
      setLoading(false);
      if (!snapshot.exists()) {
        setDbEvent(null);
        return;
      }
      const val = snapshot.val();
      setDbEvent({
        title: val["Nama Event"] || "Tanpa Judul",
        organizer: val["Nama penyelenggara"] || "-",
        category: val["Kategori Event"] || "-",
        description: val["Deskripsi event"] || "Tidak ada deskripsi.",
        posterUrl: val["upload poster"] || "",
        startDate: val["Periode mulai"] || "-",
        endDate: val["periode akhir"] || "-",
        location: val["lokasi"] || "-",
        registrationLink: val["Link pendaftaran"] || "",
        phone: val["phone"] || "-",
        status: val["status"] || "pending",
      });
    });
    return () => unsubDb();
  }, [id, isDbEvent]);

  const handleBookmark = () => {
    if (isDbEvent && dbEvent) {
      // DB event — simpan data lengkap agar muncul di bookmark list
      bookmarkStore.toggleDbEvent(id ?? "", {
        title: dbEvent.title,
        date: `${dbEvent.startDate} — ${dbEvent.endDate}`,
        status: dbEvent.status === "approved" ? "Approved" : "Pending",
        posterUrl: dbEvent.posterUrl,
      });
    } else {
      // Mock event (EVT-001..006)
      bookmarkStore.toggleByEvtId(id ?? "");
    }
  };

  const handleRegister = async (link?: string) => {
    if (!link || !link.startsWith("http")) {
      Alert.alert(
        "Link Tidak Tersedia",
        "Link pendaftaran untuk event ini belum tersedia atau tidak valid.",
        [{ text: "OK", style: "default" }],
      );
      return;
    }
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert(
          "Tidak Dapat Membuka Link",
          `Tidak dapat membuka URL: ${link}`,
          [{ text: "OK", style: "default" }],
        );
      }
    } catch (error) {
      Alert.alert(
        "Terjadi Kesalahan",
        "Gagal membuka link pendaftaran. Silakan coba lagi.",
        [{ text: "OK", style: "default" }],
      );
    }
  };

  // Warna status dot untuk DB events
  const dotColor =
    isDbEvent && dbEvent ? getDateStatusColor(dbEvent.endDate) : "#10B981";

  const hasPosterUrl =
    dbEvent?.posterUrl && dbEvent.posterUrl.startsWith("http");

  // ---------------------------------------------------------------------------
  // Render: DB Event
  // ---------------------------------------------------------------------------
  if (isDbEvent) {
    if (loading) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2F4454" />
            <Text style={styles.loadingText}>Memuat event...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (!dbEvent) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Event tidak ditemukan.</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtnFallback}
            >
              <Text style={styles.backBtnText}>← Kembali</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{"< Back"}</Text>
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

        {/* Thumbnail / Poster */}
        {hasPosterUrl && !imageError ? (
          <Image
            source={{ uri: dbEvent.posterUrl }}
            style={styles.posterImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.posterContainer} />
        )}

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Judul + Status dot */}
            <View style={styles.titleRow}>
              <Text
                style={[styles.descriptionTitle, { flex: 1 }]}
                numberOfLines={2}
              >
                {dbEvent.title}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
            </View>

            <Text style={styles.metaLabel}>Penyelenggara</Text>
            <Text style={styles.metaValue}>{dbEvent.organizer}</Text>

            <Text style={styles.metaLabel}>Kategori</Text>
            <Text style={styles.metaValue}>{dbEvent.category}</Text>

            <Text style={styles.metaLabel}>Periode</Text>
            <Text style={styles.metaValue}>
              {dbEvent.startDate} — {dbEvent.endDate}
            </Text>

            <Text style={styles.metaLabel}>Lokasi</Text>
            <Text style={styles.metaValue}>{dbEvent.location}</Text>

            <Text style={styles.metaLabel}>Kontak</Text>
            <Text style={styles.metaValue}>{dbEvent.phone}</Text>

            <Text style={styles.metaLabel}>Deskripsi</Text>
            <Text style={styles.descriptionText}>{dbEvent.description}</Text>
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isBookmarked && styles.bookmarkedButton,
            ]}
            onPress={handleBookmark}
          >
            <Text style={styles.buttonText}>
              {isBookmarked ? "✓ Bookmarked" : "Bookmark"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRegister(dbEvent?.registrationLink)}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Mock Event (EVT-001 .. EVT-006)
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* Header Info */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{"< Back"}</Text>
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

      {/* Event Poster */}
      {id === "EVT-001" ? (
        <Image
          source={require("../../assets/images/itFair.png")}
          style={styles.posterImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.posterContainer} />
      )}

      {/* Description Card */}
      <View style={styles.descriptionCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Judul + Status dot (open = hijau untuk mock) */}
          <View style={styles.titleRow}>
            <Text style={[styles.descriptionTitle, { flex: 1 }]}>
              {id === "EVT-001"
                ? "IT FAIR XIV"
                : id === "EVT-002"
                  ? "Lomba Futsal"
                  : id === "EVT-003"
                    ? "Workshop UI/UX"
                    : id === "EVT-004"
                      ? "Bazar Kampus"
                      : id === "EVT-005"
                        ? "Bedah Buku"
                        : id === "EVT-006"
                          ? "Pentas Seni"
                          : `Event ${id}`}
            </Text>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    id === "EVT-001" || id === "EVT-004"
                      ? "#10B981"
                      : id === "EVT-002" || id === "EVT-005"
                        ? "#F59E0B"
                        : "#EF4444",
                },
              ]}
            />
          </View>
          <Text style={styles.descriptionText}>
            Menampilkan detail informasi untuk Event ID: {id}
          </Text>
        </ScrollView>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isBookmarked && styles.bookmarkedButton]}
          onPress={handleBookmark}
        >
          <Text style={styles.buttonText}>
            {isBookmarked ? "✓ Bookmarked" : "Bookmark"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRegister(undefined)}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#2F4454",
    marginTop: 12,
  },
  backBtnFallback: {
    marginTop: 20,
    backgroundColor: "#2F4454",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: "#2F4454", fontWeight: "bold" },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    marginRight: 10,
  },
  userName: { fontSize: 16, fontWeight: "bold", color: "#2F4454" },
  userMajor: { fontSize: 12, color: "#556B7D" },
  posterContainer: {
    backgroundColor: "#A9D08E",
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  posterImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  descriptionCard: {
    flex: 1,
    backgroundColor: "#F8FAF8",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#2F4454",
    padding: 20,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#2F4454",
    flexShrink: 0,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#7A8B99",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    color: "#2F4454",
    marginTop: 2,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#2F4454",
    lineHeight: 22,
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: "#2F4454",
    flex: 0.48,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  bookmarkedButton: { backgroundColor: "#4A8060" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
