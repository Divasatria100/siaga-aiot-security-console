# SIAGA Frontend Design Document (FDD)

**Project Name:** SIAGA — ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment
**Document Type:** Frontend Design Document (FDD)
**Reference Documents:** SIAGA Software Design Document (SDD); SIAGA Database Design Document (DDD); SIAGA API Specification
**Status:** Draft v1.0

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini disusun untuk mendefinisikan desain frontend dari sistem SIAGA, yaitu React Dashboard yang berperan sebagai antarmuka pemantauan bagi pengguna. Dokumen ini menerjemahkan Frontend Module Design pada Software Design Document (SDD) Bab 3.3, Entity dan Table Design pada Database Design Document (DDD), serta kontrak komunikasi pada API Specification menjadi rancangan Component-Based Architecture, Application Structure, Navigation Design, Page Design, Component Design, State Management, dan strategi API Integration yang siap menjadi acuan implementasi React Dashboard.

Dokumen ini tidak mendefinisikan ulang architecture, technology stack, module design pada Backend maupun Embedded Layer, desain skema database, maupun spesifikasi endpoint REST API secara rinci, karena seluruh topik tersebut telah dibahas masing-masing pada SDD, DDD, dan API Specification sebagai dokumen rujukan.

### 1.2 Scope

Ruang lingkup dokumen ini terbatas pada desain frontend untuk sistem SIAGA pada tahap Minimum Viable Product (MVP), selaras dengan ruang lingkup yang telah ditetapkan pada SDD Bab 1.2 dan API Specification Bab 1.2. Dokumen ini membahas desain frontend secara konseptual — Component Architecture, Application Structure, Navigation Design, Page Design, Component Design, State Management, API Integration, dan Data Visualization — tanpa membahas implementasi kode React, wireframe, mockup, maupun diagram.

Fitur-fitur pada roadmap Phase 6 yang berkaitan dengan Frontend (Dark Mode, Multi Device Dashboard, Real-Time WebSocket, AI Visualization, Notification Center) dibahas pada Bab 14 sebagai **Future Development**, bukan sebagai bagian dari desain frontend MVP.

### 1.3 References

1. *SIAGA Software Design Document (SDD)* — dokumen rujukan terkait Frontend Module Design (Bab 3.3), Component Responsibilities, Module Interaction, dan Folder Structure Frontend.
2. *SIAGA Database Design Document (DDD)* — dokumen rujukan terkait Entity Design dan Table Design yang menjadi sumber data yang ditampilkan pada Dashboard.
3. *SIAGA API Specification* — dokumen rujukan terkait REST API Endpoint, Request/Response Structure, dan Response Standard yang menjadi kontrak komunikasi antara Frontend dan Backend.

---

## 2. Frontend Overview

React Dashboard merupakan Human Machine Interface (HMI) dari sistem SIAGA, yang berfungsi sebagai satu-satunya titik akses bagi pengguna untuk memantau kondisi perangkat ESP32, data sensor, dan status ancaman secara terpusat. Sebagaimana ditetapkan pada SDD Bab 3.3, React Dashboard tidak terlibat dalam proses pengambilan keputusan threat assessment — proses tersebut sepenuhnya berlangsung pada Rule-Based Decision Engine dan State Machine di sisi Embedded Layer. React Dashboard berperan murni sebagai lapisan Presentation yang menyajikan data yang telah tersimpan pada Database Layer melalui Backend, tanpa memengaruhi jalur pengambilan keputusan lokal yang bersifat independen terhadap konektivitas jaringan.

Sebagai HMI, React Dashboard memiliki tiga peran utama:

- **Monitoring**, menampilkan data sensor dan status sistem terkini secara real-time bagi pengguna, sesuai FR-016 dan FR-017 pada SRS.
- **Historical Review**, menyajikan riwayat data sensor dan status sistem berdasarkan rentang waktu tertentu, sesuai FR-018.
- **Alerting**, menyajikan indikasi visual terhadap kejadian WARNING dan DANGER yang telah tercatat pada sistem, sebagai representasi dari fungsi Alert & Notification pada SRS Bab 5.6.

Seluruh peran tersebut dijalankan melalui interaksi dengan REST API yang disediakan oleh Controller Layer pada Backend, sebagaimana dijelaskan pada SDD Bab 5 dan Bab 6.

---

## 3. Frontend Architecture

### 3.1 Component-Based Architecture

React Dashboard dirancang mengikuti Component-Based Architecture, di mana antarmuka disusun sebagai kumpulan Component yang independen, dapat digunakan kembali, dan memiliki tanggung jawab yang jelas. Setiap Component menerima data melalui props dan menghasilkan tampilan (UI) berdasarkan data tersebut, tanpa saling bergantung secara langsung terhadap Component lain di luar hubungan parent-child yang telah ditetapkan. Pendekatan ini selaras dengan prinsip Modular Architecture yang diterapkan secara konsisten pada seluruh layer SIAGA, sebagaimana ditetapkan pada SAD.

### 3.2 Feature-Based Folder Structure

Struktur folder Frontend disusun berdasarkan Feature-Based Folder Structure, mengikuti pembagian Frontend Module pada SDD Bab 3.3 — Dashboard Module, Monitoring Module, Historical Data Module, Alert Module, dan Device Module. Setiap module memiliki folder tersendiri yang mengelompokkan Component, Hook, dan Service yang relevan dengan module tersebut, sebagaimana telah digambarkan pada Folder Structure Frontend di SDD Bab 10. Pendekatan ini memastikan setiap module dapat dikembangkan, diuji, dan dipelihara secara independen, tanpa memengaruhi module lain.

### 3.3 Separation of Concerns

Setiap lapisan pada Frontend memiliki tanggung jawab yang terpisah secara tegas:

- **Pages** bertanggung jawab menyusun tampilan halaman secara keseluruhan, menggabungkan beberapa Component menjadi satu kesatuan tampilan.
- **Components** bertanggung jawab menyajikan UI berdasarkan data yang diterima, tanpa mengetahui dari mana data tersebut berasal.
- **Services** bertanggung jawab menangani komunikasi dengan REST API, mengabstraksi detail Request dan Response dari Component yang menggunakannya.
- **Hooks** bertanggung jawab mengelola logika State dan efek samping (side effect) yang dapat digunakan kembali oleh lebih dari satu Component.

Pemisahan ini selaras dengan prinsip Separation of Concerns yang diterapkan secara konsisten pada seluruh layer SIAGA sesuai SDD Bab 12.

### 3.4 Reusable Components

Component yang digunakan oleh lebih dari satu Module — seperti indikator status, kartu ringkasan, tabel data, maupun elemen grafik — dirancang sebagai Reusable Component yang ditempatkan pada Shared Components, sebagaimana dijelaskan pada SDD Bab 3.3. Reusable Component menerima data dan konfigurasi tampilan melalui props, sehingga dapat digunakan pada konteks yang berbeda-beda tanpa duplikasi implementasi.

---

## 4. Technology Stack

Technology stack Frontend telah ditetapkan pada dokumen referensi dan tidak diubah pada dokumen ini. Berikut penjelasan peran masing-masing teknologi dalam konteks desain frontend:

**React**
Digunakan sebagai Library utama untuk membangun antarmuka pengguna berbasis Component, memungkinkan penyusunan UI yang modular dan reusable, selaras dengan Component-Based Architecture pada Bab 3.1.

**Vite**
Digunakan sebagai build tool yang menyediakan proses development dan build yang cepat bagi React Dashboard, mendukung produktivitas pengembangan tanpa memengaruhi arsitektur aplikasi.

**Tailwind CSS**
Digunakan sebagai utility-first CSS Framework untuk penulisan style secara konsisten dan efisien, mendukung penerapan Responsive Design dan menjaga konsistensi visual pada seluruh Component.

**shadcn/ui**
Digunakan sebagai kumpulan Component UI yang menjadi dasar bagi Shared Components, menyediakan elemen antarmuka standar seperti button, card, table, dan dialog yang konsisten secara visual dan dapat disesuaikan sesuai kebutuhan SIAGA.

**React Router**
Digunakan untuk mengelola Routing antar-halaman pada React Dashboard, memetakan setiap Page kepada URL tertentu sesuai Navigation Design pada Bab 6.

**Axios**
Digunakan sebagai HTTP Client untuk menjalankan komunikasi dengan REST API yang disediakan oleh Backend, sebagaimana dijelaskan pada strategi API Integration di Bab 10.

**Recharts**
Digunakan sebagai Library visualisasi data untuk menyajikan data sensor dan tren status sistem dalam bentuk grafik, sesuai FR-017 dan tanggung jawab Monitoring Module pada SDD Bab 3.3.

---

## 5. Application Structure

Application Structure Frontend disusun secara konseptual sebagai berikut, selaras dengan Folder Structure pada SDD Bab 10:

- **Pages**, merepresentasikan setiap halaman yang dapat diakses melalui Routing, seperti Dashboard, Monitoring, Historical Data, Alerts, dan Device Settings. Setiap Page menyusun Component dari Module terkait menjadi satu kesatuan tampilan.
- **Components**, terdiri atas Component yang spesifik bagi satu Module (misalnya Sensor Card pada Monitoring Module) maupun Reusable Component pada Shared Components.
- **Layouts**, merepresentasikan struktur tampilan umum yang digunakan pada seluruh Page, mencakup Sidebar, Navbar, dan area konten utama.
- **Services**, merepresentasikan lapisan komunikasi dengan REST API, mengelompokkan fungsi pemanggilan API berdasarkan resource — Devices, Sensor Data, Alerts, dan System Status — sesuai API Resource pada API Specification Bab 5.
- **Hooks**, merepresentasikan logika State dan pengambilan data yang dapat digunakan kembali oleh lebih dari satu Component, misalnya logika pengambilan data terkini secara berkala.
- **Utils**, merepresentasikan fungsi pendukung yang bersifat generik, seperti pemformatan tanggal dari format ISO 8601 pada Response API, maupun pemformatan satuan data sensor.
- **Types**, merepresentasikan struktur data yang digunakan pada Frontend, diselaraskan dengan struktur Response API pada API Specification Bab 9.1, seperti struktur data device, sensor data, dan alert.
- **Assets**, merepresentasikan berkas statis yang digunakan pada tampilan, seperti icon dan logo.

---

## 6. Navigation Design

Struktur navigasi React Dashboard disusun berdasarkan Frontend Module pada SDD Bab 3.3 dan resource yang tersedia pada API Specification Bab 5, mencakup halaman berikut:

- **Dashboard**, sebagai halaman utama yang menyajikan ringkasan kondisi sistem secara keseluruhan.
- **Monitoring**, sebagai halaman yang menyajikan data sensor dan status sistem terkini secara real-time bagi satu device.
- **Historical Data**, sebagai halaman yang menyajikan riwayat data sensor berdasarkan rentang waktu yang dipilih pengguna.
- **Alerts**, sebagai halaman yang menyajikan riwayat kejadian WARNING dan DANGER.
- **Devices**, sebagai halaman yang menyajikan daftar dan detail perangkat yang terdaftar pada sistem.

Navigasi antar-halaman tersebut ditampilkan melalui Sidebar yang persisten pada seluruh Page, memungkinkan pengguna berpindah antar-halaman tanpa kehilangan konteks. Setiap item navigasi pada Sidebar dipetakan kepada satu Route menggunakan React Router, sesuai Technology Stack pada Bab 4.

Halaman **Settings** sebagaimana disebutkan pada module design tidak dirancang sebagai halaman konfigurasi yang menulis data melalui Frontend pada tahap MVP, karena parameter konfigurasi perangkat — Sampling Interval, Threshold, WiFi Configuration, API Endpoint, dan Device ID — dikelola oleh Configuration Manager pada Embedded Layer sesuai SDD Bab 8, dan tidak tersedia sebagai endpoint penulisan pada API Specification. Kebutuhan terkait pengaturan device pada Frontend tahap MVP diakomodasi melalui halaman **Devices**, yang bersifat read-only terhadap informasi device.

---

## 7. Page Design

### 7.1 Dashboard Page

**Purpose**
Menyajikan ringkasan kondisi sistem secara keseluruhan sebagai titik masuk utama bagi pengguna, sesuai tanggung jawab Dashboard Module pada SDD Bab 3.3.

**Main Components**
Dashboard Card untuk ringkasan jumlah device online/offline, Device Status Card untuk status ringkas tiap device, dan Alert Card untuk menyoroti kejadian WARNING/DANGER terbaru.

**Data Displayed**
Total device, jumlah device online dan offline, status sistem terkini tiap device (`latest_status`), serta waktu `last_seen_at`, sesuai struktur Response pada resource System Status.

**User Interaction**
Pengguna dapat memilih salah satu Device Status Card untuk berpindah menuju halaman Monitoring bagi device terkait.

**Related API**
`GET /api/v1/system/status`.

### 7.2 Monitoring Page

**Purpose**
Menyajikan data sensor dan status sistem terkini bagi satu device secara real-time dalam bentuk visual, sesuai tanggung jawab Monitoring Module pada SDD Bab 3.3 dan FR-017.

**Main Components**
Sensor Card untuk tiap jenis sensor (suhu, kelembapan, gerakan, cahaya, obstacle), Device Status Card untuk status konektivitas device, dan Chart untuk tren nilai sensor.

**Data Displayed**
Nilai `temperature`, `humidity`, `motion`, `light`, `obstacle`, `status`, dan `recorded_at` dari record sensor data terkini.

**User Interaction**
Pengguna dapat memilih device melalui selector, serta melakukan refresh data secara manual maupun otomatis melalui polling berkala, sebagaimana dijelaskan pada Bab 10.

**Related API**
`GET /api/v1/sensor-data/latest`, `GET /api/v1/devices/{device_id}`.

### 7.3 Historical Data Page

**Purpose**
Menyajikan riwayat data sensor dan status sistem berdasarkan rentang waktu tertentu, sesuai tanggung jawab Historical Data Module pada SDD Bab 3.3 dan FR-018.

**Main Components**
Filter rentang waktu (start date, end date), Chart untuk tren data sensor pada rentang waktu terpilih, dan Data Table untuk menyajikan record secara rinci dengan Pagination.

**Data Displayed**
Kumpulan record `sensor_data` berdasarkan rentang `recorded_at`, mencakup `temperature`, `humidity`, `motion`, `light`, `obstacle`, dan `status`, beserta informasi `meta` (`current_page`, `per_page`, `total`).

**User Interaction**
Pengguna memilih device, menentukan rentang waktu, serta berpindah halaman data melalui kontrol Pagination.

**Related API**
`GET /api/v1/sensor-data/history`.

### 7.4 Alerts Page

**Purpose**
Menyajikan riwayat kejadian WARNING dan DANGER, sesuai tanggung jawab Alert Module pada SDD Bab 3.3 dan fitur Alert & Notification pada SRS Bab 5.6.

**Main Components**
Filter berdasarkan device, status, dan rentang waktu; Data Table untuk daftar alert; Alert Card untuk detail satu alert yang mencakup data sensor pemicunya.

**Data Displayed**
`device_id`, `status`, `triggered_at` pada daftar alert, serta `sensor_data` (temperature, humidity, motion, light, obstacle) pada tampilan detail alert.

**User Interaction**
Pengguna dapat memfilter daftar alert, memilih satu alert untuk melihat detail, serta berpindah halaman melalui kontrol Pagination.

**Related API**
`GET /api/v1/alerts`, `GET /api/v1/alerts/{id}`.

### 7.5 Devices Page

**Purpose**
Menyajikan informasi terkait perangkat yang terdaftar pada sistem, sesuai tanggung jawab Device Module pada SDD Bab 3.3.

**Main Components**
Data Table untuk daftar device, Device Status Card untuk ringkasan status tiap device, dan tampilan detail device.

**Data Displayed**
`device_id`, `name`, `status`, `last_seen_at`, `created_at`, dan `updated_at` pada tampilan detail device.

**User Interaction**
Pengguna dapat memfilter daftar device berdasarkan status konektivitas, serta memilih satu device untuk melihat detail maupun berpindah menuju halaman Monitoring bagi device tersebut.

**Related API**
`GET /api/v1/devices`, `GET /api/v1/devices/{device_id}`.

---

## 8. Component Design

**Sidebar**
Bertanggung jawab menyajikan navigasi utama antar-Page sesuai Navigation Design pada Bab 6, serta menandai Page yang sedang aktif agar pengguna dapat mengetahui posisinya dalam aplikasi.

**Navbar**
Bertanggung jawab menyajikan informasi kontekstual pada bagian atas tampilan, seperti judul halaman yang sedang aktif, tanpa mengandung logika navigasi utama yang telah menjadi tanggung jawab Sidebar.

**Dashboard Card**
Bertanggung jawab menyajikan satu ringkasan metrik pada Dashboard Page, seperti total device atau jumlah device online, dalam bentuk yang ringkas dan mudah dibaca.

**Sensor Card**
Bertanggung jawab menyajikan satu nilai sensor beserta satuannya secara ringkas, digunakan berulang pada Monitoring Page untuk tiap jenis sensor.

**Device Status Card**
Bertanggung jawab menyajikan ringkasan status satu device, mencakup status konektivitas dan status sistem terkini, digunakan pada Dashboard Page dan Devices Page.

**Alert Card**
Bertanggung jawab menyajikan informasi satu kejadian alert secara ringkas maupun rinci, mencakup status, waktu kejadian, dan device terkait.

**Data Table**
Bertanggung jawab menyajikan data dalam bentuk tabular dengan dukungan Pagination, digunakan pada Historical Data Page, Alerts Page, dan Devices Page.

**Chart**
Bertanggung jawab memvisualisasikan data sensor maupun status sistem dalam bentuk grafik menggunakan Recharts, digunakan pada Monitoring Page dan Historical Data Page sesuai Bab 11.

**Loading Indicator**
Bertanggung jawab menyajikan indikasi visual bahwa data sedang diambil dari REST API, sebagai representasi dari Loading State pada Bab 10.

**Empty State**
Bertanggung jawab menyajikan tampilan alternatif ketika data yang diminta tidak tersedia, misalnya ketika suatu device belum memiliki record `sensor_data`.

**Error State**
Bertanggung jawab menyajikan tampilan alternatif ketika Request menuju REST API mengalami kegagalan, sebagai representasi dari Error Handling pada Bab 10.

---

## 9. State Management

Strategi State Management pada React Dashboard dibagi menjadi tiga kategori berdasarkan sifat dan sumber data, tanpa membahas implementasi Library secara rinci.

**Local State**
Digunakan untuk mengelola State yang hanya relevan bagi satu Component, seperti status buka-tutup dialog, nilai input pada filter, atau halaman aktif pada Pagination. Local State tidak perlu dibagikan kepada Component lain di luar konteks penggunaannya.

**Server State**
Digunakan untuk mengelola data yang berasal dari REST API, seperti daftar device, data sensor terkini, data historis, dan daftar alert. Server State mencakup representasi Loading State, Error State, dan data hasil Response, sebagaimana dijelaskan pada Bab 10. Server State dikelola pada tingkat Hook yang digunakan oleh Component maupun Page terkait, memungkinkan mekanisme refetching data secara berkala khususnya bagi Monitoring Page.

**Global State**
Digunakan secara terbatas hanya bagi data yang benar-benar dibutuhkan lintas Module, seperti device yang sedang dipilih pengguna untuk ditampilkan pada Monitoring Page maupun Historical Data Page. Global State tidak digunakan untuk menyimpan data yang bersifat Server State, guna menghindari duplikasi sumber kebenaran data.

---

## 10. API Integration

React Dashboard berkomunikasi dengan REST API yang disediakan oleh Controller Layer pada Backend menggunakan Axios sebagai HTTP Client, mengikuti Response Standard pada API Specification Bab 9.

**Request Flow**
Setiap kebutuhan data pada Page atau Component diteruskan menuju Services yang relevan dengan resource terkait — Devices, Sensor Data, Alerts, atau System Status. Services menyusun Request sesuai Endpoint Specification pada API Specification Bab 6, termasuk penyertaan Path Parameter, Query Parameter, maupun Request Body yang diperlukan.

**Response Handling**
Response yang diterima dari REST API mengikuti struktur standar `success` dan `data`, sebagaimana ditetapkan pada API Specification Bab 9.1. Frontend mengekstraksi field `data` untuk digunakan oleh Component terkait, serta membaca field `meta` pada endpoint yang menerapkan Pagination — `GET /api/v1/sensor-data/history` dan `GET /api/v1/alerts` — untuk mengelola navigasi antar-halaman data pada Data Table.

**Error Handling**
Apabila Response menunjukkan kegagalan sesuai Error Response Standard pada API Specification Bab 9.2, Frontend menampilkan Error State pada Component terkait, tanpa menghentikan operasional Page secara keseluruhan. Kondisi `404 Not Found`, misalnya pada `GET /api/v1/sensor-data/latest` ketika device belum memiliki record, ditampilkan melalui Empty State agar dapat dibedakan dari kegagalan komunikasi lainnya.

**Loading State**
Selama Request masih berlangsung, Component terkait menampilkan Loading Indicator, memastikan pengguna memperoleh umpan balik visual bahwa data sedang diproses, sesuai prinsip User Feedback pada Bab 13.

---

## 11. Data Visualization

Visualisasi data pada React Dashboard disusun sesuai kebutuhan tiap Page dan karakteristik data yang ditampilkan, menggunakan Recharts sebagai Library utama.

- **Line Chart**, digunakan untuk menampilkan tren nilai sensor yang bersifat kontinu — suhu, kelembapan, dan cahaya — terhadap waktu, baik pada Monitoring Page maupun Historical Data Page.
- **Bar Chart**, digunakan untuk menampilkan perbandingan agregat, misalnya jumlah kejadian alert berdasarkan status pada rentang waktu tertentu.
- **Status Indicator**, digunakan untuk menampilkan status sistem (`NORMAL`, `WARNING`, `DANGER`) maupun status konektivitas device (`online`, `offline`) secara visual melalui warna dan label yang konsisten.
- **Badge**, digunakan untuk menandai status pada Data Table maupun Card secara ringkas, seperti status alert atau status device.
- **Table**, digunakan melalui Component Data Table untuk menyajikan data historis dan daftar alert secara rinci, dilengkapi dengan Pagination sesuai Response Standard.

---

## 12. Responsive Design

React Dashboard dirancang untuk tetap dapat digunakan secara optimal pada berbagai ukuran layar, menggunakan pendekatan Responsive Design berbasis Tailwind CSS.

**Desktop**
Menjadi target utama penggunaan, dengan Sidebar yang ditampilkan secara persisten dan layout multi-kolom bagi Dashboard Card, Sensor Card, dan Chart, guna memaksimalkan visibilitas informasi.

**Tablet**
Layout disesuaikan menjadi jumlah kolom yang lebih sedikit dibanding Desktop, dengan Sidebar yang tetap dapat diakses namun dapat disembunyikan untuk memaksimalkan ruang tampilan konten.

**Mobile**
Layout disusun menjadi satu kolom secara vertikal, dengan Sidebar diubah menjadi navigasi yang dapat disembunyikan (misalnya melalui toggle), serta Data Table disesuaikan agar tetap dapat dibaca pada layar yang sempit.

---

## 13. UI/UX Design Principles

**Consistency**
Seluruh Component mengikuti pola visual yang sama, memanfaatkan Shared Components berbasis shadcn/ui, sehingga pengguna memperoleh pengalaman yang seragam pada seluruh Page.

**Simplicity**
Tampilan dirancang untuk menyajikan informasi yang relevan secara langsung, tanpa elemen tambahan yang tidak mendukung kebutuhan monitoring, selaras dengan prinsip KISS pada SDD Bab 12.

**Accessibility**
Elemen antarmuka dirancang dengan kontras warna yang memadai, khususnya pada Status Indicator dan Badge yang merepresentasikan kondisi WARNING dan DANGER, agar tetap dapat dibedakan secara jelas oleh pengguna.

**Readability**
Data numerik dan status ditampilkan dengan format dan satuan yang konsisten, serta ukuran teks yang memadai pada seluruh ukuran layar sesuai Responsive Design pada Bab 12.

**User Feedback**
Setiap interaksi pengguna — pengambilan data, kegagalan Request, maupun kondisi data kosong — direspons melalui Loading Indicator, Error State, atau Empty State, sehingga pengguna senantiasa mengetahui kondisi sistem yang sedang berlangsung.

---

## 14. Future Frontend

Bagian ini membahas pengembangan Frontend pada roadmap Phase 6 yang **belum menjadi bagian dari desain MVP**, sesuai Future Design Considerations pada SDD Bab 14 dan Future API pada API Specification Bab 12.

- **Dark Mode** *(Future Development)* — penambahan tema tampilan alternatif bagi pengguna.
- **Multi Device Dashboard** *(Future Development)* — tampilan yang mendukung pengelolaan kepemilikan device oleh entity `users` secara Many-to-Many, sebagaimana disebutkan pada DDD Bab 7 dan API Specification Bab 12.
- **Real-Time WebSocket** *(Future Development)* — mekanisme pembaruan data secara real-time tanpa polling, sebagai pelengkap komunikasi MQTT pada roadmap Embedded.
- **AI Visualization** *(Future Development)* — visualisasi hasil Threat Scoring dari Adaptive Threat Intelligence Engine, sebagaimana disebutkan pada SDD Bab 3.4 dan Future API Bab 12.
- **Notification Center** *(Future Development)* — pusat notifikasi bagi kejadian WARNING dan DANGER secara real-time, sebagai pelengkap Alert Module pada tahap MVP.

---

## 15. Design Decisions

**Pemilihan React**
React dipilih karena mendukung Component-Based Architecture yang selaras dengan kebutuhan penyusunan antarmuka modular bagi Dashboard, Monitoring, Historical Data, Alert, dan Device Module sebagaimana ditetapkan pada SDD Bab 3.3.

**Pemilihan Tailwind CSS**
Tailwind CSS dipilih karena mendukung penulisan style yang konsisten dan efisien melalui pendekatan utility-first, mempermudah penerapan Responsive Design pada Bab 12 tanpa memerlukan pengelolaan file CSS terpisah bagi setiap Component.

**Pemilihan shadcn/ui**
shadcn/ui dipilih sebagai dasar Shared Components karena menyediakan Component UI yang dapat disesuaikan langsung pada basis kode Frontend, mendukung konsistensi visual sekaligus fleksibilitas penyesuaian tampilan sesuai kebutuhan SIAGA.

**Pemilihan Recharts**
Recharts dipilih karena menyediakan Component Chart berbasis React yang dapat langsung diintegrasikan dengan Server State pada Monitoring Page dan Historical Data Page, mendukung visualisasi data time-series sesuai FR-017 dan FR-018.

---

## 16. Glossary

| Istilah | Penjelasan |
|---|---|
| **Frontend** | Bagian aplikasi yang berinteraksi langsung dengan pengguna melalui antarmuka. |
| **HMI (Human Machine Interface)** | Antarmuka yang menghubungkan pengguna dengan sistem, dalam konteks ini React Dashboard. |
| **Component** | Unit antarmuka yang independen dan dapat digunakan kembali pada React. |
| **Component-Based Architecture** | Pendekatan arsitektur yang menyusun antarmuka sebagai kumpulan Component. |
| **Feature-Based Folder Structure** | Struktur folder yang dikelompokkan berdasarkan Module atau fitur, bukan berdasarkan jenis file. |
| **Reusable Component** | Component yang dirancang agar dapat digunakan pada lebih dari satu konteks tanpa duplikasi. |
| **Page** | Halaman pada Frontend yang dipetakan kepada satu Route melalui React Router. |
| **Layout** | Struktur tampilan umum yang digunakan pada seluruh Page, seperti Sidebar dan Navbar. |
| **Service** | Lapisan pada Frontend yang menangani komunikasi dengan REST API. |
| **Hook** | Unit logika State atau efek samping yang dapat digunakan kembali oleh Component. |
| **Local State** | State yang hanya relevan bagi satu Component. |
| **Server State** | State yang merepresentasikan data hasil komunikasi dengan REST API. |
| **Global State** | State yang dibagikan lintas Module pada Frontend. |
| **Loading State** | Kondisi ketika data sedang diambil dari REST API. |
| **Empty State** | Tampilan alternatif ketika data yang diminta tidak tersedia. |
| **Error State** | Tampilan alternatif ketika Request menuju REST API mengalami kegagalan. |
| **Data Table** | Component yang menyajikan data dalam bentuk tabular dengan dukungan Pagination. |
| **Status Indicator** | Component visual yang merepresentasikan status sistem atau status konektivitas device. |
| **Responsive Design** | Pendekatan desain yang menyesuaikan tampilan terhadap berbagai ukuran layar. |

---

*Dokumen ini merupakan turunan dari SIAGA Software Design Document, SIAGA Database Design Document, dan SIAGA API Specification, serta menjadi acuan bagi implementasi React Dashboard pada sistem SIAGA.*
