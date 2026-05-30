import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../database";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    // Halaman yang bisa diakses tanpa login
    const publicRoutes = ["login", "register-screen"];
    const inPublicRoute = publicRoutes.some((route) =>
      segments.includes(route as never)
    );

    if (!user && !inPublicRoute) {
      // Belum login dan bukan di halaman publik → redirect ke login
      router.replace("/login");
    } else if (user && inPublicRoute) {
      // Sudah login tapi masih di halaman login/register → redirect ke home
      router.replace("/");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E8F5CC" }}>
        <ActivityIndicator size="large" color="#2F4454" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
