# SIAGA Embedded

## Purpose

Folder `embedded/` berisi seluruh kode firmware ESP32 untuk sistem SIAGA (ESP32-Based Adaptive Security and Safety Console). Dokumen ini merupakan **aturan kerja resmi** untuk pengembangan embedded system SIAGA, dengan tujuan utama:

- Menjaga firmware **baseline** yang sudah terbukti berhasil di-upload dan berjalan dengan baik di hardware agar tetap stabil dan tidak berubah.
- Memberikan area kerja yang jelas untuk pengembangan firmware berikutnya tanpa mengganggu baseline.
- Mencegah AI/developer berikutnya secara tidak sengaja mengubah, me-refactor, atau menghapus firmware baseline yang sudah stabil.

---

## Embedded Structure

```
embedded/
├── README.md
├── baseline/
│   └── [firmware existing — sudah diuji & berjalan di hardware]
│
└── development/
    └── [pengembangan firmware berikutnya]
```

- `baseline/` — firmware referensi yang sudah stabil. **READ-ONLY.**
- `development/` — satu-satunya area untuk perubahan, eksperimen, dan pengembangan firmware baru.

---

## Baseline

`embedded/baseline/` berisi firmware ESP32 yang:

- Sudah berhasil di-upload ke perangkat.
- Sudah terbukti bekerja dengan baik pada hardware yang sebenarnya.
- Berfungsi sebagai **titik referensi (reference point)** dan **fallback** apabila pengembangan pada `development/` mengalami masalah atau kegagalan.

### Aturan READ-ONLY

Semua file di dalam `embedded/baseline/` **tidak boleh diubah dengan cara apa pun**. Secara spesifik, AI/developer:

- ❌ Tidak boleh mengubah file.
- ❌ Tidak boleh melakukan refactor.
- ❌ Tidak boleh mengganti pin.
- ❌ Tidak boleh mengganti library.
- ❌ Tidak boleh mengubah logic sensor.
- ❌ Tidak boleh menambahkan fitur langsung ke baseline.
- ❌ Tidak boleh menghapus atau memindahkan file baseline.

Jika suatu perubahan dibutuhkan, perubahan tersebut **harus dilakukan di `embedded/development/`**, bukan di `baseline/`.

### Alasan Baseline Tidak Boleh Diubah

- Baseline adalah satu-satunya firmware yang sudah tervalidasi berjalan di hardware nyata.
- Baseline menjadi titik fallback yang aman apabila proses development menghasilkan firmware yang tidak stabil atau gagal di-upload/berjalan.
- Menjaga baseline tetap utuh memastikan tim selalu memiliki versi kerja yang dapat diandalkan, terlepas dari status pengembangan yang sedang berjalan.

---

## Development

`embedded/development/` adalah **satu-satunya area pengembangan** untuk firmware SIAGA.

### Lokasi Pengembangan

Seluruh firmware baru, refactoring, eksperimen, integrasi komunikasi, dan perubahan kode harus dilakukan di dalam `embedded/development/`.

Contoh arah pengembangan yang **mungkin** dilakukan di masa mendatang (belum tentu sudah diimplementasikan):

- Modularisasi sensor
- Konfigurasi hardware
- Komunikasi LoRa
- Komunikasi WiFi
- Telemetry
- Integrasi gateway
- Format payload sensor
- Error handling
- Power management

> Catatan: Daftar di atas adalah kemungkinan arah pengembangan, **bukan** klaim bahwa fitur-fitur tersebut sudah ada atau sedang berjalan.

### Aturan Perubahan

- Semua perubahan kode embedded dilakukan di `development/`, tidak pernah langsung di `baseline/`.
- Firmware hasil development harus melalui tahap testing dan validasi hardware sebelum dianggap sebagai kandidat pengganti/pelengkap baseline (lihat Embedded Development Workflow).
- Perubahan terhadap spesifikasi hardware (pin, board, sensor, tegangan, dll.) tidak boleh dilakukan tanpa dokumentasi/approval yang jelas.

---

## IoT Hardware

> Bagian ini akan dilengkapi berdasarkan dokumen hardware/IoT yang akan diberikan secara terpisah. Sesuai aturan proyek, spesifikasi hardware **tidak boleh dikarang** — data berikut disusun hanya dari deskripsi komponen level-tinggi yang sudah tersedia di dokumen `01-project-context-overview.md`. Detail teknis (model spesifik, GPIO/pin, tegangan, protokol komunikasi, library per-komponen) masih **TBD** sampai dokumen hardware terpisah diberikan.

| Perangkat | Fungsi | Model/Spesifikasi Teknis |
|---|---|---|
| ESP32 Development Board | Microcontroller utama yang menjalankan Rule-Based Decision Engine dan Finite State Machine | TBD |
| Sensor Suhu dan Kelembapan | Mendeteksi kondisi lingkungan terkait suhu dan kelembapan udara | TBD |
| Sensor Gerakan (Motion Sensor) | Mendeteksi adanya pergerakan pada area yang dimonitor | TBD |
| Sensor Cahaya (Light Sensor) | Mendeteksi tingkat intensitas cahaya di lingkungan sekitar | TBD |
| Sensor Obstacle | Mendeteksi keberadaan objek penghalang pada jarak tertentu | TBD |
| OLED Display | Media penampil status sistem secara langsung pada perangkat | TBD |
| LED Indicator | Indikator visual status NORMAL, WARNING, dan DANGER | TBD |
| Buzzer | Indikator audio untuk kondisi WARNING dan DANGER | TBD |
| Relay Module | Aktuator output untuk mengendalikan perangkat eksternal berdasarkan status sistem | TBD |

*Informasi GPIO/pin, tegangan kerja, protokol komunikasi antar-komponen, dan library spesifik per-perangkat: **belum tersedia — TBD.***

---

## Development Rules

- Firmware **baseline** di `embedded/baseline/` tidak boleh diubah, direfactor, atau dihapus dengan cara apa pun.
- `embedded/development/` adalah satu-satunya area yang sah untuk perubahan, eksperimen, dan pengembangan firmware baru.
- Perubahan terhadap hardware specification (pin, board, sensor, tegangan, protokol, library) tidak boleh dilakukan tanpa dokumentasi/approval yang jelas.
- Jangan mengasumsikan atau mengarang spesifikasi hardware yang belum terdokumentasi; gunakan `TBD` apabila informasi belum tersedia.

---

## Embedded Development Workflow

```
Baseline
   ↓
Development
   ↓
Testing
   ↓
Hardware Validation
   ↓
Approved Firmware
```

## Architecture 
┌─────────────────────┐
│     CONFIGURATION   │
│ Pins / Threshold /  │
│ Timing / Frequency  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│    SENSOR STATE     │
│ SensorData struct   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│    SENSOR READING   │
│ readDHT()           │
│ readPIR()           │
│ readLDR()           │
│ readObstacle()      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   SYSTEM LOGIC      │
│ updateSystemStatus()│
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   OUTPUT CONTROL    │
│ LED + Buzzer        │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ SERIAL MONITORING   │
└─────────────────────┘