# SIAGA Software Design Document (SDD)

**Project Name:** SIAGA — ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment
**Document Type:** Software Design Document (SDD)
**Reference Documents:** SIAGA Project Context & Overview; SIAGA Software Requirements Specification (SRS); SIAGA Software Architecture Document (SAD)
**Status:** Draft v1.0

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini disusun untuk mendefinisikan **Low-Level Software Design** dari sistem SIAGA, yaitu bagaimana setiap module dan component yang telah didefinisikan pada Software Architecture Document (SAD) dirancang secara internal agar dapat diimplementasikan secara konsisten oleh tim pengembang Embedded, Backend, dan Frontend. Dokumen ini menerjemahkan keputusan architecture tingkat tinggi menjadi rancangan module yang lebih konkret, mencakup tanggung jawab module, interaksi antar-module, alur data internal, strategi error handling, pengelolaan configuration, strategi logging, struktur folder, design pattern yang digunakan, serta coding standard yang menjadi acuan implementasi.

Dokumen ini akan menjadi referensi utama bagi penyusunan Database Design Document (DDD), API Specification, Frontend Design Document, AI Design Document, dan proses implementasi software pada seluruh layer.

### 1.2 Scope

Ruang lingkup dokumen ini terbatas pada desain software tingkat rendah (low-level design) untuk sistem SIAGA pada tahap Minimum Viable Product (MVP), sebagaimana telah ditetapkan pada Project Context Bab 6 dan SRS Bab 1.2. Dokumen ini tidak membahas ulang architectural style, logical architecture, maupun deployment architecture yang telah dijelaskan secara rinci pada SAD. Dokumen ini juga tidak membahas desain skema database secara rinci, spesifikasi REST API secara rinci, maupun rancangan detail komponen AI, karena ketiga topik tersebut akan dibahas masing-masing pada Database Design Document, API Specification, dan AI Design Document sebagai dokumen turunan tersendiri.

Fitur-fitur pada roadmap Phase 6 (MQTT, AI, LoRa, OTA, multi-device, Docker) dibahas pada Bab 14 sebagai Future Design Considerations, bukan sebagai bagian dari desain software MVP.

### 1.3 References

1. *SIAGA Project Context & Overview* — dokumen rujukan utama terkait background, objectives, scope, technology stack, dan development roadmap.
2. *SIAGA Software Requirements Specification (SRS)* — dokumen rujukan terkait functional requirements, non-functional requirements, dan business rules.
3. *SIAGA Software Architecture Document (SAD)* — dokumen rujukan terkait architectural style, logical architecture, component architecture, dan data flow architecture.

---

## 2. Software Design Overview

Desain software SIAGA disusun untuk menerjemahkan Logical Architecture dan Component Architecture yang telah ditetapkan pada SAD menjadi rancangan module yang dapat diimplementasikan secara langsung oleh tim pengembang, tanpa mengubah architecture, technology stack, maupun scope proyek yang telah disepakati pada dokumen referensi.

Tujuan utama dari desain software ini adalah:

- Menjabarkan setiap component pada Embedded Layer, Backend Layer, dan Frontend Layer menjadi kumpulan module dengan tanggung jawab yang spesifik dan tidak saling tumpang tindih, selaras dengan prinsip Separation of Concerns.
- Menetapkan pola interaksi antar-module secara konsisten agar alur data — mulai dari akuisisi sensor hingga visualisasi pada dashboard — dapat ditelusuri dengan jelas.
- Menyediakan strategi penanganan error yang seragam di seluruh layer, sehingga kegagalan pada satu titik tidak menyebabkan kegagalan sistem secara keseluruhan.
- Menetapkan pendekatan configuration management dan logging yang mendukung maintainability sesuai NFR-009 pada SRS.
- Menyediakan struktur folder dan standar penulisan kode yang konsisten sebagai pedoman implementasi bagi seluruh anggota tim.
- Meletakkan dasar desain yang siap diperluas menuju fitur-fitur pada roadmap Phase 6 tanpa memerlukan perubahan struktural yang signifikan, sejalan dengan prinsip Extensibility dan Future AI Ready pada Project Context Bab 15.

Desain pada dokumen ini berlaku lintas layer — Embedded, Backend, dan Frontend — dengan pendekatan yang konsisten, meskipun teknologi dan constraint pada masing-masing layer berbeda sesuai dengan technology stack yang telah ditetapkan.

---

## 3. Software Module Design

### 3.1 Embedded

**Sensor Manager**
Bertanggung jawab atas pembacaan data dari seluruh sensor (suhu, kelembapan, gerakan, cahaya, obstacle) secara periodik. Module ini mengabstraksi proses akuisisi data mentah dari perangkat keras sensor menjadi nilai yang siap dikonsumsi oleh module lain, sehingga penambahan atau penggantian jenis sensor di masa mendatang tidak memengaruhi module lain di luar Sensor Manager, sesuai NFR-007.

**Rule-Based Decision Engine**
Bertanggung jawab mengevaluasi kombinasi nilai sensor yang diterima dari Sensor Manager berdasarkan sekumpulan rule yang telah ditetapkan, untuk menghasilkan penilaian tingkat ancaman. Module ini menjadi inti dari fungsi threat assessment dan bekerja secara independen dari konektivitas jaringan, selaras dengan Design Constraint pada SRS Bab 2.5.

**State Machine**
Bertanggung jawab mengelola transisi status sistem (NORMAL, WARNING, DANGER) berdasarkan hasil evaluasi dari Rule-Based Decision Engine. Module ini memastikan setiap perubahan status berlangsung secara terstruktur, predictable, dan tidak menghasilkan status yang tidak terdefinisi, sesuai Business Rule pada SRS Bab 6.

**WiFi Manager**
Bertanggung jawab mengelola konektivitas jaringan WiFi pada perangkat, termasuk proses koneksi awal, pemantauan status koneksi, dan upaya reconnect apabila koneksi terputus. Module ini menyediakan status konektivitas yang dapat digunakan oleh module lain, khususnya REST API Client, tanpa memengaruhi operasional Rule-Based Decision Engine dan State Machine.

**REST API Client**
Bertanggung jawab mengemas data sensor dan status sistem ke dalam format JSON serta mengirimkannya ke Backend melalui REST API berbasis HTTP. Module ini beroperasi secara terpisah dari jalur pengambilan keputusan lokal, sehingga kegagalan pengiriman data tidak memengaruhi fungsi Rule-Based Decision Engine maupun State Machine.

**Configuration Manager**
Bertanggung jawab menyimpan dan mengambil parameter konfigurasi perangkat secara non-volatile menggunakan library Preferences, sebagaimana ditetapkan pada FR-019. Module ini menyediakan akses terpusat terhadap parameter konfigurasi bagi module lain, sehingga perubahan konfigurasi tidak memerlukan modifikasi pada logika module tersebut.

**Logger**
Bertanggung jawab mencatat aktivitas dan kondisi penting pada firmware, seperti hasil evaluasi Decision Engine, transisi status pada State Machine, maupun status pengiriman data melalui REST API Client, untuk mendukung proses debugging dan pemantauan operasional perangkat.

### 3.2 Backend

**Controller Layer**
Bertanggung jawab menerima request yang masuk melalui REST API endpoint, meneruskan permintaan tersebut ke Service Layer, dan mengembalikan response kepada pemanggil (ESP32 Firmware maupun React Dashboard). Controller Layer tidak mengandung business logic secara langsung.

**Service Layer**
Bertanggung jawab menjalankan business logic pada sisi Backend, termasuk orkestrasi proses validasi data dan koordinasi antara Controller Layer dan Repository Layer, sejalan dengan peran Laravel Backend yang dijelaskan pada SAD Bab 7.4.

**Repository Layer**
Bertanggung jawab menjembatani Service Layer dengan Database Layer, mengabstraksi mekanisme akses data sehingga Service Layer tidak perlu mengetahui detail implementasi query terhadap PostgreSQL + TimescaleDB.

**Model Layer**
Bertanggung jawab merepresentasikan struktur data yang digunakan pada Backend, sebagai representasi dari entitas data sensor dan status sistem yang dipertukarkan antara Repository Layer dan Service Layer.

**Validation Layer**
Bertanggung jawab memastikan seluruh data yang diterima dari perangkat embedded telah memenuhi struktur dan tipe data yang ditetapkan sebelum diteruskan ke Service Layer, sesuai NFR-010 dan Business Rule SRS Bab 6.

**Exception Handler**
Bertanggung jawab menangani kondisi error yang terjadi pada Backend secara terpusat, memastikan setiap error dikembalikan kepada pemanggil dalam format response yang konsisten tanpa menghentikan operasional Backend secara keseluruhan.

### 3.3 Frontend

**Dashboard Module**
Bertanggung jawab menyajikan ringkasan kondisi sistem secara keseluruhan sebagai halaman utama bagi pengguna, mengintegrasikan informasi dari Monitoring Module dan Alert Module.

**Monitoring Module**
Bertanggung jawab menampilkan data sensor dan status sistem terkini secara real-time dalam bentuk visualisasi grafik menggunakan Recharts, sesuai FR-017.

**Historical Data Module**
Bertanggung jawab menyajikan riwayat data sensor dan status sistem berdasarkan rentang waktu yang dipilih pengguna, sesuai FR-018.

**Alert Module**
Bertanggung jawab menampilkan indikasi status WARNING dan DANGER kepada pengguna melalui antarmuka dashboard, sebagai representasi visual dari fungsi Alert & Notification pada SRS Bab 5.6.

**Device Module**
Bertanggung jawab menampilkan informasi terkait perangkat, termasuk status konektivitas dan identitas perangkat, sebagai representasi dari fungsi Device Management pada sisi Presentation Layer.

**Shared Components**
Bertanggung jawab menyediakan komponen antarmuka yang dapat digunakan bersama oleh module lain, seperti elemen visual dari shadcn/ui, guna menjaga konsistensi tampilan dan mengurangi duplikasi implementasi antar-module.

### 3.4 Future AI

**AI Service**
Direncanakan sebagai titik orkestrasi utama bagi Adaptive Threat Intelligence Engine pada Phase 6, yang akan mengonsumsi data historis dari Database Layer sebagai input pemrosesan.

**Feature Engineering**
Direncanakan bertanggung jawab mengekstraksi fitur-fitur relevan dari data time-series sebagai representasi input bagi model AI, sebagaimana disebutkan pada Project Context Bab 13.

**Threat Prediction**
Direncanakan bertanggung jawab menghasilkan prediksi maupun threat scoring berdasarkan hasil pemrosesan model AI terhadap data sensor historis.

**Model Management**
Direncanakan bertanggung jawab mengelola siklus hidup model AI, termasuk penyimpanan, pemuatan, dan pembaruan model yang digunakan oleh AI Service.

Rancangan rinci dari keempat module pada Future AI akan dijelaskan lebih lanjut pada AI Design Document yang disusun secara terpisah pada tahap pengembangan Phase 6.

---

## 4. Component Responsibilities

Setiap component software pada SIAGA dirancang dengan batasan tanggung jawab yang tegas agar selaras dengan prinsip Separation of Concerns dan Modular Architecture.

Pada **Embedded Layer**, ESP32 Firmware sebagai component utama bertanggung jawab mengoordinasikan seluruh module — Sensor Manager, Rule-Based Decision Engine, State Machine, WiFi Manager, REST API Client, Configuration Manager, dan Logger — melalui task scheduling berbasis FreeRTOS, tanpa mencampur logika akuisisi sensor, pengambilan keputusan, dan komunikasi jaringan ke dalam satu unit kode yang sama.

Pada **Backend Layer**, Laravel Backend sebagai component utama bertanggung jawab mengoordinasikan Controller Layer, Service Layer, Repository Layer, Model Layer, Validation Layer, dan Exception Handler, di mana masing-masing layer hanya berinteraksi dengan layer yang berdekatan sesuai prinsip Layered Architecture yang telah ditetapkan pada SAD Bab 5.1.

Pada **Frontend Layer**, React Dashboard sebagai component utama bertanggung jawab mengoordinasikan Dashboard Module, Monitoring Module, Historical Data Module, Alert Module, dan Device Module, dengan Shared Components sebagai lapisan pendukung yang digunakan lintas module untuk menjaga konsistensi antarmuka.

Pembagian tanggung jawab ini memastikan bahwa perubahan pada satu component — misalnya penambahan jenis sensor pada Sensor Manager, atau penambahan endpoint baru pada Controller Layer — dapat dilakukan tanpa memengaruhi component lain secara langsung.

---

## 5. Module Interaction

Interaksi antar-module pada SIAGA mengikuti alur yang selaras dengan High-Level Architecture pada Project Context Bab 12 dan Data Flow Architecture pada SAD Bab 8, namun dijabarkan lebih rinci pada tingkat module.

Pada sisi Embedded, Sensor Manager secara periodik membaca nilai dari seluruh sensor dan meneruskan hasil pembacaan tersebut kepada Rule-Based Decision Engine. Rule-Based Decision Engine mengevaluasi kombinasi nilai sensor tersebut dan meneruskan hasil evaluasinya kepada State Machine, yang kemudian menentukan status sistem serta mengelola transisi antar-status secara konsisten. Status yang dihasilkan oleh State Machine selanjutnya digunakan oleh dua jalur module yang berjalan secara paralel: pertama, jalur output lokal yang memicu pembaruan tampilan pada OLED, LED, dan buzzer; kedua, jalur REST API Client yang mengemas data sensor beserta status sistem untuk dikirimkan menuju Backend, dengan terlebih dahulu memeriksa status konektivitas melalui WiFi Manager. Configuration Manager berperan sebagai penyedia parameter bagi module-module tersebut, sementara Logger mencatat aktivitas penting yang terjadi pada setiap tahapan interaksi ini.

Pada sisi Backend, data yang diterima dari REST API Client pada Embedded ditangani oleh Controller Layer, yang meneruskannya kepada Validation Layer untuk memastikan struktur dan tipe data telah sesuai. Data yang lolos validasi kemudian diproses oleh Service Layer, yang berkoordinasi dengan Repository Layer untuk melakukan persistensi data melalui Model Layer menuju Database Layer. Apabila terjadi kegagalan pada tahapan mana pun, Exception Handler menangani kondisi tersebut secara terpusat sebelum response dikembalikan kepada pemanggil.

Pada sisi Frontend, Dashboard Module berinteraksi dengan Monitoring Module, Historical Data Module, Alert Module, dan Device Module untuk menyajikan informasi kepada pengguna. Setiap module tersebut mengambil data dari Backend melalui REST API yang disediakan oleh Controller Layer, kemudian menampilkannya menggunakan Shared Components agar konsisten secara visual.

Secara ringkas, alur interaksi module dapat dinarasikan sebagai berikut: Sensor Manager meneruskan data kepada Rule-Based Decision Engine, yang kemudian meneruskan hasil evaluasinya kepada State Machine. State Machine meneruskan status yang telah ditetapkan kepada REST API Client, yang selanjutnya berkomunikasi dengan Controller Layer pada Backend. Controller Layer meneruskan data melalui Validation Layer dan Service Layer menuju Repository Layer untuk disimpan. Data yang telah tersimpan kemudian dapat diambil kembali oleh Frontend melalui Controller Layer yang sama, untuk ditampilkan oleh Monitoring Module dan Historical Data Module pada Dashboard Module.

---

## 6. Internal Data Flow

Alur pemrosesan data secara internal pada SIAGA, mulai dari pembacaan sensor hingga ditampilkan pada dashboard, dapat dijelaskan sebagai berikut.

Proses dimulai ketika Sensor Manager melakukan pembacaan nilai mentah dari sensor suhu, kelembapan, gerakan, cahaya, dan obstacle secara periodik. Nilai-nilai tersebut kemudian diteruskan sebagai satu kesatuan input kepada Rule-Based Decision Engine, yang mengevaluasi kombinasi nilai tersebut terhadap sekumpulan rule untuk menghasilkan penilaian tingkat ancaman. Hasil evaluasi ini kemudian diproses oleh State Machine untuk menentukan status sistem yang berlaku, yaitu salah satu dari NORMAL, WARNING, atau DANGER.

Status yang dihasilkan tersebut mengalir menuju dua tujuan secara bersamaan. Pada jalur pertama, status diteruskan kepada module output lokal untuk memperbarui tampilan OLED, indikator LED, dan aktivasi buzzer maupun relay sesuai kondisi yang berlaku, tanpa memerlukan keterlibatan Backend. Pada jalur kedua, data sensor beserta status sistem yang sama dikemas oleh REST API Client ke dalam format JSON dan dikirimkan menuju Backend melalui HTTP, dengan syarat WiFi Manager melaporkan status konektivitas yang aktif.

Setibanya di Backend, data tersebut diterima oleh Controller Layer dan diteruskan kepada Validation Layer untuk diperiksa kesesuaian struktur dan tipenya. Data yang dinyatakan valid diteruskan kepada Service Layer, yang selanjutnya berkoordinasi dengan Repository Layer dan Model Layer untuk disimpan sebagai record time-series pada Database Layer. Data yang tidak lolos validasi ditangani oleh Exception Handler dan tidak diteruskan ke tahap persistensi.

Ketika pengguna mengakses React Dashboard, Monitoring Module maupun Historical Data Module mengirimkan permintaan data melalui REST API yang disediakan oleh Controller Layer. Permintaan tersebut diteruskan melalui Service Layer dan Repository Layer untuk mengambil data dari Database Layer, baik berupa data terkini maupun data historis berdasarkan rentang waktu yang dipilih pengguna. Hasil pengambilan data tersebut kemudian dikembalikan sebagai response dan divisualisasikan oleh Frontend menggunakan komponen grafik dari Recharts.

Alur internal ini menegaskan kembali adanya dua jalur pemrosesan data yang independen sebagaimana dijelaskan pada SAD Bab 8: jalur lokal yang tidak bergantung pada konektivitas, dan jalur terpusat yang bergantung pada ketersediaan jaringan dan Backend.

---

## 7. Error Handling Strategy

Strategi penanganan error pada SIAGA dirancang agar kegagalan pada satu titik tidak menyebabkan kegagalan sistem secara keseluruhan, khususnya pada fungsi threat assessment lokal yang harus tetap beroperasi sesuai NFR-003.

**Sensor Error**
Apabila Sensor Manager mendeteksi kegagalan pembacaan pada salah satu sensor, kondisi tersebut dicatat oleh Logger dan ditangani agar tidak menghentikan proses evaluasi pada Rule-Based Decision Engine secara keseluruhan. Pendekatan ini memastikan bahwa gangguan pada satu sensor tidak melumpuhkan fungsi threat assessment yang bergantung pada kombinasi seluruh sensor.

**Communication Error**
Kegagalan komunikasi antara REST API Client dan Backend, misalnya akibat timeout atau response yang tidak valid, ditangani pada sisi Embedded tanpa memengaruhi jalur output lokal. WiFi Manager dan REST API Client bertanggung jawab mendeteksi kondisi ini dan mencatatnya melalui Logger, sementara upaya pengiriman ulang dapat dilakukan pada siklus pengiriman data berikutnya.

**Validation Error**
Data yang tidak memenuhi struktur atau tipe data yang ditetapkan akan ditolak oleh Validation Layer pada Backend sebelum mencapai Service Layer. Penolakan ini ditangani oleh Exception Handler, yang mengembalikan response error yang konsisten kepada pemanggil tanpa menyimpan data yang tidak valid ke database, selaras dengan Business Rule pada SRS Bab 6.

**Network Failure**
Kegagalan jaringan, baik pada sisi Embedded maupun pada sisi Frontend saat mengakses Backend, ditangani dengan memastikan fungsi inti pada masing-masing sisi tetap berjalan. Pada sisi Embedded, fungsi threat assessment dan output lokal tetap beroperasi independen dari konektivitas. Pada sisi Frontend, Monitoring Module dan Historical Data Module menangani kondisi tidak tersedianya response dari Backend tanpa menyebabkan aplikasi berhenti berfungsi secara keseluruhan.

**Unexpected Error**
Kondisi error yang tidak terantisipasi pada Backend ditangani secara terpusat oleh Exception Handler, yang memastikan setiap error tetap menghasilkan response yang terstruktur. Pada sisi Embedded, kondisi serupa dicatat oleh Logger untuk keperluan analisis lebih lanjut tanpa menyebabkan firmware berhenti beroperasi.

---

## 8. Configuration Management

Configuration Management pada SIAGA bertujuan memisahkan parameter yang dapat berubah dari logika inti software, sehingga penyesuaian konfigurasi tidak memerlukan perubahan pada kode program. Pada sisi Embedded, pengelolaan konfigurasi ini ditangani oleh Configuration Manager menggunakan library Preferences sesuai FR-019, sementara pada sisi Backend dan Frontend, parameter konfigurasi dikelola melalui mekanisme konfigurasi environment yang umum digunakan pada masing-masing technology stack.

Parameter konfigurasi yang dapat diubah pada sistem SIAGA meliputi:

- **Sampling Interval**: interval waktu pembacaan data oleh Sensor Manager, yang memengaruhi frekuensi evaluasi Rule-Based Decision Engine.
- **Threshold**: nilai ambang batas yang digunakan oleh Rule-Based Decision Engine dalam mengevaluasi kombinasi nilai sensor untuk menentukan tingkat ancaman.
- **WiFi Configuration**: kredensial dan parameter jaringan yang digunakan oleh WiFi Manager untuk terhubung ke jaringan WiFi.
- **API Endpoint**: alamat endpoint Backend yang digunakan oleh REST API Client untuk mengirimkan data.
- **Device ID**: identitas unik perangkat yang digunakan untuk membedakan sumber data pada saat pengiriman menuju Backend, sekaligus menjadi fondasi bagi kesiapan multi-device pada roadmap pengembangan lanjutan.

Seluruh parameter tersebut disimpan secara non-volatile pada sisi Embedded, sehingga tetap tersedia meskipun perangkat mengalami restart, tanpa memerlukan konfigurasi ulang secara manual setiap kali perangkat dinyalakan kembali.

---

## 9. Logging Strategy

Strategi logging pada SIAGA dirancang untuk mendukung proses debugging, pemantauan operasional, dan penelusuran masalah pada seluruh layer, tanpa menjadi bagian dari alur pengambilan keputusan itu sendiri.

**Firmware Log**
Dicatat oleh module Logger pada sisi Embedded, mencakup aktivitas seperti hasil pembacaan sensor, hasil evaluasi Rule-Based Decision Engine, transisi status pada State Machine, status koneksi WiFi, serta status pengiriman data melalui REST API Client. Log ini membantu proses debugging pada tahap pengembangan maupun pemantauan kondisi perangkat di lapangan.

**Backend Log**
Dicatat pada sisi Laravel Backend, mencakup aktivitas pemrosesan request yang diterima oleh Controller Layer, hasil validasi pada Validation Layer, proses persistensi data pada Repository Layer, serta kondisi error yang ditangani oleh Exception Handler. Log ini mendukung penelusuran masalah pada proses penerimaan dan penyimpanan data.

**API Log**
Mencakup pencatatan interaksi pada tingkat REST API, baik dari sisi pengiriman data oleh Embedded maupun dari sisi permintaan data oleh Frontend, termasuk informasi seperti endpoint yang diakses dan status response yang dihasilkan. Log ini membantu memantau pola komunikasi antar-component sesuai Communication Architecture yang telah ditetapkan pada SAD Bab 9.

---

## 10. Folder Structure

Struktur folder berikut merupakan contoh struktur tingkat tinggi yang selaras dengan Repository Structure pada Project Context Bab 16, dijabarkan lebih rinci pada tingkat module untuk masing-masing layer.

### Embedded

```
embedded/
├── src/
│   ├── sensors/          # Sensor Manager
│   ├── decision_engine/  # Rule-Based Decision Engine
│   ├── state_machine/    # State Machine
│   ├── network/          # WiFi Manager, REST API Client
│   ├── config/           # Configuration Manager
│   ├── logger/           # Logger
│   └── main.cpp
├── lib/
└── platformio.ini
```

### Backend

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/   # Controller Layer
│   ├── Services/          # Service Layer
│   ├── Repositories/      # Repository Layer
│   ├── Models/            # Model Layer
│   ├── Http/Requests/     # Validation Layer
│   └── Exceptions/        # Exception Handler
├── routes/
├── database/
└── config/
```

### Frontend

```
frontend/
├── src/
│   ├── modules/
│   │   ├── dashboard/       # Dashboard Module
│   │   ├── monitoring/      # Monitoring Module
│   │   ├── historical-data/ # Historical Data Module
│   │   ├── alert/           # Alert Module
│   │   └── device/          # Device Module
│   ├── components/          # Shared Components
│   └── pages/
└── public/
```

Struktur ini bersifat contoh tingkat tinggi dan dapat disesuaikan lebih lanjut pada tahap implementasi, selama tetap mengikuti pemisahan tanggung jawab module yang telah ditetapkan pada Bab 3.

---

## 11. Design Patterns

Beberapa design pattern diterapkan pada SIAGA di titik-titik yang relevan, tanpa memaksakan penggunaan pattern pada bagian yang tidak membutuhkannya.

- **Layered Architecture**: diterapkan secara konsisten pada Backend Layer melalui pemisahan Controller Layer, Service Layer, dan Repository Layer, selaras dengan architectural style yang telah ditetapkan pada SAD Bab 5.1.
- **Repository Pattern**: diterapkan pada Repository Layer untuk mengabstraksi mekanisme akses data, sehingga Service Layer tidak bergantung langsung pada detail implementasi query terhadap database.
- **Service Layer Pattern**: diterapkan untuk memisahkan business logic dari Controller Layer, memungkinkan logika pemrosesan data digunakan kembali oleh lebih dari satu Controller apabila diperlukan.
- **State Pattern**: diterapkan pada module State Machine untuk mengelola transisi status sistem (NORMAL, WARNING, DANGER) secara terstruktur, memastikan setiap transisi hanya terjadi melalui jalur yang telah didefinisikan.
- **Strategy Pattern**: dapat diterapkan pada Rule-Based Decision Engine untuk memungkinkan evaluasi rule dilakukan secara fleksibel, sehingga penambahan atau penyesuaian rule di masa mendatang tidak memerlukan perubahan struktural pada module tersebut.

Pattern seperti Dependency Injection diterapkan secara alami mengingat penggunaan Laravel sebagai backend framework, khususnya pada penyediaan Repository Layer kepada Service Layer, tanpa memerlukan konfigurasi tambahan di luar konvensi framework tersebut.

---

## 12. Coding Standards

Standar pengembangan software pada SIAGA mengacu pada prinsip-prinsip berikut, berlaku pada seluruh layer:

- **SOLID Principle**: setiap module dan class dirancang dengan tanggung jawab tunggal (Single Responsibility) dan tidak bergantung langsung pada detail implementasi module lain, khususnya pada Service Layer dan Repository Layer.
- **DRY (Don't Repeat Yourself)**: logika yang digunakan pada lebih dari satu tempat, seperti validasi struktur data maupun komponen antarmuka pada Frontend, disusun sebagai unit yang dapat digunakan kembali, misalnya melalui Shared Components.
- **KISS (Keep It Simple, Stupid)**: implementasi diarahkan untuk tetap sederhana sesuai kebutuhan MVP, tanpa menambahkan kompleksitas yang tidak diperlukan pada tahap ini.
- **Clean Code**: penulisan kode mengutamakan keterbacaan, penamaan yang deskriptif, serta struktur yang konsisten pada seluruh layer, selaras dengan Design Principle Clean Code pada Project Context Bab 15.
- **Naming Convention**: penamaan file, module, function, dan variable mengikuti konvensi standar dari masing-masing technology stack — misalnya konvensi Arduino/C++ pada Embedded, konvensi Laravel/PHP pada Backend, dan konvensi React/JavaScript pada Frontend — untuk menjaga konsistensi dan kemudahan pemeliharaan.

---

## 13. Design Decisions

Beberapa keputusan desain pada tingkat implementasi diambil untuk mendukung keputusan architecture yang telah ditetapkan pada SAD.

Pemisahan Rule-Based Decision Engine dan State Machine menjadi dua module yang terpisah, meskipun keduanya bekerja secara berurutan, diputuskan agar logika evaluasi ancaman dan logika pengelolaan transisi status dapat dikembangkan serta diuji secara independen, selaras dengan NFR-007 terkait scalability terhadap penambahan sensor.

Penempatan WiFi Manager sebagai module terpisah dari REST API Client diputuskan agar status konektivitas dapat dipantau secara independen dari proses pengiriman data, sehingga REST API Client dapat memeriksa ketersediaan jaringan sebelum melakukan pengiriman, tanpa mencampur logika pengelolaan koneksi dengan logika komunikasi data.

Pada Backend, pemisahan Validation Layer dari Service Layer diputuskan agar proses pemeriksaan struktur dan tipe data dapat dilakukan sedini mungkin sebelum data masuk ke business logic, sejalan dengan NFR-010 dan Business Rule terkait validasi data pada SRS Bab 6.

Pada Frontend, pemisahan Monitoring Module dari Historical Data Module diputuskan karena kedua module tersebut memiliki karakteristik pengambilan data yang berbeda — data real-time versus data berdasarkan rentang waktu — sehingga masing-masing dapat dikembangkan dan dioptimalkan sesuai kebutuhannya tanpa saling memengaruhi.

Penempatan Configuration Manager sebagai module tersendiri pada Embedded diputuskan agar parameter seperti Sampling Interval, Threshold, dan Device ID dapat diubah tanpa memerlukan perubahan pada logika Sensor Manager, Rule-Based Decision Engine, maupun REST API Client.

---

## 14. Future Design Considerations

Desain module pada dokumen ini disusun dengan mempertimbangkan kesiapan terhadap fitur-fitur pada roadmap Phase 6, sebagaimana ditetapkan pada Development Roadmap Project Context Bab 14 dan Scalability Considerations SAD Bab 12, tanpa mengimplementasikannya pada tahap MVP.

- **MQTT**: penempatan REST API Client sebagai module komunikasi yang terpisah dari WiFi Manager memungkinkan penambahan mekanisme komunikasi berbasis MQTT di masa mendatang tanpa mengubah struktur Sensor Manager, Rule-Based Decision Engine, maupun State Machine.
- **AI**: pemisahan Future AI menjadi module AI Service, Feature Engineering, Threat Prediction, dan Model Management pada Bab 3.4 disiapkan agar dapat mengonsumsi data historis dari Database Layer melalui mekanisme yang serupa dengan Historical Data Module pada Frontend, tanpa mengubah alur data inti yang telah ada.
- **LoRa**: kesiapan penambahan komunikasi LoRa didukung oleh pemisahan tanggung jawab komunikasi jaringan pada module WiFi Manager dan REST API Client, yang memungkinkan penambahan module komunikasi alternatif tanpa memengaruhi module threat assessment.
- **OTA**: penempatan Configuration Manager sebagai module tersendiri pada Embedded menyediakan fondasi bagi pengelolaan versi firmware di masa mendatang, sebagai bagian dari kesiapan menuju mekanisme Over-The-Air update.
- **Multi Device**: parameter Device ID pada Configuration Manager, sebagaimana dijelaskan pada Bab 8, menjadi fondasi bagi identifikasi perangkat secara individual apabila sistem dikembangkan untuk mendukung lebih dari satu perangkat ESP32.
- **Docker**: struktur folder Backend dan Database yang telah dipisahkan secara modular pada Bab 10 mendukung proses containerisasi di masa mendatang tanpa memerlukan restrukturisasi kode secara signifikan.

Rancangan rinci dari masing-masing poin di atas akan dijelaskan lebih lanjut pada dokumen turunan terkait, khususnya AI Design Document untuk aspek AI, serta dokumen implementasi lanjutan untuk aspek MQTT, LoRa, OTA, multi-device, dan Docker.

---

## 15. Glossary

| Istilah | Penjelasan |
|---|---|
| **Sensor Manager** | Module pada Embedded Layer yang bertanggung jawab atas pembacaan data dari seluruh sensor secara periodik. |
| **Rule-Based Decision Engine** | Module inti pengambilan keputusan yang mengevaluasi kombinasi nilai sensor untuk menentukan tingkat ancaman. |
| **State Machine** | Module yang mengelola transisi status sistem (NORMAL, WARNING, DANGER) secara terstruktur. |
| **WiFi Manager** | Module yang mengelola konektivitas jaringan WiFi pada perangkat Embedded. |
| **REST API Client** | Module pada Embedded yang mengemas dan mengirimkan data menuju Backend melalui REST API. |
| **Configuration Manager** | Module yang mengelola parameter konfigurasi perangkat secara non-volatile. |
| **Logger** | Module yang mencatat aktivitas dan kondisi penting pada firmware maupun Backend. |
| **Controller Layer** | Layer pada Backend yang menerima request REST API dan meneruskannya ke Service Layer. |
| **Service Layer** | Layer pada Backend yang menjalankan business logic dan mengoordinasikan proses data. |
| **Repository Layer** | Layer pada Backend yang mengabstraksi mekanisme akses data terhadap database. |
| **Model Layer** | Layer pada Backend yang merepresentasikan struktur data entitas sistem. |
| **Validation Layer** | Layer pada Backend yang memvalidasi struktur dan tipe data sebelum diproses lebih lanjut. |
| **Exception Handler** | Komponen pada Backend yang menangani kondisi error secara terpusat. |
| **Dashboard Module** | Module pada Frontend yang menyajikan ringkasan kondisi sistem secara keseluruhan. |
| **Monitoring Module** | Module pada Frontend yang menampilkan data sensor dan status sistem secara real-time. |
| **Historical Data Module** | Module pada Frontend yang menyajikan riwayat data berdasarkan rentang waktu tertentu. |
| **Alert Module** | Module pada Frontend yang menampilkan indikasi status WARNING dan DANGER. |
| **Device Module** | Module pada Frontend yang menampilkan informasi terkait perangkat. |
| **Shared Components** | Komponen antarmuka yang digunakan bersama oleh module lain pada Frontend. |
| **Design Pattern** | Pola desain umum yang digunakan untuk memecahkan permasalahan desain software secara konsisten. |
| **Repository Pattern** | Design pattern yang mengabstraksi mekanisme akses data dari business logic. |
| **State Pattern** | Design pattern yang digunakan untuk mengelola transisi status secara terstruktur. |
| **Strategy Pattern** | Design pattern yang memungkinkan penggantian algoritma atau logika evaluasi secara fleksibel. |
| **SOLID Principle** | Kumpulan lima prinsip desain software berorientasi objek yang mendukung maintainability. |
| **Clean Code** | Standar penulisan kode yang mengutamakan keterbacaan dan konsistensi. |

---

*Dokumen ini merupakan turunan dari SIAGA Project Context & Overview, SIAGA Software Requirements Specification, dan SIAGA Software Architecture Document, serta menjadi dasar bagi penyusunan Database Design Document (DDD), API Specification, Frontend Design Document, AI Design Document, dan implementasi software.*
