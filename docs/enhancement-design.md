# Frontend Enhancement Design

## 1. Frontend Baseline

Dokumen ini mendokumentasikan kondisi aktual frontend React SIAGA setelah initial implementation selesai (5 halaman utama). Bagian ini berfungsi sebagai **baseline** untuk tahap redesign/enhancement berikutnya.

Sumber observasi: seluruh file source code frontend (`frontend/src/**`) — pages, layout components, shared components, UI primitives, hooks, services, config, utils, types, CSS design tokens, dan routing. Dokumentasi bersifat deskriptif (apa yang benar-benar diimplementasikan), tanpa rekomendasi perubahan.

Catatan metode:
- Hanya komponen/perilaku yang benar-benar ada pada kode yang didokumentasikan.
- Hal yang tidak dapat dipastikan dari kode ditandai "Tidak dapat ditentukan dari implementasi."
- Perbedaan dengan dokumen desain (FDD) dicatat sebagai observasi faktual tanpa solusi.

---

## 2. Dashboard

### 2.1 Page Overview
Halaman ringkasan kondisi sistem secara keseluruhan. Menampilkan agregat jumlah device, jumlah online/offline, dan status konektivitas + status sistem terkini tiap perangkat. Data bersumber dari `GET /api/v1/system/status` yang dipolling otomatis.

### 2.2 Layout Structure
- `PageHeader` (judul "Dashboard" + deskripsi + indikator "Diperbarui ..." di area aksi).
- Section ringkasan sistem: grid 3 `DashboardCard` (Total Device, Device Online, Device Offline).
- Section "Device Overview": heading + summary text (`N device · N online · N offline`) + grid `DeviceStatusCard`.
- Urutan dari atas ke bawah: PageHeader → [loading | error | empty] → summary cards → device overview.

### 2.3 Sections
- Ringkasan sistem (3 metric card).
- Device Overview (daftar device beserta status).

### 2.4 Components
- `PageHeader` — atas halaman; judul, deskripsi, area aksi.
- `DashboardCard` — kartu metrik (label mono uppercase, nilai besar, satuan, ikon tone warna): Total Device (tone default), Device Online (tone online), Device Offline (tone offline).
- `DeviceStatusCard` — kartu per device: nama (fallback device_id), device_id (mono), status konektivitas (StatusBadge device), status sistem terkini (StatusBadge system) atau "—", waktu relatif last_seen_at. Clickable → navigasi ke Monitoring.
- `LoadingIndicator` — spinner saat loading awal (label "Memuat status sistem…").
- `ErrorState` — tampilan saat error tanpa data (dengan tombol retry).
- `EmptyState` — saat tidak ada data dan tidak ada error (status "Data tidak tersedia").
- Stale notice — baris `role="status"` "Gagal memperbarui data · menampilkan data terakhir" saat data lama masih tampil namun polling gagal.
- Indikator "Diperbarui {waktu relatif}" — badge kecil di area aksi PageHeader dengan dot hijau online.

### 2.5 Data Visualization
- Metric cards (3 DashboardCard): total, online, offline.
- Status indicator per device (StatusBadge system NORMAL/WARNING/DANGER + StatusBadge device online/offline).
- Tidak ada chart/graph pada halaman ini.

### 2.6 Interactions
- Klik `DeviceStatusCard` → navigasi ke `/monitoring/{device_id}`.
- Tombol "Coba lagi" pada ErrorState → refetch.
- Polling otomatis (useSystemStatus default `POLLING_INTERVAL`); indikator waktu diperbarui pada setiap pembaruan data.

### 2.7 UI States
- Loading (initial, tanpa data).
- Error (tanpa data) → ErrorState.
- Empty (tanpa data, tanpa error) → EmptyState.
- Stale (error polling namun data lama tersedia) → data tetap + notice.
- Success (data tersedia) → summary + overview.
- Online/Offline pada kartu device; NORMAL/WARNING/DANGER pada status sistem.
- Active/selected state: tidak ada seleksi elemen pada Dashboard; DeviceStatusCard dapat difokus (tabIndex 0) saat clickable.

### 2.8 Visual Design
- Typography: judul `text-2xl font-semibold tracking-tight`, label metrik mono uppercase tracking-widest, nilai metrik `text-3xl font-semibold`, mono untuk nilai teknis (waktu, id).
- Color: card pada `bg-surface/40`, teks `text-foreground`, label `text-muted-foreground`, tone status via token status (online/warning/danger).
- Spacing: antar-section `space-y-6`; dalam section `space-y-4`/`space-y-1`; grid `gap-4`.
- Border: `border border-border`, `border-t border-border` (pemisah dalam kartu).
- Radius: `rounded-control` (kartu indikator), token radius card untuk `Card`.
- Shadow: tidak ada shadow eksplisit pada kartu Dashboard.
- Icon: `HardDrive`, `Wifi`, `WifiOff` (lucide) dengan `aria-hidden`, dalam container `h-10 w-10 rounded-control` tone sesuai.
- Hierarchy: metrik besar di atas deskripsi; section heading `text-sm font-semibold` + deskripsi `text-xs`.

### 2.9 Responsive Behavior
- Grid metrik: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` (1 kolom mobile, 2 tablet, 3 desktop).
- Grid device: `grid gap-4 sm:grid-cols-2 xl:grid-cols-3` (1/2/3 kolom).
- PageHeader: `flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between` (actions pindah ke samping pada sm+).
- Indikator "Diperbarui" dan summary text memakai `flex-wrap`.

---

## 3. Monitoring

### 3.1 Page Overview
Halaman data sensor dan status sistem terkini satu device secara real-time. Device dipilih melalui selector; route `/monitoring` (belum pilih) dan `/monitoring/:deviceId` (device dari URL) berbagi komponen yang sama.

### 3.2 Layout Structure
- `PageHeader` — judul (nama device bila terpilih, atau "Monitoring" bila belum), meta (device_id), deskripsi, area aksi berisi `DeviceSelector`.
- Bila device belum dipilih: LoadingIndicator (saat daftar device dimuat) / ErrorState / EmptyState "Belum ada device" / EmptyState "Pilih device".
- Bila device terpilih: `MonitoringContent`:
  - `DeviceStatusCard` (atau skeleton saat loading).
  - Section "Latest Sensor Data": heading + deskripsi + (bila ada) StatusBadge sistem + waktu recorded_at; lalu `SensorGrid` (5 `SensorCard`) atau skeleton/empty/error.

### 3.3 Sections
- Device status.
- Latest Sensor Data (grid sensor).

### 3.4 Components
- `DeviceSelector` — label "Device" + `<select>` berisi daftar device (nilai = device_id, label = name); opsi aktif dari URL dipastikan tampil walau tidak ada di halaman 1 list. Menampilkan placeholder "Pilih device…". Saat error list device & list kosong → tombol "Muat ulang device".
- `DeviceStatusCard` — kartu status device (nama, id, status konektivitas, status sistem terkini, waktu relatif). Di sini `latestStatus` diisi dari `latest.status`.
- `SensorGrid` — grid `SensorCard` untuk 5 sensor: Suhu (Thermometer), Kelembapan (Droplets), Cahaya (Sun), Gerakan (Activity), Obstacle (Box). Boolean ditampilkan "Ada"/"Tidak"; numerik diformat id-ID + satuan.
- `SensorCard` — kartu nilai sensor (label mono, nilai `text-xl`, satuan mono).
- `SensorGridSkeleton`, `DeviceStatusSkeleton` — placeholder skeleton.
- `StatusBadge` — status sistem terkini + status konektivitas.
- `EmptyState` — saat device 404 ("Device tidak ditemukan") atau belum ada record sensor ("Belum ada data sensor").
- `ErrorState` — saat error jaringan/500 (dengan retry).
- Stale notice — "Gagal memperbarui data · menampilkan pembacaan terakhir {waktu relatif}" saat polling gagal namun data lama ada.

### 3.5 Data Visualization
- Sensor cards (5 nilai sensor dengan satuan).
- Status indicator (status sistem + status konektivitas).
- **Tidak ada chart/graph pada implementasi Monitoring** — file `Monitoring/MonitoringView.jsx` tidak mengimpor/menggunakan `Chart`. (FDD Bab 7.2 menyebut Chart sebagai komponen Monitoring; pada implementasi saat ini chart tidak ditemukan.)

### 3.6 Interactions
- Select device → navigasi ke `/monitoring/{device_id}` (state tercermin di URL).
- Polling otomatis data sensor terkini saat device aktif (`useLatestSensorData` default `POLLING_INTERVAL`).
- Retry via ErrorState.
- `DeviceStatusCard` pada Dashboard menuju halaman ini.

### 3.7 UI States
- Loading daftar device; loading detail device (skeleton); loading sensor (skeleton grid).
- Empty: belum pilih device; tidak ada device; device 404; device belum punya record (404 latest).
- Error: list device, detail device, sensor.
- Stale: polling gagal dengan data lama.
- Online/Offline (konektivitas); NORMAL/WARNING/DANGER (sistem).
- Active/selected: device terpilih tampil pada selector dan PageHeader (judul + meta).

### 3.8 Visual Design
- Typography: judul dari nama device; label selector mono uppercase; nilai sensor `text-xl font-semibold`; satuan mono.
- Color: sama dengan token global; tone status pada nilai sensor (default; boolean true/gerakan → default, false → muted).
- Spacing: `space-y-6` antar blok; sensor grid `gap-4`.
- Border: card `border border-border`, `border-t border-border` pada DeviceStatusCard.
- Radius: `rounded-control` untuk select/ikon.
- Icon: lucide per sensor, container `h-9 w-9 rounded-control bg-surface`.

### 3.9 Responsive Behavior
- SensorGrid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` (1/2/3/5 kolom).
- Selector: `h-8` select; PageHeader menyesuaikan (flex-col → flex-row pada sm+).
- Tidak ada tabel; tidak ada horizontal overflow eksplisit di luar komponen.

---

## 4. Historical Data

### 4.1 Page Overview
Halaman riwayat data sensor dan status sistem dalam rentang waktu yang dipilih (per device). Memadukan filter, line chart tren sensor, dan tabel rinci dengan pagination.

### 4.2 Layout Structure
- `PageHeader` ("Historical Data", meta "RIWAYAT", deskripsi).
- `HistoryFilters` (Card "Filter Riwayat"): select Device + input tanggal awal/akhir.
- Setelah filter lengkap & valid: section "Tren Sensor" (Card + line Chart) dan section "Detail Riwayat" (Card + DataTable + Pagination).
- Sebelum filter lengkap: EmptyState "Pilih device dan rentang waktu".
- Rentang tidak valid: EmptyState "Rentang waktu tidak valid".

### 4.3 Sections
- Filter Riwayat.
- Tren Sensor.
- Detail Riwayat.

### 4.4 Components
- `HistoryFilters` — Card dengan 3 kontrol: Device (select, placeholder "Pilih device…", opsi "device_id — name"), Tanggal Awal (input date, `max=endDate`), Tanggal Akhir (input date, `min=startDate`). Area error list device + tombol "Muat ulang".
- `Chart` — line chart 3 seri: Suhu (°C, #f97316), Kelembapan (% , #818cf8), Cahaya (lux, #22c55e). Sumbu X = waktu `HH:MM` (id-ID). Data = record halaman aktif (disebutkan di deskripsi Card dan JSDoc). `valueFormatter` = formatNumber id-ID.
- `DataTable` — tabel riwayat: Waktu (formatDateTime), Suhu, Kelembapan, Cahaya (angka kanan, mono), Gerakan/Obstacle (Ada/Tidak, tengah), Status (StatusBadge system). Skeleton saat loading.
- `Pagination` — bawah tabel, berdasarkan `meta`.
- `Skeleton` — placeholder chart `h-[280px]` saat loading.
- `EmptyState` / `ErrorState` / stale notice (sama pola).

### 4.5 Data Visualization
- Line chart (3 seri kontinu: suhu, kelembapan, cahaya) — satu-satunya chart yang digunakan aplikasi.
- Status indicator per baris tabel.
- ChartTooltip kustom: label mono, dot warna, nilai terformat id-ID.
- Catatan: chart menampilkan record halaman aktif (paginated), bukan seluruh rentang (dinyatakan pada deskripsi Card).

### 4.6 Interactions
- Select device, input tanggal (auto-apply; request berjalan hanya saat device + start + end terisi dan rentang valid).
- Pagination.
- Retry pada ErrorState.
- Perubahan filter me-reset halaman ke 1.

### 4.7 UI States
- Loading: skeleton chart + skeleton tabel.
- Empty: filter belum lengkap; rentang invalid; tidak ada data dalam rentang (200 kosong).
- Error: jaringan/500 (ErrorState + retry).
- Stale: error saat data lama ada → notice "Gagal memperbarui data · menampilkan data terakhir" + chart/table tetap tampil.
- Status per baris (NORMAL/WARNING/DANGER).

### 4.8 Visual Design
- Typography: tabel header mono uppercase; nilai angka mono; tanggal id-ID.
- Color: chart memakai palette token (primary/accent/normal); grid `#1f1f1f`, axis `#2a2a2a`, tick `#a1a1aa`.
- Spacing: `space-y-6` antar blok; CardContent `space-y-4`.
- Border: card `border border-border`.
- Radius: token card; bar chart radius `[3,3,0,0]`.
- Icon: CalendarDays pada EmptyState.

### 4.9 Responsive Behavior
- Filter grid: `sm:grid-cols-2 lg:grid-cols-3`.
- Chart responsif via `ResponsiveContainer` (width 100%, height tetap 280px).
- Tabel: `overflow-x-auto` (dari DataTable).

---

## 5. Alerts

### 5.1 Page Overview
Halaman riwayat kejadian WARNING dan DANGER beserta data sensor pemicunya. Memiliki daftar dengan filter + pagination dan panel detail (master-detail) yang terikat ke URL.

### 5.2 Layout Structure
- `PageHeader` ("Alerts", meta "ALERT", deskripsi).
- `AlertsContent` (grid master-detail):
  - Kolom utama: `AlertsFilters` (Card "Filter Alert") → [stale notice] → list (DataTable skeleton / ErrorState+ValidationDetails / EmptyState / DataTable+Pagination).
  - Kolom detail (bila `alertId` ada): `<aside>` sticky berisi `AlertDetailPanel`.

### 5.3 Sections
- Filter Alert.
- Daftar alert.
- Detail alert (panel).

### 5.4 Components
- `AlertsFilters` — Card: 4 kontrol (Device select, Status select `Semua`/WARNING/DANGER, Tanggal Awal, Tanggal Akhir) + pesan validasi inline ("Tanggal akhir harus sama dengan atau setelah tanggal awal", `role="alert"`) + error list device + retry.
- `DataTable` — kolom: ID (`#id` mono), Device (device_id), Status (StatusBadge system), Waktu Kejadian (formatDateTime). Baris clickable → detail.
- `Pagination` — meta pagination.
- `AlertDetailPanel` — Card: header "Alert Detail" + deskripsi "Kejadian #{id}" + tombol tutup (X). Isi: skeleton / EmptyState 404 ("Alert tidak ditemukan") / ErrorState / `AlertCard`.
- `AlertCard` — ringkasan alert: label "Alert · {device_id}", waktu triggered_at, StatusBadge, dan grid ringkasan 5 sensor pemicu (Suhu, Kelembapan, Cahaya, Gerakan, Obstacle) saat `sensor_data` ada.
- `ValidationDetails` — daftar pesan validasi dari `ApiError.details` (list disk).
- Shared states: LoadingIndicator tidak digunakan di Alerts (memakai skeleton DataTable); EmptyState, ErrorState dipakai.

### 5.5 Data Visualization
- Status indicator per baris (StatusBadge WARNING/DANGER).
- Ringkasan nilai sensor pada detail (format nilai + Ada/Tidak).
- Tidak ada chart.

### 5.6 Interactions
- Filter (device, status, rentang waktu) — auto-apply, reset page 1.
- Klik baris → `/alerts/{id}` (URL-driven).
- Tombol tutup detail → kembali `/alerts`.
- Pagination.
- Retry (list & detail).
- Direct navigation `/alerts/{id}` dirender SPA.

### 5.7 UI States
- Loading: skeleton tabel (list), skeleton panel (detail).
- Empty: "Belum ada alert" (tanpa filter) vs "Tidak ada alert yang sesuai dengan filter" (dengan filter).
- Error: jaringan/500 (ErrorState + retry); 404 detail → EmptyState "Alert tidak ditemukan"; 422 → ErrorState + ValidationDetails.
- Stale: `error && hasAlerts` → notice data terakhir.
- WARNING/DANGER status.

### 5.8 Visual Design
- Typography: label kontrol mono uppercase; ID kolom mono; waktu id-ID.
- Color: status warning (#f59e0b) / danger (#ef4444) pada badge; notice stale bg `status-danger/10`.
- Spacing: `space-y-6`; filter grid `gap-4`.
- Border: card `border border-border`.
- Radius: `rounded-control` pada kontrol; token card.
- Icon: BellRing (EmptyState), X (tutup detail), ChevronLeft/Right (pagination).

### 5.9 Responsive Behavior
- Master-detail: single column (< xl), `xl:grid-cols-[minmax(0,1fr)_360px]` dengan aside `xl:sticky xl:top-6 xl:self-start`.
- Filter grid: `sm:grid-cols-2 lg:grid-cols-4`.
- Tabel: `overflow-x-auto`.

---

## 6. Devices

### 6.1 Page Overview
Halaman daftar dan detail perangkat terdaftar (read-only): status konektivitas, waktu terakhir terlihat, dan timestamp metadata. Master-detail dengan URL.

### 6.2 Layout Structure
- `PageHeader` ("Devices", meta "DEVICE", deskripsi).
- `DevicesContent` (grid master-detail):
  - Kolom utama: `DeviceFilters` (Card "Filter Device") → [stale notice] → list (skeleton / ErrorState / EmptyState / DataTable+Pagination).
  - Kolom detail (bila `deviceId` ada): `<aside>` sticky berisi `DeviceDetailPanel`.

### 6.3 Sections
- Filter Device.
- Daftar device.
- Detail device (panel).

### 6.4 Components
- `DeviceFilters` — Card: satu kontrol Status (select `Semua`/Online/Offline). Layout grid 4 kolom (hanya terisi 1).
- `DataTable` — kolom: Device (device_id mono + name), Status (StatusBadge device), Terakhir Terlihat (formatDateTime). Baris clickable.
- `Pagination` — meta pagination.
- `DeviceDetailPanel` — Card: header "Device Detail" + deskripsi "Perangkat {id}" + tombol tutup (X). Isi: skeleton / EmptyState 404 ("Device tidak ditemukan") / ErrorState / detail: nama (+ device_id), StatusBadge, list timestamp (Terakhir Terlihat, Jarak Waktu, Terdaftar, Diperbarui) + tombol "Buka Monitoring".

### 6.5 Data Visualization
- Status indicator per baris & detail (StatusBadge online/offline).
- Tidak ada chart, tidak ada metric cards.

### 6.6 Interactions
- Filter status — auto-apply, reset page 1.
- Klik baris → `/devices/{device_id}` (URL-driven).
- Tombol tutup detail → `/devices`.
- Tombol "Buka Monitoring" → `/monitoring/{device_id}`.
- Pagination.
- Retry (list & detail).
- Direct navigation `/devices/{device_id}` dirender SPA.

### 6.7 UI States
- Loading: skeleton tabel (list), skeleton panel (detail).
- Empty: "Belum ada device terdaftar" (tanpa filter) vs "Tidak ada device yang sesuai dengan filter" (dengan filter).
- Error: jaringan/500 (ErrorState + retry); 404 detail → EmptyState "Device tidak ditemukan".
- Stale: `error && hasDevices` → notice data terakhir.
- Online/Offline.

### 6.8 Visual Design
- Typography: id device mono; label kontrol mono uppercase; tanggal id-ID.
- Color: badge online (#22c55e) / offline (#71717a).
- Spacing: `space-y-6`; filter grid `gap-4`.
- Border: card `border border-border`, `border-t` pada list detail.
- Radius: `rounded-control` kontrol; token card.
- Icon: Boxes (EmptyState), X (tutup), ExternalLink (Buka Monitoring), Chevron (pagination).

### 6.9 Responsive Behavior
- Master-detail: single column (< xl), `xl:grid-cols-[minmax(0,1fr)_360px]` dengan aside sticky.
- Filter grid: `sm:grid-cols-2 lg:grid-cols-4` (satu kontrol).
- Tabel: `overflow-x-auto`.

---

## 7. Shared Components

Komponen yang digunakan oleh lebih dari satu halaman.

### 7.1 Layout Components
| Nama | Digunakan | Fungsi visual |
|---|---|---|
| `AppLayout` | Seluruh route | Kerangka: sidebar (desktop persisten / drawer mobile), navbar, konten utama (max-w-7xl), scroll ke atas saat ganti route. |
| `Sidebar` | Seluruh halaman (via layout) | Navigasi utama, brand SIAGA / Zone Alpha, indikator aktif, footer versi. |
| `Navbar` | Seluruh halaman (via layout) | Breadcrumb "SIAGA / {Halaman}", tombol menu mobile. |
| `LoadingIndicator` | Dashboard, AppLayout (fallback Suspense) | Spinner sentral dengan label. |

Konsistensi: layout global tunggal, dipakai seluruh halaman. LoadingIndicator juga dipakai sebagai Suspense fallback di AppLayout.

### 7.2 Navigation Components
- `Sidebar` (via `NAVIGATION` di `config/navigation.js`): 5 item — Dashboard, Monitoring, Historical Data, Alerts, Devices — masing-masing dengan ikon lucide dan `NavLink` (active state: `bg-primary/15 text-primary` + bar accent kiri).
- `Navbar` breadcrumb + hamburger toggle (lg:hidden).
- Cross-page: navigasi antar halaman hanya melalui Sidebar; ada navigasi kontekstual via card/baris (Dashboard→Monitoring, Devices→Monitoring, Alerts detail).

### 7.3 Data Display Components
| Nama | Digunakan | Fungsi visual | Konsistensi |
|---|---|---|---|
| `DataTable` | Historical, Alerts, Devices | Tabel generik: header mono uppercase, sel kustom, skeleton rows saat loading, empty state, row click | Konsisten; definisi kolom per halaman |
| `Pagination` | Historical, Alerts, Devices | Kontrol halaman (prev/next + nomor + ellipsis) + info "Menampilkan x–y dari z" | Konsisten |
| `AlertCard` | Alerts (detail) | Ringkasan alert + sensor pemicu | Hanya di Alerts |
| `DeviceStatusCard` | Dashboard, Monitoring | Kartu status device (nama, id, konektivitas, sistem, last_seen) | Konsisten |
| `DashboardCard` | Dashboard | Kartu metrik besar | Hanya di Dashboard |
| `SensorCard` | Monitoring | Kartu nilai sensor | Hanya di Monitoring |

### 7.4 Form Components
Tidak ada form component khusus yang dibagikan. Kontrol form (select, input date) memakai elemen HTML native langsung pada masing-masing halaman dengan class utilitas `controlClass`/`labelClass` yang **diulang identik** pada `HistoricalData.jsx`, `Alerts.jsx`, dan `Devices.jsx` (string class yang sama: `h-9 w-full rounded-control border border-border bg-surface/40 px-3 font-mono text-sm ...`). `DeviceSelector` (Monitoring) memakai class select terpisah (`h-8`).

### 7.5 Status Components
| Nama | Digunakan | Fungsi visual |
|---|---|---|
| `StatusBadge` (kind system) | Dashboard, Monitoring, Historical, Alerts | Badge dot + label untuk NORMAL/WARNING/DANGER |
| `StatusBadge` (kind device) | Dashboard, Monitoring, Devices | Badge dot + label untuk online/offline |

Konsisten di seluruh halaman; variasi warna via `Badge` variants (`normal`, `warning`, `danger`, `online`, `offline`).

### 7.6 Visualization Components
| Nama | Digunakan | Fungsi visual |
|---|---|---|
| `Chart` | Historical Data | Wrapper Recharts (line/area/bar) dengan theming dark, tooltip kustom, legend mono |
| `ChartTooltip` | Historical Data (via Chart) | Tooltip kustom: label mono, dot warna, nilai id-ID |

Hanya dipakai di Historical Data pada implementasi saat ini (meskipun Chart mendukung line/area/bar dan didokumentasikan untuk Monitoring pada FDD).

### 7.7 Feedback Components
| Nama | Digunakan | Fungsi visual | Konsistensi |
|---|---|---|---|
| `EmptyState` | Semua halaman | Ikon + judul + deskripsi; teks bervariasi per konteks | Konsisten (ikon/konten bervariasi) |
| `ErrorState` | Semua halaman | Ikon (WifiOff/AlertCircle) + judul + pesan + kode/status HTTP + retry | Konsisten |
| `LoadingIndicator` | Dashboard, AppLayout | Spinner + label | — |
| `Skeleton` | Monitoring, Historical, Alerts, Devices | Placeholder pulse | Konsisten |

---

## 8. Cross-Page UI Patterns

Pola UI yang benar-benar ada dan muncul di lebih dari satu halaman:

- **Page Header pattern**: `PageHeader` — judul (h1), meta mono uppercase opsional, deskripsi, actions opsional. Dipakai di seluruh 5 halaman.
- **Card container pattern**: `Card` (`rounded-card border border-border bg-surface/40`) sebagai wadah utama — DashboardCard, SensorCard, DeviceStatusCard, AlertCard, filter card, chart card, table card, detail panel.
- **Filter card pattern**: `Card` + `CardHeader` (CardTitle "Filter ..." + CardDescription) + `CardContent` berisi kontrol dengan label mono uppercase dan class kontrol identik. Ada di Historical ("Filter Riwayat"), Alerts ("Filter Alert"), Devices ("Filter Device"). Monitoring memakai variant selector di PageHeader (bukan card).
- **Master-detail pattern**: grid `gap-6` + `xl:grid-cols-[minmax(0,1fr)_360px]` dengan detail di `<aside xl:sticky>` — Alerts dan Devices. Detail terikat URL.
- **Table + Pagination pattern**: `DataTable` (kolom per halaman) + `Pagination` bawah — Historical, Alerts, Devices.
- **Status indicator pattern**: `StatusBadge` (dot + label + warna) — system (NORMAL/WARNING/DANGER) dan device (online/offline) di seluruh halaman.
- **Empty state pattern**: `EmptyState` dengan pesan yang dibedakan antara "belum ada data sama sekali" dan "tidak ada data sesuai filter/rentang" — Dashboard, Monitoring, Historical, Alerts, Devices.
- **Error + retry pattern**: `ErrorState` dengan tombol "Coba lagi" (refetch) di seluruh halaman.
- **Stale notice pattern**: baris `role="status"` dengan `border-status-danger/30 bg-status-danger/10 font-mono text-xs` "menampilkan data terakhir" saat request gagal namun data lama tersedia — Dashboard, Monitoring, Historical, Alerts, Devices.
- **404 detail pattern**: detail resource tidak ditemukan → `EmptyState` (bukan ErrorState) — Monitoring ("Device tidak ditemukan"), Alerts ("Alert tidak ditemukan"), Devices ("Device tidak ditemukan").
- **Relative time pattern**: `formatRelativeTime` (mnt/jam/hari lalu) untuk last_seen_at / pembaruan — Dashboard, Monitoring, Devices.
- **Filter → reset page pattern**: setiap perubahan filter me-reset pagination ke halaman 1 — Historical, Alerts, Devices.
- **Boolean sensor display pattern**: motion/obstacle ditampilkan "Ada"/"Tidak" — Monitoring, Historical, Alerts.
- **id-ID formatting pattern**: `formatDateTime`/`formatNumber`/`formatSensorValue` dengan locale id-ID — seluruh halaman.

---

## 9. Cross-Page UI Consistency

- **Card structure**: konsisten — semua wadah utama memakai `Card` yang sama (`border-border`, `bg-surface/40`, `rounded-card`).
- **Status badge**: konsisten — `StatusBadge` dipakai untuk semua status; warna/kind konsisten antar halaman.
- **Spacing**: konsisten — antar-section selalu `space-y-6`; dalam konten `space-y-3`/`space-y-4`; grid `gap-4`; PageHeader `gap-4`.
- **Typography**: konsisten — font Inter (body/judul) dan JetBrains Mono (label/metadata/angka teknis) via token `--font-sans`/`--font-mono`; label kontrol mono uppercase `tracking-widest` identik di ketiga filter card.
- **Button**: konsisten — `Button` (variants primary/outline/ghost/danger; size sm/default/icon). Retry memakai `variant="outline"`, aksi utama memakai default/primary, ikon tombol memakai `size="icon"`/`size="sm"`.
- **Page header**: konsisten — `PageHeader` di seluruh halaman; meta label mono uppercase (Dashboard tanpa meta, Monitoring meta = device_id, Historical "RIWAYAT", Alerts "ALERT", Devices "DEVICE").
- **Filter control class**: konsisten — string class `controlClass`/`labelClass` diulang identik (duplikasi kode, bukan shared component) pada Historical/Alerts/Devices.
- **Empty/Error/Stale**: konsisten pola & teks (varian kecil pada pesan konteks).
- **Input control style**: konsisten (rounded-control, border-border, bg-surface/40, font-mono). Monitoring selector memakai tinggi `h-8` vs filter `h-9` (perbedaan minor).
- **Perbedaan yang dapat diamati**:
  - Dashboard & Monitoring memakai `LoadingIndicator` (spinner) untuk loading awal; Historical/Alerts/Devices memakai skeleton rows (DataTable) — dua pendekatan loading berbeda.
  - Dashboard metrik memakai `DashboardCard`; device ringkas memakai `DeviceStatusCard`; hanya Monitoring yang memakai `SensorCard`.
  - Filter Monitoring berbentuk selector di PageHeader; filter Historical/Alerts/Devices berbentuk Card di badan halaman.
  - Alerts & Devices memakai master-detail; Dashboard/Monitoring/Historical single-column (dengan grid kartu/table).

---

## 10. Current Frontend Inventory

### 10.1 Pages
- Dashboard (`/`) — `pages/Dashboard.jsx`
- Monitoring (`/monitoring`, `/monitoring/:deviceId`) — `pages/Monitoring.jsx`, `pages/MonitoringDetail.jsx`, `pages/Monitoring/MonitoringView.jsx`
- Historical Data (`/history`) — `pages/HistoricalData.jsx`
- Alerts (`/alerts`, `/alerts/:alertId`) — `pages/Alerts.jsx`
- Devices (`/devices`, `/devices/:deviceId`) — `pages/Devices.jsx`
- NotFound (`*`) — `pages/NotFound.jsx`

### 10.2 Layout Components
- `AppLayout` (shell: sidebar + navbar + main)
- `Sidebar` (brand, nav, footer versi)
- `Navbar` (breadcrumb, toggle menu)

### 10.3 Shared Components
- `PageHeader`
- `DataTable`
- `Pagination`
- `StatusBadge`
- `DashboardCard`
- `SensorCard`
- `DeviceStatusCard`
- `AlertCard`
- `Chart`
- `ChartTooltip`
- `EmptyState`
- `ErrorState`
- `LoadingIndicator`

### 10.4 Page-Specific Components
- Dashboard: `DashboardContent`
- Monitoring: `MonitoringView`, `DeviceSelector`, `SensorGrid`, `SensorGridSkeleton`, `DeviceStatusSkeleton`, `MonitoringContent`
- Historical Data: `HistoricalDataContent`, `HistoryFilters`, `HistoryResults`
- Alerts: `AlertsContent`, `AlertsFilters`, `AlertDetailPanel`, `ValidationDetails`
- Devices: `DevicesContent`, `DeviceFilters`, `DeviceDetailPanel`

### 10.5 Data Visualization
- Line chart (Chart/Recharts) — Historical Data: 3 seri (suhu, kelembapan, cahaya) dengan tooltip kustom dan legend.
- Chart wrapper mendukung line/area/bar (`Chart.jsx`), namun yang digunakan hanya line.
- Metric cards (DashboardCard) — Dashboard.
- Status indicators (StatusBadge) — semua halaman.
- Sensor value cards (SensorCard) — Monitoring.

### 10.6 Navigation
- Sidebar (5 item) dengan NavLink active state.
- Breadcrumb Navbar.
- Navigasi kontekstual: DeviceStatusCard → Monitoring (Dashboard); baris tabel → detail (Alerts, Devices); "Buka Monitoring" (Devices detail).
- React Router `createBrowserRouter` + lazy loading per page + Suspense fallback.

### 10.7 Forms and Controls
- Select (native): device selector (Monitoring), filter device/status (Historical/Alerts/Devices).
- Input date (native): Tanggal Awal/Akhir (Historical, Alerts).
- Button: primary/outline/ghost/danger, sizes sm/default/lg/icon.
- Tidak ada checkbox, radio, toggle, text input search, tabs, atau dropdown kustom.

### 10.8 Feedback and States
- Loading: `LoadingIndicator`, `Skeleton`, skeleton rows `DataTable`.
- Empty: `EmptyState` (beragam pesan konteks).
- Error: `ErrorState` (network vs HTTP, code, retry).
- Stale notice: baris peringatan data terakhir.
- 404: NotFound page (route) + EmptyState (resource detail).
- 422: `ValidationDetails` (Alerts) — daftar pesan validasi.
- Status: NORMAL/WARNING/DANGER, online/offline via `StatusBadge`.

---

## 11. Frontend Baseline Summary

- **Halaman yang tersedia (5)**: Dashboard, Monitoring, Historical Data, Alerts, Devices — plus NotFound. Monitoring, Alerts, Devices masing-masing memiliki route detail yang memakai komponen page yang sama.
- **Komponen utama**: PageHeader, Card (wadah), DataTable + Pagination (tabel), StatusBadge (status), DashboardCard/SensorCard/DeviceStatusCard/AlertCard (kartu), Chart + ChartTooltip (visualisasi), EmptyState/ErrorState/LoadingIndicator/Skeleton (feedback).
- **Visualisasi yang tersedia**: line chart (Historical Data), metric cards (Dashboard), status indicators, sensor value cards. Chart wrapper mendukung line/area/bar namun hanya line yang digunakan.
- **Shared component**: 13 shared components di `components/shared/` + 4 UI primitives (`Card`, `Button`, `Badge`, `Skeleton`) + 3 layout components. Semua dipakai lintas halaman.
- **Pattern UI yang digunakan di seluruh aplikasi**: page header konsisten; card container konsisten; filter card (Historical/Alerts/Devices); master-detail (Alerts/Devices); table + pagination; status badge (dot+label+warna); empty/error/stale states dengan pola identik; 404 detail → EmptyState; filter reset halaman; format id-ID; boolean sensor → "Ada"/"Tidak".
- **Struktur umum frontend saat ini**: 
  - Entry `main.jsx` → `App` (createBrowserRouter, lazy pages, Suspense) → `AppLayout` (Sidebar + Navbar + main). Semua halaman dirender dalam satu shell.
  - Tiap page = default export (container: hooks + state + PageHeader) + named export presentational (`*Content`) yang dipisahkan untuk verifikasi statis (SSR smoke). Komponen khusus halaman didefinisikan internal (bukan folder per page, kecuali Monitoring yang memiliki `Monitoring/MonitoringView.jsx`).
  - Data diakses via services (axios, envelope `{success,data,meta}` dinormalisasi di interceptor) dan hooks server-state (`usePolling`/`useApiResource`; polling aktif di Dashboard & Monitoring, one-shot di Historical/Alerts/Devices).
  - Design system di `index.css` (`@theme`): palet dark (primary orange #f97316, accent indigo #818cf8, background #0f0f0f, surface #2a2a2a), font Inter + JetBrains Mono, radius card/control 8px & pill, status colors internal. Seluruh halaman memakai token ini.
  - Layout responsif: grid breakpoint sm/lg/xl; sidebar drawer mobile (< lg); master-detail hanya pada xl.
