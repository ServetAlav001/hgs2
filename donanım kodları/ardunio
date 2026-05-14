/*
 * HGS Mega <-> ESP32 test koprusu
 *
 * Amac:
 * - ESP32 tarafindaki HTTP koprusunun seri protokolunu gercekten test etmek
 * - Yorum satirina alinmis eski Mega kodu yerine yuklenebilir bir sketch saglamak
 *
 * Donanim:
 * - Arduino Mega 2560
 * - Mega TX2 (16) -> ESP32 RX2 (GPIO16)
 * - Mega RX2 (17) -> ESP32 TX2 (GPIO17)
 * - GND ortak olmali
 *
 * Seri monitor komutlari:
 * - card 1234ABCD
 * - no 22014567
 * - fp 7
 * - enr_kart 22014567|1234ABCD
 * - enr_fp 22014567|7
 * - enr_no 22014567|22014568
 * - enr_ogr 22014567
 * - ping
 *
 * ESP32'den gelen WEB_SCAN_CARD / WEB_SCAN_FP komutlari seri monitore yazdirilir.
 * Ardindan uygun "card ..." veya "fp ..." komutunu girerek akisi tamamlayabilirsiniz.
 */

#define ESP_LINK Serial2
#define PC_LINK Serial

const unsigned long PC_BAUD = 115200;
const unsigned long ESP_BAUD = 9600;
const unsigned long PING_INTERVAL_MS = 5000;

String serialBuffer;
unsigned long lastPingMs = 0;

void setup() {
  PC_LINK.begin(PC_BAUD);
  ESP_LINK.begin(ESP_BAUD);

  PC_LINK.println();
  PC_LINK.println("HGS Mega bridge hazir.");
  PC_LINK.println("Komut ornegi: card 1234ABCD");
}

void loop() {
  handlePcInput();
  handleEspInput();
  maybeSendPing();
}

void handlePcInput() {
  while (PC_LINK.available() > 0) {
    char ch = (char)PC_LINK.read();
    if (ch == '\r') {
      continue;
    }
    if (ch == '\n') {
      processConsoleCommand(serialBuffer);
      serialBuffer = "";
      continue;
    }
    serialBuffer += ch;
  }
}

void handleEspInput() {
  while (ESP_LINK.available() > 0) {
    String line = ESP_LINK.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) {
      continue;
    }

    if (line == "WEB_SCAN_CARD") {
      PC_LINK.println("[ESP] Web kart taramasi bekliyor. Komut girin: card <uid>");
    } else if (line == "WEB_SCAN_FP") {
      PC_LINK.println("[ESP] Web parmak taramasi bekliyor. Komut girin: fp <slot>");
    } else {
      PC_LINK.print("[ESP] ");
      PC_LINK.println(line);
    }
  }
}

void maybeSendPing() {
  unsigned long now = millis();
  if (now - lastPingMs < PING_INTERVAL_MS) {
    return;
  }

  lastPingMs = now;
  ESP_LINK.println("PING");
}

void processConsoleCommand(String command) {
  command.trim();
  if (command.length() == 0) {
    return;
  }

  if (command == "ping") {
    sendToEsp("PING");
    return;
  }

  if (command.startsWith("card ")) {
    sendWithPrefix("UID:", command.substring(5));
    return;
  }

  if (command.startsWith("no ")) {
    sendWithPrefix("PIN:", command.substring(3));
    return;
  }

  if (command.startsWith("fp ")) {
    sendWithPrefix("FP:", command.substring(3));
    return;
  }

  if (command.startsWith("enr_kart ")) {
    sendWithPrefix("ENR_KART|", command.substring(9));
    return;
  }

  if (command.startsWith("enr_fp ")) {
    sendWithPrefix("ENR_FP|", command.substring(7));
    return;
  }

  if (command.startsWith("enr_no ")) {
    sendWithPrefix("ENR_NO|", command.substring(7));
    return;
  }

  if (command.startsWith("enr_ogr ")) {
    sendWithPrefix("ENR_OGR|", command.substring(8));
    return;
  }

  PC_LINK.println("Bilinmeyen komut.");
}

void sendWithPrefix(const char* prefix, String payload) {
  payload.trim();
  if (payload.length() == 0) {
    PC_LINK.println("Eksik veri.");
    return;
  }

  sendToEsp(String(prefix) + payload);
}

void sendToEsp(const String& line) {
  ESP_LINK.println(line);
  PC_LINK.print("[MEGA->ESP] ");
  PC_LINK.println(line);
}
