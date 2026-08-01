# SIAGA AI Design Document (AIDD)

**Project Name:** SIAGA — ESP32-Based Adaptive Security and Safety Console with AI-Driven Multi-Sensor Threat Assessment
**Document Type:** AI Design Document (AIDD)
**Reference Documents:** SIAGA Software Design Document (SDD); SIAGA Database Design Document (DDD); SIAGA API Specification; SIAGA Frontend Design Document (FDD)
**Status:** Draft v1.0 — Future Development (Phase 6, Pasca-MVP)

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini disusun untuk mendefinisikan **desain Artificial Intelligence (AI)** pada sistem SIAGA sebagai kelanjutan dari Future AI Layer yang telah disinggung pada Software Design Document (SDD) Bab 3.4 dan Bab 14, Future Database Considerations pada Database Design Document (DDD) Bab 13, Future API pada API Specification Bab 12, serta Future Frontend pada Frontend Design Document (FDD) Bab 14. Dokumen ini menjabarkan bagaimana kapabilitas AI — dalam bentuk Adaptive Threat Intelligence Engine — dirancang secara konseptual agar dapat diintegrasikan dengan Architecture, module design, database, dan API yang telah ditetapkan pada dokumen-dokumen tersebut, tanpa mengubah keputusan yang telah diambil pada tahap Minimum Viable Product (MVP).

Dokumen ini menjadi referensi utama bagi implementasi AI pada sistem SIAGA di tahap pengembangan lanjutan (Phase 6), mencakup Dataset Design, Feature Engineering, Candidate Model, Training Strategy, Evaluation Strategy, hingga strategi Deployment dan integrasinya dengan Backend, Database, dan Frontend yang telah ada.

### 1.2 Scope

Ruang lingkup dokumen ini terbatas pada **desain konseptual AI** sebagai roadmap pengembangan pasca-MVP. AI **bukan merupakan bagian dari MVP** dan tidak diimplementasikan pada tahap saat ini, sejalan dengan penegasan yang telah dinyatakan secara konsisten pada SDD Bab 1.2 dan Bab 14, DDD Bab 1.2, API Specification Bab 1.2 dan Bab 12, serta FDD Bab 1.2 dan Bab 14.

Dokumen ini tidak membahas ulang Architecture, technology stack, module design pada Embedded, Backend, maupun Frontend Layer, desain skema Database, maupun kontrak REST API yang telah ditetapkan pada dokumen referensi. Dokumen ini juga tidak menyertakan source code, notebook, dataset sintetis, flowchart, maupun diagram — seluruh desain dijelaskan secara naratif sebagai landasan konseptual bagi tahap implementasi lanjutan.

Dokumen ini tidak menetapkan satu Model AI tertentu sebagai keputusan final. Apabila terdapat beberapa alternatif Model yang relevan, dokumen ini menjelaskan kelebihan, kekurangan, dan tingkat kesesuaiannya terhadap konteks SIAGA, dengan keputusan akhir diserahkan pada tahap perancangan teknis lanjutan (technical design) pada Phase 6.

### 1.3 References

1. *SIAGA Software Design Document (SDD)* — dokumen rujukan terkait Future AI Module (Bab 3.4: AI Service, Feature Engineering, Threat Prediction, Model Management) dan Future Design Considerations (Bab 14).
2. *SIAGA Database Design Document (DDD)* — dokumen rujukan terkait Entity Design, Table `sensor_data` sebagai hypertable TimescaleDB, dan Future Database Considerations terkait AI Dataset (Bab 13).
3. *SIAGA API Specification* — dokumen rujukan terkait Response Standard, Versioning, serta Future API terkait AI Prediction (Bab 12).
4. *SIAGA Frontend Design Document (FDD)* — dokumen rujukan terkait Data Visualization dan Future Frontend terkait AI Visualization (Bab 14).

---

## 2. AI Overview

AI pada sistem SIAGA diposisikan sebagai **lapisan analisis tambahan (additional analysis layer)** yang bertujuan meningkatkan kemampuan analisis ancaman pada sistem secara keseluruhan, bukan sebagai pengganti Rule-Based Decision Engine yang telah dirancang pada Embedded Layer. Sebagaimana ditetapkan pada SDD Bab 3.1 dan ditegaskan kembali pada Bab 3.4, Rule-Based Decision Engine bersama State Machine tetap menjadi mekanisme utama dan satu-satunya jalur pengambilan keputusan threat assessment pada tahap MVP maupun pasca-MVP, karena kedua module tersebut beroperasi secara independen terhadap konektivitas jaringan dan menjamin fungsi keselamatan (safety function) tetap berjalan meskipun AI Service maupun Backend tidak dapat diakses.

Dengan demikian, AI pada SIAGA tidak dirancang untuk menggantikan, mengintervensi, maupun menunda proses evaluasi lokal yang dilakukan oleh Rule-Based Decision Engine terhadap kombinasi nilai sensor suhu, kelembapan, gerakan, cahaya, dan obstacle. Sebaliknya, AI beroperasi pada Backend Layer — memanfaatkan data historis yang telah tersimpan pada Database Layer — untuk memberikan wawasan tambahan berupa pola, anomali, maupun estimasi tren ancaman yang tidak dapat diperoleh dari evaluasi rule tunggal yang bersifat instan (point-in-time) pada Embedded Layer.

Posisi ini selaras dengan prinsip *Future AI Ready* pada Project Context Bab 15 dan kesiapan struktural yang telah disiapkan pada SDD Bab 3.4, di mana Future AI Module (AI Service, Feature Engineering, Threat Prediction, dan Model Management) dirancang untuk mengonsumsi data historis dari Database Layer melalui mekanisme yang serupa dengan Historical Data Module pada Frontend, tanpa mengubah alur data inti yang telah ada pada MVP.

---

## 3. AI Objectives

Tujuan penerapan AI pada sistem SIAGA diarahkan untuk memperkaya kapabilitas analisis ancaman yang telah disediakan oleh Rule-Based Decision Engine, melalui beberapa objective berikut.

**Threat Assessment**
Melengkapi hasil evaluasi Rule-Based Decision Engine dengan penilaian ancaman berbasis pola data historis, sehingga kondisi yang secara individual belum melewati Threshold pada satu pembacaan sensor, namun menunjukkan kecenderungan yang mengarah pada ancaman, tetap dapat teridentifikasi.

**Anomaly Detection**
Mengidentifikasi pola pembacaan sensor yang menyimpang secara signifikan dari perilaku normal perangkat maupun lingkungan yang dipantau, termasuk kombinasi nilai sensor yang tidak lazim namun belum tentu terdefinisikan secara eksplisit pada rule yang ada.

**Pattern Recognition**
Mengenali pola berulang pada data time-series, misalnya pola aktivitas harian yang wajar maupun pola yang mengindikasikan kondisi tidak wajar, sebagai dasar bagi pemahaman perilaku sistem yang lebih menyeluruh dibandingkan evaluasi rule per-record.

**Adaptive Alerting**
Mendukung penyempurnaan mekanisme Alert & Notification pada masa mendatang, dengan mempertimbangkan konteks historis di samping evaluasi Threshold statis, sehingga Alert yang dihasilkan berpotensi lebih relevan terhadap kondisi aktual.

**Predictive Analysis**
Memberikan estimasi terhadap potensi kondisi ancaman pada rentang waktu ke depan berdasarkan tren data historis, sebagai kapabilitas tambahan yang melengkapi sifat reaktif dari Rule-Based Decision Engine yang hanya mengevaluasi kondisi saat ini.

Seluruh objective di atas bersifat komplementer terhadap Rule-Based Decision Engine, bukan menggantikannya, sejalan dengan penegasan pada Bab 2.

---

## 4. AI Architecture

Secara konseptual, AI Architecture pada SIAGA disusun sebagai rangkaian komponen yang saling berkaitan, mulai dari pengumpulan data hingga penyajian hasil analisis pada Dashboard. Komponen-komponen tersebut dijelaskan secara naratif sebagai berikut, tanpa membahas detail implementasi maupun penggambaran dalam bentuk diagram.

**Data Collection**
Data yang menjadi input bagi AI bersumber dari data yang telah tersimpan pada hypertable `sensor_data`, yaitu hasil pembacaan sensor beserta status sistem yang dikirimkan oleh ESP32 melalui REST API dan disimpan oleh Backend sebagaimana dijelaskan pada DDD Bab 6.2. AI tidak memerlukan jalur akuisisi data baru dari Embedded Layer, karena seluruh data yang dibutuhkan telah tersedia melalui alur data yang sudah berjalan pada MVP.

**Data Validation**
Sebelum digunakan lebih lanjut, data historis yang diambil dari Database Layer diperiksa kelengkapan dan konsistensinya, misalnya memastikan tidak terdapat rentang waktu yang hilang secara signifikan akibat gangguan konektivitas pada Embedded Layer, maupun memastikan nilai sensor berada pada rentang yang secara fisik masuk akal. Data Validation pada konteks AI ini berbeda dari Validation Layer pada Backend Bab MVP, karena berfokus pada kelayakan data untuk kebutuhan analisis, bukan pada kelayakan struktur payload.

**Data Cleaning**
Menangani kondisi data yang tidak ideal bagi kebutuhan analisis, seperti nilai sensor yang hilang (missing value) pada rentang waktu tertentu maupun duplikasi record akibat kondisi jaringan yang tidak stabil, sebelum data tersebut digunakan pada tahap Feature Engineering.

**Time-Series Storage**
Memanfaatkan kapabilitas hypertable pada TimescaleDB yang telah dirancang pada DDD Bab 8, di mana data sensor tersimpan secara terstruktur berdasarkan waktu. Kapabilitas ini menjadi fondasi yang memungkinkan AI Service mengambil data historis dalam rentang waktu tertentu secara efisien, tanpa memerlukan struktur penyimpanan tambahan di luar yang telah ditetapkan pada DDD.

**Feature Engineering**
Mengekstraksi representasi data yang lebih bermakna dari data time-series mentah, sebagaimana dijelaskan lebih rinci pada Bab 6, sebagai input bagi proses Training maupun Inference pada Model AI.

**Model Training**
Proses pembelajaran Model AI terhadap Dataset yang telah melalui tahap Feature Engineering, dilakukan secara terpisah dari alur operasional sistem, sebagaimana dijelaskan pada Bab 8 (Training Strategy).

**Model Evaluation**
Proses penilaian terhadap performa Model yang telah melalui Training, menggunakan metrik yang relevan terhadap karakteristik data dan pendekatan Model yang digunakan, sebagaimana dijelaskan pada Bab 9 (Evaluation Strategy).

**Model Deployment**
Proses penempatan Model yang telah dievaluasi ke dalam lingkungan operasional, agar dapat digunakan oleh Inference Service untuk menghasilkan hasil analisis terhadap data baru, sebagaimana dijelaskan pada Bab 11 (AI Deployment).

**Inference Service**
Merepresentasikan konsep dari AI Service pada SDD Bab 3.4, yang bertanggung jawab menjalankan Model yang telah di-deploy terhadap data historis maupun data terkini untuk menghasilkan Threat Scoring maupun hasil analisis lain, kemudian menyediakan hasil tersebut melalui mekanisme komunikasi yang konsisten dengan REST API yang telah ditetapkan pada API Specification.

**Dashboard Visualization**
Merepresentasikan penyajian hasil analisis AI pada React Dashboard, sejalan dengan AI Visualization yang telah disebutkan sebagai Future Development pada FDD Bab 14, agar pengguna dapat memahami hasil analisis AI dengan cara yang konsisten dengan visualisasi data sensor dan status sistem yang telah ada pada MVP.

Secara naratif, hubungan antar-komponen tersebut dapat dijelaskan sebagai berikut: data yang telah tersimpan pada Time-Series Storage diambil melalui proses Data Collection, kemudian diperiksa melalui Data Validation dan disempurnakan melalui Data Cleaning, sebelum diproses lebih lanjut oleh Feature Engineering menjadi representasi yang siap digunakan oleh Model Training. Model yang dihasilkan dari proses Training kemudian dinilai performanya melalui Model Evaluation, dan apabila memenuhi kriteria yang ditetapkan, ditempatkan ke lingkungan operasional melalui Model Deployment. Model yang telah di-deploy tersebut digunakan oleh Inference Service untuk menghasilkan hasil analisis, yang selanjutnya disajikan kepada pengguna melalui Dashboard Visualization pada React Dashboard.

---

## 5. Dataset Design

Dataset yang digunakan bagi kebutuhan AI bersumber sepenuhnya dari data yang telah tersimpan pada hypertable `sensor_data`, tanpa memerlukan sumber data tambahan di luar yang telah ditetapkan pada DDD Bab 6.2. Kolom-kolom yang relevan sebagai sumber Dataset meliputi:

- **temperature** — nilai suhu hasil pembacaan sensor.
- **humidity** — nilai kelembapan hasil pembacaan sensor.
- **motion** — nilai boolean hasil pembacaan motion sensor.
- **light** — nilai intensitas cahaya hasil pembacaan sensor.
- **obstacle** — nilai boolean hasil pembacaan obstacle sensor.
- **status** — hasil evaluasi Rule-Based Decision Engine dan State Machine (`NORMAL`, `WARNING`, `DANGER`), yang pada konteks AI berperan sebagai representasi Threat Level bagi kebutuhan analisis maupun evaluasi Model.
- **recorded_at** — Timestamp yang merepresentasikan waktu aktual pembacaan sensor, sebagaimana ditetapkan sebagai Time Column pada DDD Bab 8.
- **device_id** — identitas perangkat yang menghasilkan data, sebagai fondasi bagi kesiapan Multi Device Learning pada Bab 13.

Dataset ini tidak memerlukan penambahan kolom baru pada `sensor_data`, sejalan dengan Future Database Considerations DDD Bab 13 yang menyatakan bahwa kebutuhan AI Dataset direncanakan sebagai table tambahan hasil preprocessing, tanpa mengubah struktur `sensor_data` yang telah ada pada MVP.

**Kualitas Data yang Dibutuhkan**

Beberapa aspek kualitas data perlu diperhatikan agar Dataset layak digunakan bagi kebutuhan Training maupun Evaluation:

- **Completeness**, ketersediaan data pada rentang waktu yang cukup panjang dan tanpa jeda signifikan, mengingat karakteristik data time-series yang sensitif terhadap data yang hilang.
- **Consistency**, keseragaman interval pengiriman data sesuai Sampling Interval yang dikonfigurasi pada Configuration Manager, agar pola temporal pada Dataset dapat merepresentasikan kondisi aktual secara wajar.
- **Sufficient Volume**, ketersediaan volume data historis yang memadai, mengingat pada tahap awal Phase 6 volume data kemungkinan masih terbatas pada satu perangkat, sebagaimana dibahas lebih lanjut pada Bab 12 (Risks and Limitations).
- **Label Balance**, proporsi antara data berstatus `NORMAL` dengan data berstatus `WARNING` dan `DANGER` yang secara alami cenderung tidak seimbang, karena kejadian ancaman diharapkan jarang terjadi dibandingkan kondisi normal, sebagaimana turut memengaruhi pemilihan pendekatan Model pada Bab 7.
- **Data Integrity**, keterjaminan bahwa data yang digunakan tidak mengalami perubahan setelah tersimpan, sejalan dengan sifat immutable pada Business Rule SRS Bab 6 dan DDD Bab 14, sehingga Dataset yang digunakan pada suatu waktu Training dapat direproduksi kembali secara konsisten.

---

## 6. Feature Engineering

Feature Engineering pada SIAGA diarahkan untuk mengekstraksi representasi yang lebih bermakna dari data time-series mentah pada `sensor_data`, sehingga Model AI dapat mengenali pola maupun anomali yang tidak tampak apabila hanya menggunakan nilai sensor pada satu titik waktu. Beberapa kemungkinan feature yang dapat dibangun meliputi:

**Rolling Average**
Nilai rata-rata bergerak dari suatu sensor (misalnya temperature atau humidity) pada jendela waktu tertentu, digunakan untuk merepresentasikan kecenderungan (trend) nilai sensor secara lebih stabil dibandingkan nilai mentah yang berpotensi terpengaruh oleh Sensor Noise.

**Moving Standard Deviation**
Nilai deviasi standar bergerak pada jendela waktu tertentu, digunakan untuk merepresentasikan tingkat fluktuasi atau volatilitas suatu sensor, yang berpotensi menjadi indikator terhadap kondisi yang tidak stabil.

**Delta Temperature**
Selisih nilai suhu antara satu pembacaan dengan pembacaan sebelumnya, digunakan untuk merepresentasikan laju perubahan suhu, yang berpotensi lebih relevan bagi deteksi kondisi tertentu dibandingkan nilai suhu absolut.

**Delta Humidity**
Selisih nilai kelembapan antara satu pembacaan dengan pembacaan sebelumnya, dengan tujuan yang serupa dengan Delta Temperature, yaitu merepresentasikan laju perubahan kondisi lingkungan.

**Motion Frequency**
Frekuensi kemunculan nilai motion yang bernilai aktif pada jendela waktu tertentu, digunakan untuk merepresentasikan intensitas aktivitas pergerakan pada area yang dipantau, dibandingkan hanya menggunakan nilai motion pada satu titik waktu.

**Light Transition**
Representasi perubahan kondisi cahaya antar-pembacaan, misalnya transisi dari kondisi terang menuju gelap atau sebaliknya, yang berpotensi relevan bagi identifikasi pola aktivitas maupun anomali pada lingkungan yang dipantau.

**Time-Based Features**
Representasi berbasis waktu seperti jam dalam sehari maupun hari dalam seminggu, yang diekstraksi dari Timestamp `recorded_at`, digunakan untuk membantu Model mengenali pola aktivitas yang bersifat siklikal, misalnya perbedaan pola pada jam kerja dibandingkan malam hari.

Feature-feature di atas bersifat kandidat konseptual yang akan disempurnakan pada tahap perancangan teknis lanjutan, disesuaikan dengan karakteristik data aktual dan pendekatan Model AI yang dipilih pada Phase 6.

---

## 7. Candidate AI Models

Beberapa alternatif Model AI berikut relevan untuk dipertimbangkan pada konteks SIAGA, mengingat karakteristik data yang bersifat time-series multivariat dengan proporsi kejadian ancaman yang secara alami tidak seimbang. Penjelasan berikut bersifat sebagai perbandingan alternatif, tanpa menetapkan satu Model sebagai keputusan final.

### 7.1 Isolation Forest

**Working Principle**
Isolation Forest bekerja dengan mengisolasi setiap data point melalui serangkaian pemisahan (partitioning) acak terhadap Feature yang digunakan. Data point yang bersifat anomali cenderung dapat diisolasi dengan jumlah pemisahan yang lebih sedikit dibandingkan data point normal, sehingga tingkat keanomaliannya dapat diukur dari kedalaman proses isolasi tersebut.

**Advantages**
Relatif sederhana secara komputasi, tidak memerlukan Dataset berlabel (unsupervised), serta cukup robust terhadap Dataset berukuran menengah dengan jumlah Feature yang tidak terlalu besar.

**Limitations**
Kurang optimal dalam menangkap pola temporal (urutan waktu) secara eksplisit, karena pendekatan ini pada dasarnya memperlakukan setiap data point secara independen, kecuali Feature temporal (seperti Rolling Average atau Delta) telah disertakan secara eksplisit pada tahap Feature Engineering.

**Suitability for SIAGA**
Berpotensi sesuai sebagai titik awal (baseline) bagi Anomaly Detection pada SIAGA, mengingat kesederhanaan implementasi dan kebutuhan Dataset berlabel yang minimal, selaras dengan kondisi Dataset pada awal Phase 6 yang kemungkinan belum memiliki label ancaman dalam jumlah besar.

### 7.2 Autoencoder

**Working Principle**
Autoencoder merupakan Model berbasis Deep Learning yang dilatih untuk merekonstruksi kembali input data melalui representasi berdimensi lebih rendah (latent representation). Data yang sulit direkonstruksi dengan baik — ditandai dengan nilai reconstruction error yang tinggi — diindikasikan sebagai anomali, karena Model tersebut umumnya dilatih terutama menggunakan data yang merepresentasikan kondisi normal.

**Advantages**
Mampu menangkap hubungan non-linear antar-Feature yang lebih kompleks dibandingkan pendekatan statistik sederhana, serta fleksibel untuk disesuaikan dengan karakteristik data multivariat pada SIAGA.

**Limitations**
Memerlukan volume data Training yang lebih besar dibandingkan Isolation Forest maupun One-Class SVM agar proses pembelajaran representasi dapat berjalan optimal, serta memerlukan sumber daya komputasi yang lebih tinggi pada tahap Training.

**Suitability for SIAGA**
Berpotensi sesuai pada tahap Phase 6 lanjutan, ketika volume data historis dari SIAGA telah cukup besar, namun kurang ideal digunakan sebagai pendekatan awal apabila Dataset yang tersedia masih terbatas.

### 7.3 LSTM Autoencoder

**Working Principle**
Merupakan variasi dari Autoencoder yang menggunakan Long Short-Term Memory (LSTM) sebagai komponen utama, sehingga mampu mempelajari pola sekuensial pada data time-series secara eksplisit, alih-alih memperlakukan setiap data point secara independen sebagaimana pada Autoencoder konvensional.

**Advantages**
Secara konseptual paling sesuai dengan karakteristik data time-series pada SIAGA, karena mampu mempertimbangkan urutan dan ketergantungan waktu antar-pembacaan sensor, sehingga berpotensi lebih akurat dalam mendeteksi anomali yang hanya tampak melalui pola sekuensial.

**Limitations**
Memiliki kompleksitas Training yang lebih tinggi dibandingkan Isolation Forest maupun Autoencoder konvensional, memerlukan volume Dataset time-series yang lebih besar, serta membutuhkan sumber daya komputasi yang paling tinggi di antara Model yang dibahas pada dokumen ini.

**Suitability for SIAGA**
Berpotensi menjadi pendekatan jangka panjang yang paling sesuai dengan karakteristik data SIAGA, namun realistis untuk dipertimbangkan setelah volume data historis dan kebutuhan analisis pola temporal yang kompleks benar-benar diperlukan, bukan sebagai pendekatan awal pada Phase 6.

### 7.4 One-Class SVM

**Working Principle**
One-Class SVM mempelajari batas keputusan (decision boundary) yang memisahkan data yang merepresentasikan kondisi normal dari ruang Feature secara keseluruhan, sehingga data yang berada di luar batas tersebut diklasifikasikan sebagai anomali.

**Advantages**
Memiliki dasar matematis yang telah matang dan teruji pada berbagai kasus Anomaly Detection, serta dapat bekerja cukup baik pada Dataset berukuran kecil hingga menengah.

**Limitations**
Sensitif terhadap pemilihan parameter dan jenis kernel yang digunakan, serta cenderung kurang efisien secara komputasi apabila volume data bertambah besar dibandingkan pendekatan berbasis Isolation Forest.

**Suitability for SIAGA**
Berpotensi sesuai sebagai pembanding (benchmark) terhadap Isolation Forest pada tahap awal Phase 6, khususnya untuk mengevaluasi pendekatan mana yang lebih sesuai dengan karakteristik data SIAGA sebelum mempertimbangkan pendekatan berbasis Deep Learning yang lebih kompleks.

---

## 8. Training Strategy

**Offline Training**
Proses Training Model AI pada SIAGA direncanakan dilakukan secara offline, yaitu menggunakan data historis yang telah terkumpul pada Database Layer dalam suatu periode tertentu, terpisah dari alur operasional sistem secara real-time. Pendekatan ini dipilih karena sejalan dengan sifat AI sebagai lapisan analisis tambahan yang tidak memengaruhi jalur pengambilan keputusan lokal, serta lebih sesuai dengan keterbatasan sumber daya pada tahap awal Phase 6.

**Future Incremental Training**
Pembaruan Model secara bertahap (incremental) seiring bertambahnya data historis baru direncanakan sebagai pengembangan lanjutan setelah pendekatan Offline Training berjalan stabil, sebagaimana turut disebutkan pada Bab 13 (Future AI Roadmap) terkait Online Learning.

**Dataset Versioning**
Setiap Dataset yang digunakan pada suatu proses Training direncanakan dicatat versinya secara eksplisit, mencakup rentang waktu data yang digunakan dan parameter Feature Engineering yang diterapkan, agar hasil Training dapat ditelusuri dan direproduksi kembali pada tahap Evaluation maupun audit di kemudian hari.

**Validation Dataset**
Sebagian dari Dataset historis dialokasikan sebagai Validation Dataset, digunakan untuk memantau performa Model selama proses Training berlangsung dan membantu proses penyesuaian parameter Model, tanpa digunakan sebagai bagian dari proses pembelajaran Model itu sendiri.

**Test Dataset**
Sebagian Dataset historis lainnya dialokasikan sebagai Test Dataset yang sepenuhnya terpisah dari proses Training dan Validation, digunakan khusus untuk menilai performa akhir Model sebelum dipertimbangkan untuk memasuki tahap Model Deployment. Mengingat karakteristik data time-series, pembagian Training, Validation, dan Test Dataset direncanakan mengikuti urutan waktu (chronological split), bukan pembagian acak, guna menghindari kebocoran informasi (data leakage) dari data pada masa mendatang ke dalam proses Training.

---

## 9. Evaluation Strategy

Strategi Evaluation pada SIAGA disesuaikan dengan pendekatan Model yang digunakan, mengingat kandidat Model pada Bab 7 mencakup pendekatan yang bersifat unsupervised.

**Metrik bagi Pendekatan Berlabel**
Apabila Evaluation dilakukan dengan memanfaatkan status hasil Rule-Based Decision Engine (`NORMAL`, `WARNING`, `DANGER`) sebagai referensi pembanding, metrik berikut relevan untuk digunakan:

- **Precision**, mengukur proporsi hasil deteksi ancaman oleh AI yang benar-benar sesuai dengan kondisi ancaman aktual, guna menekan kejadian False Positive.
- **Recall**, mengukur proporsi kondisi ancaman aktual yang berhasil terdeteksi oleh AI, guna menekan kejadian False Negative.
- **F1-Score**, merepresentasikan keseimbangan antara Precision dan Recall, relevan mengingat proporsi data ancaman yang secara alami tidak seimbang sebagaimana dijelaskan pada Bab 5.
- **ROC-AUC**, digunakan apabila Model menghasilkan skor kontinu (misalnya Threat Scoring) yang perlu dievaluasi pada berbagai kemungkinan nilai Threshold, sebelum ditetapkan nilai Threshold akhir yang digunakan pada tahap operasional.
- **Confusion Matrix**, digunakan untuk menyajikan gambaran menyeluruh terhadap distribusi hasil klasifikasi Model dibandingkan status aktual, membantu identifikasi pola kesalahan yang cenderung terjadi.

**Metrik bagi Pendekatan Unsupervised**
Mengingat Model seperti Isolation Forest, Autoencoder, dan One-Class SVM pada dasarnya tidak memerlukan label secara langsung selama proses Training, Evaluation terhadap Model tersebut dapat dilakukan melalui:

- Analisis distribusi **anomaly score** atau **reconstruction error** yang dihasilkan Model, untuk memahami sebaran nilai antara data yang dianggap normal dan data yang dianggap anomali.
- Perbandingan hasil deteksi anomali oleh Model terhadap status `WARNING` dan `DANGER` yang telah dihasilkan Rule-Based Decision Engine, sebagai bentuk validasi tidak langsung (indirect validation), mengingat status tersebut merupakan satu-satunya referensi ancaman yang tersedia pada Dataset SIAGA.
- Evaluasi kualitatif oleh tim pengembang terhadap kasus-kasus anomali yang terdeteksi, untuk menilai relevansi hasil deteksi terhadap konteks operasional SIAGA secara aktual.

Pendekatan Evaluation ini bersifat konseptual dan akan disempurnakan lebih lanjut pada tahap perancangan teknis, disesuaikan dengan Model yang akhirnya dipilih pada Phase 6.

---

## 10. AI Integration

Integrasi AI dengan sistem SIAGA yang telah berjalan dijelaskan secara naratif berikut, mengikuti alur data dari Embedded Layer hingga Frontend Layer, tanpa membahas detail implementasi.

Data sensor yang dihasilkan oleh **ESP32** dikirimkan menuju **Laravel Backend** melalui REST API sebagaimana telah ditetapkan pada API Specification, mengikuti alur Controller Layer, Validation Layer, Service Layer, dan Repository Layer yang telah dijelaskan pada SDD Bab 5 dan Bab 6. Data yang telah lolos validasi tersebut disimpan pada **Database Layer**, khususnya pada hypertable `sensor_data`, sebagaimana ditetapkan pada DDD Bab 6.2.

Selanjutnya, **AI Service** — merepresentasikan konsep Inference Service pada Bab 4 sekaligus Future AI Module pada SDD Bab 3.4 — mengambil data historis dari Database Layer melalui mekanisme akses data yang serupa dengan yang digunakan oleh Historical Data Module pada Frontend, tanpa mengakses Database secara langsung di luar jalur yang telah ditetapkan pada Layered Architecture SAD Bab 5.1. AI Service memproses data tersebut melalui tahapan yang telah dijelaskan pada Bab 4, menghasilkan output berupa Threat Scoring maupun hasil analisis lain.

Hasil analisis dari AI Service kemudian disediakan kepada pihak lain melalui **REST API**, konsisten dengan prinsip API Design yang telah ditetapkan pada API Specification Bab 3 — RESTful, Stateless, Resource-Oriented, serta mengikuti Response Standard dan Versioning yang sama seperti endpoint MVP lainnya. Sebagaimana disebutkan pada API Specification Bab 12, endpoint AI Prediction direncanakan sebagai resource tersendiri pada versi API mendatang, tanpa mengubah kontrak endpoint `v1` yang telah berjalan pada MVP.

Pada tahap akhir, **Frontend Dashboard** mengonsumsi endpoint AI Prediction tersebut untuk menyajikan hasil analisis AI kepada pengguna, sebagaimana direncanakan sebagai AI Visualization pada FDD Bab 14, menggunakan pendekatan Data Visualization yang konsisten dengan Library dan Component yang telah digunakan pada MVP, seperti Recharts dan Status Indicator.

Dengan demikian, integrasi AI tidak menambah jalur komunikasi baru antara ESP32 dan Backend, maupun antara Backend dan Frontend — AI Service beroperasi sebagai konsumen data historis dari Database Layer yang sama, dan penyedia data baru bagi Frontend melalui REST API yang konsisten dengan arsitektur yang telah ada.

---

## 11. AI Deployment

**Python AI Service**
AI Service direncanakan diimplementasikan menggunakan Python, mengingat ekosistem Library dan Framework AI/Machine Learning yang matang pada Python, serta karakteristiknya yang umum digunakan pada kebutuhan Data Science dan pengembangan Model AI. Python AI Service ini beroperasi terpisah dari Laravel Backend, sejalan dengan pemisahan tanggung jawab yang telah ditetapkan pada SDD Bab 3.4, di mana AI Service merupakan module tersendiri yang tidak tercampur dengan business logic pada Service Layer Laravel.

**REST API Communication**
Komunikasi antara Python AI Service dengan Laravel Backend maupun secara langsung dengan Frontend — bergantung pada keputusan teknis yang akan ditetapkan pada tahap perancangan lanjutan — dilakukan melalui REST API, konsisten dengan pendekatan komunikasi yang telah digunakan di seluruh layer SIAGA sebagaimana ditetapkan pada API Specification Bab 3. Pendekatan ini menjaga konsistensi arsitektur tanpa memerlukan protokol komunikasi tambahan di luar yang telah ditetapkan.

**Docker (Future)**
Containerization menggunakan Docker bagi AI Service direncanakan sebagai bagian dari Future Development, sejalan dengan kesiapan containerisasi yang telah disebutkan pada SDD Bab 14 terkait struktur folder Backend dan Database yang mendukung proses containerisasi di masa mendatang. Pendekatan ini memungkinkan AI Service di-deploy secara terisolasi dari Laravel Backend, sehingga siklus pembaruan Model maupun dependency Python tidak memengaruhi operasional Backend maupun Embedded Layer.

Strategi Deployment ini menegaskan bahwa AI Service merupakan komponen tambahan yang bersifat independen secara operasional, sehingga kegagalan maupun downtime pada AI Service tidak memengaruhi fungsi inti SIAGA — baik threat assessment lokal pada Embedded Layer maupun fungsi Monitoring dan Historical Data pada MVP.

---

## 12. Risks and Limitations

**Small Dataset**
Pada tahap awal Phase 6, volume data historis kemungkinan masih terbatas, khususnya apabila SIAGA baru dioperasikan pada satu perangkat dalam periode yang belum lama, sehingga Dataset yang tersedia bagi kebutuhan Training maupun Evaluation Model berpotensi belum representatif.

**Sensor Noise**
Nilai pembacaan sensor pada perangkat IoT umumnya rentan terhadap noise akibat faktor lingkungan maupun keterbatasan akurasi sensor itu sendiri, yang berpotensi memengaruhi kualitas Feature yang diekstraksi maupun performa Model apabila tidak ditangani secara memadai pada tahap Data Cleaning.

**Concept Drift**
Pola data sensor maupun kondisi lingkungan yang dipantau berpotensi berubah seiring waktu, misalnya akibat perubahan tata letak ruangan atau perubahan pola aktivitas di sekitar perangkat, sehingga Model yang telah dilatih pada suatu periode berpotensi mengalami penurunan performa apabila tidak diperbarui secara berkala.

**False Positive**
Kesalahan deteksi ancaman oleh AI pada kondisi yang sebenarnya normal berpotensi menurunkan kepercayaan pengguna terhadap hasil analisis AI, khususnya apabila terjadi secara berulang.

**False Negative**
Kegagalan AI dalam mendeteksi kondisi yang sebenarnya mengarah pada ancaman merupakan risiko yang perlu mendapat perhatian khusus, mengingat konteks SIAGA sebagai sistem keselamatan. Risiko ini menjadi salah satu alasan utama mengapa AI tidak diposisikan sebagai pengganti Rule-Based Decision Engine, sebagaimana ditegaskan pada Bab 14.

**Computational Cost**
Proses Training maupun Inference bagi Model tertentu, khususnya pendekatan berbasis Deep Learning seperti Autoencoder dan LSTM Autoencoder, memerlukan sumber daya komputasi yang perlu dipertimbangkan pada tahap Model Deployment, agar tidak membebani lingkungan operasional secara berlebihan.

---

## 13. Future AI Roadmap

Bagian ini membahas kemungkinan pengembangan AI lebih lanjut, seluruhnya sebagai **Future Development** pada tahap setelah Adaptive Threat Intelligence Engine dasar berhasil diimplementasikan pada Phase 6.

**Predictive Maintenance**
Pemanfaatan pola data historis untuk mengidentifikasi indikasi penurunan performa perangkat atau sensor, sebagai dasar bagi estimasi kebutuhan perawatan perangkat sebelum terjadi kegagalan fungsi.

**Federated Learning**
Pendekatan Training Model yang memungkinkan pembelajaran dilakukan pada beberapa perangkat maupun lokasi secara terdistribusi tanpa memusatkan seluruh data mentah pada satu lokasi, relevan dipertimbangkan apabila SIAGA berkembang ke skenario Multi Device dengan sebaran lokasi yang luas.

**TinyML**
Kemungkinan penempatan Model AI berukuran kecil secara langsung pada perangkat ESP32 di masa yang sangat jauh ke depan, sebagai pelengkap terhadap Rule-Based Decision Engine, dengan tetap mempertimbangkan keterbatasan sumber daya komputasi pada Embedded Layer sebagaimana ditetapkan pada Design Constraint SIAGA.

**Online Learning**
Kemampuan Model untuk memperbarui dirinya secara bertahap berdasarkan data baru yang terus masuk, sebagai pengembangan lanjutan dari Future Incremental Training yang telah disinggung pada Bab 8.

**Multi Device Learning**
Pemanfaatan data dari lebih dari satu perangkat ESP32 sebagai Dataset bagi Training Model, memanfaatkan fondasi `device_id` yang telah disiapkan sejak MVP pada DDD Bab 13, guna menghasilkan Model yang lebih general dan tidak hanya merepresentasikan karakteristik satu perangkat maupun satu lokasi tertentu.

---

## 14. AI Design Decisions

AI pada sistem SIAGA secara konsisten diposisikan sebagai **lapisan analisis tambahan (additional analysis layer)**, bukan sebagai pengganti Rule-Based Decision Engine, berdasarkan beberapa pertimbangan berikut.

Pertama, fungsi threat assessment pada SIAGA merupakan fungsi keselamatan (safety function) yang harus tetap beroperasi secara independen terhadap konektivitas jaringan maupun ketersediaan Backend, sebagaimana ditetapkan pada Design Constraint SRS Bab 2.5 dan NFR-003. Menempatkan AI sebagai mekanisme utama akan bertentangan dengan prinsip ini, mengingat AI Service beroperasi pada Backend Layer yang bergantung pada konektivitas jaringan.

Kedua, risiko False Negative pada konteks sistem keselamatan memiliki konsekuensi yang jauh lebih besar dibandingkan konteks aplikasi AI pada umumnya, sebagaimana dijelaskan pada Bab 12. Rule-Based Decision Engine yang bersifat deterministik dan dapat diverifikasi secara eksplisit memberikan jaminan perilaku yang lebih dapat diprediksi dibandingkan Model AI, sehingga tetap dipertahankan sebagai mekanisme utama.

Ketiga, pendekatan ini selaras dengan kesiapan struktural yang telah disiapkan sejak MVP, di mana Future AI Module pada SDD Bab 3.4 dirancang untuk mengonsumsi data historis tanpa mengubah alur data inti, serta Future Database Considerations pada DDD Bab 13 yang menempatkan AI Dataset sebagai table tambahan tanpa mengubah struktur `sensor_data`. Desain ini memastikan bahwa penambahan AI pada Phase 6 tidak memerlukan perubahan struktural terhadap Architecture, Database, maupun API yang telah ditetapkan dan telah beroperasi pada tahap MVP.

Dengan demikian, AI pada SIAGA berfungsi untuk memperkaya wawasan yang disajikan kepada pengguna melalui Dashboard — melalui Anomaly Detection, Pattern Recognition, dan Predictive Analysis — tanpa mengubah jaminan keselamatan yang telah dijamin oleh Rule-Based Decision Engine dan State Machine pada Embedded Layer.

---

## 15. Glossary

| Istilah | Penjelasan |
|---|---|
| **AIDD (AI Design Document)** | Dokumen yang mendefinisikan desain Artificial Intelligence suatu sistem, mencakup Architecture, Dataset, Feature Engineering, Model, Training, Evaluation, dan Deployment. |
| **Adaptive Threat Intelligence Engine** | Sebutan konseptual bagi kapabilitas AI pada roadmap SIAGA yang bertujuan meningkatkan analisis ancaman berbasis data historis. |
| **AI Service** | Module pada Future AI Layer yang menjadi titik orkestrasi utama bagi pemrosesan AI, merepresentasikan Inference Service pada dokumen ini. |
| **Feature Engineering** | Proses ekstraksi representasi data yang lebih bermakna dari data mentah sebagai input bagi Model AI. |
| **Dataset** | Kumpulan data yang digunakan sebagai input bagi proses Training, Validation, dan Evaluation Model AI. |
| **Model** | Representasi hasil pembelajaran Machine Learning maupun Deep Learning yang digunakan untuk menghasilkan Inference terhadap data baru. |
| **Training** | Proses pembelajaran Model terhadap Dataset yang tersedia. |
| **Inference** | Proses penggunaan Model yang telah dilatih untuk menghasilkan output terhadap data baru. |
| **Evaluation** | Proses penilaian performa Model menggunakan metrik yang relevan. |
| **Deployment** | Proses penempatan Model ke lingkungan operasional agar dapat digunakan secara aktual. |
| **Anomaly Detection** | Kapabilitas AI untuk mengidentifikasi data yang menyimpang signifikan dari pola normal. |
| **Isolation Forest** | Model unsupervised berbasis pemisahan acak untuk mengidentifikasi anomali. |
| **Autoencoder** | Model berbasis Deep Learning yang mendeteksi anomali melalui reconstruction error. |
| **LSTM Autoencoder** | Variasi Autoencoder yang menggunakan Long Short-Term Memory untuk menangkap pola sekuensial pada data time-series. |
| **One-Class SVM** | Model yang mempelajari batas keputusan antara data normal dan anomali. |
| **Reconstruction Error** | Selisih antara data asli dan hasil rekonstruksi Model, digunakan sebagai indikator anomali pada Autoencoder. |
| **Threat Scoring** | Representasi numerik hasil analisis AI terhadap tingkat ancaman suatu kondisi. |
| **Concept Drift** | Perubahan pola data seiring waktu yang berpotensi menurunkan performa Model. |
| **Federated Learning** | Pendekatan Training Model secara terdistribusi tanpa memusatkan data mentah pada satu lokasi. |
| **TinyML** | Pendekatan penempatan Model AI berukuran kecil pada perangkat dengan sumber daya terbatas. |
| **Online Learning** | Kemampuan Model untuk diperbarui secara bertahap berdasarkan data baru yang terus masuk. |
| **Predictive Maintenance** | Estimasi kebutuhan perawatan perangkat berdasarkan pola data historis. |
| **Rule-Based Decision Engine** | Mekanisme utama threat assessment pada SIAGA berbasis evaluasi rule terhadap kombinasi nilai sensor, tetap menjadi mekanisme utama meskipun AI diimplementasikan. |

---

*Dokumen ini merupakan turunan dari SIAGA Software Design Document, SIAGA Database Design Document, SIAGA API Specification, dan SIAGA Frontend Design Document, serta menjadi referensi utama bagi implementasi AI pada sistem SIAGA di tahap pengembangan Phase 6, tanpa mengubah Architecture, technology stack, maupun ruang lingkup proyek yang telah ditetapkan pada tahap MVP.*
