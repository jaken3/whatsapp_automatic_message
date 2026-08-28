const fs = require("fs");
const path = require("path");

class AdvertiserTask {
  #miliSeconds = 60 * 1000;
  #hourMs = 60 * this.#miliSeconds;
  #offSetMS = 45 * this.#miliSeconds; // 45 minutos en milisegundos
  #minMs = 45000; // 45 segundos
  #maxMs = 85000; // 1 minuto con 25 segundos
  constructor(config) {
    this.config = config;
    this.lastSentTimestamp = 0;
    this.timerStarted = false;
    this.intervalMs = config.HOURS_INTERVAL * this.#hourMs;
  }

  /**
   * Realiza el envío publicitario con protección contra múltiples reconexiones
   */
  async send(sock, targetId, force = false) {
    if (!sock || !targetId) {
      console.info("Sock no listo o destinatario no asignado. Omitiendo.");
      return;
    }

    const now = Date.now();
    const timeElapsed = now - this.lastSentTimestamp;

    if (
      !force &&
      this.lastSentTimestamp !== 0 &&
      timeElapsed < this.intervalMs
    ) {
      const minutesLeft = Math.ceil(
        (this.intervalMs - timeElapsed) / this.#miliSeconds,
      );
      console.info(
        `Programador activo: Faltan ${minutesLeft} minutos para el próximo envío.`,
      );
      return;
    }

    try {
      // Rotación aleatoria de imagen y mensaje
      let randomMessage = "";
      const randomImage =
        this.config.IMAGES[
          Math.floor(Math.random() * this.config.IMAGES.length)
        ];
      const imagePath = path.join(this.config.PATHS.IMAGES, randomImage);
     
      if (!fs.existsSync(imagePath)) {
        console.error(`Archivo de imagen no encontrado: ${imagePath}`);
        return;
      }

      if (randomImage.toLocaleLowerCase().includes("image")) {
        randomMessage =
          this.config.MESSAGES[
            Math.floor(Math.random() * this.config.MESSAGES.length)
          ];
      }

      await sock.sendMessage(targetId, {
        image: { url: imagePath },
        caption: randomMessage,
      });

      this.lastSentTimestamp = Date.now();
      console.info(
        `[${new Date().toLocaleTimeString()}] Publicidad enviada a ${targetId} (${randomImage})`,
      );
    } catch (error) {
      console.error("Error enviando mensaje publicitario:", error);
    }
  }

  /**
   * Inicia el bucle de verificación periódica
   */
  startScheduler(sockProvider, getTargetId) {
    if (this.timerStarted) return;
    this.timerStarted = true;

    console.info(
      `Programador activo: Intentando envío cada ${this.config.HOURS_INTERVAL} horas.`,
    );
    this.#scheduleNextSend(sockProvider, getTargetId);
  }

  #delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  #scheduleNextSend = (sockProvider, getTargetId) => {
    const delay = this.#hourMs + Math.random() * this.#offSetMS;
    setTimeout(async () => {
      const sock = sockProvider();
      const targetId = getTargetId();
      const humanDelay =
        Math.floor(Math.random() * (this.#maxMs - this.#minMs + 1)) +
        this.#minMs;
      await this.#delay(humanDelay);
      await this.send(sock, targetId, false);
      this.#scheduleNextSend(sockProvider, getTargetId); // Reprograma el siguiente envío
    }, delay);
  };
}

module.exports = AdvertiserTask;
