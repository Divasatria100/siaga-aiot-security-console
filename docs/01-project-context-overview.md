# SIAGA Project Context & Overview

---

## 1. Project Information

**Project Name**
SIAGA: ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment

**Description**
SIAGA adalah konsol keamanan adaptif berbasis ESP32 yang menggabungkan sensor suhu, kelembapan, gerakan, cahaya, dan obstacle untuk menilai ancaman secara lokal menggunakan Rule-Based Decision Engine. Sistem menghasilkan status NORMAL, WARNING, dan DANGER melalui indikator LED dan buzzer. Pengembangan selanjutnya mencakup integrasi WiFi, Laravel REST API, PostgreSQL + TimescaleDB, React Dashboard untuk monitoring real-time, serta peluang ekspansi ke MQTT, AI Anomaly Detection, dan fitur Industrial IoT lainnya.

**Project Type**
Mini Industrial IoT Monitoring Platform

**Document Purpose**
Dokumen ini berfungsi sebagai fondasi kontekstual proyek SIAGA yang akan menjadi rujukan utama dalam penyusunan dokumen turunan berikutnya, yaitu Software Requirements Specification (SRS), Software Architecture Document (SAD), Database Design Document (DDD), API Specification, dan AI Design Document.

---

## 2. Background

Perkembangan teknologi Internet of Things (IoT) telah mendorong kebutuhan akan sistem keamanan dan keselamatan yang tidak hanya bersifat reaktif, tetapi juga adaptif terhadap kondisi lingkungan secara real-time. Sistem keamanan konvensional umumnya hanya mengandalkan satu jenis sensor dan logika deteksi yang sederhana, sehingga rentan terhadap false positive maupun keterlambatan respons terhadap kondisi berbahaya.

SIAGA dikembangkan sebagai jawaban atas kebutuhan tersebut, yaitu sebuah konsol keamanan berbasis ESP32 yang mampu melakukan penilaian ancaman secara lokal (edge processing) menggunakan kombinasi beberapa sensor sekaligus. Pendekatan multi-sensor ini memungkinkan sistem untuk mengambil keputusan yang lebih akurat dibandingkan sistem berbasis sensor tunggal.

Proyek ini tidak dirancang sebagai sekadar proyek pembacaan sensor sederhana, melainkan sebagai fondasi dari sebuah **Mini Industrial IoT Monitoring Platform** yang mengintegrasikan Embedded System, IoT connectivity, Industrial Software Architecture, REST API, Time-Series Database, Human Machine Interface (HMI), Real-Time Monitoring, Rule-Based Decision Engine, hingga Future AI Integration.

---

## 3. Problem Statement

Beberapa permasalahan yang melatarbelakangi pengembangan SIAGA adalah sebagai berikut:

1. Sistem keamanan berbasis sensor tunggal cenderung menghasilkan keputusan yang kurang akurat karena tidak mempertimbangkan korelasi antar kondisi lingkungan.
2. Belum tersedianya sistem monitoring keamanan skala kecil-menengah yang mampu melakukan pengambilan keputusan secara lokal (on-device decision making) tanpa bergantung sepenuhnya pada koneksi internet atau server pusat.
3. Minimnya integrasi antara perangkat embedded dengan sistem backend modern yang mendukung REST API, penyimpanan data time-series, serta visualisasi dashboard secara real-time.
4. Belum adanya arsitektur yang dirancang secara modular sehingga sulit untuk dikembangkan lebih lanjut ke arah integrasi AI, komunikasi MQTT, maupun ekspansi ke perangkat Industrial IoT lainnya.

---

## 4. Proposed Solution

SIAGA menawarkan solusi berupa konsol keamanan adaptif yang menggabungkan beberapa komponen utama:

- **Multi-Sensor Data Acquisition**: pembacaan data dari sensor suhu, kelembapan, gerakan, cahaya, dan obstacle secara simultan.
- **Rule-Based Decision Engine**: mesin pengambilan keputusan berbasis aturan yang mengevaluasi kombinasi nilai sensor untuk menentukan status ancaman.
- **Finite State Machine (FSM)**: pengelolaan transisi status sistem (NORMAL, WARNING, DANGER) secara terstruktur dan predictable.
- **Local Output Indicators**: notifikasi status melalui OLED, LED, dan buzzer sebagai bentuk respons langsung di sisi perangkat.
- **Cloud & Dashboard Integration**: pengiriman data melalui REST API ke backend Laravel, disimpan pada PostgreSQL dengan ekstensi TimescaleDB, dan divisualisasikan melalui React Dashboard secara real-time.
- **Extensible Architecture**: dirancang agar dapat dikembangkan lebih lanjut menuju integrasi AI Anomaly Detection, komunikasi MQTT, LoRa, serta kebutuhan Industrial IoT lainnya di fase-fase berikutnya.

---

## 5. Objectives

Tujuan utama pengembangan SIAGA adalah:

1. Membangun sistem keamanan adaptif berbasis ESP32 yang mampu melakukan threat assessment menggunakan multiple sensor input.
2. Mengimplementasikan Rule-Based Decision Engine yang dikombinasikan dengan Finite State Machine untuk pengelolaan status sistem yang jelas dan terstruktur.
3. Menyediakan indikator output lokal (OLED, LED, buzzer, relay) yang responsif terhadap perubahan status ancaman.
4. Membangun integrasi end-to-end antara perangkat embedded dengan backend Laravel, database PostgreSQL + TimescaleDB, dan dashboard React.
5. Merancang arsitektur sistem yang modular, scalable, dan maintainable sehingga siap untuk pengembangan lanjutan berbasis AI dan Industrial IoT.
6. Menyediakan fondasi dokumentasi teknis yang lengkap sebagai dasar penyusunan dokumen SRS, SAD, DDD, API Specification, dan AI Design Document.

---

## 6. Scope

Lingkup pengembangan SIAGA pada tahap Minimum Viable Product (MVP) mencakup:

- Pembacaan data dari sensor suhu, kelembapan, gerakan, cahaya, dan obstacle menggunakan ESP32.
- Implementasi Rule-Based Decision Engine untuk menentukan status NORMAL, WARNING, dan DANGER.
- Implementasi Finite State Machine untuk mengelola transisi status sistem.
- Output lokal melalui OLED display, LED indicator, dan buzzer.
- Konektivitas WiFi untuk pengiriman data ke backend.
- Implementasi REST API menggunakan Laravel sebagai penghubung antara perangkat dan sistem backend.
- Penyimpanan data sensor dan status sistem pada PostgreSQL dengan ekstensi TimescaleDB untuk kebutuhan time-series.
- Pengembangan React Dashboard untuk monitoring data secara real-time.

---

## 7. Out of Scope

Hal-hal berikut tidak termasuk dalam scope pengembangan pada tahap MVP dan merupakan bagian dari roadmap pengembangan lanjutan:

- Implementasi AI Anomaly Detection menggunakan LSTM Autoencoder atau model machine learning lainnya.
- Komunikasi berbasis protokol MQTT.
- Integrasi komunikasi jarak jauh menggunakan LoRa.
- Fitur Over-The-Air (OTA) update firmware.
- Predictive Analytics dan fitur-fitur Industrial IoT lanjutan lainnya.
- Integrasi multi-device atau multi-node monitoring dalam skala besar.

---

## 8. Target Users

- **Individual/Home Users**: pengguna yang membutuhkan sistem keamanan adaptif untuk lingkungan rumah atau ruangan pribadi.
- **Small-Scale Facility Operators**: pengelola fasilitas kecil-menengah yang membutuhkan monitoring kondisi lingkungan secara real-time.
- **IoT Developers & Researchers**: pengembang maupun akademisi yang membutuhkan referensi implementasi Mini Industrial IoT Monitoring Platform.
- **Industrial IoT Enthusiasts**: pihak yang tertarik pada pengembangan sistem embedded yang dapat diperluas menuju kebutuhan Industrial IoT.

---

## 9. Technology Stack

### Embedded
- ESP32
- Arduino Framework
- FreeRTOS
- WiFi
- HTTPClient
- ArduinoJson
- U8g2
- Preferences
- Bounce2

### Backend
- Laravel 12
- PHP 8.3
- REST API

### Database
- PostgreSQL
- TimescaleDB

### Frontend
- React
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts

### Communication
- HTTP REST API
- WebSocket

---

## 10. Hardware Components

Komponen hardware yang digunakan pada perangkat SIAGA meliputi:

- **ESP32 Development Board**: sebagai microcontroller utama yang menjalankan Rule-Based Decision Engine dan Finite State Machine.
- **Sensor Suhu dan Kelembapan**: untuk mendeteksi kondisi lingkungan terkait suhu dan kelembapan udara.
- **Sensor Gerakan (Motion Sensor)**: untuk mendeteksi adanya pergerakan pada area yang dimonitor.
- **Sensor Cahaya (Light Sensor)**: untuk mendeteksi tingkat intensitas cahaya di lingkungan sekitar.
- **Sensor Obstacle**: untuk mendeteksi keberadaan objek penghalang pada jarak tertentu.
- **OLED Display**: sebagai media penampil status sistem secara langsung pada perangkat.
- **LED Indicator**: sebagai indikator visual status NORMAL, WARNING, dan DANGER.
- **Buzzer**: sebagai indikator audio untuk kondisi WARNING dan DANGER.
- **Relay Module**: sebagai aktuator output yang dapat digunakan untuk mengendalikan perangkat eksternal berdasarkan status sistem.

---

## 11. Software Stack

Software Stack SIAGA terbagi ke dalam beberapa lapisan (layer) sesuai dengan Layered Architecture yang diterapkan:

- **Embedded Layer**: firmware berbasis Arduino Framework dengan dukungan FreeRTOS untuk task scheduling, serta library pendukung seperti ArduinoJson untuk parsing data, U8g2 untuk kontrol OLED display, Preferences untuk penyimpanan konfigurasi non-volatile, dan Bounce2 untuk debouncing input digital.
- **Backend Layer**: dibangun menggunakan Laravel 12 dengan PHP 8.3 yang menyediakan REST API sebagai penghubung antara perangkat embedded dan sistem penyimpanan data.
- **Database Layer**: menggunakan PostgreSQL sebagai relational database dengan ekstensi TimescaleDB untuk menangani data time-series dari sensor secara efisien.
- **Frontend Layer**: dibangun menggunakan React dengan Vite sebagai build tool, Tailwind CSS untuk styling, shadcn/ui sebagai component library, dan Recharts untuk visualisasi data dalam bentuk grafik pada dashboard.
- **Communication Layer**: menggunakan HTTP REST API sebagai metode komunikasi utama, dengan WebSocket sebagai opsi untuk kebutuhan komunikasi real-time pada pengembangan lanjutan.

---

## 12. High-Level Architecture (Description)

Alur arsitektur sistem SIAGA secara high-level dapat digambarkan sebagai berikut:

```
Sensor Input
    ↓
Rule-Based Decision Engine
    ↓
Finite State Machine
    ↓
Output (OLED, LED, Buzzer, Relay)
    ↓
REST API
    ↓
Laravel Backend
    ↓
PostgreSQL + TimescaleDB
    ↓
React Dashboard
```

**Penjelasan Alur:**

1. **Sensor Input**: ESP32 melakukan pembacaan data secara berkala dari sensor suhu, kelembapan, gerakan, cahaya, dan obstacle.
2. **Rule-Based Decision Engine**: data sensor yang telah dibaca kemudian dievaluasi menggunakan sekumpulan aturan (rules) untuk menentukan tingkat ancaman yang terjadi.
3. **Finite State Machine**: hasil evaluasi dari Decision Engine digunakan untuk mengelola transisi status sistem antara NORMAL, WARNING, dan DANGER secara terstruktur dan konsisten.
4. **Output**: status sistem yang telah ditentukan kemudian ditampilkan melalui OLED display, diindikasikan melalui LED, buzzer, dan dapat mengaktifkan relay sebagai aktuator eksternal.
5. **REST API**: data sensor dan status sistem dikirimkan dari ESP32 menuju backend melalui komunikasi REST API berbasis HTTP.
6. **Laravel Backend**: menerima, memvalidasi, dan memproses data yang dikirimkan oleh perangkat sebelum disimpan ke database.
7. **PostgreSQL + TimescaleDB**: menyimpan data sensor dan status sistem dalam format time-series untuk mendukung query historis dan analisis data jangka panjang.
8. **React Dashboard**: menampilkan data secara real-time dalam bentuk visualisasi grafik dan status kepada pengguna melalui antarmuka berbasis web.

Perlu ditegaskan bahwa komponen **AI, MQTT, dan LoRa merupakan bagian dari roadmap pengembangan lanjutan** dan **bukan merupakan bagian dari MVP** pada tahap pengembangan saat ini.

---

## 13. Future AI Architecture

Pada fase pengembangan lanjutan, SIAGA direncanakan untuk mengintegrasikan **Adaptive Threat Intelligence Engine** sebagai bentuk peningkatan kemampuan sistem dari Rule-Based Decision Engine menuju pendekatan berbasis AI. Arsitektur AI ini terdiri dari beberapa komponen berikut:

- **Time-Series Preprocessing**: tahap pembersihan dan normalisasi data sensor time-series sebelum diproses lebih lanjut, termasuk penanganan missing values dan noise reduction.
- **Feature Engineering**: proses ekstraksi fitur-fitur relevan dari data time-series yang telah diproses, sebagai representasi input bagi model AI.
- **Sliding Window Generator**: mekanisme pembentukan window data secara berurutan untuk merepresentasikan pola temporal dari data sensor.
- **LSTM Autoencoder**: model deep learning berbasis Long Short-Term Memory yang digunakan untuk mempelajari pola normal dari data sensor dan mendeteksi anomali berdasarkan reconstruction error.
- **Threat Scoring**: proses konversi hasil deteksi anomali menjadi skor ancaman yang dapat diinterpretasikan oleh sistem maupun pengguna.
- **Adaptive Alert Generator**: komponen yang menghasilkan alert secara adaptif berdasarkan threat scoring, dengan mempertimbangkan konteks dan histori data sebelumnya.
- **Dashboard Visualization**: penyajian hasil threat scoring dan alert dari AI Engine ke dalam React Dashboard agar dapat dipantau oleh pengguna secara real-time.

Perlu ditekankan bahwa **Adaptive Threat Intelligence Engine ini akan diimplementasikan pada fase pengembangan berikutnya (Phase 6)** dan belum menjadi bagian dari MVP SIAGA saat ini.

---

## 14. Development Roadmap

- **Phase 1 — Embedded Foundation**: pengembangan firmware dasar ESP32, integrasi sensor, implementasi Rule-Based Decision Engine, dan Finite State Machine beserta output lokal (OLED, LED, buzzer).
- **Phase 2 — IoT Connectivity**: integrasi konektivitas WiFi pada perangkat serta persiapan komunikasi data menuju backend.
- **Phase 3 — Backend Development**: pengembangan REST API menggunakan Laravel 12 dan PHP 8.3, serta perancangan skema database pada PostgreSQL + TimescaleDB.
- **Phase 4 — Dashboard Development**: pengembangan antarmuka React Dashboard menggunakan Vite, Tailwind CSS, shadcn/ui, dan Recharts untuk visualisasi data.
- **Phase 5 — Real-Time Communication**: peningkatan komunikasi data antara perangkat, backend, dan dashboard agar mendukung pembaruan data secara real-time, termasuk eksplorasi penggunaan WebSocket.
- **Phase 6 — Advanced Features**: pengembangan fitur lanjutan yang mencakup AI Anomaly Detection (Adaptive Threat Intelligence Engine), komunikasi MQTT, integrasi LoRa, fitur Over-The-Air (OTA) update, Predictive Analytics, dan kebutuhan Industrial IoT lainnya.

---

## 15. Design Principles

Pengembangan SIAGA berpedoman pada prinsip-prinsip desain berikut:

- **Modular Architecture**: setiap komponen sistem dirancang secara modular agar dapat dikembangkan dan dipelihara secara independen.
- **Separation of Concerns**: pemisahan tanggung jawab yang jelas antara embedded layer, backend layer, database layer, dan frontend layer.
- **Layered Architecture**: penerapan arsitektur berlapis untuk memastikan setiap layer memiliki fungsi dan batasan tanggung jawab yang jelas.
- **Scalability**: sistem dirancang agar mampu menangani penambahan jumlah sensor, perangkat, maupun volume data di masa mendatang.
- **Maintainability**: struktur kode dan arsitektur disusun agar mudah dipahami, diperbaiki, dan dikembangkan lebih lanjut.
- **Extensibility**: sistem dirancang agar mudah diperluas dengan fitur-fitur baru tanpa mengubah struktur inti secara signifikan.
- **Clean Code**: penerapan standar penulisan kode yang bersih, konsisten, dan mudah dibaca pada seluruh layer pengembangan.
- **Future AI Ready**: arsitektur sistem dirancang agar siap diintegrasikan dengan Adaptive Threat Intelligence Engine pada fase pengembangan lanjutan.
- **Future Multi-Device Ready**: sistem dirancang dengan mempertimbangkan kemungkinan ekspansi menuju monitoring multi-device di masa mendatang.

---

## 16. Repository Structure

Struktur repository tingkat tinggi SIAGA dirancang untuk memisahkan setiap komponen utama sistem sebagai berikut:

```
siaga-project/
├── embedded/
│   ├── src/
│   ├── lib/
│   └── platformio.ini / sketch.ino
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── config/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── public/
│
├── ai-service/            # Future
│   ├── preprocessing/
│   ├── models/
│   └── inference/
│
└── documentation/
    ├── SIAGA_Project_Context_Overview.md
    ├── SRS.md
    ├── SAD.md
    ├── DDD.md
    ├── API_Specification.md
    └── AI_Design_Document.md
```

---

## 17. Glossary

| Istilah | Penjelasan |
|---|---|
| **SIAGA** | Nama proyek sistem keamanan adaptif berbasis ESP32 dengan kemampuan multi-sensor threat assessment. |
| **ESP32** | Microcontroller yang digunakan sebagai otak utama perangkat embedded SIAGA. |
| **Rule-Based Decision Engine** | Mekanisme pengambilan keputusan berdasarkan sekumpulan aturan logika untuk menentukan status ancaman. |
| **Finite State Machine (FSM)** | Model komputasi yang digunakan untuk mengelola transisi status sistem secara terstruktur. |
| **REST API** | Arsitektur antarmuka pemrograman berbasis HTTP yang menghubungkan embedded device dengan backend. |
| **TimescaleDB** | Ekstensi PostgreSQL yang dioptimalkan untuk penyimpanan dan query data time-series. |
| **HMI (Human Machine Interface)** | Antarmuka yang menjembatani interaksi antara pengguna dengan sistem, dalam hal ini direpresentasikan oleh OLED display dan React Dashboard. |
| **LSTM Autoencoder** | Model deep learning berbasis Long Short-Term Memory yang digunakan untuk deteksi anomali pada data time-series. |
| **Threat Scoring** | Proses konversi hasil analisis data menjadi skor tingkat ancaman yang terukur. |
| **MQTT** | Protokol komunikasi message-based yang direncanakan untuk digunakan pada fase pengembangan lanjutan. |
| **LoRa** | Teknologi komunikasi nirkabel jarak jauh dengan konsumsi daya rendah, direncanakan untuk fase pengembangan lanjutan. |
| **OTA (Over-The-Air) Update** | Mekanisme pembaruan firmware perangkat secara nirkabel tanpa koneksi fisik langsung. |
| **MVP (Minimum Viable Product)** | Versi awal produk dengan fitur inti minimum yang layak untuk dirilis dan diuji. |
