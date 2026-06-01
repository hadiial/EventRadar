import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

/**
 * AdminBottomNav Component
 * A reusable bottom navigation bar specifically for ADMIN screens.
 * Automatically highlights the active screen based on the current route.
 */
export default function AdminBottomNav() {
  const router = useRouter();
  const pathname = usePathname(); // Retrieves the current active route

  /**
   * Handles navigation to prevent pushing the same route multiple times
   * @param {any} route - The target screen route
   */
  const handleNavigation = (route: any) => {
    if (pathname === route) return;
    router.push(route as any);
  };

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        {/* SCHEDULE / CALENDAR BUTTON */}
        <TouchableOpacity
          style={[
            styles.navIcon,
            pathname === "/jadwal" && styles.activeNavIcon,
          ]}
          onPress={() => handleNavigation("/jadwal")}
          accessibilityLabel="Go to schedule"
        >
          <Ionicons name="calendar" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* BOOKMARKS / REQUEST LIST BUTTON */}
        <TouchableOpacity
          style={[
            styles.navIcon,
            pathname === "/bookmarks-page" && styles.activeNavIcon,
          ]}
          onPress={() => handleNavigation("/bookmarks-page")}
          accessibilityLabel="Go to bookmarks"
        >
          <Ionicons name="bookmark" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* CENTER FLOATING HOME BUTTON */}
        <View style={styles.homeButtonWrapper}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => handleNavigation("/admin")}
            accessibilityLabel="Go to home"
          >
            <Ionicons name="home" size={36} color="#2F4454" />
          </TouchableOpacity>
        </View>

        {/* CREATE EVENT / CURATION BUTTON */}
        <TouchableOpacity
          style={[
            styles.navIcon,
            pathname === "/event-form" && styles.activeNavIcon,
          ]}
          onPress={() => handleNavigation("/event-form")}
          accessibilityLabel="Go to create event"
        >
          <Ionicons name="add-circle-outline" size={32} color="#FFF" />
        </TouchableOpacity>

        {/* USER PROFILE BUTTON */}
        <TouchableOpacity
          style={[
            styles.navIcon,
            pathname === "/user-profile" && styles.activeNavIcon,
          ]}
          onPress={() => handleNavigation("/user-profile")}
          accessibilityLabel="Go to profile"
        >
          <Ionicons name="person" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    opacity: 0.5, // Default is dimmed for inactive states
  },
  activeNavIcon: {
    opacity: 1.0, // Fully visible when active
  },
  homeButtonWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8F5CC", // Matches the main app background color
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
