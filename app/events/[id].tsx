import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5CC" />

      {/* Header Info */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.userName}>Yafi Ghazian</Text>
            <Text style={styles.userMajor}>Teknik Informatika</Text>
          </View>
        </View>
      </View>

      {/* Event Poster */}
      <View style={styles.posterContainer} />

      {/* Description Card */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionTitle}>Deskripsi event</Text>
        <Text style={styles.descriptionText}>
          Menampilkan detail informasi untuk Event ID: {id}
        </Text>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Bookmark</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5CC', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  backButton: { marginRight: 15 },
  backText: { fontSize: 16, color: '#2F4454', fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D9D9D9', marginRight: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#2F4454' },
  userMajor: { fontSize: 12, color: '#556B7D' },
  posterContainer: { backgroundColor: '#A9D08E', height: 200, borderRadius: 15, marginBottom: 20 },
  descriptionCard: { flex: 1, backgroundColor: '#F8FAF8', borderRadius: 15, borderWidth: 2, borderColor: '#2F4454', padding: 20, marginBottom: 20 },
  descriptionTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 10, textAlign: 'center' },
  descriptionText: { fontSize: 14, color: '#333' },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionButton: { backgroundColor: '#2F4454', flex: 0.48, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});