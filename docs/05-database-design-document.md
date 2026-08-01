# SIAGA Database Design Document (DDD)

**Project Name:** SIAGA — ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment
**Document Type:** Database Design Document (DDD)
**Reference Documents:** SIAGA Project Context & Overview; SIAGA Software Requirements Specification (SRS); SIAGA Software Architecture Document (SAD); SIAGA Software Design Document (SDD)
**Status:** Draft v1.0

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini disusun untuk mendefinisikan **database design** dari sistem SIAGA, mencakup entity design, table design, relationship design, time-series design, indexing strategy, data integrity, naming convention, serta security dan roadmap pada layer database. Dokumen ini menerjemahkan keputusan architecture yang telah ditetapkan pada Software Architecture Document (SAD) dan module design pada Software Design Document (SDD) — khususnya yang berkaitan dengan Database Layer, Repository Layer, dan Model Layer — menjadi rancangan database yang konkret dan siap dijadikan acuan implementasi.

Dokumen ini akan menjadi referensi utama bagi penyusunan API Specification, proses implementasi migration, serta AI Design Document pada tahap pengembangan lanjutan.

### 1.2 Scope

Ruang lingkup dokumen ini terbatas pada perancangan database sistem SIAGA menggunakan PostgreSQL dengan ekstensi TimescaleDB, pada tahap Minimum Viable Product (MVP) sebagaimana ditetapkan pada Project Context Bab 6 dan SRS Bab 1.2. Dokumen ini tidak membahas ulang architectural style, logical architecture, component architecture, module design, maupun functional/non-functional requirement yang telah dijelaskan secara rinci pada dokumen referensi. Dokumen ini juga tidak membahas spesifikasi REST API, desain frontend, maupun rancangan detail komponen AI, karena ketiga topik tersebut akan dibahas pada dokumen turunan tersendiri.

Fitur-fitur pada roadmap Phase 6 (Multi Device, AI Dataset, MQTT Data, LoRa Gateway, Partitioning, Replication) dibahas pada Bab 13 sebagai Future Database Considerations, bukan sebagai bagian dari database design MVP.

### 1.3 References

1. *SIAGA Project Context & Overview* — dokumen rujukan utama terkait background, objectives, scope, technology stack, dan development roadmap.
2. *SIAGA Software Requirements Specification (SRS)* — dokumen rujukan terkait functional requirements, non-functional requirements, dan business rules, khususnya yang berkaitan dengan Historical Data dan Alert & Notification.
3. *SIAGA Software Architecture Document (SAD)* — dokumen rujukan terkait Database Layer, Data Flow Architecture, dan Security Architecture.
4. *SIAGA Software Design Document (SDD)* — dokumen rujukan terkait Model Layer, Repository Layer, Configuration Management, dan Logging Strategy.

---

## 2. Database Overview

PostgreSQL dipilih sebagai relational database management system utama pada SIAGA karena menyediakan kapabilitas relational database standar yang matang, mendukung constraint, transaction, dan referential integrity secara native, sekaligus kompatibel penuh dengan Laravel melalui Eloquent ORM pada Model Layer dan Repository Layer sebagaimana dijelaskan pada SDD Bab 3.2. Kapabilitas relational ini digunakan untuk menyimpan entity yang bersifat master data dan struktural, seperti identitas perangkat dan riwayat alert.

TimescaleDB digunakan sebagai ekstensi di atas PostgreSQL untuk menangani kebutuhan penyimpanan data sensor yang bersifat time-series, sesuai dengan Business Rule pada SRS Bab 6 yang menetapkan bahwa data sensor dan status sistem bersifat immutable, serta NFR-008 yang mensyaratkan struktur penyimpanan mampu menangani pertumbuhan volume data seiring waktu. Dengan mekanisme hypertable, TimescaleDB memungkinkan data sensor yang terus bertambah secara periodik tetap dapat di-query secara efisien tanpa mengorbankan kapabilitas relational PostgreSQL untuk entity lain di dalam database yang sama.

Kombinasi keduanya memungkinkan SIAGA memiliki satu database engine yang menangani dua karakteristik data yang berbeda — data relational (devices, alerts) dan data time-series (sensor_data) — tanpa memerlukan sistem penyimpanan terpisah, selaras dengan prinsip Maintainability dan Extensibility pada Project Context Bab 15.

---

## 3. Database Architecture

Secara konseptual, Database Layer pada SIAGA berada pada posisi penerima akhir dari alur data yang telah dijelaskan pada SAD Bab 8 (Data Flow Architecture), dengan fokus khusus pada bagaimana data mengalir menuju dan dari database itu sendiri.

Pada jalur penyimpanan (write path), ESP32 mengirimkan data sensor beserta status sistem melalui REST API menuju Laravel. Laravel, melalui Controller Layer, Validation Layer, Service Layer, dan Repository Layer, menerima data tersebut dan menuliskannya ke dalam PostgreSQL. Data sensor dituliskan ke hypertable yang dikelola oleh TimescaleDB, sementara informasi terkait identitas perangkat dan kejadian alert dituliskan ke table relational standar pada PostgreSQL yang sama.

Pada jalur pembacaan (read path), Dashboard mengirimkan permintaan data — baik data terkini maupun data historis — melalui REST API menuju Laravel. Laravel, melalui Repository Layer yang sama, melakukan query terhadap PostgreSQL dan TimescaleDB, kemudian mengembalikan hasilnya untuk divisualisasikan oleh React Dashboard.

Dengan demikian, PostgreSQL dan TimescaleDB berperan sebagai satu kesatuan penyimpanan yang diakses secara eksklusif melalui Laravel Backend, tanpa akses langsung dari ESP32 maupun Dashboard, sejalan dengan Layered Architecture yang ditetapkan pada SAD Bab 5.1 dan Repository Pattern yang ditetapkan pada SDD Bab 11.

---

## 4. Database Design Principles

Perancangan database SIAGA berpedoman pada prinsip-prinsip berikut, selaras dengan Design Principles pada Project Context Bab 15.

**Normalization**
Table relational seperti devices dan alerts dirancang mengikuti normalized form yang wajar (hingga Third Normal Form) untuk menghindari redundansi data identitas perangkat, sementara hypertable sensor_data tetap dipertahankan dalam bentuk yang relatif denormalized terhadap satu record pembacaan sensor, sesuai karakteristik data time-series yang umumnya dioptimalkan untuk kecepatan penulisan (write throughput) dan query berbasis waktu, bukan untuk menghindari redundansi secara ketat.

**Data Integrity**
Setiap table dilengkapi dengan primary key, foreign key, dan constraint yang relevan untuk memastikan data yang tersimpan selalu konsisten dan merepresentasikan kondisi nyata sistem, sejalan dengan NFR-004 terkait tidak terjadinya data loss maupun data yang tidak konsisten.

**Scalability**
Struktur database dirancang agar mampu menangani pertumbuhan volume data sensor dari waktu ke waktu (NFR-008) serta penambahan jenis sensor pada masa mendatang tanpa mengubah struktur inti table, sejalan dengan NFR-007.

**Maintainability**
Struktur table dan naming convention disusun agar mudah dipahami oleh tim pengembang, konsisten dengan prinsip Clean Code pada Project Context Bab 15.

**Extensibility**
Skema database dirancang agar dapat diperluas untuk mendukung kebutuhan Phase 6 — seperti Multi Device dan AI Dataset — tanpa memerlukan perubahan struktural yang signifikan terhadap table yang telah ada pada MVP.

**Consistency**
Seluruh table mengikuti konvensi penamaan, tipe data, dan pola constraint yang seragam, sehingga perilaku database dapat diprediksi secara konsisten oleh Model Layer dan Repository Layer pada Backend.

---

## 5. Entity Design

Berdasarkan kebutuhan pada SRS dan module design pada SDD, berikut adalah entity utama yang diperlukan pada database SIAGA.

### 5.1 Entity pada Tahap MVP

**devices**
Merepresentasikan identitas perangkat ESP32 yang terhubung ke sistem. Entity ini menjadi fondasi bagi Device ID sebagaimana dijelaskan pada SDD Bab 8 (Configuration Management) dan mendukung fitur Device Management pada SRS Bab 5.3.

**sensor_data**
Merepresentasikan data time-series hasil pembacaan sensor suhu, kelembapan, gerakan, cahaya, dan obstacle, beserta status sistem (NORMAL/WARNING/DANGER) yang dihasilkan Rule-Based Decision Engine dan State Machine pada saat pembacaan yang sama, sesuai FR-013 yang menetapkan bahwa data sensor dan status sistem dikirimkan bersamaan dalam satu payload.

**alerts**
Merepresentasikan kejadian ketika status sistem berada pada kondisi WARNING atau DANGER, sebagai entity turunan dari sensor_data yang mendukung fitur Alert & Notification pada SRS Bab 5.6 dan Alert Module pada SDD Bab 3.3, tanpa mengharuskan Dashboard melakukan scan terhadap keseluruhan hypertable sensor_data setiap kali menampilkan riwayat alert.

**system_logs**
Merepresentasikan catatan aktivitas penting pada Backend, sejalan dengan Logging Strategy pada SDD Bab 9, khususnya Backend Log dan API Log yang dicatat oleh Controller Layer, Validation Layer, Repository Layer, dan Exception Handler.

### 5.2 Entity sebagai Future Development

**users**
Belum diperlukan pada tahap MVP karena mekanisme Authentication dan Authorization pada Dashboard maupun REST API secara eksplisit ditetapkan sebagai Future Development pada SAD Bab 11 (Security Architecture). Entity ini direncanakan menjadi fondasi bagi pengelolaan akun pengguna Dashboard pada fase pengembangan lanjutan.

**settings**
Belum diperlukan sebagai table pada database pusat, karena parameter konfigurasi perangkat (Sampling Interval, Threshold, WiFi Configuration, API Endpoint, Device ID) dikelola secara non-volatile langsung pada perangkat ESP32 melalui Configuration Manager dan library Preferences, sesuai FR-019 dan SDD Bab 8. Sentralisasi pengelolaan konfigurasi melalui database — misalnya agar konfigurasi dapat diubah dari sisi Backend — direncanakan sebagai bagian dari Future Development yang selaras dengan kesiapan menuju fitur Over-The-Air (OTA) Update pada Phase 6.

---

## 6. Table Design

### 6.1 Table `devices`

**Purpose**
Menyimpan identitas dan informasi dasar setiap perangkat ESP32 yang terdaftar pada sistem, sebagai fondasi bagi fitur Device Management dan kesiapan Multi Device pada roadmap pengembangan lanjutan.

| Column | Data Type | PK | FK | Nullable | Default | Constraint |
|---|---|---|---|---|---|---|
| id | bigint | Yes | — | No | auto-increment | Primary Key |
| device_id | varchar | No | — | No | — | Unique, merepresentasikan Device ID yang dikonfigurasi pada Configuration Manager |
| name | varchar | No | — | No | — | — |
| status | varchar | No | — | No | `offline` | Check constraint (`online`, `offline`), merepresentasikan status konektivitas yang dilaporkan WiFi Manager |
| last_seen_at | timestamp | No | — | Yes | null | Diperbarui setiap kali data diterima dari perangkat |
| created_at | timestamp | No | — | No | current timestamp | — |
| updated_at | timestamp | No | — | No | current timestamp | — |

### 6.2 Table `sensor_data` (Hypertable)

**Purpose**
Menyimpan data time-series hasil pembacaan sensor beserta status sistem yang dihasilkan Rule-Based Decision Engine dan State Machine, sebagai representasi data historis utama sistem sesuai FR-015 dan FR-018.

| Column | Data Type | PK | FK | Nullable | Default | Constraint |
|---|---|---|---|---|---|---|
| id | bigint | Yes (composite dengan recorded_at) | — | No | auto-increment | Primary Key |
| device_id | bigint | No | Yes (`devices.id`) | No | — | Foreign Key |
| recorded_at | timestamp | Yes (composite) | — | No | — | Time column bagi hypertable |
| temperature | numeric | No | — | No | — | — |
| humidity | numeric | No | — | No | — | — |
| motion | boolean | No | — | No | — | Merepresentasikan hasil pembacaan motion sensor |
| light | numeric | No | — | No | — | — |
| obstacle | boolean | No | — | No | — | Merepresentasikan hasil pembacaan obstacle sensor |
| status | varchar | No | — | No | — | Check constraint (`NORMAL`, `WARNING`, `DANGER`) |
| created_at | timestamp | No | — | No | current timestamp | Waktu data diterima oleh Backend (ingestion time) |

### 6.3 Table `alerts`

**Purpose**
Menyimpan kejadian WARNING dan DANGER sebagai entity turunan dari sensor_data, mendukung penyajian riwayat alert secara efisien pada Alert Module tanpa memerlukan scan penuh terhadap hypertable.

| Column | Data Type | PK | FK | Nullable | Default | Constraint |
|---|---|---|---|---|---|---|
| id | bigint | Yes | — | No | auto-increment | Primary Key |
| device_id | bigint | No | Yes (`devices.id`) | No | — | Foreign Key |
| sensor_data_id | bigint | No | Yes (`sensor_data.id`) | No | — | Foreign Key, merujuk pada record pembacaan yang memicu alert |
| status | varchar | No | — | No | — | Check constraint (`WARNING`, `DANGER`) |
| triggered_at | timestamp | No | — | No | — | Waktu status WARNING/DANGER ditetapkan oleh State Machine |
| created_at | timestamp | No | — | No | current timestamp | — |

### 6.4 Table `system_logs`

**Purpose**
Menyimpan catatan aktivitas Backend Log dan API Log sesuai Logging Strategy pada SDD Bab 9, mendukung proses debugging dan penelusuran masalah pada Controller Layer, Validation Layer, Repository Layer, dan Exception Handler.

| Column | Data Type | PK | FK | Nullable | Default | Constraint |
|---|---|---|---|---|---|---|
| id | bigint | Yes | — | No | auto-increment | Primary Key |
| device_id | bigint | No | Yes (`devices.id`) | Yes | null | Foreign Key, bernilai null untuk log yang tidak terkait perangkat tertentu |
| log_level | varchar | No | — | No | — | Check constraint (`info`, `warning`, `error`) |
| source | varchar | No | — | No | — | Merepresentasikan asal log, misalnya Controller Layer, Validation Layer, atau Exception Handler |
| message | text | No | — | No | — | — |
| created_at | timestamp | No | — | No | current timestamp | — |

---

## 7. Relationship Design

**devices → sensor_data (One-to-Many)**
Satu device dapat menghasilkan banyak record sensor_data seiring waktu, karena pembacaan sensor dilakukan secara periodik sesuai Sampling Interval. Relationship ini digunakan agar setiap record time-series dapat ditelusuri kembali ke perangkat sumbernya, sejalan dengan kesiapan Multi Device pada roadmap pengembangan lanjutan.

**devices → alerts (One-to-Many)**
Satu device dapat memiliki banyak kejadian alert seiring waktu, karena status WARNING/DANGER dapat terjadi berulang kali pada perangkat yang sama.

**sensor_data → alerts (One-to-One)**
Satu record sensor_data yang berstatus WARNING atau DANGER menghasilkan tepat satu record alerts yang merujuk kepadanya. Relationship One-to-One ini dipilih karena alerts merupakan representasi turunan langsung dari satu kejadian pembacaan tertentu, bukan agregasi dari beberapa pembacaan.

**devices → system_logs (One-to-Many, Optional)**
Satu device dapat memiliki banyak entry system_logs yang terkait dengan aktivitasnya, namun relationship ini bersifat opsional karena sebagian log — misalnya log pada Validation Layer yang menolak payload sebelum device dapat diidentifikasi — tidak selalu terasosiasi dengan device tertentu.

Tidak terdapat relationship Many-to-Many pada entity MVP saat ini. Relationship Many-to-Many berpotensi muncul pada Future Development, misalnya antara users dan devices apabila satu Dashboard perlu mengelola kepemilikan atas lebih dari satu perangkat.

---

## 8. Time-Series Design

**Hypertable**
Table sensor_data dirancang sebagai hypertable pada TimescaleDB, yang secara otomatis membagi data ke dalam beberapa chunk berdasarkan rentang waktu, sehingga query terhadap rentang waktu tertentu — sebagaimana dibutuhkan oleh FR-018 (Historical Data) — dapat dieksekusi hanya terhadap chunk yang relevan, tanpa harus memindai keseluruhan table.

**Time Column**
Column `recorded_at` ditetapkan sebagai time column bagi hypertable, karena merepresentasikan waktu aktual pembacaan sensor pada perangkat ESP32, yang lebih relevan bagi kebutuhan analisis historis dibandingkan `created_at` yang merepresentasikan waktu data diterima oleh Backend dan dapat dipengaruhi oleh latensi jaringan.

**Chunk Strategy**
Interval chunk ditetapkan pada rentang waktu harian sebagai starting point yang wajar bagi volume data pada tahap MVP, mempertimbangkan frekuensi pengiriman data sesuai Sampling Interval yang dikelola oleh Configuration Manager. Strategi ini dapat disesuaikan lebih lanjut pada tahap implementasi berdasarkan volume data aktual yang diterima dari perangkat.

**Retention Policy (Future)**
Pada tahap MVP, seluruh data sensor dipertahankan tanpa batas waktu penghapusan otomatis, sejalan dengan sifat immutable pada Business Rule SRS Bab 6. Retention Policy — yaitu mekanisme penghapusan otomatis terhadap chunk data yang telah melewati usia tertentu — direncanakan sebagai bagian dari Future Development apabila volume data historis memerlukan pengelolaan siklus hidup yang lebih eksplisit.

**Compression (Future)**
Kemampuan native compression pada TimescaleDB terhadap chunk data yang telah melewati periode tertentu direncanakan sebagai bagian dari Future Development untuk mengoptimalkan kebutuhan storage seiring pertumbuhan volume data sesuai NFR-008.

**Continuous Aggregate (Future)**
Continuous aggregate — yaitu mekanisme agregasi data time-series secara periodik pada level waktu tertentu (misalnya per jam atau per hari) — direncanakan sebagai bagian dari Future Development untuk mendukung kebutuhan visualisasi historis jangka panjang pada Dashboard, sekaligus menjadi fondasi bagi kebutuhan Feature Engineering pada Future AI Layer sebagaimana disebutkan pada SDD Bab 14.

---

## 9. Indexing Strategy

**Sensor Data**
Selain index yang secara otomatis dibentuk oleh TimescaleDB pada time column saat pembuatan hypertable, sebuah composite index pada kombinasi `device_id` dan `recorded_at` diperlukan untuk mendukung query yang memfilter data berdasarkan perangkat tertentu dalam rentang waktu tertentu, sebagaimana dibutuhkan oleh FR-018.

**Timestamp**
Index pada time column (`recorded_at`) menjadi index utama bagi seluruh query historis, karena mayoritas akses terhadap sensor_data dilakukan berdasarkan rentang waktu, sejalan dengan karakteristik hypertable pada TimescaleDB.

**Device**
Index pada `device_id` diperlukan pada table sensor_data, alerts, dan system_logs untuk mendukung query yang berfokus pada satu perangkat tertentu, sekaligus mempersiapkan kebutuhan filtering berbasis device pada skenario Multi Device di masa mendatang.

**Alert**
Index pada kombinasi `device_id` dan `triggered_at` pada table alerts diperlukan untuk mendukung penyajian riwayat alert secara terurut berdasarkan waktu bagi Alert Module, sementara index pada `status` mendukung query yang memisahkan kejadian WARNING dari DANGER.

---

## 10. Data Integrity

**Primary Key**
Setiap table memiliki primary key berupa `id` yang bertipe auto-increment, kecuali pada hypertable sensor_data yang menggunakan composite primary key antara `id` dan `recorded_at` sebagai konsekuensi dari mekanisme partitioning pada TimescaleDB.

**Foreign Key**
Foreign key diterapkan pada `device_id` di seluruh table yang merujuk kepada devices, serta pada `sensor_data_id` di table alerts yang merujuk kepada record pembacaan spesifik yang memicu alert, untuk menjamin referential integrity antar entity.

**Unique Constraint**
Unique constraint diterapkan pada column `device_id` di table devices, untuk memastikan setiap Device ID yang dikonfigurasi pada Configuration Manager hanya merepresentasikan satu identitas perangkat pada database.

**Check Constraint**
Check constraint diterapkan pada column `status` di table sensor_data (`NORMAL`, `WARNING`, `DANGER`), table alerts (`WARNING`, `DANGER`), table devices (`online`, `offline`), serta column `log_level` di table system_logs (`info`, `warning`, `error`), untuk memastikan hanya nilai yang telah didefinisikan pada Business Rule SRS Bab 6 yang dapat tersimpan pada database.

**Referential Integrity**
Mengingat sifat immutable pada data sensor sebagaimana ditetapkan pada Business Rule SRS Bab 6, referential integrity antara sensor_data, alerts, dan devices diarahkan untuk mencegah penghapusan data historis secara tidak sengaja, sehingga penghapusan record pada devices yang masih memiliki relasi terhadap sensor_data maupun alerts perlu dibatasi (restrict), bukan diteruskan secara otomatis (cascade), kecuali pada skenario penghapusan device yang memang disengaja bersamaan dengan seluruh riwayat datanya.

---

## 11. Naming Convention

**Table**
Nama table menggunakan format snake_case dan bentuk plural, merepresentasikan kumpulan entity, misalnya `devices`, `sensor_data`, `alerts`, dan `system_logs`.

**Column**
Nama column menggunakan format snake_case dan bentuk singular, dengan penamaan yang deskriptif terhadap makna data, misalnya `device_id`, `recorded_at`, dan `triggered_at`. Column yang merepresentasikan foreign key mengikuti pola `<nama_table_singular>_id`, misalnya `device_id` dan `sensor_data_id`.

**Constraint**
Nama constraint mengikuti pola `<jenis_constraint>_<nama_table>_<nama_column>`, misalnya `uq_devices_device_id` untuk unique constraint, `chk_sensor_data_status` untuk check constraint, dan `fk_alerts_sensor_data_id` untuk foreign key, guna memudahkan identifikasi constraint pada saat pemeliharaan skema.

**Index**
Nama index mengikuti pola `idx_<nama_table>_<nama_column>`, misalnya `idx_sensor_data_device_id_recorded_at` untuk composite index, guna menjaga konsistensi penamaan yang selaras dengan constraint.

---

## 12. Database Security

**Database Authentication**
Akses terhadap PostgreSQL dan TimescaleDB dilakukan melalui kredensial database yang terpisah dari mekanisme Authentication pada level aplikasi, sejalan dengan Security Architecture pada SAD Bab 11 yang menetapkan bahwa Authentication pada level aplikasi masih menjadi Future Development pada tahap MVP.

**Authorization**
Akses terhadap database pada tahap MVP dibatasi hanya bagi Laravel Backend melalui Repository Layer, tanpa akses langsung dari ESP32 maupun React Dashboard, sejalan dengan Deployment Architecture pada SAD Bab 10 yang menempatkan Database Server terpisah secara logis dari layer aplikasi lain.

**Least Privilege**
Database user yang digunakan oleh Laravel Backend diberikan hak akses yang terbatas hanya pada operasi yang diperlukan (read dan write terhadap table yang relevan), tanpa hak administratif terhadap database secara keseluruhan, guna meminimalkan dampak apabila terjadi kondisi yang tidak diinginkan pada sisi aplikasi.

**Backup Strategy**
Backup database dilakukan secara berkala untuk memastikan ketersediaan salinan data historis, mengingat sifat immutable data sensor yang menjadikan data tersebut tidak dapat direkonstruksi apabila hilang. Strategi backup secara spesifik (frekuensi, mekanisme, dan lokasi penyimpanan) akan ditentukan pada tahap implementasi sesuai environment operasional yang digunakan.

**Recovery Strategy**
Strategi recovery diarahkan untuk memungkinkan pemulihan data hingga titik waktu tertentu (point-in-time recovery), guna meminimalkan kehilangan data historis apabila terjadi gangguan pada database, selaras dengan NFR-004 terkait tidak terjadinya data loss.

---

## 13. Future Database Considerations

**Multi Device**
Table devices telah dirancang dengan `device_id` sebagai unique business key sejak tahap MVP, sehingga penambahan jumlah perangkat pada masa mendatang tidak memerlukan perubahan struktural terhadap skema yang telah ada, hanya penambahan record baru pada table devices.

**AI Dataset**
Data historis pada sensor_data direncanakan menjadi sumber utama bagi kebutuhan Feature Engineering pada Future AI Layer sebagaimana dijelaskan pada Project Context Bab 13 dan SDD Bab 14. Table tambahan yang merepresentasikan dataset hasil preprocessing maupun hasil Threat Scoring direncanakan sebagai bagian dari roadmap ini, tanpa mengubah struktur sensor_data yang telah ada.

**MQTT Data**
Apabila komunikasi berbasis MQTT diimplementasikan pada Phase 6, data yang diterima melalui jalur tersebut direncanakan tetap disimpan pada struktur table sensor_data yang sama, mengingat MQTT berperan sebagai alternatif protokol komunikasi, bukan sebagai perubahan terhadap struktur data itu sendiri.

**LoRa Gateway**
Apabila integrasi LoRa diimplementasikan pada masa mendatang, entity tambahan yang merepresentasikan gateway sebagai perantara antara perangkat berbasis LoRa dan Backend perlu dipertimbangkan, sebagai perluasan terhadap entity devices yang telah ada.

**Partitioning**
Selain chunk-based partitioning bawaan TimescaleDB berdasarkan waktu, sub-partitioning tambahan berdasarkan `device_id` dapat dipertimbangkan apabila jumlah perangkat bertambah signifikan pada skenario Multi Device, guna menjaga performa query pada skala yang lebih besar.

**Replication**
Read replica pada PostgreSQL dapat dipertimbangkan pada masa mendatang untuk memisahkan beban query dari Dashboard (read-heavy) terhadap beban penulisan data sensor (write-heavy) dari ESP32, guna menjaga performa kedua jalur data tersebut seiring pertumbuhan sistem.

---

## 14. Design Decisions

**PostgreSQL**
PostgreSQL dipilih karena menyediakan kapabilitas relational database yang matang — termasuk dukungan terhadap constraint, transaction, dan referential integrity — yang dibutuhkan untuk menjaga konsistensi entity seperti devices dan alerts, sekaligus memiliki kompatibilitas yang baik dengan Laravel melalui Eloquent ORM pada Model Layer dan Repository Layer sebagaimana ditetapkan pada Architecture Decision di SAD Bab 13.

**TimescaleDB**
TimescaleDB dipilih sebagai ekstensi di atas PostgreSQL karena menyediakan kapabilitas hypertable yang secara khusus dioptimalkan untuk data time-series, sehingga mampu menangani pertumbuhan volume data sensor secara efisien sesuai NFR-008, tanpa mengharuskan penggunaan database engine terpisah di luar PostgreSQL. Pendekatan ini memungkinkan SIAGA tetap memperoleh kapabilitas relational database standar bagi entity non-time-series, sekaligus kapabilitas time-series database bagi entity sensor_data, dalam satu sistem database yang sama.

Kombinasi kedua teknologi ini mendukung kebutuhan sistem secara menyeluruh — mulai dari penyimpanan data sensor berfrekuensi tinggi, penyajian data historis pada Dashboard, hingga kesiapan menjadi fondasi data bagi Future AI Layer — tanpa mengorbankan integritas maupun kemudahan pemeliharaan database.

---

## 15. Glossary

| Istilah | Penjelasan |
|---|---|
| **DDD (Database Design Document)** | Dokumen yang mendefinisikan rancangan database suatu sistem, mencakup entity, table, relationship, dan strategi penyimpanan data. |
| **Hypertable** | Table pada TimescaleDB yang secara otomatis dipartisi ke dalam beberapa chunk berdasarkan rentang waktu untuk mendukung penyimpanan data time-series secara efisien. |
| **Chunk** | Unit partisi data pada hypertable yang dibentuk berdasarkan rentang waktu tertentu. |
| **Time Column** | Column yang dijadikan acuan waktu bagi partitioning pada hypertable. |
| **Retention Policy** | Mekanisme penghapusan otomatis terhadap data time-series yang telah melewati usia tertentu. |
| **Compression** | Mekanisme kompresi data pada chunk time-series untuk mengoptimalkan kebutuhan storage. |
| **Continuous Aggregate** | Mekanisme agregasi data time-series secara periodik pada level waktu tertentu untuk mendukung query historis jangka panjang. |
| **Normalization** | Proses perancangan skema database untuk mengurangi redundansi data pada table relational. |
| **Primary Key** | Column atau kombinasi column yang menjadi identitas unik bagi setiap record pada suatu table. |
| **Foreign Key** | Column yang merujuk pada primary key table lain untuk menjaga referential integrity antar entity. |
| **Referential Integrity** | Prinsip yang memastikan relasi antar table pada database selalu konsisten dan valid. |
| **Least Privilege** | Prinsip keamanan yang membatasi hak akses suatu entitas hanya pada apa yang benar-benar diperlukan. |
| **Point-in-Time Recovery** | Mekanisme pemulihan data database hingga kondisi pada suatu titik waktu tertentu sebelum terjadinya gangguan. |

---

*Dokumen ini merupakan turunan dari SIAGA Project Context & Overview, SIAGA Software Requirements Specification, SIAGA Software Architecture Document, dan SIAGA Software Design Document, serta menjadi dasar bagi penyusunan API Specification, implementasi database, migration, dan AI Design Document.*
