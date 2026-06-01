import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, database } from "../database";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    const userRef = ref(database, "User/" + user.uid);

    get(userRef)
      .then((snapshot) => {
        const data = snapshot.val();
        if (data && data.role) {
          setUserRole(data.role);
        } else {
          setUserRole("user");
        }
      })
      .catch((error) => {
        console.error("Error fetching user role:", error);
        setUserRole("user");
      })
      .finally(() => {
        setRoleLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (loading || roleLoading) return;

    const publicRoutes = ["login", "register-screen"];
    const inPublicRoute = publicRoutes.some((route) =>
      segments.includes(route as never),
    );

    if (!user && !inPublicRoute) {
      router.replace("/login");
      return;
    }

    if (user && inPublicRoute) {
      if (userRole === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
      return;
    }

    if (user && userRole) {
      const isAdminRoute = segments.includes("admin" as never);
      const isRootHome =
        segments[0] === undefined || segments.includes("index" as never);

      if (userRole === "admin" && isRootHome) {
        router.replace("/admin");
      }

      if (userRole !== "admin" && isAdminRoute) {
        router.replace("/");
      }
    }
  }, [user, userRole, loading, roleLoading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#E8F5CC",
        }}
      >
        <ActivityIndicator size="large" color="#2F4454" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
