/**
 * bookmarkStore.ts
 * Singleton store untuk state bookmark agar data tidak hilang
 * saat komponen di-unmount dan di-mount ulang.
 */

export type BookmarkedEvent = {
  id: string;
  title: string;
  date: string;
  status: string;
};

// Semua event yang tersedia (mock data)
const ALL_EVENTS: BookmarkedEvent[] = [
  { id: '1', title: 'Seminar IT', date: '30 Febuari 2024', status: 'Terdaftar' },
  { id: '2', title: 'Lomba Futsal', date: '3 Maret 2024', status: 'Belum Terdaftar' },
  { id: '3', title: 'Workshop UI/UX', date: '14 Maret 2024', status: 'Belum Terdaftar' },
  { id: '4', title: 'Bazar Kampus', date: '30 Maret 2024', status: 'Terdaftar' },
  { id: '5', title: 'Bedah Buku', date: '30 Febuari 2024', status: 'Terdaftar' },
  { id: '6', title: 'Pentas Seni', date: '30 Febuari 2024', status: 'Terdaftar' },
];

// Map event mock ID <-> mock title (untuk lookup dari EVT-xxx ke bookmark id)
const EVT_ID_MAP: Record<string, string> = {
  'EVT-001': '1',
  'EVT-002': '2',
  'EVT-003': '3',
  'EVT-004': '4',
  'EVT-005': '5',
  'EVT-006': '6',
};

// State singleton — hanya set ID yang sudah di-bookmark
let bookmarkedIds = new Set<string>();

// Listeners untuk reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const bookmarkStore = {
  /** Daftarkan listener (untuk useBookmarks hook) */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Ambil daftar event yang di-bookmark */
  getBookmarked(): BookmarkedEvent[] {
    return ALL_EVENTS.filter((e) => bookmarkedIds.has(e.id));
  },

  /** Cek apakah event ter-bookmark berdasarkan id bookmark ('1'..'6') */
  isBookmarked(id: string): boolean {
    return bookmarkedIds.has(id);
  },

  /** Cek apakah event ter-bookmark berdasarkan EVT-xxx id */
  isBookmarkedByEvtId(evtId: string): boolean {
    const id = EVT_ID_MAP[evtId];
    return id ? bookmarkedIds.has(id) : false;
  },

  /** Toggle bookmark berdasarkan EVT-xxx id (dipakai dari home/detail) */
  toggleByEvtId(evtId: string) {
    const id = EVT_ID_MAP[evtId];
    if (!id) return;
    if (bookmarkedIds.has(id)) {
      bookmarkedIds.delete(id);
    } else {
      bookmarkedIds.add(id);
    }
    notify();
  },

  /** Hapus bookmark berdasarkan id ('1'..'6') — dipakai dari bookmarks-page */
  remove(id: string) {
    bookmarkedIds.delete(id);
    notify();
  },

  /** Tambah bookmark berdasarkan id ('1'..'6') */
  add(id: string) {
    bookmarkedIds.add(id);
    notify();
  },
};
