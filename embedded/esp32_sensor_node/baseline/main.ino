// ======================================================
// SIAGA - ESP32 (Non-Blocking Status Based)
// Refactored version — behavior identik dengan baseline.
//
// Fitur:
// - DHT11 (temperature & humidity)
// - PIR HC-SR501 (motion detection)
// - LDR Module (analog light intensity)
// - Obstacle Sensor (digital object detection)
// - LED status: Hijau (NORMAL) / Kuning (WASPADA) / Merah (BAHAYA)
// - Passive Buzzer (aktif hanya saat BAHAYA)
//
// Catatan penting:
// - Semua timing menggunakan millis() (non-blocking).
// - Pengurangan unsigned long (now - last) aman terhadap
//   overflow millis() setelah ~49 hari, karena aritmatika
//   unsigned wrap-around otomatis menghasilkan hasil yang benar.
// ======================================================

#include <DHT.h>

// ======================================================
// CONFIGURATION
// ======================================================
// Semua parameter hardware, threshold, dan timing dikumpulkan
// di sini agar mudah ditemukan dan diubah tanpa menelusuri
// seluruh file.

// ---------------- Pin Definitions ----------------
// WAJIB TIDAK DIUBAH — sesuai hardware yang sudah terpasang & teruji.
constexpr uint8_t DHT_PIN        = 4;
#define DHTTYPE DHT11

constexpr uint8_t PIR_PIN        = 18;
constexpr uint8_t LDR_PIN        = 34;
constexpr uint8_t OBSTACLE_PIN   = 19;

constexpr uint8_t RED_LED_PIN    = 25;
constexpr uint8_t YELLOW_LED_PIN = 26;
constexpr uint8_t GREEN_LED_PIN  = 27;

constexpr uint8_t BUZZER_PIN     = 32;

// ---------------- Threshold Configuration ----------------
// Nilai default dipertahankan sama persis dengan baseline.
constexpr int   DARK_THRESHOLD     = 1500; // nilaiCahaya > ini dianggap gelap
constexpr float DANGER_TEMPERATURE = 32.0f; // suhu >= ini dianggap bahaya
constexpr int   BUZZER_FREQUENCY   = 3000;  // Hz

// ---------------- Timing Configuration ----------------
// Interval default dipertahankan sama persis dengan baseline.
constexpr unsigned long DHT_INTERVAL      = 2000;
constexpr unsigned long PIR_INTERVAL      = 100;
constexpr unsigned long LDR_INTERVAL      = 500;
constexpr unsigned long OBSTACLE_INTERVAL = 100;
constexpr unsigned long SERIAL_INTERVAL   = 2000;
constexpr unsigned long BLINK_INTERVAL    = 500;

// ======================================================
// SENSOR STATE
// ======================================================
// Dikelompokkan dalam satu struct supaya jelas data mana yang
// merupakan "hasil bacaan sensor", terpisah dari status sistem.
struct SensorData {
  float temperature = 0.0f;
  float humidity     = 0.0f;
  bool  dhtValid      = false; // true jika bacaan DHT11 terakhir valid

  int   lightLevel    = 0;

  bool  motionDetected = false;

  int   obstacleRaw    = HIGH;
  bool  objectDetected = false;
};

SensorData sensorData;

// ======================================================
// SYSTEM STATE
// ======================================================
enum class SystemStatus {
  NORMAL,
  WASPADA,
  BAHAYA
};

SystemStatus currentStatus = SystemStatus::NORMAL;

// State untuk blink LED (non-blocking)
bool ledBlinkState = false;

// Timer terakhir untuk setiap task, dipakai bersama millis()
unsigned long lastDhtRead      = 0;
unsigned long lastPirRead      = 0;
unsigned long lastLdrRead      = 0;
unsigned long lastObstacleRead = 0;
unsigned long lastSerialPrint  = 0;
unsigned long lastBlinkToggle  = 0;

DHT dht(DHT_PIN, DHTTYPE);

// ======================================================
// SETUP
// ======================================================
void setup() {
  Serial.begin(115200);

  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  pinMode(PIR_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(OBSTACLE_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  dht.begin();

  Serial.println(F("==============================="));
  Serial.println(F(" SIAGA - ESP32 Started"));
  Serial.println(F("==============================="));
}

// ======================================================
// LOOP
// ======================================================
void loop() {
  const unsigned long now = millis();

  // --- Sensor Reading (masing-masing punya interval sendiri,
  //     tidak saling memblokir) ---
  if (now - lastDhtRead >= DHT_INTERVAL) {
    lastDhtRead = now;
    readDHT();
  }

  if (now - lastPirRead >= PIR_INTERVAL) {
    lastPirRead = now;
    readPIR();
  }

  if (now - lastLdrRead >= LDR_INTERVAL) {
    lastLdrRead = now;
    readLDR();
  }

  if (now - lastObstacleRead >= OBSTACLE_INTERVAL) {
    lastObstacleRead = now;
    readObstacle();
  }

  // --- Logic Processing ---
  updateSystemStatus();

  // --- Output Control ---
  updateLedBlinkState(now);
  updateLed();
  updateBuzzer();

  // --- Serial Monitoring ---
  if (now - lastSerialPrint >= SERIAL_INTERVAL) {
    lastSerialPrint = now;
    printSensorData();
    printSystemStatus();
  }
}

// ======================================================
// SENSOR READING
// ======================================================

// DHT11: temperature & humidity.
// Jika bacaan gagal (NaN), nilai suhu/kelembapan lama tetap
// dipertahankan (tidak direset), sama seperti baseline.
// dhtValid hanya dipakai untuk pelaporan/diagnostik, TIDAK
// mempengaruhi logic status (lihat catatan di bagian akhir).
void readDHT() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t) && !isnan(h)) {
    sensorData.temperature = t;
    sensorData.humidity    = h;
    sensorData.dhtValid    = true;
  } else {
    sensorData.dhtValid = false;
  }
}

// PIR: motion detection.
void readPIR() {
  sensorData.motionDetected = digitalRead(PIR_PIN);
}

// LDR: analog light intensity.
void readLDR() {
  sensorData.lightLevel = analogRead(LDR_PIN);
}

// Obstacle sensor: LOW berarti objek terdeteksi (sesuai wiring modul).
void readObstacle() {
  sensorData.obstacleRaw    = digitalRead(OBSTACLE_PIN);
  sensorData.objectDetected = (sensorData.obstacleRaw == LOW);
}

// ======================================================
// LOGIC PROCESSING
// ======================================================

// Menentukan status sistem berdasarkan kombinasi sensor.
// Prioritas: BAHAYA > WASPADA > NORMAL.
// Logic ini sengaja dipertahankan identik dengan baseline.
void updateSystemStatus() {
  const bool isDark       = sensorData.lightLevel > DARK_THRESHOLD;
  const bool isTempDanger = sensorData.temperature >= DANGER_TEMPERATURE;

  if (sensorData.motionDetected && (isTempDanger || isDark)) {
    currentStatus = SystemStatus::BAHAYA;
  } else if (sensorData.motionDetected || sensorData.objectDetected) {
    currentStatus = SystemStatus::WASPADA;
  } else {
    currentStatus = SystemStatus::NORMAL;
  }
}

// ======================================================
// OUTPUT CONTROL
// ======================================================

// Timer blink terpisah dari penulisan LED itu sendiri, supaya
// "kapan LED berkedip" dan "LED mana yang aktif" tidak bercampur.
void updateLedBlinkState(unsigned long now) {
  if (now - lastBlinkToggle >= BLINK_INTERVAL) {
    lastBlinkToggle = now;
    ledBlinkState = !ledBlinkState;
  }
}

// Hanya satu LED yang boleh menyala sesuai status saat ini.
void updateLed() {
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

  if (!ledBlinkState) {
    return; // Fase "mati" dari siklus blink.
  }

  switch (currentStatus) {
    case SystemStatus::NORMAL:
      digitalWrite(GREEN_LED_PIN, HIGH);
      break;
    case SystemStatus::WASPADA:
      digitalWrite(YELLOW_LED_PIN, HIGH);
      break;
    case SystemStatus::BAHAYA:
      digitalWrite(RED_LED_PIN, HIGH);
      break;
  }
}

// Buzzer hanya aktif saat status BAHAYA.
void updateBuzzer() {
  if (currentStatus == SystemStatus::BAHAYA) {
    tone(BUZZER_PIN, BUZZER_FREQUENCY);
  } else {
    noTone(BUZZER_PIN);
  }
}

// ======================================================
// SERIAL MONITORING
// ======================================================

const char* statusToString(SystemStatus s) {
  switch (s) {
    case SystemStatus::NORMAL:  return "NORMAL";
    case SystemStatus::WASPADA: return "WASPADA";
    case SystemStatus::BAHAYA:  return "BAHAYA";
  }
  return "UNKNOWN";
}

void printSensorData() {
  Serial.println(F("================================"));
  Serial.println(F("SIAGA SENSOR STATUS"));
  Serial.println(F("================================"));

  Serial.print(F("Temperature : "));
  Serial.print(sensorData.temperature, 1);
  Serial.println(F(" C"));
  if (!sensorData.dhtValid) {
    Serial.println(F("  (warning: last DHT11 read failed, showing last known value)"));
  }

  Serial.print(F("Humidity    : "));
  Serial.print(sensorData.humidity, 1);
  Serial.println(F(" %"));

  Serial.print(F("Light (ADC) : "));
  Serial.println(sensorData.lightLevel);

  Serial.print(F("Motion      : "));
  Serial.println(sensorData.motionDetected ? F("DETECTED") : F("NONE"));

  Serial.print(F("Obstacle DO : "));
  Serial.println(sensorData.obstacleRaw);

  Serial.print(F("Obstacle    : "));
  Serial.println(sensorData.objectDetected ? F("DETECTED") : F("NONE"));
}

void printSystemStatus() {
  Serial.print(F("Status      : "));
  Serial.println(statusToString(currentStatus));
  Serial.println(F("================================"));
}

