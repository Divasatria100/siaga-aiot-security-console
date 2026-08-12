# SIAGA Frontend — Planning Design (Redesign & Enhancement Blueprint)

**Dokumen:** docs/planning-design.md
**Status:** Draft v1.0 — Blueprint, belum diimplementasikan
**Input:** docs/frontend-design.md (FDD, intended design), docs/enhancement-design.md (baseline, kondisi aktual), docs/design.md (design constraint/guideline)
**Sifat dokumen:** Perencanaan. Tidak ada perubahan source code, wireframe visual, mockup, atau file gambar pada dokumen ini.

---

## 0. Metode dan Cara Membaca Dokumen Ini

Dokumen ini disusun dengan urutan: baca ketiga dokumen sumber → bandingkan intended design (FDD) dengan kondisi aktual (baseline) → identifikasi gap dan masalah nyata (bukan mengarang masalah) → putuskan solusi UI/UX yang tetap patuh pada docs/design.md → susun rencana per halaman, per component, dan per visualization → tetapkan priority dan urutan implementasi.

Catatan penting soal sumber: source code frontend tidak tersedia untuk direview langsung pada sesi ini — seluruh analisis "current state" pada dokumen ini murni bersumber dari docs/enhancement-design.md, yang sudah bersifat deskriptif hasil observasi kode. Jika suatu detail implementasi tidak disebutkan pada baseline, dokumen ini menandainya sebagai **"Tidak dapat dipastikan dari baseline"** alih-alih mengarang.

Setiap perbedaan antara FDD dan baseline dianalisis dahulu (Bagian 2) sebelum diputuskan sebagai gap yang perlu diperbaiki, penyederhanaan yang sah dipertahankan, atau catatan saja tanpa tindakan.

---

## 1. Ringkasan Design Foundation (dari docs/design.md)

docs/design.md menetapkan design token dan guardrail berikut sebagai sumber kebenaran visual (bukan dokumentasi kondisi frontend, bukan daftar fitur):

- **Palet warna:** primary `#F97316` (orange), secondary `#000000`, accent `#818CF8` (indigo), background `#0F0F0F`, surface `#2A2A2A`, text-primary `#FFFFFF`, text-secondary `#A1A1AA`, border `#2A2A2A`. Dark-mode-only, kontras background/surface/text/border harus tetap berbeda tegas.
- **Tipografi:** Inter untuk display dan body; JetBrains Mono (atau mono setara) untuk label dan metadata teknis. `display-lg` 64px/500, `body-md` 16px/400, `label-md` 12px/600 mono.
- **Spacing:** base 8px, gap 16px, card padding 24px, section padding 80px.
- **Radius:** card 8px, control 8px, pill untuk elemen bulat penuh.
- **Karakter visual:** "Systems Interface" — nuansa operational/security console (ZONE ALPHA), bento/dashboard density, nested surface, metric emphasis, motion restrained (masked reveal, staggered entrance, hover lift, scroll-triggered — bukan animasi ramai).
- **Guardrail eksplisit:** jangan meratakan struktur menjadi generic card grid; jangan mengganti color mode; pertahankan focal object dan densitas visual pertama; radius/border pada button/card/badge harus konsisten satu bahasa visual.

**Temuan penting:** berdasarkan docs/enhancement-design.md Bagian 2.8–6.8 dan Bagian 11, token warna (`#f97316` primary, `#818cf8` accent, `#0f0f0f` background, `#2a2a2a` surface), font Inter + JetBrains Mono, radius `rounded-card`/`rounded-control`, dan mono-label-uppercase pattern **sudah diimplementasikan secara konsisten di seluruh 5 halaman**. Artinya foundation docs/design.md sudah menjadi baseline aktual — bukan gap. Rencana pada dokumen ini **mempertahankan** foundation tersebut dan hanya menambah/menata di atasnya, bukan mengubah palet, tipografi, atau radius.

Satu area docs/design.md yang **belum teramati** pada baseline: motion cues (hover lift, staggered entrance, masked reveal) dan WebGL/atmospheric background layer. Ini didokumentasikan sebagai opportunity opsional (P3) di Bagian 11, bukan kebutuhan wajib — karena docs/design.md sendiri menyatakan efek tersebut harus "restrained" dan "secondary to the interface", dan prinsip FUNCTION > DECORATION pada brief lebih diutamakan dibanding motion decorative.

---

## 2. Perbandingan Intended (FDD) vs Aktual (Baseline) — Analisis Gap

| # | Area | FDD (Intended) | Baseline (Aktual) | Analisis | Klasifikasi |
|---|---|---|---|---|---|
| 1 | Chart di Monitoring | Bab 7.2 & Bab 8 menyebut `Chart` sebagai komponen Monitoring untuk tren sensor | `MonitoringView.jsx` tidak mengimpor/menggunakan `Chart` sama sekali (baseline 3.5) | Bukan kesalahan implementasi — kemungkinan penyederhanaan MVP karena Monitoring difokuskan ke "current reading". Namun ini benar-benar gap terhadap FR-017 (real-time trend) dan menyulitkan user melihat arah perubahan tanpa pindah ke Historical Data | **Gap nyata — enhancement opportunity** |
| 2 | Chart Historical Data merepresentasikan rentang waktu yang dipilih | FDD Bab 7.3: chart menampilkan "tren data sensor pada rentang waktu terpilih" | Baseline 4.5: chart hanya menampilkan **record halaman aktif (paginated)**, bukan seluruh rentang | Ini adalah keterbatasan teknis nyata (chart terikat pagination tabel), bukan keputusan UX yang disengaja — berpotensi menyesatkan (chart terlihat lengkap padahal terpotong pagination) | **Gap nyata — priority tinggi** |
| 3 | Halaman Settings | FDD Bab 6 menjelaskan Settings tidak dibutuhkan sebagai write-config page pada MVP; kebutuhan diakomodasi lewat halaman Devices (read-only) | Baseline: 5 halaman (tanpa Settings terpisah), Devices read-only sesuai deskripsi | Selaras. Bukan gap. | **Sesuai** |
| 4 | Filter form components | FDD tidak merinci implementasi filter, hanya menyebut "filter" per halaman | Baseline 7.4: class `controlClass`/`labelClass` diulang identik (bukan shared component) di 3 halaman | Bukan penyimpangan dari FDD (FDD tidak mengatur ini), tapi merupakan technical debt/maintainability gap yang relevan untuk redesign | **Gap teknis — opportunity refactor** |
| 5 | Loading pattern | FDD Bab 10 hanya menyebut "Loading Indicator" secara umum, tidak merinci pola per halaman | Baseline: Dashboard & Monitoring pakai spinner (`LoadingIndicator`) untuk initial load; Historical/Alerts/Devices pakai skeleton rows | Dua pendekatan berbeda untuk situasi yang secara struktural mirip (initial fetch). Bukan bug fungsional, tapi inkonsistensi pola yang berpotensi terasa sebagai dua "bahasa" loading berbeda | **Inkonsistensi minor — opportunity standardisasi** |
| 6 | Visualisasi motion/obstacle | FDD tidak merinci; docs/design.md prinsip data-viz (brief) menegaskan binary/event data jangan dipaksa jadi continuous line chart | Baseline: motion/obstacle ditampilkan sebagai teks "Ada"/"Tidak" pada Sensor Card, tabel, dan Alert Card — tidak divisualisasikan sebagai chart | Sudah sesuai prinsip "jangan paksakan continuous line chart pada binary data". Representasi teks sudah tepat secara semantik | **Sesuai — tidak perlu diubah**, namun ada opportunity opsional untuk event-timeline (Bagian 11.3, Monitoring) |
| 7 | Bar chart untuk agregat alert | FDD Bab 11 menyebut Bar Chart untuk "jumlah kejadian alert berdasarkan status" | Baseline 5.5: Alerts hanya menampilkan tabel + status indicator, tidak ada bar chart agregat | Gap nyata terhadap FDD, namun perlu dinilai apakah agregat ini benar-benar dibutuhkan user atau berisiko jadi "random statistics" (dilarang Bagian 19). Karena Alerts page fokus pada daftar kejadian yang butuh tindakan (bukan analisis tren), agregat ini **opsional**, bukan wajib | **Gap — opportunity rendah priority (P2)** |
| 8 | Reusable component (Shared Components) | FDD Bab 3.4: reusable component untuk status indicator, kartu ringkasan, tabel, elemen grafik | Baseline 7: 13 shared components + 4 UI primitives + 3 layout components, dipakai lintas halaman | Selaras sepenuhnya | **Sesuai** |
| 9 | Master-detail pattern | Tidak diatur eksplisit pada FDD | Baseline: Alerts & Devices pakai master-detail URL-driven; Dashboard/Monitoring/Historical single-column | Perbedaan pola dijustifikasi oleh kebutuhan halaman (list-of-records vs single-focus-device), bukan inkonsistensi yang keliru | **Sesuai — variasi kontekstual yang valid** |

**Kesimpulan Bagian 2:** dari 9 titik perbandingan, **2 gap prioritas tinggi** (Monitoring tanpa trend, Historical chart terpotong pagination), **2 gap teknis/priority menengah** (filter form duplikasi, loading pattern inkonsisten), **1 gap opsional priority rendah** (bar chart agregat alert), dan sisanya sudah selaras dan **dipertahankan apa adanya**. Redesign tidak mengembalikan seluruh frontend ke FDD secara mentah — hanya menutup gap yang benar-benar berdampak pada usability.

---

## 3. Design Principles

1. Clarity over decoration — informasi harus jelas dibaca sebelum dipercantik.
2. Information hierarchy over visual density — Dashboard tetap ringkas, detail dipindah ke halaman terkait.
3. Visualisasi dipilih berdasarkan karakter data: continuous (temperature/humidity/light) → line/area chart; event/binary (motion/obstacle) → status/text/event indicator, bukan line chart.
4. Consistency across pages — pola yang sudah konsisten (Card, StatusBadge, EmptyState/ErrorState, page header, id-ID formatting) dipertahankan dan diperluas ke bagian yang belum konsisten (filter control, loading pattern).
5. Reusable component hanya bila dipakai ≥2 halaman dengan struktur/behavior yang sama — bukan abstraksi berlebihan.
6. Responsive by design — bukan sekadar "stack semua jadi 1 kolom", tetap pertahankan urutan prioritas informasi di setiap breakpoint.
7. Accessibility by default — status tidak hanya lewat warna, kontras memadai, keyboard-focusable pada elemen interaktif (row klik, card klik).
8. Minimal dependency baru — Recharts, shadcn/ui, Tailwind, Axios, React Router sudah cukup untuk seluruh rencana pada dokumen ini; tidak ada dependency baru yang diperlukan.
9. Tidak ada feature expansion di luar kebutuhan UI — ide fitur baru (mis. export CSV, notification center) dipisahkan ke Bagian 13 (Potential Future Features), bukan mandatory.
10. Konteks IoT/security monitoring console dipertahankan — bukan diarahkan menjadi generic SaaS/trading dashboard. Estetika "Systems Interface" pada docs/design.md justru selaras secara tematik dengan positioning SIAGA sebagai "Adaptive Security and Safety Console".
11. Aturan docs/design.md diprioritaskan di atas tren komponen UI populer bila terjadi konflik.
12. Hindari pola AI-generated generik: tidak semua section jadi card, tidak semua elemen diberi border+shadow+radius otomatis, tidak ada chart/statistik tanpa tujuan informasi yang jelas.

---

## 4. Page-by-Page Planning

### 4.1 Dashboard

**Objective**
Overview kondisi sistem secara keseluruhan — entry point, bukan halaman detail.

**Primary User Goal**
"Apakah sistem saya baik-baik saja secara keseluruhan, dan device mana yang perlu perhatian?"

**Information Hierarchy**
- Primary: jumlah device online/offline (system health at a glance), device mana yang berstatus WARNING/DANGER.
- Secondary: daftar device dengan status masing-masing.
- Supporting: waktu last_seen_at, indikator "diperbarui X detik lalu".

**Current State**
PageHeader → 3 DashboardCard (Total/Online/Offline) → Device Overview (grid DeviceStatusCard). Polling otomatis, stale notice bila polling gagal, loading spinner di initial load, empty/error state tersedia. Card clickable menuju Monitoring per device.

**Design Problems**
- Tidak ada masalah struktural besar — layout sudah overview-appropriate (ringkas, tidak padat).
- Device WARNING/DANGER tidak dibedakan urutannya dari device NORMAL pada grid — user harus scan seluruh grid untuk menemukan device bermasalah, padahal ini adalah informasi paling kritis pada halaman overview.
- Tidak ada ringkasan cepat jumlah device berstatus WARNING/DANGER (hanya online/offline yang dihitung di metric card), padahal status sistem (bukan hanya konektivitas) adalah concern utama sebuah console keamanan.

**UX Opportunities**
- Sorting/grouping DeviceStatusCard: device DANGER dan WARNING ditampilkan lebih dulu (di atas), device NORMAL/offline mengikuti.
- Tambah metric card ke-4 (atau ubah salah satu dari 3 existing) untuk "Perlu Perhatian" (jumlah device berstatus WARNING+DANGER), melengkapi Total/Online/Offline yang sudah ada — tetap dalam grid metrik yang sama, tidak menambah section baru.

**Components — Keep / Modify / Replace / Remove / Add**

| Component | Decision | Reason |
|---|---|---|
| PageHeader | KEEP | Pattern konsisten, sudah sesuai fungsi |
| DashboardCard (3x: Total/Online/Offline) | MODIFY | Tambahkan 1 card "Perlu Perhatian" (WARNING+DANGER count) agar status sistem — bukan hanya konektivitas — terlihat di ringkasan puncak |
| DeviceStatusCard grid | MODIFY | Urutan render diubah: prioritas DANGER → WARNING → NORMAL/OFFLINE, agar device bermasalah langsung terlihat tanpa scroll/scan |
| LoadingIndicator, ErrorState, EmptyState, stale notice | KEEP | Sudah sesuai pola UI state yang konsisten lintas halaman |

**Visualization Plan**
Tetap metric card + status badge (bukan chart) — Dashboard adalah ringkasan status, bukan analisis tren; chart di Dashboard berisiko jadi "random chart" yang melanggar Bagian 19. Tidak ada chart baru di Dashboard.

**Layout Plan**

```
┌──────────────────────────────────────────────┐
│ PageHeader (Dashboard · diperbarui Xs lalu)  │
├────────────┬────────────┬────────────┬───────┤
│ Total      │ Online     │ Offline    │ Perlu │
│ Device     │            │            │Perhat.│
├────────────┴────────────┴────────────┴───────┤
│ Device Overview (grid, DANGER/WARNING dulu)   │
└────────────────────────────────────────────────┘
```

**Interaction Plan**
Tidak berubah — klik card tetap menuju Monitoring, retry tetap sama.

**UI State Plan**
Tidak berubah dari baseline (loading/error/empty/stale/success sudah lengkap dan konsisten).

**Responsive Plan**
- Desktop: metric grid 4 kolom (naik dari 3, sesuaikan breakpoint `lg:grid-cols-4`), device grid 3 kolom.
- Tablet: metric grid 2 kolom, device grid 2 kolom.
- Mobile: 1 kolom untuk keduanya (tidak berubah dari pola existing).

**Shared Components**
DashboardCard, DeviceStatusCard, StatusBadge — reused, tidak ada component baru.

**Library Requirements**
Tidak ada. Sorting dilakukan di layer data (hook/util), bukan library baru.

**API/Data Dependency**
Tidak ada endpoint baru — `GET /api/v1/system/status` sudah membawa `latest_status` per device, cukup untuk menghitung count WARNING/DANGER dan sorting di client-side.

**Accessibility Considerations**
Card "Perlu Perhatian" harus memiliki label teks eksplisit (bukan hanya warna) agar status tetap terbaca oleh screen reader; urutan device pada grid tetap mengikuti DOM order (bukan reorder visual-only via CSS) supaya keyboard/reader order konsisten dengan visual order.

**Implementation Notes**
Perubahan ini murni UI enhancement (sorting + 1 metric tambahan), tidak menyentuh backend. Priority P1.

**Final Proposed Structure**
PageHeader → 4 metric card (Total, Online, Offline, Perlu Perhatian) → Device Overview grid (urut prioritas status).

---

### 4.2 Monitoring

**Objective**
Kondisi sensor & status device tertentu secara real-time.

**Primary User Goal**
"Apa yang sedang terjadi pada device ini sekarang — dan apakah nilainya bergerak naik/turun?"

**Information Hierarchy**
- Primary: status sistem terkini (NORMAL/WARNING/DANGER) dan status konektivitas device.
- Secondary: 5 nilai sensor terkini (suhu, kelembapan, cahaya, gerakan, obstacle).
- Supporting: arah pergerakan singkat nilai sensor kontinu (baru), waktu recorded_at.

**Current State**
PageHeader (device selector di action area) → DeviceStatusCard → Section "Latest Sensor Data" → SensorGrid (5 SensorCard). Tidak ada chart sama sekali (baseline 3.5, dikonfirmasi juga sebagai gap FDD pada Bagian 2 #1 dokumen ini).

**Design Problems**
- Gap dari FDD: tidak ada representasi tren, hanya snapshot. User tidak bisa tahu apakah suhu sedang naik atau baru saja turun tanpa membuka Historical Data secara manual dan menyaring device+rentang.
- Duplikasi konsep dengan Dashboard/Historical Data harus dihindari — Monitoring bukan tempat untuk full historical chart (itu tanggung jawab Historical Data page), tapi butuh *konteks* singkat, bukan analisis mendalam.

**UX Opportunities**
Tambahkan **mini trend indicator (sparkline)** ringan di setiap SensorCard untuk 3 sensor kontinu (suhu, kelembapan, cahaya) — bukan chart penuh dengan axis/legend/tooltip seperti di Historical Data, melainkan sparkline kecil (tanpa axis) yang menjawab "naik/turun sejak beberapa saat lalu", memakai beberapa titik data terakhir dari device yang sama. Untuk motion/obstacle (binary), tetap gunakan representasi teks/indicator, tidak dipaksakan jadi sparkline — sesuai prinsip data-viz Bagian 10.

**Components — Keep / Modify / Replace / Remove / Add**

| Component | Decision | Reason |
|---|---|---|
| DeviceSelector | KEEP | Sudah sesuai fungsi |
| DeviceStatusCard | KEEP | Konsisten dengan Dashboard/Devices |
| SensorCard (suhu, kelembapan, cahaya) | MODIFY | Tambahkan slot sparkline kecil di dalam card, opsional (hilang bila data historis singkat tidak tersedia) |
| SensorCard (gerakan, obstacle) | KEEP | Tetap representasi teks "Ada"/"Tidak" — binary data tidak dipaksa jadi sparkline |
| SensorGrid, SensorGridSkeleton, DeviceStatusSkeleton | KEEP | Struktur grid tetap sama |

**Component Baru**

### SensorTrendSparkline
- **Page:** Monitoring
- **Purpose:** Memberi konteks arah pergerakan singkat pada sensor kontinu tanpa membuat user berpindah halaman.
- **Position:** Di dalam `SensorCard`, di bawah nilai utama, ukuran kecil (± 32–40px tinggi), tanpa axis/label/tooltip.
- **Data:** N titik terakhir (mis. 10–20 record) dari sensor yang sama pada device aktif.
- **Interaction:** Non-interaktif (tanpa hover/tooltip) — untuk menjaga kesederhanaan; bila interaksi dibutuhkan di masa depan, user diarahkan ke Historical Data (bukan menambah kompleksitas di Monitoring).
- **UI State:** Disembunyikan (bukan skeleton/error) bila data historis singkat tidak tersedia — sparkline bersifat pelengkap, bukan primary information, sehingga kegagalannya tidak boleh memblokir tampilan nilai sensor utama.
- **Reusability:** Ya — dapat dipakai ulang bila di masa depan Dashboard butuh indikator tren singkat per device.
- **Reason:** Mengisi gap FDD (Bab 7.2 & Bab 8) terhadap tren sensor di Monitoring, tanpa menduplikasi fungsi Historical Data.

**Visualization Plan**
Sparkline minimalis (line, tanpa axis) untuk suhu/kelembapan/cahaya. Tidak ada chart besar di Monitoring — chart penuh tetap eksklusif milik Historical Data agar kedua halaman tidak menjadi duplikat (sesuai Bagian 12 brief).

**Layout Plan**

```
┌──────────────────────────────────────────────┐
│ PageHeader (Device Name · [Device Selector]) │
├──────────────────────────────────────────────┤
│ DeviceStatusCard                              │
├──────────────────────────────────────────────┤
│ Latest Sensor Data                            │
├────────┬────────┬────────┬────────┬──────────┤
│ Suhu   │ Kelemb │ Cahaya │ Gerakan│ Obstacle │
│ +sparkl│ +sparkl│ +sparkl│ (text) │ (text)   │
└────────┴────────┴────────┴────────┴──────────┘
```

**Interaction Plan**
Tidak berubah selain penambahan sparkline pasif (non-interaktif).

**UI State Plan**
Tambahan: sparkline tidak tampil (bukan skeleton) bila histori singkat kosong/gagal — degradasi lembut, tidak menambah error state baru.

**Responsive Plan**
Grid sensor tetap `1/2/3/5` kolom sesuai baseline (mobile/tablet/desktop-lg/desktop-xl); sparkline scale mengikuti lebar card, tidak menambah breakpoint baru.

**Shared Components**
`SensorTrendSparkline` baru, bisa reusable ke Dashboard di masa depan.

**Library Requirements**
Recharts (existing dependency) — pakai `LineChart` minimal tanpa `XAxis`/`YAxis`/`Tooltip` untuk sparkline, atau `AreaChart` sederhana. Tidak perlu dependency baru.

**API/Data Dependency**
"Requires backend/API support" — **tidak diperlukan endpoint baru**; endpoint `GET /api/v1/sensor-data/history` yang sudah ada dapat dipanggil dengan rentang waktu pendek (mis. 1 jam terakhir) dan `per_page` kecil untuk sumber data sparkline. Tidak ada perubahan backend/API/database yang dibutuhkan.

**Accessibility Considerations**
Sparkline bersifat dekoratif-informatif (bukan primary data) — beri `aria-hidden` pada elemen grafis, dan sediakan indikator arah tekstual tersembunyi (visually-hidden) seperti "naik"/"turun"/"stabil" untuk screen reader, agar informasi tren tidak hilang bagi pengguna non-visual.

**Implementation Notes**
Priority P2 — bukan blocking, tapi mengisi gap FDD yang cukup berdampak pada usability Monitoring. Membutuhkan hook baru (mis. `useRecentSensorTrend`) di layer Hooks, tidak mengubah Service layer secara struktural (endpoint sudah ada).

**Final Proposed Structure**
PageHeader (dengan selector) → DeviceStatusCard → SensorGrid (5 card, 3 di antaranya dengan sparkline).

---

### 4.3 Historical Data

**Objective**
Analisis data sensor masa lalu berdasarkan rentang waktu.

**Primary User Goal**
"Bagaimana tren sensor pada device ini selama periode yang saya pilih, dan apa detail rincinya?"

**Information Hierarchy**
- Primary: chart tren untuk rentang waktu yang benar-benar dipilih (bukan hanya halaman tabel aktif).
- Secondary: tabel data rinci dengan pagination.
- Supporting: filter (device, tanggal awal/akhir).

**Current State**
PageHeader → HistoryFilters (Card) → [bila filter lengkap & valid] Chart (line, 3 seri) + DataTable + Pagination. Chart menampilkan **record halaman aktif saja**, bukan seluruh rentang (baseline 4.5 & Bagian 2 #2 dokumen ini).

**Design Problems**
- **Gap prioritas tinggi:** chart yang terikat pagination tabel berisiko menyesatkan — pengguna men-scan tren visual yang sebenarnya hanya mewakili 1 halaman tabel (mis. 10–20 baris), bukan keseluruhan rentang tanggal yang dipilih (bisa berhari-hari data). Ini bukan sekadar "keterbatasan kecil", melainkan berlawanan langsung dengan tujuan halaman: analisis tren pada rentang waktu.

**UX Opportunities**
Pisahkan sumber data Chart dari sumber data DataTable:
- **Chart** mengambil seluruh rentang waktu terpilih (independen dari halaman tabel aktif), dengan `per_page` besar/khusus untuk chart atau — bila rentang berpotensi sangat besar — down-sampling di client (mis. ambil maksimum N titik representatif, dengan catatan ini butuh keputusan teknis lebih lanjut, ditandai sebagai "Requires backend/API support" bila volume data melebihi batas wajar untuk single-request).
- **DataTable** tetap dengan pagination seperti sekarang untuk detail rinci.

**Components — Keep / Modify / Replace / Remove / Add**

| Component | Decision | Reason |
|---|---|---|
| HistoryFilters | KEEP (struktur), lihat Bagian 5 untuk refactor shared control | Fungsi filter sudah tepat, tapi implementasi controlnya diduplikasi (lihat Filter Form Refactor) |
| Chart (line, 3 seri) | MODIFY | Sumber data diubah dari "halaman tabel aktif" menjadi "seluruh rentang waktu terpilih", agar benar-benar merepresentasikan rentang, bukan potongan pagination |
| DataTable + Pagination | KEEP | Sudah sesuai untuk detail rinci |
| ChartTooltip | KEEP | Sudah baik: label mono, dot warna, nilai id-ID |

**Visualization Plan**
Tetap line chart 3 seri (suhu/kelembapan/cahaya) — sudah tepat secara semantik untuk data kontinu. Perubahan hanya pada sumber data, bukan jenis chart.

| Chart Name | Page | Purpose | Type | Data | X-axis | Y-axis | Series | Time Range | Interaction | Responsive | Reason |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sensor Trend Chart | Historical Data | Melihat tren 3 sensor kontinu pada rentang terpilih | Line | temperature, humidity, light | recorded_at (HH:MM, id-ID) | value (°C/%/lux) | 3 (suhu, kelembapan, cahaya) | Sesuai filter tanggal awal–akhir (bukan per-halaman tabel) | Tooltip kustom (existing) | `ResponsiveContainer`, height tetap ~280px (existing) | Data kontinu, line chart adalah representasi paling sesuai untuk tren waktu |

**Layout Plan**
Tidak berubah dari baseline (Filter → Chart → Table + Pagination), hanya sumber data chart yang berubah — layout structure sudah baik dan sesuai alur "Filter → Visualization → Detailed Data" yang diminta brief.

**Interaction Plan**
Tidak berubah — auto-apply filter, reset page ke 1 saat filter berubah, retry pada error.

**UI State Plan**
Tambahan pertimbangan: bila rentang data untuk chart terlalu besar untuk 1 request, tampilkan pesan kecil non-blocking (mis. "Menampilkan tren berdasarkan sampel data" — hanya bila down-sampling benar-benar diterapkan), bukan error.

**Responsive Plan**
Tidak berubah dari baseline (filter grid `sm:grid-cols-2 lg:grid-cols-3`, chart `ResponsiveContainer`, tabel `overflow-x-auto`).

**Shared Components**
Chart, ChartTooltip — reused. Filter control mengikuti refactor pada Bagian 5.

**Library Requirements**
Tidak ada dependency baru — Recharts sudah cukup untuk down-sampling sederhana (dilakukan di layer data, bukan library chart).

**API/Data Dependency**
"Requires backend/API support" (bersyarat) — bila endpoint `GET /api/v1/sensor-data/history` mendukung `per_page` besar/tanpa limit ketat, tidak perlu perubahan API. Namun bila rentang waktu yang sangat panjang menghasilkan volume data besar, disarankan endpoint agregasi (mis. down-sampled by interval) di masa depan — ditandai sebagai potential backend enhancement, bukan bagian wajib rencana UI ini.

**Accessibility Considerations**
Tidak berubah dari baseline (tooltip chart tetap harus dapat diakses; pastikan value teks alternatif tersedia untuk pembaca layar, bukan hanya visual).

**Implementation Notes**
Priority P1 (tinggi) — ini adalah gap paling berdampak pada akurasi informasi yang disajikan ke user.

**Final Proposed Structure**
PageHeader → Filter Riwayat → Tren Sensor (chart mewakili seluruh rentang) → Detail Riwayat (table + pagination, tetap per-halaman).

---

### 4.4 Alerts

**Objective**
Menyajikan kejadian yang membutuhkan perhatian (WARNING/DANGER).

**Primary User Goal**
"Kejadian apa yang perlu saya tindak lanjuti, dan apa detail pemicunya?"

**Information Hierarchy**
- Primary: daftar alert dengan status (DANGER lebih menonjol dari WARNING).
- Secondary: detail alert (sensor pemicu) pada panel.
- Supporting: filter (device, status, rentang waktu).

**Current State**
PageHeader → AlertsFilters (Card, 4 kontrol) → master-detail grid: DataTable + Pagination (kolom utama) + AlertDetailPanel (aside sticky, bila alertId ada). Alert Card di panel menampilkan ringkasan 5 sensor pemicu.

**Design Problems**
- Tidak ditemukan masalah struktural besar pada layout master-detail — sudah sesuai kebutuhan "list → detail" untuk item yang butuh investigasi.
- Kolom tabel saat ini (ID, Device, Status, Waktu Kejadian) tidak menampilkan hierarki DANGER-di-atas-WARNING secara visual selain warna badge — untuk daftar panjang, DANGER bisa "tenggelam" di antara banyak WARNING bila urutan hanya berdasarkan waktu.

**UX Opportunities**
- Opsi sort/urutan default: DANGER lebih diprioritaskan pada tampilan (mis. secondary sort setelah waktu, atau opsi sort by severity) — namun ini perlu dipertimbangkan hati-hati agar tidak bertentangan dengan ekspektasi kronologis; direkomendasikan sebagai **P2 opsional**, bukan wajib, karena tabel dengan filter status yang sudah ada (`Semua`/WARNING/DANGER) sudah memungkinkan user memfilter langsung ke DANGER.
- Bar chart agregat (dari FDD Bab 11) — dinilai pada Bagian 2 #7: opsional, P2, hanya bila benar-benar dibutuhkan sebagai insight tambahan, bukan mandatory.

**Components — Keep / Modify / Replace / Remove / Add**

| Component | Decision | Reason |
|---|---|---|
| AlertsFilters | KEEP (struktur), refactor control (Bagian 5) | Fungsi sudah tepat |
| DataTable, Pagination | KEEP | Sudah sesuai |
| AlertDetailPanel, AlertCard, ValidationDetails | KEEP | Sudah menyajikan detail dengan baik |
| Alert severity sort option | ADD (opsional, P2) | Membantu user fokus ke DANGER tanpa harus filter manual, tanpa mengubah default kronologis kecuali diminta user |

**Visualization Plan**
Tidak ada chart baru wajib. Bar chart agregat status (opsional) hanya bila validasi lanjutan menunjukkan kebutuhan nyata — tidak dimasukkan sebagai mandatory item pada rencana ini agar tidak menambah "random statistics" yang dilarang Bagian 19.

**Layout Plan**
Tidak berubah dari baseline (master-detail sudah tepat).

```
┌──────────────────────────────────────────────┐
│ PageHeader (Alerts)                           │
├─────────────────────────────┬──────────────────┤
│ Filter Alert                 │                  │
│ DataTable + Pagination       │ AlertDetailPanel │
│ (severity-aware, opsional)   │ (sticky, xl+)    │
└─────────────────────────────┴──────────────────┘
```

**Interaction Plan**
Tidak berubah — filter auto-apply, klik baris → detail, retry, close panel.

**UI State Plan**
Tidak berubah dari baseline (loading/empty/error/stale/404/422 sudah lengkap dan konsisten).

**Responsive Plan**
Tidak berubah (`xl:grid-cols-[minmax(0,1fr)_360px]`, single column < xl).

**Shared Components**
Filter control mengikuti refactor Bagian 5.

**Library Requirements**
Tidak ada.

**API/Data Dependency**
Tidak ada perubahan API dibutuhkan untuk item wajib pada halaman ini.

**Accessibility Considerations**
Tidak berubah — status tidak hanya lewat warna (StatusBadge sudah memakai dot + label, sudah sesuai).

**Implementation Notes**
Priority P2 untuk sort opsional; tidak ada item P0/P1 baru pada halaman ini di luar filter form refactor (Bagian 5, berlaku lintas halaman).

**Final Proposed Structure**
Tidak berubah signifikan dari baseline — halaman ini sudah cukup matang secara struktural.

---

### 4.5 Devices

**Objective**
Kondisi device/node terdaftar (read-only).

**Primary User Goal**
"Device mana yang online/offline, dan bagaimana detail masing-masing?"

**Information Hierarchy**
- Primary: status konektivitas per device.
- Secondary: waktu terakhir terlihat.
- Supporting: timestamp metadata (created/updated).

**Current State**
PageHeader → DeviceFilters (Card, 1 kontrol status) → master-detail: DataTable + Pagination + DeviceDetailPanel (aside).

**Design Problems**
Tidak ditemukan masalah struktural. Halaman ini sudah sesuai fungsi read-only sederhana yang dituntut FDD Bab 7.5 — tidak perlu ditambah device management feature (sesuai batasan Bagian 15 brief).

**UX Opportunities**
Tidak ada perubahan struktural yang diperlukan. Satu opportunity minor: `DeviceFilters` memakai grid 4 kolom padahal hanya berisi 1 kontrol (baseline 6.4) — ini murni penyesuaian layout kecil (bukan penambahan fitur), agar filter card tidak terlihat kosong/tidak proporsional.

**Components — Keep / Modify / Replace / Remove / Add**

| Component | Decision | Reason |
|---|---|---|
| DeviceFilters | MODIFY | Sesuaikan lebar grid agar 1 kontrol status tidak terlihat "mengambang" di grid 4 kolom kosong — gunakan lebar kontrol yang proporsional (mis. `max-w-xs`) alih-alih grid penuh |
| DataTable, Pagination, DeviceDetailPanel | KEEP | Sudah sesuai fungsi |

**Visualization Plan**
Tetap status indicator saja — tidak perlu chart (device page bersifat administratif/read-only, bukan analitis).

**Layout Plan**
Tidak berubah dari baseline selain lebar filter.

**Interaction Plan / UI State Plan / Responsive Plan**
Tidak berubah dari baseline — sudah konsisten dengan pola Alerts.

**Shared Components**
Filter control mengikuti refactor Bagian 5 (walau hanya 1 kontrol, tetap gunakan komponen `FilterField` yang sama untuk konsistensi lintas halaman).

**Library Requirements / API Dependency**
Tidak ada.

**Accessibility Considerations**
Tidak berubah — sudah sesuai pola lintas halaman.

**Implementation Notes**
Priority P3 (kosmetik kecil, tidak mendesak).

**Final Proposed Structure**
Tidak berubah dari baseline.

---

## 5. Shared Component Strategy

### 5.1 Filter Form Refactor (lintas Historical Data, Alerts, Devices)

**Masalah:** `controlClass`/`labelClass` diulang identik sebagai string di 3 file halaman berbeda (baseline 7.4) — bukan shared component, melainkan duplikasi kode yang berisiko drift (perubahan style harus diterapkan manual di 3 tempat).

**Solusi:** Ekstrak menjadi shared component `FilterField` (wrapper label + control) dan pertahankan native `<select>`/`<input type="date">` di dalamnya (tidak perlu library form baru — sesuai prinsip minimal dependency).

### FilterField
- **Page:** Historical Data, Alerts, Devices (dan Monitoring's DeviceSelector dapat mengadopsi struktur yang sama untuk menyamakan tinggi kontrol, lihat catatan di bawah).
- **Purpose:** Satu titik kebenaran untuk style label mono-uppercase + control (select/date input), menghindari duplikasi class string.
- **Position:** Di dalam Card Filter tiap halaman, menggantikan markup inline yang ada saat ini.
- **Data:** Menerima `label`, `type` (`select`/`date`), `options` (untuk select), `value`, `onChange` melalui props.
- **Interaction:** Sama seperti kontrol native saat ini (tidak ada perubahan behavior).
- **UI State:** Mewarisi disabled/error state dari parent (mis. saat list device gagal dimuat).
- **Responsive Behavior:** Mengikuti grid parent (`sm:grid-cols-2 lg:grid-cols-3/4` sesuai halaman masing-masing, tidak berubah).
- **Reusability:** Ya — dipakai di 3 halaman filter, dan direkomendasikan pula agar `DeviceSelector` pada Monitoring menyamakan tinggi kontrol (`h-8` vs `h-9` pada baseline 3.9, perbedaan minor) melalui component yang sama untuk konsistensi penuh.
- **Reason:** Menghilangkan duplikasi kode, satu tempat perubahan bila style kontrol perlu disesuaikan, konsistensi tinggi/warna/radius kontrol yang saat ini sedikit berbeda antara Monitoring dan 3 halaman filter lain.
- **Priority:** P1 — technical debt yang berdampak langsung pada maintainability (bukan cosmetic, bukan feature).

### 5.2 Loading Pattern Standardization

**Masalah:** Dashboard & Monitoring memakai spinner (`LoadingIndicator`) untuk initial load; Historical/Alerts/Devices memakai skeleton rows.

**Analisis:** Pola ini sebenarnya **kontekstual dan bisa dijustifikasi** — Dashboard/Monitoring initial load tidak punya struktur grid/table yang sudah pasti bentuknya di awal (bergantung jumlah device), sedangkan Historical/Alerts/Devices initial load punya bentuk tabel yang sudah pasti kolomnya sehingga skeleton row masuk akal. **Keputusan: pertahankan perbedaan ini secara sadar** (bukan standardisasi paksa ke satu pola), namun dokumentasikan sebagai pola resmi pada Design System Summary (Bagian 6) — bukan lagi inkonsistensi tak disengaja, melainkan aturan: *"gunakan skeleton bila struktur akhir sudah pasti (tabel dengan kolom tetap); gunakan spinner bila struktur akhir belum pasti (grid dengan jumlah item dinamis di initial load)"*.

**Priority:** P3 — dokumentasi pola saja, tidak ada perubahan komponen.

### 5.3 Existing Shared Components — Tidak Berubah

`PageHeader`, `Card`/`Button`/`Badge`/`Skeleton` (UI primitives), `StatusBadge`, `DataTable`, `Pagination`, `EmptyState`, `ErrorState`, `LoadingIndicator`, `Chart`/`ChartTooltip`, `DeviceStatusCard` — seluruhnya KEEP, sudah konsisten dan dipakai lintas halaman sesuai fungsinya masing-masing. Tidak ada REPLACE atau REMOVE pada shared component manapun — seluruh baseline shared component sudah selaras dengan docs/design.md dan tidak menunjukkan masalah struktural.

---

## 6. Design System Summary

### Typography
Heading halaman: `text-2xl font-semibold tracking-tight` (Inter). Section heading: `text-sm font-semibold`. Body/deskripsi: default Inter. Label kontrol/metric: mono uppercase `tracking-widest` (JetBrains Mono). Metric value besar: `text-3xl font-semibold`. Nilai sensor: `text-xl font-semibold`. Seluruhnya **dipertahankan tanpa perubahan** — sudah sesuai docs/design.md dan konsisten lintas halaman.

### Spacing
`space-y-6` antar-section, `space-y-3`/`space-y-4` dalam konten, `gap-4` grid — dipertahankan.

### Color
Semantic: normal (hijau/online token), warning (`#f59e0b`), danger (`#ef4444`), primary orange `#f97316` untuk aksi utama, accent indigo `#818cf8` untuk seri chart kedua. Dipertahankan penuh sesuai docs/design.md.

### Status
Pattern `StatusBadge` (dot + label + warna) untuk NORMAL/WARNING/DANGER dan ONLINE/OFFLINE — dipertahankan sebagai satu-satunya pola status di seluruh aplikasi, termasuk pada component baru (`SensorTrendSparkline` tidak menggantikan StatusBadge, hanya melengkapi).

### Components
Card (`rounded-card border border-border bg-surface/40`), Button (primary/outline/ghost/danger), Table (mono header uppercase + skeleton rows), Filter (`FilterField` baru — lihat Bagian 5.1), Charts (line chart untuk data kontinu, sparkline untuk indikator tren ringan pada Monitoring) — seluruhnya konsisten dengan satu bahasa visual (radius, border, warna) sesuai docs/design.md.

### Loading/Empty/Error State
Skeleton untuk struktur tabel yang pasti, spinner untuk initial load struktur dinamis (Bagian 5.2); EmptyState dan ErrorState dengan pola pesan yang membedakan "tidak ada data" vs "tidak sesuai filter" — dipertahankan.

---

## 7. Library Summary

| Library | Purpose | Page | Existing/New | Required? |
|---|---|---|---|---|
| Recharts | Line chart (Historical), sparkline (Monitoring, baru) | Historical Data, Monitoring | Existing | Ya, sudah dependency existing — tidak ada penambahan dependency |
| shadcn/ui + Tailwind | UI primitives, styling | Seluruh halaman | Existing | Ya |
| Axios | HTTP client | Seluruh halaman | Existing | Ya |
| React Router | Routing, URL state | Seluruh halaman | Existing | Ya |

**Tidak ada library baru yang diperlukan** untuk seluruh rencana pada dokumen ini. Seluruh enhancement (sparkline, chart rentang penuh, filter refactor, dashboard sorting) dapat dibangun dengan dependency yang sudah ada di project.

---

## 8. Component Inventory

### Existing Shared Components (dipertahankan)
PageHeader, Card, Button, Badge, Skeleton, StatusBadge, DataTable, Pagination, DashboardCard, SensorCard, DeviceStatusCard, AlertCard, Chart, ChartTooltip, EmptyState, ErrorState, LoadingIndicator.

### Existing Page-Specific Components (dipertahankan)
DashboardContent; MonitoringView, DeviceSelector, SensorGrid, SensorGridSkeleton, DeviceStatusSkeleton, MonitoringContent; HistoricalDataContent, HistoryFilters, HistoryResults; AlertsContent, AlertsFilters, AlertDetailPanel, ValidationDetails; DevicesContent, DeviceFilters, DeviceDetailPanel.

### Modified Components
DashboardCard grid (tambah 1 card, P1), DeviceStatusCard grid ordering (Dashboard, P1), SensorCard (slot sparkline, Monitoring, P2), Chart data source (Historical Data, P1), HistoryFilters/AlertsFilters/DeviceFilters (adopsi `FilterField`, P1), DeviceFilters grid width (P3).

### New Components
`SensorTrendSparkline` (Monitoring, P2), `FilterField` (Historical/Alerts/Devices, P1).

### Removed Components
Tidak ada component yang dihapus — seluruh baseline shared component tetap relevan dan dipakai.

### Reusable Visualization Components
Chart (line, existing), SensorTrendSparkline (sparkline, baru) — keduanya reusable lintas halaman bila dibutuhkan di masa depan.

---

## 9. Enhancement Matrix

| Page | Element | Current | Decision | Proposed | Priority |
|---|---|---|---|---|---|
| Dashboard | Metric cards | 3 card (Total/Online/Offline) | MODIFY | Tambah card "Perlu Perhatian" (WARNING+DANGER) | P1 |
| Dashboard | Device grid order | Urutan tidak diatur berdasarkan severity | MODIFY | Urutkan DANGER → WARNING → lainnya | P1 |
| Monitoring | Sensor trend | Tidak ada tren sama sekali | ADD | Sparkline pada 3 sensor kontinu | P2 |
| Historical Data | Chart data source | Terikat halaman tabel aktif | MODIFY | Independen, mewakili seluruh rentang terpilih | P1 |
| Historical/Alerts/Devices | Filter control | Class diulang identik di 3 file | MODIFY | Ekstrak jadi `FilterField` shared component | P1 |
| Alerts | Severity sort | Default kronologis saja | ADD (opsional) | Opsi sort/prioritas severity | P2 |
| Alerts | Aggregate chart | Tidak ada | ADD (opsional) | Bar chart agregat status (bila terbukti dibutuhkan) | P2 |
| Devices | Filter card width | Grid 4 kolom, 1 kontrol terisi | MODIFY | Lebar proporsional | P3 |
| Seluruh halaman | Loading pattern | Spinner vs skeleton berbeda tanpa aturan eksplisit | DOCUMENT | Tetapkan aturan resmi kapan pakai yang mana | P3 |

---

## 10. Prioritization & Implementation Order

**P0 — Critical:** Tidak ada item P0. Baseline sudah fungsional dan tidak memiliki masalah struktural/usability yang menghalangi penggunaan dasar.

**P1 — High:** Dashboard metric "Perlu Perhatian" + device severity ordering; Historical Data chart data source (rentang penuh, bukan per-halaman); `FilterField` shared component refactor.

**P2 — Medium:** Monitoring sparkline; Alerts severity sort (opsional); Alerts aggregate chart (opsional, tergantung validasi kebutuhan).

**P3 — Optional:** Devices filter card width; dokumentasi resmi pola loading.

### Implementation Order

```
Phase 1 — Design Foundation Confirmation
  Konfirmasi token docs/design.md pada codebase (tidak ada perubahan, hanya verifikasi) — sudah selaras, phase ini singkat.
↓
Phase 2 — Shared Components
  Bangun `FilterField`, terapkan ke Historical Data, Alerts, Devices.
↓
Phase 3 — Dashboard
  Tambah metric "Perlu Perhatian", urutkan device grid berdasarkan severity.
↓
Phase 4 — Historical Data
  Pisahkan sumber data Chart dari pagination tabel.
↓
Phase 5 — Monitoring
  Bangun `SensorTrendSparkline`, integrasikan ke 3 SensorCard kontinu.
↓
Phase 6 — Alerts (opsional)
  Evaluasi kebutuhan nyata severity sort & aggregate chart; implementasi bila tervalidasi.
↓
Phase 7 — Devices
  Rapikan lebar filter card.
↓
Phase 8 — Responsive & UI State Refinement
  Verifikasi seluruh perubahan pada breakpoint mobile/tablet/desktop; dokumentasikan aturan loading pattern.
↓
Phase 9 — Frontend Validation
  Review lintas halaman terhadap docs/design.md (warna, radius, spacing, guardrail anti-AI-slop) dan terhadap dokumen ini.
```

Dependency utama: Phase 2 (`FilterField`) harus selesai sebelum Phase 4/6/7 menyentuh halaman yang memakainya, agar tidak ada refactor ganda.

---

## 11. Potential Future Features

Ide berikut ditemukan selama analisis namun merupakan feature baru (bukan UI enhancement) dan **tidak termasuk mandatory implementation** pada dokumen ini:

### Event Timeline untuk Motion/Obstacle
Purpose: Menjawab "kapan tepatnya motion/obstacle terdeteksi" dalam bentuk timeline diskrit, melengkapi representasi teks "Ada"/"Tidak" yang sudah ada.
Reason: Berguna untuk investigasi pola kejadian dari waktu ke waktu.
Why not included: Membutuhkan keputusan data model event (apakah setiap perubahan state motion/obstacle disimpan sebagai event terpisah atau hanya snapshot per sensor_data record) — perlu klarifikasi backend/database terlebih dahulu, di luar scope UI enhancement murni.

### Export CSV pada Historical Data
Purpose: Mengunduh data historis yang sudah difilter.
Reason: Kebutuhan umum pada halaman analisis data.
Why not included: Fitur baru (bukan redesign UI dari yang sudah ada), tidak disebutkan pada FDD maupun baseline.

### Notification Center Real-Time
Purpose: Pusat notifikasi WARNING/DANGER real-time di luar halaman Alerts.
Reason: Sudah disebutkan FDD Bab 14 sebagai Future Development (Phase 6 roadmap), bukan bagian MVP.
Why not included: Eksplisit di luar scope frontend MVP sesuai FDD, membutuhkan mekanisme real-time (WebSocket) yang juga belum ada.

### Bar Chart Agregat Alert (mandatory version)
Purpose: Visualisasi jumlah alert per status pada rentang waktu, sebagaimana disebut FDD Bab 11.
Reason: Disebutkan pada dokumen desain awal.
Why not included as mandatory: Berisiko menjadi "random statistics" bila tidak terbukti membantu keputusan user secara langsung — dimasukkan sebagai opsional P2 pada Bagian 4.4, bukan wajib di sini.

---

Dashboard — Additional Enhancement

ADD: Recent Alerts / Incidents Preview

Purpose:
Memberikan situational awareness terhadap alert terbaru langsung dari
Dashboard tanpa menggantikan halaman Alerts.

Data:
GET /api/v1/alerts

Implementation:
Reuse existing useAlerts hook and AlertCard component.
Fetch maximum 5 latest alerts.

Layout:
Dashboard lower section menggunakan two-column layout:
- Device Overview
- Recent Alerts

Behavior:
- Menampilkan 3–5 alert terbaru.
- Severity menggunakan existing StatusBadge.
- Menampilkan device, severity, dan triggered_at.
- Empty state jika belum ada alert.
- Error state tidak boleh memblokir Device Overview.
- Tidak mengubah behavior halaman Alerts.

Backend:
No backend changes.

Dependency:
No new dependency.

Priority:
P1 / Medium-High.

Not included:
- Full alert management
- Alert filtering
- Alert detail management
- New analytics chart

## 12. Final Design Principles

1. Clarity over decoration.
2. Information hierarchy over visual density.
3. Visualisasi yang sesuai karakter data — kontinu vs event/binary vs status.
4. Consistency lintas halaman, termasuk pada bagian yang sebelumnya belum konsisten (filter control).
5. Reusable component hanya bila dipakai ≥2 halaman dengan struktur/behavior sama.
6. Responsive by design, bukan sekadar stack.
7. Accessibility by default — status tidak hanya lewat warna.
8. Minimal dependency baru — nol dependency baru pada rencana ini.
9. Tidak ada feature expansion tak perlu — dipisah ke Potential Future Features.
10. Konteks IoT/security monitoring console dipertahankan, selaras dengan estetika "Systems Interface" pada docs/design.md.
11. Aturan docs/design.md diprioritaskan di atas tren UI populer bila terjadi konflik.
12. Hindari pola AI-generated generik — tidak semua section jadi card, tidak semua chart ditambahkan tanpa tujuan informasi jelas.
13. Gap terhadap FDD hanya ditutup bila benar-benar berdampak usability (Historical chart, Monitoring trend) — bukan seluruh perbedaan otomatis dianggap kesalahan yang harus "dikembalikan" ke FDD.

---

*Dokumen ini adalah blueprint perencanaan. Implementasi kode, wireframe visual, dan mockup tidak termasuk dalam scope dokumen ini.*