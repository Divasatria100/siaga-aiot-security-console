# SIAGA Software Requirements Specification (SRS)

**Project Name:** SIAGA — ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment
**Document Type:** Software Requirements Specification (SRS)
**Reference Document:** SIAGA Project Context & Overview
**Status:** Draft v1.0

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini disusun untuk mendefinisikan kebutuhan fungsional dan non-fungsional dari sistem SIAGA secara rinci, jelas, dan dapat diuji (testable), sebagai turunan langsung dari dokumen *SIAGA Project Context & Overview*. Dokumen SRS ini bertujuan untuk:

- Menetapkan kebutuhan sistem (system requirements) yang menjadi acuan bagi tim pengembang Embedded, Backend, Database, dan Frontend.
- Menjadi dasar bagi penyusunan dokumen turunan berikutnya, yaitu Software Architecture Document (SAD), Database Design Document (DDD), API Specification, dan Test Plan.
- Memastikan bahwa seluruh pihak yang terlibat (stakeholders) memiliki pemahaman yang sama mengenai lingkup dan batasan sistem yang akan dibangun pada tahap Minimum Viable Product (MVP).

### 1.2 Scope

SRS ini mencakup kebutuhan sistem SIAGA pada tahap MVP, yaitu sistem konsol keamanan adaptif berbasis ESP32 yang melakukan multi-sensor threat assessment menggunakan Rule-Based Decision Engine dan Finite State Machine (FSM), dengan output lokal (OLED, LED, buzzer, relay), konektivitas WiFi, integrasi REST API ke backend Laravel, penyimpanan data pada PostgreSQL + TimescaleDB, dan visualisasi melalui React Dashboard.

Fitur-fitur yang berada pada roadmap pengembangan lanjutan (Phase 6), yaitu AI Anomaly Detection (Adaptive Threat Intelligence Engine), komunikasi MQTT, integrasi LoRa, fitur Over-The-Air (OTA) update, Predictive Analytics, dan multi-device monitoring skala besar, **tidak termasuk dalam scope MVP** dan dijelaskan secara terpisah pada Bab 8 — Future Development sebagai referensi kontekstual, bukan sebagai kebutuhan yang wajib dipenuhi pada tahap ini.

### 1.3 Intended Audience

| Peran | Kepentingan terhadap Dokumen |
|---|---|
| **Embedded Developer** | Memahami kebutuhan fungsional terkait sensor, Decision Engine, FSM, dan output lokal. |
| **Backend Developer** | Memahami kebutuhan REST API, validasi data, dan integrasi dengan database. |
| **Database Engineer** | Memahami kebutuhan penyimpanan data time-series sebagai dasar penyusunan DDD. |
| **Frontend Developer** | Memahami kebutuhan dashboard monitoring dan visualisasi data real-time. |
| **System Analyst / Requirements Engineer** | Memvalidasi kelengkapan dan konsistensi requirement terhadap Project Context & Overview. |
| **Quality Assurance / Tester** | Menyusun Test Plan berdasarkan Acceptance Criteria yang didefinisikan pada dokumen ini. |
| **Project Stakeholder** | Memahami ruang lingkup dan batasan sistem yang akan dikembangkan. |

### 1.4 Definitions, Acronyms, and Abbreviations

Definisi istilah teknis, akronim, dan singkatan yang digunakan pada dokumen ini mengacu pada Glossary yang telah ditetapkan pada dokumen *SIAGA Project Context & Overview*. Daftar lengkap disajikan kembali pada Bab 10 — Glossary dokumen ini untuk memudahkan pembacaan.

### 1.5 References

1. *SIAGA Project Context & Overview* (dokumen rujukan utama/single source of truth).
2. Dokumen turunan yang akan disusun berdasarkan SRS ini: Software Architecture Document (SAD), Database Design Document (DDD), API Specification, Test Plan, dan AI Design Document.

---

## 2. Overall Description

### 2.1 Product Perspective

SIAGA merupakan produk baru (standalone product) yang dikembangkan sebagai **Mini Industrial IoT Monitoring Platform**. Sistem terdiri atas empat layer utama yang saling terintegrasi sesuai Layered Architecture yang telah ditetapkan pada dokumen referensi:

- **Embedded Layer** (ESP32, Arduino Framework, FreeRTOS) — melakukan akuisisi data sensor dan threat assessment secara lokal (edge processing).
- **Backend Layer** (Laravel 12, PHP 8.3) — menyediakan REST API sebagai penghubung antara perangkat dan sistem penyimpanan data.
- **Database Layer** (PostgreSQL + TimescaleDB) — menyimpan data sensor dan status sistem dalam format time-series.
- **Frontend Layer** (React, Vite, Tailwind CSS, shadcn/ui, Recharts) — menyediakan Human Machine Interface (HMI) berupa dashboard monitoring real-time.

Alur kerja end-to-end sistem mengikuti High-Level Architecture yang telah ditetapkan pada dokumen referensi: Sensor Input → Rule-Based Decision Engine → Finite State Machine → Output lokal → REST API → Laravel Backend → PostgreSQL + TimescaleDB → React Dashboard.

### 2.2 Product Functions

Secara garis besar, SIAGA menyediakan fungsi-fungsi berikut pada tahap MVP:

- Akuisisi data multi-sensor (suhu, kelembapan, gerakan, cahaya, obstacle) secara periodik.
- Evaluasi kombinasi nilai sensor menggunakan Rule-Based Decision Engine untuk menentukan status ancaman.
- Pengelolaan transisi status sistem (NORMAL, WARNING, DANGER) menggunakan Finite State Machine.
- Penyampaian status sistem melalui output lokal (OLED display, LED indicator, buzzer, relay module).
- Pengiriman data sensor dan status sistem ke backend melalui REST API berbasis HTTP.
- Validasi dan penyimpanan data pada backend Laravel ke database PostgreSQL + TimescaleDB.
- Visualisasi data sensor dan status sistem secara real-time melalui React Dashboard.
- Penyediaan data historis untuk kebutuhan monitoring dan analisis jangka panjang.

### 2.3 User Classes and Characteristics

| Kelas Pengguna | Karakteristik |
|---|---|
| **Individual/Home User** | Pengguna akhir tanpa latar belakang teknis mendalam, membutuhkan tampilan dashboard yang sederhana dan mudah dipahami. |
| **Small-Scale Facility Operator** | Pengguna yang memantau kondisi lingkungan fasilitas secara rutin, membutuhkan visibilitas status dan riwayat data. |
| **IoT Developers & Researchers** | Pengguna dengan latar belakang teknis yang memanfaatkan SIAGA sebagai referensi implementasi Mini Industrial IoT Monitoring Platform. |
| **Industrial IoT Enthusiasts** | Pengguna yang tertarik pada aspek ekstensibilitas arsitektur menuju kebutuhan Industrial IoT lanjutan. |

### 2.4 Operating Environment

- **Perangkat Embedded**: berjalan pada microcontroller ESP32 dengan Arduino Framework dan FreeRTOS untuk task scheduling.
- **Konektivitas**: jaringan WiFi sebagai media komunikasi antara perangkat dan backend.
- **Backend**: dijalankan pada environment yang mendukung PHP 8.3 dan Laravel 12.
- **Database**: PostgreSQL dengan ekstensi TimescaleDB.
- **Frontend**: React Dashboard yang dapat diakses melalui web browser modern yang mendukung standar HTML5, CSS3, dan JavaScript ES6+.
- **Protokol Komunikasi**: HTTP REST API sebagai protokol utama, dengan WebSocket sebagai opsi pengembangan lanjutan untuk komunikasi real-time.

### 2.5 Design Constraints

- Sistem harus mengikuti Layered Architecture dan prinsip Separation of Concerns antara Embedded, Backend, Database, dan Frontend layer sebagaimana ditetapkan pada dokumen referensi.
- Rule-Based Decision Engine dan Finite State Machine harus dijalankan secara lokal (on-device) pada ESP32, tidak bergantung sepenuhnya pada konektivitas internet atau server pusat untuk fungsi threat assessment dasar.
- Technology stack yang digunakan bersifat tetap sebagaimana ditetapkan pada Bab 9 dokumen referensi (ESP32, Arduino Framework, FreeRTOS, Laravel 12, PHP 8.3, PostgreSQL + TimescaleDB, React, Vite, Tailwind CSS, shadcn/ui, Recharts) dan tidak dapat diganti atau ditambah dengan teknologi lain di luar yang telah ditentukan.
- Komunikasi antara perangkat dan backend menggunakan HTTP REST API sebagai metode utama pada tahap MVP.
- Fitur AI, MQTT, LoRa, OTA, dan Predictive Analytics tidak boleh diimplementasikan pada tahap MVP karena termasuk dalam Out of Scope dan merupakan bagian dari Phase 6 — Advanced Features.

### 2.6 Assumptions and Dependencies

- Diasumsikan bahwa perangkat ESP32 memiliki akses ke jaringan WiFi yang stabil untuk pengiriman data ke backend.
- Diasumsikan bahwa fungsi threat assessment lokal (Decision Engine dan FSM) tetap dapat berjalan meskipun konektivitas jaringan terputus, sesuai dengan latar belakang masalah yang dijelaskan pada dokumen referensi.
- Sistem backend bergantung pada ketersediaan environment yang mendukung Laravel 12 dan PHP 8.3.
- Sistem database bergantung pada ketersediaan PostgreSQL dengan ekstensi TimescaleDB yang telah terpasang.
- Pengembangan fitur lanjutan (AI, MQTT, LoRa, OTA) bergantung pada penyelesaian Phase 1 hingga Phase 5 sesuai Development Roadmap pada dokumen referensi.

---

## 3. Functional Requirements

### 3.1 Functional Requirement List

| ID | Deskripsi Requirement | Kategori |
|---|---|---|
| FR-001 | Sistem harus mampu membaca data sensor suhu dan kelembapan secara periodik menggunakan ESP32. | Sensor Monitoring |
| FR-002 | Sistem harus mampu membaca data sensor gerakan (motion sensor) secara periodik. | Sensor Monitoring |
| FR-003 | Sistem harus mampu membaca data sensor cahaya (light sensor) secara periodik. | Sensor Monitoring |
| FR-004 | Sistem harus mampu membaca data sensor obstacle secara periodik. | Sensor Monitoring |
| FR-005 | Sistem harus mampu mengevaluasi kombinasi nilai dari seluruh sensor menggunakan Rule-Based Decision Engine untuk menentukan tingkat ancaman. | Threat Assessment |
| FR-006 | Sistem harus mampu menentukan status sistem berupa NORMAL, WARNING, atau DANGER berdasarkan hasil evaluasi Rule-Based Decision Engine. | Threat Assessment |
| FR-007 | Sistem harus mengelola transisi antar status (NORMAL, WARNING, DANGER) menggunakan Finite State Machine secara terstruktur dan konsisten. | Threat Assessment |
| FR-008 | Sistem harus menampilkan status sistem saat ini pada OLED display secara langsung di perangkat. | Device Management |
| FR-009 | Sistem harus mengindikasikan status sistem melalui LED indicator sesuai dengan status NORMAL, WARNING, atau DANGER. | Device Management |
| FR-010 | Sistem harus mengaktifkan buzzer sebagai indikator audio pada kondisi WARNING dan DANGER. | Alert & Notification |
| FR-011 | Sistem harus mampu mengaktifkan relay module sebagai aktuator eksternal berdasarkan status sistem yang ditentukan. | Device Management |
| FR-012 | Sistem harus mampu terhubung ke jaringan WiFi untuk mengirimkan data ke backend. | Device Management |
| FR-013 | Sistem harus mampu mengirimkan data sensor dan status sistem ke backend melalui REST API berbasis HTTP menggunakan format data JSON. | Dashboard Monitoring |
| FR-014 | Backend harus mampu menerima dan memvalidasi data yang dikirimkan oleh perangkat sebelum disimpan ke database. | Dashboard Monitoring |
| FR-015 | Backend harus mampu menyimpan data sensor dan status sistem ke dalam database PostgreSQL dengan ekstensi TimescaleDB dalam format time-series. | Historical Data |
| FR-016 | Sistem harus menyediakan REST API endpoint yang dapat diakses oleh frontend untuk menampilkan data sensor dan status sistem terkini. | Dashboard Monitoring |
| FR-017 | React Dashboard harus mampu menampilkan data sensor dan status sistem secara real-time dalam bentuk visualisasi grafik. | Dashboard Monitoring |
| FR-018 | React Dashboard harus mampu menampilkan riwayat (historical) data sensor dan status sistem berdasarkan rentang waktu tertentu. | Historical Data |
| FR-019 | Sistem harus mampu menyimpan konfigurasi perangkat secara non-volatile menggunakan library Preferences pada ESP32. | Device Management |
| FR-020 | Sistem harus melakukan debouncing terhadap input digital menggunakan library Bounce2 untuk mencegah pembacaan input yang tidak valid. | Device Management |

### 3.2 Use Case Summary

| Use Case ID | Nama Use Case | Aktor | Deskripsi Singkat |
|---|---|---|---|
| UC-01 | Melakukan Akuisisi Data Sensor | ESP32 (Embedded System) | Perangkat membaca data dari sensor suhu, kelembapan, gerakan, cahaya, dan obstacle secara periodik. |
| UC-02 | Melakukan Threat Assessment | ESP32 (Embedded System) | Perangkat mengevaluasi data sensor menggunakan Rule-Based Decision Engine dan menentukan status melalui FSM. |
| UC-03 | Menampilkan Status Lokal | ESP32 (Embedded System) | Perangkat menampilkan status sistem melalui OLED, LED, buzzer, dan relay. |
| UC-04 | Mengirim Data ke Backend | ESP32 (Embedded System) | Perangkat mengirimkan data sensor dan status sistem ke backend melalui REST API. |
| UC-05 | Menerima dan Menyimpan Data | Laravel Backend | Backend menerima, memvalidasi, dan menyimpan data ke PostgreSQL + TimescaleDB. |
| UC-06 | Memantau Dashboard Real-Time | Home User / Facility Operator | Pengguna memantau data sensor dan status sistem terkini melalui React Dashboard. |
| UC-07 | Melihat Data Historis | Facility Operator / Researcher | Pengguna melihat riwayat data sensor dan status sistem berdasarkan rentang waktu tertentu. |
| UC-08 | Menerima Notifikasi Status | Home User / Facility Operator | Pengguna mendapatkan indikasi status WARNING/DANGER melalui output lokal maupun dashboard. |

### 3.3 User Stories

1. **Sebagai Home User**, saya ingin mengetahui status keamanan ruangan saya melalui indikator LED dan buzzer, sehingga saya dapat segera mengetahui kondisi berbahaya tanpa harus membuka dashboard.
2. **Sebagai Small-Scale Facility Operator**, saya ingin memantau kondisi lingkungan fasilitas secara real-time melalui dashboard, sehingga saya dapat mengambil tindakan lebih cepat terhadap kondisi WARNING atau DANGER.
3. **Sebagai Small-Scale Facility Operator**, saya ingin melihat riwayat data sensor dan status sistem, sehingga saya dapat menganalisis pola kejadian pada periode waktu tertentu.
4. **Sebagai IoT Developer/Researcher**, saya ingin memahami alur data dari sensor hingga dashboard melalui REST API, sehingga saya dapat menggunakan SIAGA sebagai referensi implementasi platform monitoring IoT.
5. **Sebagai Industrial IoT Enthusiast**, saya ingin memastikan bahwa arsitektur sistem bersifat modular dan extensible, sehingga saya dapat mempertimbangkan pengembangan lanjutan di masa mendatang.

### 3.4 Acceptance Criteria

| ID Requirement Terkait | Given | When | Then |
|---|---|---|---|
| FR-005, FR-006 | Perangkat telah membaca seluruh nilai sensor | Rule-Based Decision Engine mengevaluasi kombinasi nilai sensor | Sistem menghasilkan salah satu status: NORMAL, WARNING, atau DANGER |
| FR-007 | Status sistem sebelumnya telah ditentukan | Terjadi perubahan hasil evaluasi Decision Engine | Finite State Machine melakukan transisi status secara konsisten tanpa status yang tidak terdefinisi |
| FR-008, FR-009, FR-010 | Status sistem berubah menjadi WARNING atau DANGER | Perangkat memproses perubahan status | OLED, LED, dan buzzer memperbarui indikator sesuai status dalam waktu yang responsif |
| FR-012, FR-013 | Perangkat terhubung ke jaringan WiFi | Data sensor dan status siap dikirim | Perangkat berhasil mengirimkan data ke REST API backend dalam format JSON |
| FR-014, FR-015 | Backend menerima request dari perangkat | Data melewati proses validasi | Data tersimpan pada PostgreSQL + TimescaleDB tanpa kehilangan data yang valid |
| FR-017 | Data telah tersimpan pada database | Pengguna membuka React Dashboard | Dashboard menampilkan data sensor dan status sistem terkini secara real-time |
| FR-018 | Data historis tersedia pada database | Pengguna memilih rentang waktu tertentu pada dashboard | Dashboard menampilkan data historis sesuai rentang waktu yang dipilih |

---

## 4. Non-Functional Requirements

| ID | Kategori | Deskripsi | Target Terukur |
|---|---|---|---|
| NFR-001 | Performance | Waktu evaluasi Rule-Based Decision Engine dan transisi Finite State Machine pada perangkat ESP32 harus berlangsung cepat agar output lokal dapat merespons perubahan kondisi secara langsung. | Proses evaluasi dan pembaruan output lokal berlangsung dalam hitungan detik sejak pembacaan sensor. |
| NFR-002 | Performance | Pengiriman data dari perangkat ke backend melalui REST API harus dilakukan secara periodik dan konsisten selama koneksi WiFi tersedia. | Data terkirim pada setiap siklus pembacaan sensor tanpa duplikasi. |
| NFR-003 | Reliability | Fungsi threat assessment lokal (Decision Engine dan FSM) harus tetap berjalan meskipun koneksi WiFi atau backend tidak tersedia. | Output lokal (OLED, LED, buzzer, relay) tetap berfungsi tanpa bergantung pada konektivitas backend. |
| NFR-004 | Reliability | Data yang telah divalidasi oleh backend harus tersimpan secara konsisten ke database tanpa kehilangan data (data loss). | Tidak terjadi kehilangan data pada proses penyimpanan data yang telah lolos validasi. |
| NFR-005 | Availability | Backend dan database harus tersedia untuk menerima serta menyimpan data pengiriman dari perangkat secara berkelanjutan. | Layanan backend dapat diakses selama environment operasional aktif. |
| NFR-006 | Availability | React Dashboard harus dapat diakses oleh pengguna selama backend dan database dalam kondisi operasional. | Dashboard dapat menampilkan data setiap kali diakses melalui web browser yang didukung. |
| NFR-007 | Scalability | Arsitektur sistem harus mampu menangani penambahan jumlah sensor pada perangkat tanpa mengubah struktur inti Decision Engine dan FSM. | Penambahan jenis/jumlah sensor dapat dilakukan secara modular. |
| NFR-008 | Scalability | Struktur penyimpanan data time-series harus mampu menangani pertumbuhan volume data sensor seiring berjalannya waktu. | Skema database mendukung penyimpanan data time-series dalam volume yang terus bertambah menggunakan TimescaleDB. |
| NFR-009 | Maintainability | Kode program pada seluruh layer (Embedded, Backend, Frontend) harus disusun secara modular dan mengikuti prinsip Clean Code serta Separation of Concerns. | Setiap komponen/modul dapat diperbarui secara independen tanpa memengaruhi modul lain. |
| NFR-010 | Security | Komunikasi data antara perangkat dan backend melalui REST API harus melalui proses validasi data pada sisi backend sebelum data disimpan. | Seluruh data yang diterima backend melewati tahap validasi sebelum masuk ke database. |
| NFR-011 | Usability | React Dashboard harus menyajikan visualisasi data sensor dan status sistem dengan tampilan yang mudah dipahami oleh pengguna non-teknis. | Status sistem dan grafik data ditampilkan secara jelas menggunakan komponen shadcn/ui dan Recharts. |
| NFR-012 | Usability | Indikator output lokal (OLED, LED, buzzer) harus memberikan informasi status yang jelas dan mudah dikenali oleh pengguna di lokasi perangkat. | Perbedaan status NORMAL, WARNING, dan DANGER dapat dibedakan secara visual dan audio secara jelas. |
| NFR-013 | Compatibility | React Dashboard harus dapat diakses melalui web browser modern yang mendukung standar HTML5, CSS3, dan JavaScript ES6+. | Dashboard dapat diakses dan berfungsi normal pada browser modern yang umum digunakan. |
| NFR-014 | Compatibility | REST API yang disediakan backend harus menggunakan format data JSON yang konsisten agar dapat diakses oleh perangkat embedded maupun frontend. | Seluruh endpoint REST API menggunakan format request/response JSON yang konsisten. |

---

## 5. System Features

### 5.1 Sensor Monitoring

Fitur ini mencakup pembacaan data dari sensor suhu, kelembapan, gerakan, cahaya, dan obstacle secara periodik oleh ESP32. Data hasil pembacaan menjadi input utama bagi proses threat assessment. *(Terkait: FR-001, FR-002, FR-003, FR-004)*

### 5.2 Threat Assessment

Fitur ini mencakup evaluasi kombinasi nilai sensor menggunakan Rule-Based Decision Engine serta pengelolaan transisi status sistem (NORMAL, WARNING, DANGER) menggunakan Finite State Machine. *(Terkait: FR-005, FR-006, FR-007)*

### 5.3 Device Management

Fitur ini mencakup pengelolaan output lokal perangkat (OLED, LED, buzzer, relay), konektivitas WiFi, penyimpanan konfigurasi non-volatile menggunakan Preferences, dan debouncing input digital menggunakan Bounce2. *(Terkait: FR-008, FR-009, FR-011, FR-012, FR-019, FR-020)*

### 5.4 Dashboard Monitoring

Fitur ini mencakup penyediaan REST API oleh backend serta visualisasi data sensor dan status sistem secara real-time pada React Dashboard menggunakan Recharts. *(Terkait: FR-013, FR-014, FR-016, FR-017)*

### 5.5 Historical Data

Fitur ini mencakup penyimpanan data sensor dan status sistem dalam format time-series pada PostgreSQL + TimescaleDB, serta penyajian riwayat data pada dashboard berdasarkan rentang waktu tertentu. *(Terkait: FR-015, FR-018)*

### 5.6 Alert & Notification

Fitur ini mencakup pemberian peringatan lokal melalui buzzer pada kondisi WARNING dan DANGER sebagai bentuk notifikasi langsung kepada pengguna di lokasi perangkat. *(Terkait: FR-010)*

### 5.7 Future Features

Bagian ini merupakan referensi kontekstual terhadap roadmap pengembangan lanjutan dan **bukan bagian dari kebutuhan MVP**:

- Adaptive Threat Intelligence Engine (AI Anomaly Detection berbasis LSTM Autoencoder).
- Komunikasi berbasis protokol MQTT.
- Integrasi komunikasi jarak jauh menggunakan LoRa.
- Fitur Over-The-Air (OTA) update firmware.
- Predictive Analytics dan fitur Industrial IoT lanjutan lainnya.
- Monitoring multi-device/multi-node dalam skala besar.

Detail lebih lanjut mengenai fitur-fitur ini dijelaskan pada Bab 8 — Future Development.

---

## 6. Business Rules

1. Status sistem hanya dapat bernilai salah satu dari tiga kondisi yang telah ditetapkan: NORMAL, WARNING, atau DANGER.
2. Penentuan status sistem harus didasarkan pada evaluasi kombinasi nilai dari seluruh sensor yang tersedia (suhu, kelembapan, gerakan, cahaya, obstacle), bukan berdasarkan nilai sensor tunggal.
3. Transisi antar status sistem harus dikelola melalui Finite State Machine agar tidak terjadi transisi status yang tidak terdefinisi atau tidak konsisten.
4. Fungsi threat assessment lokal (Decision Engine dan FSM) harus tetap dapat beroperasi secara independen tanpa bergantung sepenuhnya pada ketersediaan koneksi internet atau backend.
5. Data yang dikirimkan oleh perangkat ke backend harus melalui proses validasi sebelum disimpan ke database.
6. Data sensor dan status sistem yang tersimpan pada database bersifat time-series dan tidak boleh diubah (immutable) setelah tersimpan, mengingat fungsinya sebagai data historis.
7. Fitur-fitur yang termasuk dalam Out of Scope (AI, MQTT, LoRa, OTA, Predictive Analytics, multi-device skala besar) tidak boleh diimplementasikan pada tahap MVP.

---

## 7. System Constraints

- Sistem harus dikembangkan menggunakan technology stack yang telah ditetapkan pada dokumen referensi (Bab 9), tanpa penambahan framework, library, atau platform lain di luar yang telah ditentukan.
- Embedded Layer terbatas pada kapabilitas microcontroller ESP32 dan library pendukung yang telah ditetapkan (ArduinoJson, U8g2, Preferences, Bounce2).
- Backend harus dikembangkan menggunakan Laravel 12 dengan PHP 8.3.
- Database harus menggunakan PostgreSQL dengan ekstensi TimescaleDB.
- Frontend harus dikembangkan menggunakan React dengan Vite, Tailwind CSS, shadcn/ui, dan Recharts.
- Komunikasi data antara perangkat dan backend pada tahap MVP menggunakan HTTP REST API; WebSocket hanya berstatus opsi eksplorasi pada Phase 5 dan bukan kebutuhan wajib MVP.
- Sistem harus mengikuti Layered Architecture dan prinsip desain (Modular Architecture, Separation of Concerns, Scalability, Maintainability, Extensibility, Clean Code) sebagaimana ditetapkan pada Bab 15 dokumen referensi.
- Struktur repository proyek harus mengikuti struktur yang telah ditetapkan pada Bab 16 dokumen referensi (embedded/, backend/, frontend/, ai-service/ untuk pengembangan lanjutan, dan documentation/).

---

## 8. Future Development

Bagian ini menjelaskan fitur-fitur yang berada pada roadmap pengembangan lanjutan sesuai Phase 6 — Advanced Features pada dokumen referensi. Fitur-fitur berikut **secara eksplisit ditandai sebagai Future Development** dan **tidak menjadi bagian dari Functional Requirements maupun System Features utama** pada dokumen SRS ini:

- **Adaptive Threat Intelligence Engine**: peningkatan dari Rule-Based Decision Engine menuju pendekatan berbasis AI, terdiri atas Time-Series Preprocessing, Feature Engineering, Sliding Window Generator, LSTM Autoencoder, Threat Scoring, dan Adaptive Alert Generator, yang hasilnya akan divisualisasikan pada Dashboard Visualization.
- **Komunikasi MQTT**: sebagai alternatif protokol komunikasi message-based untuk pengembangan lanjutan.
- **Integrasi LoRa**: untuk kebutuhan komunikasi jarak jauh dengan konsumsi daya rendah.
- **Over-The-Air (OTA) Update**: mekanisme pembaruan firmware perangkat secara nirkabel.
- **Predictive Analytics**: analisis prediktif berbasis data historis untuk mendukung pengambilan keputusan proaktif.
- **Multi-Device/Multi-Node Monitoring**: ekspansi sistem untuk mendukung monitoring lebih dari satu perangkat secara bersamaan dalam skala besar.

Detail arsitektur AI ini dijelaskan lebih lanjut pada dokumen *AI Design Document* yang akan disusun secara terpisah pada tahap pengembangan Phase 6.

---

## 9. Requirement Traceability Summary

| Requirement ID | Terkait Objective (Project Context) | Terkait System Feature | Terkait Use Case |
|---|---|---|---|
| FR-001 – FR-004 | Objective 1 | Sensor Monitoring | UC-01 |
| FR-005 – FR-007 | Objective 1, Objective 2 | Threat Assessment | UC-02 |
| FR-008 – FR-011 | Objective 3 | Device Management, Alert & Notification | UC-03 |
| FR-012 – FR-013 | Objective 4 | Device Management, Dashboard Monitoring | UC-04 |
| FR-014 – FR-015 | Objective 4 | Dashboard Monitoring, Historical Data | UC-05 |
| FR-016 – FR-017 | Objective 4 | Dashboard Monitoring | UC-06 |
| FR-018 | Objective 4 | Historical Data | UC-07 |
| FR-019 – FR-020 | Objective 3, Objective 5 | Device Management | UC-03 |
| NFR-001 – NFR-002 | Objective 1, Objective 2 | Threat Assessment, Dashboard Monitoring | UC-02, UC-04 |
| NFR-003 – NFR-004 | Objective 2 | Threat Assessment, Historical Data | UC-02, UC-05 |
| NFR-005 – NFR-006 | Objective 4 | Dashboard Monitoring | UC-06 |
| NFR-007 – NFR-008 | Objective 5 | Sensor Monitoring, Historical Data | UC-01, UC-07 |
| NFR-009 | Objective 5 | Seluruh System Features | — |
| NFR-010 | Objective 4 | Dashboard Monitoring | UC-05 |
| NFR-011 – NFR-012 | Objective 3, Objective 4 | Device Management, Dashboard Monitoring | UC-03, UC-06 |
| NFR-013 – NFR-014 | Objective 4 | Dashboard Monitoring | UC-06 |

*Catatan: Objective 1–6 mengacu pada Bab 5 — Objectives dokumen SIAGA Project Context & Overview.*

---

## 10. Glossary

| Istilah | Penjelasan |
|---|---|
| **SIAGA** | Nama proyek sistem keamanan adaptif berbasis ESP32 dengan kemampuan multi-sensor threat assessment. |
| **ESP32** | Microcontroller yang digunakan sebagai otak utama perangkat embedded SIAGA. |
| **Rule-Based Decision Engine** | Mekanisme pengambilan keputusan berdasarkan sekumpulan aturan logika untuk menentukan status ancaman. |
| **Finite State Machine (FSM)** | Model komputasi yang digunakan untuk mengelola transisi status sistem secara terstruktur. |
| **REST API** | Arsitektur antarmuka pemrograman berbasis HTTP yang menghubungkan embedded device dengan backend. |
| **TimescaleDB** | Ekstensi PostgreSQL yang dioptimalkan untuk penyimpanan dan query data time-series. |
| **HMI (Human Machine Interface)** | Antarmuka yang menjembatani interaksi antara pengguna dengan sistem, direpresentasikan oleh OLED display dan React Dashboard. |
| **LSTM Autoencoder** | Model deep learning berbasis Long Short-Term Memory yang digunakan untuk deteksi anomali pada data time-series (Future Development). |
| **Threat Scoring** | Proses konversi hasil analisis data menjadi skor tingkat ancaman yang terukur (Future Development). |
| **MQTT** | Protokol komunikasi message-based yang direncanakan untuk digunakan pada fase pengembangan lanjutan. |
| **LoRa** | Teknologi komunikasi nirkabel jarak jauh dengan konsumsi daya rendah, direncanakan untuk fase pengembangan lanjutan. |
| **OTA (Over-The-Air) Update** | Mekanisme pembaruan firmware perangkat secara nirkabel tanpa koneksi fisik langsung. |
| **MVP (Minimum Viable Product)** | Versi awal produk dengan fitur inti minimum yang layak untuk dirilis dan diuji. |
| **FR (Functional Requirement)** | Kebutuhan fungsional yang mendefinisikan perilaku spesifik yang harus dipenuhi oleh sistem. |
| **NFR (Non-Functional Requirement)** | Kebutuhan yang mendefinisikan kualitas atau atribut sistem, seperti performance, reliability, dan security. |

---

*Dokumen ini merupakan turunan dari SIAGA Project Context & Overview dan menjadi dasar bagi penyusunan Software Architecture Document (SAD), Database Design Document (DDD), API Specification, dan Test Plan.*
