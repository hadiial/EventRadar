import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
// --- ADDED: Import ref and get for Realtime Database ---
import { get, ref } from "firebase/database";
// --- ADDED: Import database alongside auth ---
import { auth, database } from "../database";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Silakan masukkan email dan password.");
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      // --- ADDED: ROLE-BASED REDIRECTION LOGIC ---
      const userId = userCredential.user.uid;
      const userRef = ref(database, `User/${userId}`); // Make sure the path matches your DB structure
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // 2. Check the user's role and redirect accordingly
        if (userData.role === "admin") {
          console.log("Admin login successful");
          router.replace("/admin");
        } else {
          console.log("User login successful");
          router.replace("/");
        }
      } else {
        router.replace("/");
      }
      setLoading(false);
      // ------------------------------------------
    } catch (error: any) {
      setLoading(false);
      let errorMessage = "Terjadi kesalahan saat masuk.";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Format email tidak valid.";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage =
          "Email atau password salah. Pastikan akun Anda sudah terdaftar.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Terlalu banyak percobaan login. Coba lagi beberapa saat.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Tidak ada koneksi internet. Periksa jaringan Anda.";
      }
      Alert.alert("Login Gagal", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* SECTION 1: TITLE / LOGO */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>EVENT</Text>
          <Text style={styles.logoText}>RADAR</Text>
        </View>

        {/* SECTION 2: FORM INPUT */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda"
              placeholderTextColor="#7A8B99"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password Anda"
              placeholderTextColor="#7A8B99"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          {/* SECTION 3: LINKS */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Lupa Password",
                  "Silakan hubungi admin untuk mereset password Anda.",
                )
              }
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.normalText}>{"Don't Have Account? "}</Text>
              <TouchableOpacity onPress={() => router.push("/register-screen")}>
                <Text style={styles.registerText}>Register Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION 4: LOGIN BUTTON */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>MASUK</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5CC",
  },
  keyboardAvoid: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "space-between",
  },
  logoContainer: {
    marginTop: 80,
    alignItems: "center",
  },
  logoText: {
    fontSize: 50,
    fontWeight: "900",
    color: "#A9D08E",
    letterSpacing: 2,
    textShadowColor: "#2F4454",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    elevation: 2,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#2F4454",
    marginBottom: 5,
    marginLeft: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#2F4454",
    paddingHorizontal: 20,
    fontSize: 14,
    color: "#2F4454",
  },
  linksContainer: {
    marginTop: 10,
    marginLeft: 5,
  },
  forgotPassword: {
    fontSize: 12,
    color: "#2F4454",
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  registerRow: {
    flexDirection: "row",
  },
  normalText: {
    fontSize: 12,
    color: "#2F4454",
  },
  registerText: {
    fontSize: 12,
    color: "#2F4454",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: 50,
  },
  loginButton: {
    backgroundColor: "#2F4454",
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
