// ======================================================
// SIAGA - ESP32 (Non-Blocking Status Based)
// Fitur:
// - DHT11
// - PIR HC-SR501
// - LDR Module (Analog)
// - Obstacle Sensor
// - LED Status Blink (Hijau/Kuning/Merah)
// - Passive Buzzer (3000Hz)
// ======================================================


#include <DHT.h>


// ======================================================
// PIN CONFIGURATION
// ======================================================


// DHT11

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);



// PIR

const int PIR_PIN = 18;



// LDR

const int LDR_PIN = 34;



// Obstacle Sensor

const int OBSTACLE_PIN = 19;



// LED

const int LED_MERAH  = 25;
const int LED_KUNING = 26;
const int LED_HIJAU  = 27;



// Passive Buzzer

const int BUZZER_PIN = 32;
const int BUZZER_FREQ = 3000;




// ======================================================
// SENSOR VARIABLE
// ======================================================

float suhu = 0;
float kelembapan = 0;


int nilaiCahaya = 0;


bool adaGerakan = false;
bool adaObjek = false;


int nilaiObstacle = HIGH;




// ======================================================
// THRESHOLD
// ======================================================

const int BATAS_GELAP = 1500;

const float BATAS_SUHU_BAHAYA = 32.0;




// ======================================================
// STATUS SYSTEM
// ======================================================

enum StatusSIAGA {

  NORMAL,
  WASPADA,
  BAHAYA

};


StatusSIAGA status = NORMAL;




// ======================================================
// TIMER
// ======================================================

unsigned long waktuDHT = 0;
unsigned long waktuPIR = 0;
unsigned long waktuLDR = 0;
unsigned long waktuObstacle = 0;
unsigned long waktuSerial = 0;
unsigned long waktuBlink = 0;



const unsigned long intervalDHT = 2000;
const unsigned long intervalPIR = 100;
const unsigned long intervalLDR = 500;
const unsigned long intervalObstacle = 100;
const unsigned long intervalSerial = 2000;


// interval blink LED

const unsigned long intervalBlink = 500;



bool ledState = false;




// ======================================================
// SETUP
// ======================================================

void setup() {


  Serial.begin(115200);



  pinMode(LED_MERAH, OUTPUT);
  pinMode(LED_KUNING, OUTPUT);
  pinMode(LED_HIJAU, OUTPUT);



  pinMode(PIR_PIN, INPUT);



  pinMode(LDR_PIN, INPUT);



  pinMode(OBSTACLE_PIN, INPUT);



  pinMode(BUZZER_PIN, OUTPUT);



  dht.begin();



  Serial.println("===============================");
  Serial.println(" SIAGA - ESP32 Started");
  Serial.println("===============================");

}




// ======================================================
// LOOP
// ======================================================

void loop() {


  unsigned long sekarang = millis();




  if (sekarang - waktuDHT >= intervalDHT) {

    waktuDHT = sekarang;

    bacaDHT();

  }




  if (sekarang - waktuPIR >= intervalPIR) {

    waktuPIR = sekarang;

    bacaPIR();

  }




  if (sekarang - waktuLDR >= intervalLDR) {

    waktuLDR = sekarang;

    bacaLDR();

  }




  if (sekarang - waktuObstacle >= intervalObstacle) {

    waktuObstacle = sekarang;

    bacaObstacle();

  }




  prosesLogika();



  updateOutput(sekarang);




  if (sekarang - waktuSerial >= intervalSerial) {

    waktuSerial = sekarang;

    tampilkanSerial();

  }


}




// ======================================================
// SENSOR FUNCTION
// ======================================================


// DHT11

void bacaDHT() {


  float t = dht.readTemperature();

  float h = dht.readHumidity();



  if (!isnan(t) && !isnan(h)) {

    suhu = t;

    kelembapan = h;

  }

}




// PIR

void bacaPIR() {

  adaGerakan = digitalRead(PIR_PIN);

}




// LDR

void bacaLDR() {

  nilaiCahaya = analogRead(LDR_PIN);

}




// Obstacle

void bacaObstacle() {


  nilaiObstacle = digitalRead(OBSTACLE_PIN);



  // LOW = objek ditemukan

  if (nilaiObstacle == LOW) {

    adaObjek = true;

  }

  else {

    adaObjek = false;

  }

}





// ======================================================
// LOGIC PROCESSING
// ======================================================

void prosesLogika() {


  bool kondisiGelap = nilaiCahaya > BATAS_GELAP;




  // BAHAYA

  if (

      adaGerakan &&

      (

        suhu >= BATAS_SUHU_BAHAYA ||

        kondisiGelap

      )

     )

  {

    status = BAHAYA;

  }




  // WASPADA

  else if (

          adaGerakan ||

          adaObjek

          )

  {

    status = WASPADA;

  }




  // NORMAL

  else {

    status = NORMAL;

  }

}





// ======================================================
// OUTPUT CONTROL (BLINK)
// ======================================================

void updateOutput(unsigned long sekarang) {



  // Matikan semua LED

  digitalWrite(LED_MERAH, LOW);
  digitalWrite(LED_KUNING, LOW);
  digitalWrite(LED_HIJAU, LOW);



  // Blink timer

  if (sekarang - waktuBlink >= intervalBlink) {

    waktuBlink = sekarang;

    ledState = !ledState;

  }



  // Default buzzer mati

  noTone(BUZZER_PIN);




  switch(status) {



    case NORMAL:


      if (ledState) {

        digitalWrite(LED_HIJAU, HIGH);

      }


      break;





    case WASPADA:


      if (ledState) {

        digitalWrite(LED_KUNING, HIGH);

      }


      break;





    case BAHAYA:


      if (ledState) {

        digitalWrite(LED_MERAH, HIGH);

      }


      tone(BUZZER_PIN, BUZZER_FREQ);


      break;


  }

}





// ======================================================
// SERIAL MONITOR
// ======================================================

void tampilkanSerial() {


  Serial.println("--------------------------");


  Serial.print("Suhu       : ");

  Serial.print(suhu);

  Serial.println(" C");



  Serial.print("Kelembapan : ");

  Serial.print(kelembapan);

  Serial.println(" %");



  Serial.print("Cahaya ADC : ");

  Serial.println(nilaiCahaya);



  Serial.print("Gerakan    : ");

  Serial.println(
    adaGerakan ? "Terdeteksi" : "Tidak Ada"
  );



  Serial.print("Obstacle DO: ");

  Serial.println(nilaiObstacle);



  Serial.print("Objek      : ");

  Serial.println(
    adaObjek ? "Terdeteksi" : "Tidak Ada"
  );



  Serial.print("Status     : ");



  switch(status) {


    case NORMAL:

      Serial.println("NORMAL");

      break;



    case WASPADA:

      Serial.println("WASPADA");

      break;



    case BAHAYA:

      Serial.println("BAHAYA");

      break;


  }

}