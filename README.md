# 🇮🇩 WNI Simulator - Digital Board Game

> *Monopoli Satir Realita Kehidupan Warga +62: Bukan tentang siapa yang paling kaya, tapi siapa yang paling mampu bertahan hidup!*

Permainan papan (*board game*) interaktif berbasis web yang diadaptasi dari board game fisik **WNI Simulator** karya **Hecticholic** (seperti yang dimainkan oleh Medy Renaldy di YouTube).

---

## 🌟 Fitur Utama

- **24 Petak Papan Khas Indonesia:**
  - `Gajian START`: Ambil bansos dan gaji bulanan Rp 2.500.000 setiap kali melewati atau mendarat di sini.
  - `Kos Gang Senggol`, `Warung Madura 24 Jam`, `Warteg Bahari`, `Kafe Aesthetic Jaksel`, `Mansion Menteng`, hingga `Penthouse SCBD`.
  - `Parkir Indomaret & Pungli RT`: Biaya tak terduga khas jalanan.
  - `Proyek Tol Trans-Jawa`: Pembebasan lahan dan ganti rugi dari pemerintah.
  - `Lapas & OTT KPK`: Masuk penjara jika tertangkap tangan atau melempar dadu kembar 3x beruntun.
- **Kartu Takdir & Musibah:**
  - Puluhan skenario satir kocak: Bansos beras 10kg, Jalur Orang Dalam, Tilang ETLE bonceng tiga, Sepupu pinjam uang lalu kabur, Pajak PBB naik dadakan, dsb.
- **Pass & Play + Bot AI:**
  - Main bersama 2–4 pemain di satu layar, atau main solo melawan Bot AI dengan logika *safety cash buffer*.
- **Mekanisme Ekonomi & Sita Negara:**
  - Bangun rumah/ruko hingga level 3 untuk melipatgandakan sewa.
  - Jika kas minus dan tidak sanggup bayar, pemain terkena status **Bangkrut (Sita Negara)**. Pemain terakhir yang bertahan dinobatkan sebagai pemenang!

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Icons & UI:** Lucide React, Canvas Confetti
- **Testing:** Vitest (100% test coverage untuk core engine)
- **Arsitektur:** *Separation of Concerns* — memisahkan Game State Engine murni (`src/engine/gameEngine.ts`) dari layer presentasi UI React.

---

## 🚀 Memulai (Local Setup)

### Prasyarat
- Node.js (versi 18+)
- npm atau yarn

### Instalasi & Menjalankan

1. **Clone repository:**
   ```bash
   git clone https://github.com/<username>/wni-simulator.git
   cd wni-simulator
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:5174/` (atau port yang tertera di terminal).

4. **Menjalankan Automated Tests:**
   ```bash
   npm test
   ```

5. **Build untuk Production:**
   ```bash
   npm run build
   ```

---

## 📂 Struktur Proyek

```
src/
├── types/             # Domain models (Tile, Player, Card, GameState)
├── data/              # 24 petak papan, tumpukan kartu Takdir & Musibah
├── engine/            # State machine murni, bot AI, dan unit tests
├── components/
│   ├── board/         # CSS Grid perimeter board 7x7 & tile cells
│   ├── controls/      # Komponen dadu interaktif
│   ├── hud/           # Status keuangan pemain & feed log peristiwa
│   ├── modals/        # Pop-up kartu, beli tanah, detail petak, game over
│   └── setup/         # Konfigurasi pemain (avatar, nama, bot)
└── utils/             # Format rupiah & kalkulasi aset
```

---

## 📜 Lisensi & Atribusi

Proyek ini dibuat untuk tujuan edukasi dan hiburan sebagai adaptasi digital dari konsep board game *WNI Simulator* oleh Hecticholic. Seluruh candaan dan satir merefleksikan dinamika kehidupan sosial masyarakat Indonesia.
