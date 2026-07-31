# SIAGA Software Architecture Document (SAD)

**Project Name:** SIAGA — ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment
**Document Type:** Software Architecture Document (SAD)
**Reference Documents:** SIAGA Project Context & Overview; SIAGA Software Requirements Specification (SRS)
**Status:** Draft v1.0

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini disusun untuk mendefinisikan arsitektur perangkat lunak sistem SIAGA secara menyeluruh, mencakup architectural style, logical architecture, component architecture, data flow, communication architecture, deployment architecture, security architecture, serta scalability considerations. Dokumen ini berfungsi sebagai jembatan antara kebutuhan yang telah didefinisikan pada SRS dengan implementasi teknis yang akan dilakukan pada tahap pengembangan, serta menjadi acuan bagi penyusunan Database Design Document (DDD), API Specification, Frontend Design Document, dan AI Design Document.

### 1.2 Scope

Ruang lingkup dokumen ini mencakup perancangan arsitektur sistem SIAGA pada tahap Minimum Viable Product (MVP), sebagaimana telah ditetapkan pada SRS Bab 1.2 dan Project Context Bab 6. Dokumen ini berfokus pada keputusan arsitektural — bagaimana komponen-komponen sistem disusun, berinteraksi, dan ditempatkan — dan tidak mengulang pembahasan mengenai business background, problem statement, maupun daftar requirement yang telah dijelaskan pada dokumen referensi. Fitur-fitur Phase 6 (AI, MQTT, LoRa, OTA, Predictive Analytics, multi-device) dibahas pada Bab 12 sebagai roadmap arsitektural, bukan sebagai bagian dari arsitektur MVP.

### 1.3 References

1. *SIAGA Project Context & Overview* — dokumen rujukan utama (single source of truth) terkait background, objectives, scope, technology stack, hardware components, high-level architecture, dan development roadmap.
2. *SIAGA Software Requirements Specification (SRS)* — dokumen rujukan terkait functional requirements, non-functional requirements, use case, dan business rules.

---

## 2. Architectural Goals

Perancangan arsitektur SIAGA diarahkan untuk mencapai tujuan-tujuan berikut, selaras dengan Design Principles yang telah ditetapkan pada Project Context Bab 15:

- Memastikan **Separation of Concerns** yang jelas antara Embedded Layer, Backend Layer, Database Layer, dan Presentation Layer.
- Mendukung **edge processing** sehingga fungsi threat assessment dapat berjalan secara independen dari konektivitas backend.
- Menerapkan **Modular Architecture** agar setiap komponen dapat dikembangkan, diuji, dan dipelihara secara independen.
- Menyediakan struktur arsitektur yang **scalable** terhadap penambahan sensor, volume data, maupun jumlah perangkat di masa mendatang.
- Menjaga **maintainability** dan **extensibility** melalui batasan tanggung jawab antar-layer yang tegas.
- Menyiapkan fondasi arsitektur yang **future AI-ready** tanpa memaksakan integrasi AI pada tahap MVP.

---

## 3. Architectural Overview

Secara arsitektural, SIAGA dibangun sebagai sistem terdistribusi yang menggabungkan edge processing pada Embedded Layer dengan pemrosesan terpusat pada Backend dan Database Layer, serta visualisasi pada Presentation Layer. Prinsip utama yang mendasari susunan ini adalah bahwa pengambilan keputusan kritikal terhadap ancaman (threat assessment) tidak boleh bergantung pada ketersediaan jaringan atau server pusat, sehingga logika inti — Rule-Based Decision Engine dan Finite State Machine — ditempatkan sedekat mungkin dengan sumber data, yaitu pada perangkat ESP32 itu sendiri.

Layer-layer di atasnya (Backend, Database, Presentation) berperan sebagai lapisan agregasi, penyimpanan, dan visualisasi yang bersifat komplementer terhadap fungsi lokal perangkat, bukan sebagai prasyarat operasionalnya. Susunan ini menghasilkan arsitektur yang tangguh terhadap gangguan konektivitas sekaligus tetap menyediakan kemampuan monitoring terpusat bagi pengguna.

---

## 4. System Context

SIAGA beroperasi dalam konteks sebuah edge device (ESP32) yang berinteraksi langsung dengan lingkungan fisik melalui sensor dan aktuator, serta berkomunikasi dengan sistem backend melalui jaringan WiFi. Pihak yang berinteraksi dengan sistem meliputi:

- **Perangkat Embedded (ESP32)**, sebagai producer data sekaligus decision-making unit lokal.
- **Laravel Backend**, sebagai penerima, validator, dan pengelola data yang bertindak sebagai penghubung antara embedded device dan database.
- **PostgreSQL + TimescaleDB**, sebagai sistem penyimpanan data time-series.
- **React Dashboard**, sebagai antarmuka bagi pengguna akhir (Home User, Facility Operator, IoT Developer/Researcher) untuk memantau kondisi sistem.

Batas sistem (system boundary) mencakup keempat komponen tersebut beserta jalur komunikasi REST API di antaranya. Pihak eksternal seperti jaringan WiFi infrastruktur dan web browser pengguna berada di luar batas sistem namun menjadi bagian dari operating environment sebagaimana telah dijelaskan pada SRS Bab 2.4.

---

## 5. Architectural Style

SIAGA mengadopsi kombinasi beberapa architectural style yang saling melengkapi.

### 5.1 Layered Architecture

Sistem disusun dalam lapisan-lapisan dengan tanggung jawab yang terpisah secara tegas — Embedded, Backend, Database, dan Presentation — sebagaimana ditetapkan pada Software Stack (Project Context Bab 11). Setiap layer hanya berkomunikasi dengan layer yang berdekatan melalui antarmuka yang telah ditentukan, sehingga perubahan pada satu layer tidak memengaruhi layer lain secara langsung.

### 5.2 Modular Architecture

Di dalam masing-masing layer, komponen disusun secara modular. Pada Embedded Layer misalnya, modul sensor acquisition, Decision Engine, FSM, dan output handler dipisahkan agar penambahan jenis sensor tidak memengaruhi struktur inti Decision Engine, selaras dengan NFR-007 pada SRS.

### 5.3 Client-Server Architecture

Hubungan antara ESP32 (client) dan Laravel Backend (server), maupun antara React Dashboard (client) dan Laravel Backend (server), mengikuti pola client-server klasik berbasis request-response melalui REST API.

### 5.4 Edge Computing Concept

Fungsi threat assessment dijalankan sepenuhnya pada edge device (ESP32) tanpa bergantung pada backend, merepresentasikan konsep edge computing. Backend dan cloud-side storage berperan sebagai lapisan agregasi dan historisasi, bukan sebagai bagian dari real-time decision loop.

---

## 6. Logical Architecture

### 6.1 Embedded Layer

Bertanggung jawab atas akuisisi data sensor, evaluasi ancaman melalui Rule-Based Decision Engine, pengelolaan status melalui Finite State Machine, serta penyampaian status melalui output lokal. Layer ini beroperasi di atas Arduino Framework dengan FreeRTOS untuk task scheduling.

### 6.2 Communication Layer

Menjembatani Embedded Layer dengan Backend Layer melalui protokol HTTP REST API dengan format data JSON. Layer ini bertanggung jawab atas pengiriman data secara periodik dari perangkat ke backend.

### 6.3 Backend Layer

Bertanggung jawab menerima data dari Communication Layer, melakukan validasi, dan meneruskannya ke Database Layer, serta menyediakan REST API endpoint bagi Presentation Layer untuk mengambil data terkini maupun data historis.

### 6.4 Database Layer

Bertanggung jawab atas penyimpanan data sensor dan status sistem dalam format time-series yang immutable, sesuai Business Rule pada SRS Bab 6.

### 6.5 Presentation Layer

Bertanggung jawab menyajikan visualisasi data real-time maupun historis kepada pengguna melalui React Dashboard, dengan mengonsumsi REST API yang disediakan Backend Layer.

### 6.6 Future AI Layer

Merupakan lapisan tambahan yang direncanakan pada Phase 6 (Adaptive Threat Intelligence Engine), berada secara logis di antara Database Layer dan Presentation Layer sebagai consumer data historis dan producer threat scoring. Lapisan ini belum menjadi bagian dari arsitektur MVP dan detail rancangannya akan dibahas pada AI Design Document.

---

## 7. Component Architecture

### 7.1 ESP32 Firmware

Komponen ini bertanggung jawab atas keseluruhan operasi pada Embedded Layer, meliputi pembacaan sensor secara periodik, orkestrasi task menggunakan FreeRTOS, pengelolaan konfigurasi non-volatile melalui Preferences, debouncing input melalui Bounce2, serta pengendalian output lokal (OLED melalui U8g2, LED, buzzer, relay).

### 7.2 Rule-Based Decision Engine

Komponen inti pengambilan keputusan yang mengevaluasi kombinasi nilai dari seluruh sensor untuk menghasilkan penilaian tingkat ancaman. Komponen ini bekerja sama dengan Finite State Machine untuk menentukan dan mengelola transisi status sistem (NORMAL, WARNING, DANGER) secara terstruktur dan predictable.

### 7.3 REST API

Bertindak sebagai antarmuka komunikasi yang menghubungkan ESP32 Firmware dengan Laravel Backend, serta React Dashboard dengan Laravel Backend. Komponen ini menyediakan endpoint untuk pengiriman data sensor/status dan pengambilan data untuk kebutuhan monitoring maupun historis.

### 7.4 Laravel Backend

Bertanggung jawab atas validasi data masuk, orkestrasi penyimpanan ke database, serta penyediaan REST API endpoint bagi Presentation Layer. Komponen ini menjadi titik integrasi utama antara Embedded Layer, Database Layer, dan Presentation Layer.

### 7.5 PostgreSQL + TimescaleDB

Bertanggung jawab sebagai sistem penyimpanan data time-series yang mendukung pertumbuhan volume data sensor secara efisien, serta mendukung query historis yang dibutuhkan oleh fitur Historical Data pada Presentation Layer.

### 7.6 React Dashboard

Bertanggung jawab menyajikan Human Machine Interface (HMI) berbasis web yang menampilkan data sensor dan status sistem secara real-time maupun historis, menggunakan komponen visual dari shadcn/ui dan Recharts.

---

## 8. Data Flow Architecture

Aliran data pada SIAGA dimulai dari proses akuisisi data oleh sensor pada ESP32, kemudian mengalir secara berurutan sebagai berikut:

1. **Sensor menuju Decision Engine** — nilai mentah dari sensor suhu, kelembapan, gerakan, cahaya, dan obstacle dikumpulkan sebagai input evaluasi.
2. **Decision Engine menuju Finite State Machine** — hasil evaluasi kombinasi sensor diteruskan sebagai trigger bagi transisi status sistem.
3. **Finite State Machine menuju Output Lokal** — status yang telah ditetapkan (NORMAL, WARNING, DANGER) mengalir menuju OLED, LED, buzzer, dan relay untuk direpresentasikan secara lokal.
4. **Firmware menuju REST API** — data sensor beserta status sistem yang sama dikemas dalam format JSON dan dikirimkan melalui HTTP menuju Laravel Backend.
5. **REST API menuju Backend Processing** — Laravel Backend menerima payload, melakukan validasi, dan menyiapkan data untuk persistensi.
6. **Backend menuju Database** — data yang lolos validasi disimpan sebagai time-series record pada PostgreSQL + TimescaleDB.
7. **Database menuju Backend menuju Dashboard** — ketika pengguna mengakses React Dashboard, permintaan data mengalir dari Presentation Layer menuju REST API, diteruskan ke Database Layer, dan hasilnya dikembalikan sebagai response untuk divisualisasikan, baik dalam bentuk data real-time maupun data historis berdasarkan rentang waktu.

Aliran ini menegaskan adanya dua jalur paralel yang independen: jalur lokal (Sensor → Decision Engine → FSM → Output) yang tidak bergantung pada konektivitas, dan jalur terpusat (Firmware → REST API → Backend → Database → Dashboard) yang bergantung pada ketersediaan jaringan.

---

## 9. Communication Architecture

### 9.1 HTTP REST API

Menjadi protokol komunikasi utama pada tahap MVP, menghubungkan ESP32 dengan Laravel Backend serta React Dashboard dengan Laravel Backend. Komunikasi bersifat request-response dan stateless, sesuai karakteristik REST.

### 9.2 JSON

Digunakan sebagai format pertukaran data pada seluruh komunikasi REST API, baik untuk payload pengiriman data dari perangkat maupun response yang dikonsumsi oleh dashboard, guna menjaga konsistensi format data lintas komponen sebagaimana ditetapkan pada NFR-014.

### 9.3 WebSocket (Future)

Direncanakan sebagai opsi komunikasi tambahan pada Phase 5 untuk mendukung pembaruan data secara real-time yang lebih efisien dibandingkan pendekatan polling berbasis REST API. Pada tahap MVP, WebSocket belum diimplementasikan dan komunikasi real-time pada dashboard masih mengandalkan mekanisme REST API.

---

## 10. Deployment Architecture

Secara logis, komponen-komponen SIAGA ditempatkan sebagai berikut:

- **Embedded Device**: ESP32 ditempatkan secara fisik pada lokasi yang dimonitor, menjalankan firmware secara mandiri dan terhubung ke jaringan WiFi lokal untuk komunikasi dengan backend.
- **Backend Server**: Laravel Backend dijalankan pada environment yang mendukung PHP 8.3, berperan sebagai titik akses terpusat bagi seluruh permintaan REST API dari embedded device maupun dashboard.
- **Database Server**: PostgreSQL dengan ekstensi TimescaleDB ditempatkan pada environment penyimpanan yang dapat diakses oleh Backend Server, terpisah secara logis dari layer aplikasi.
- **Client Browser**: React Dashboard diakses oleh pengguna melalui web browser modern, berkomunikasi dengan Backend Server melalui REST API tanpa memerlukan instalasi aplikasi tambahan pada sisi klien.

Penempatan ini menegaskan pemisahan tanggung jawab operasional antara perangkat edge, layer aplikasi, layer data, dan layer presentasi, sejalan dengan Layered Architecture yang diterapkan.

---

## 11. Security Architecture

Pada tahap MVP, aspek keamanan difokuskan pada validasi data sebagai lini pertahanan utama, dengan beberapa aspek lain direncanakan sebagai pengembangan lanjutan:

- **Input Validation**: seluruh data yang diterima oleh Laravel Backend dari perangkat embedded harus melalui proses validasi sebelum disimpan ke database, sebagaimana ditetapkan pada NFR-010 dan Business Rule SRS Bab 6.
- **Authentication (Future)**: mekanisme autentikasi bagi komunikasi antara perangkat dan backend, maupun bagi akses pengguna pada dashboard, direncanakan sebagai pengembangan lanjutan di luar tahap MVP.
- **Authorization (Future)**: pengelolaan hak akses berbasis peran pengguna direncanakan sebagai bagian dari pengembangan lanjutan.
- **HTTPS (Future)**: enkripsi komunikasi antara komponen direncanakan sebagai peningkatan keamanan pada fase pengembangan berikutnya.
- **API Security**: pada tahap MVP, keamanan REST API bertumpu pada validasi struktur dan tipe data yang konsisten, sebagai fondasi awal sebelum penambahan mekanisme keamanan yang lebih komprehensif pada fase mendatang.

---

## 12. Scalability Considerations

Arsitektur SIAGA dirancang agar dapat mengakomodasi pengembangan lanjutan berikut sebagai roadmap arsitektural, bukan sebagai bagian dari MVP:

- **Multi Device**: struktur Embedded Layer dan Backend Layer yang modular memungkinkan penambahan jumlah perangkat ESP32 tanpa mengubah struktur inti Decision Engine maupun REST API yang ada.
- **MQTT**: sebagai alternatif protokol komunikasi message-based yang dapat melengkapi HTTP REST API, khususnya untuk skenario komunikasi many-to-many antar banyak perangkat.
- **LoRa**: sebagai perluasan Communication Layer untuk mendukung komunikasi jarak jauh dengan konsumsi daya rendah pada skenario Industrial IoT.
- **AI Service**: penambahan Future AI Layer (Adaptive Threat Intelligence Engine) yang mengonsumsi data historis dari Database Layer sebagai input, tanpa mengubah alur data inti yang telah ada.
- **Docker Deployment**: containerisasi Backend Layer dan Database Layer untuk mendukung deployment yang lebih konsisten dan scalable seiring pertumbuhan sistem.

Kesiapan arsitektur terhadap poin-poin di atas ditopang oleh prinsip Modular Architecture dan Separation of Concerns yang diterapkan sejak tahap MVP.

---

## 13. Architecture Decisions

- **ESP32** dipilih sebagai microcontroller utama karena kemampuannya menjalankan edge processing (Decision Engine dan FSM) secara mandiri sekaligus mendukung konektivitas WiFi bawaan, sesuai kebutuhan arsitektur edge computing pada sistem ini.
- **Laravel** dipilih sebagai backend framework karena menyediakan struktur REST API yang matang serta mendukung validasi data secara terstruktur, sejalan dengan kebutuhan Backend Layer untuk menjaga integritas data sebelum persistensi.
- **PostgreSQL + TimescaleDB** dipilih karena kemampuannya menangani data time-series secara efisien, mendukung pertumbuhan volume data sensor dari waktu ke waktu sekaligus tetap menyediakan kapabilitas relational database standar.
- **React** dipilih sebagai fondasi Presentation Layer karena mendukung pembangunan antarmuka berbasis komponen yang modular, memudahkan integrasi dengan library visualisasi seperti Recharts serta component library shadcn/ui.
- **REST API** dipilih sebagai metode komunikasi utama pada tahap MVP karena sifatnya yang stateless, sederhana untuk diimplementasikan pada perangkat embedded, dan cukup memadai untuk frekuensi pengiriman data pada skala MVP, sebelum mempertimbangkan protokol tambahan seperti WebSocket atau MQTT pada fase lanjutan.

---

## 14. Risks and Trade-offs

- **Ketergantungan pada REST API berbasis polling**: pendekatan ini sederhana dan mudah diimplementasikan, namun kurang efisien untuk kebutuhan pembaruan data real-time dibandingkan pendekatan berbasis event seperti WebSocket, sehingga berpotensi menimbulkan latensi pada visualisasi dashboard.
- **Edge processing pada ESP32**: menjamin independensi fungsi threat assessment dari konektivitas backend, namun membatasi kompleksitas logika yang dapat dijalankan mengingat keterbatasan sumber daya komputasi microcontroller.
- **Single point of integration pada Laravel Backend**: menyederhanakan arsitektur integrasi, namun menjadikan Backend Layer sebagai titik kritis yang, apabila tidak tersedia, akan menghentikan aliran data menuju Database Layer dan Presentation Layer meskipun fungsi lokal pada perangkat tetap berjalan.
- **Keamanan pada tahap MVP yang masih minimal**: fokus pada input validation tanpa mekanisme authentication, authorization, maupun HTTPS memberikan kesederhanaan implementasi pada tahap awal, namun menimbulkan risiko keamanan yang perlu diatasi sebelum sistem digunakan pada lingkungan produksi yang lebih luas.
- **Kesiapan skalabilitas versus kompleksitas MVP**: prinsip modular architecture yang diterapkan sejak awal memudahkan pengembangan lanjutan (multi-device, MQTT, LoRa, AI), namun menambah sedikit overhead desain pada tahap MVP dibandingkan pendekatan monolitik yang lebih sederhana.

---

## 15. Glossary

| Istilah | Penjelasan |
|---|---|
| **Layered Architecture** | Gaya arsitektur yang menyusun sistem dalam lapisan-lapisan dengan tanggung jawab terpisah secara tegas. |
| **Modular Architecture** | Pendekatan perancangan yang memecah sistem menjadi modul-modul independen yang dapat dikembangkan dan dipelihara secara terpisah. |
| **Client-Server Architecture** | Pola arsitektur yang memisahkan peran pemohon layanan (client) dan penyedia layanan (server). |
| **Edge Computing** | Konsep pemrosesan data yang dilakukan sedekat mungkin dengan sumber data, dalam hal ini pada perangkat ESP32. |
| **Logical Architecture** | Representasi struktur sistem berdasarkan tanggung jawab fungsional tanpa merujuk pada implementasi fisik tertentu. |
| **Component Architecture** | Rincian komponen-komponen utama sistem beserta tanggung jawabnya masing-masing. |
| **Deployment Architecture** | Gambaran penempatan logis komponen sistem pada lingkungan operasionalnya. |
| **REST API** | Arsitektur antarmuka pemrograman berbasis HTTP yang menghubungkan embedded device, backend, dan frontend. |
| **WebSocket** | Protokol komunikasi full-duplex yang direncanakan untuk mendukung pembaruan data real-time pada fase pengembangan lanjutan. |
| **TimescaleDB** | Ekstensi PostgreSQL yang dioptimalkan untuk penyimpanan dan query data time-series. |

---

*Dokumen ini merupakan turunan dari SIAGA Project Context & Overview dan SIAGA Software Requirements Specification, serta menjadi dasar bagi penyusunan Database Design Document (DDD), API Specification, Frontend Design Document, dan AI Design Document.*
