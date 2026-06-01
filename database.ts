// database.ts
// Firebase SDK v10+ configuration and initialization for Event Radar

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCACVocZP_CIraouSrJyT_ZAyIlINZ-gk4",
  authDomain: "eventradar26.firebaseapp.com",
  databaseURL: "https://eventradar26-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eventradar26",
  storageBucket: "eventradar26.firebasestorage.app",
  messagingSenderId: "194742602378",
  appId: "1:194742602378:web:31cbd7e603c0cb2e933b73",
  measurementId: "G-XD3S9D0E52"
};

// Guard agar tidak double-initialize saat hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Layanan Firebase
const auth = getAuth(app);
const database = getDatabase(app); // Realtime Database
const db = getFirestore(app);      // Cloud Firestore (opsional)

export { app, auth, database, db };
