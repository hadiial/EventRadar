/**
 * bookmarkStore.ts
 * Singleton store untuk state bookmark dengan Firebase persistence.
 * Mendukung dua jenis event:
 *   1. Mock events (EVT-001..006) — ID-nya adalah '1'..'6'
 *   2. DB events (Firebase key e.g. 'event_id_1') — data disimpan di dbEventCache
 *
 * Firebase structure:
 *   bookmarks/{userId}/{id}: true          — semua ID yang di-bookmark
 *   bookmarkData/{userId}/{key}: { title, date, status }  — data DB events
 */

import { get, ref, set } from "firebase/database";
import { database } from "../database";

export type BookmarkedEvent = {
  id: string;
  title: string;
  date: string;
  status: string;
  posterUrl?: string;
  isDbEvent?: boolean;
};

// Semua event mock yang tersedia
const ALL_EVENTS: BookmarkedEvent[] = [
  {
    id: "1",
    title: "Seminar IT",
    date: "30 Febuari 2024",
    status: "Terdaftar",
  },
  {
    id: "2",
    title: "Lomba Futsal",
    date: "3 Maret 2024",
    status: "Belum Terdaftar",
  },
  {
    id: "3",
    title: "Workshop UI/UX",
    date: "14 Maret 2024",
    status: "Belum Terdaftar",
  },
  {
    id: "4",
    title: "Bazar Kampus",
    date: "30 Maret 2024",
    status: "Terdaftar",
  },
  {
    id: "5",
    title: "Bedah Buku",
    date: "30 Febuari 2024",
    status: "Terdaftar",
  },
  {
    id: "6",
    title: "Pentas Seni",
    date: "30 Febuari 2024",
    status: "Terdaftar",
  },
];

// Map EVT-xxx → bookmark id ('1'..'6')
const EVT_ID_MAP: Record<string, string> = {
  "EVT-001": "1",
  "EVT-002": "2",
  "EVT-003": "3",
  "EVT-004": "4",
  "EVT-005": "5",
  "EVT-006": "6",
};

// State singleton
let bookmarkedIds = new Set<string>();
let dbEventCache = new Map<string, BookmarkedEvent>(); // Menyimpan data DB events yang di-bookmark
let currentUserId: string | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

/** Simpan bookmark IDs + DB event data ke Firebase RTDB */
async function persistToFirebase() {
  if (!currentUserId) return;
  try {
    // 1. Simpan bookmark IDs
    const bookmarksRef = ref(database, `bookmarks/${currentUserId}`);
    if (bookmarkedIds.size === 0) {
      await set(bookmarksRef, null);
    } else {
      const bookmarkObj: Record<string, boolean> = {};
      bookmarkedIds.forEach((id) => {
        bookmarkObj[id] = true;
      });
      await set(bookmarksRef, bookmarkObj);
    }

    // 2. Simpan data DB events (title, date, status) agar bisa ditampilkan di list bookmark
    const bookmarkDataRef = ref(database, `bookmarkData/${currentUserId}`);
    if (dbEventCache.size === 0) {
      await set(bookmarkDataRef, null);
    } else {
      const dataObj: Record<string, any> = {};
      dbEventCache.forEach((evt, key) => {
        dataObj[key] = {
          title: evt.title,
          date: evt.date,
          status: evt.status,
          posterUrl: evt.posterUrl ?? "",
        };
      });
      await set(bookmarkDataRef, dataObj);
    }
  } catch (error) {
    console.error("Error persisting bookmarks to Firebase:", error);
  }
}

export const bookmarkStore = {
  /** Daftarkan listener */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Dipanggil saat user login/logout.
   * Load bookmark IDs + DB event data dari Firebase RTDB.
   * Jika userId null (logout), kosongkan state.
   */
  async setCurrentUser(userId: string | null): Promise<void> {
    currentUserId = userId;
    dbEventCache = new Map<string, BookmarkedEvent>();

    if (!userId) {
      bookmarkedIds = new Set<string>();
      notify();
      return;
    }

    try {
      // Load bookmark IDs
      const bookmarksRef = ref(database, `bookmarks/${userId}`);
      const snapshot = await get(bookmarksRef);
      if (snapshot.exists() && snapshot.val()) {
        bookmarkedIds = new Set<string>(Object.keys(snapshot.val()));
      } else {
        bookmarkedIds = new Set<string>();
      }

      // Load DB event data cache
      const dataRef = ref(database, `bookmarkData/${userId}`);
      const dataSnap = await get(dataRef);
      if (dataSnap.exists() && dataSnap.val()) {
        const data = dataSnap.val() as Record<string, any>;
        Object.entries(data).forEach(([key, val]) => {
          dbEventCache.set(key, {
            id: key,
            title: val.title ?? "Event",
            date: val.date ?? "-",
            status: val.status ?? "-",
            posterUrl: val.posterUrl ?? "",
            isDbEvent: true,
          });
        });

        // Jika ada bookmark DB lama tanpa posterUrl, coba load dari event record.
        const missingPosterKeys = Array.from(bookmarkedIds).filter(
          (id) =>
            !/^\d+$/.test(id) &&
            dbEventCache.has(id) &&
            !dbEventCache.get(id)?.posterUrl,
        );

        if (missingPosterKeys.length > 0) {
          await Promise.all(
            missingPosterKeys.map(async (key) => {
              const eventRef = ref(database, `events/${key}`);
              const eventSnap = await get(eventRef);
              if (eventSnap.exists()) {
                const val = eventSnap.val();
                const posterUrl = val?.["upload poster"] || "";
                if (posterUrl) {
                  const cached = dbEventCache.get(key);
                  if (cached) {
                    dbEventCache.set(key, { ...cached, posterUrl });
                  }
                }
              }
            }),
          );
          await persistToFirebase();
        }
      }
    } catch (error) {
      console.error("Error loading bookmarks from Firebase:", error);
      bookmarkedIds = new Set<string>();
    }

    notify();
  },

  /**
   * Ambil daftar semua event yang di-bookmark:
   *   - Event mock yang ada di ALL_EVENTS
   *   - DB events yang datanya tersimpan di dbEventCache
   */
  getBookmarked(): BookmarkedEvent[] {
    const mockBookmarks = ALL_EVENTS.filter((e) => bookmarkedIds.has(e.id));
    const dbBookmarks: BookmarkedEvent[] = [];
    bookmarkedIds.forEach((id) => {
      if (dbEventCache.has(id)) {
        dbBookmarks.push(dbEventCache.get(id)!);
      }
    });
    return [...mockBookmarks, ...dbBookmarks];
  },

  /** Ambil semua ID yang di-bookmark */
  getBookmarkedIds(): Set<string> {
    return bookmarkedIds;
  },

  /** Cek apakah event ter-bookmark berdasarkan id mentah ('1'..'6' atau DB key) */
  isBookmarked(id: string): boolean {
    return bookmarkedIds.has(id);
  },

  /** Cek apakah event ter-bookmark berdasarkan EVT-xxx id atau DB key */
  isBookmarkedByEvtId(evtId: string): boolean {
    const id = EVT_ID_MAP[evtId] ?? evtId;
    return bookmarkedIds.has(id);
  },

  /** Toggle bookmark untuk mock event (EVT-xxx) */
  toggleByEvtId(evtId: string) {
    const id = EVT_ID_MAP[evtId] ?? evtId;
    if (bookmarkedIds.has(id)) {
      bookmarkedIds.delete(id);
      dbEventCache.delete(id);
    } else {
      bookmarkedIds.add(id);
    }
    notify();
    persistToFirebase();
  },

  /**
   * Toggle bookmark untuk DB event.
   * Menyimpan juga data event (title, date, status) agar bisa ditampilkan di bookmarks-page
   * tanpa perlu fetch ulang dari Firebase.
   */
  toggleDbEvent(
    key: string,
    eventData: {
      title: string;
      date: string;
      status: string;
      posterUrl?: string;
    },
  ) {
    if (bookmarkedIds.has(key)) {
      bookmarkedIds.delete(key);
      dbEventCache.delete(key);
    } else {
      bookmarkedIds.add(key);
      dbEventCache.set(key, { id: key, isDbEvent: true, ...eventData });
    }
    notify();
    persistToFirebase();
  },

  /** Hapus bookmark berdasarkan id */
  remove(id: string) {
    bookmarkedIds.delete(id);
    dbEventCache.delete(id);
    notify();
    persistToFirebase();
  },

  /** Tambah bookmark berdasarkan id */
  add(id: string) {
    bookmarkedIds.add(id);
    notify();
    persistToFirebase();
  },
};
