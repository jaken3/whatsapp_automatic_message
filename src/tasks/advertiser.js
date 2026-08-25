const fs = require("fs");
const path = require("path");

class AdvertiserTask {
  constructor(config) {
    this.config = config;
    this.lastSentTimestamp = 0;
    this.timerStarted = false;
    this.intervalMs = config.HOURS_INTERVAL * 60 * 60 * 1000;
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

    if (!force && this.lastSentTimestamp !== 0 && timeElapsed < this.intervalMs) {
      const minutesLeft = Math.ceil((this.intervalMs - timeElapsed) / (1000 * 60));
      console.info(`Cooldown activo: Faltan ${minutesLeft} minutos para el próximo envío. Omitiendo.`);
      return;
    }

    try {
      // Rotación aleatoria de imagen y mensaje
      const randomImage = this.config.IMAGES[Math.floor(Math.random() * this.config.IMAGES.length)];
      const randomMessage = this.config.MESSAGES[Math.floor(Math.random() * this.config.MESSAGES.length)];
      const imagePath = path.join(this.config.PATHS.IMAGES, randomImage);

      if (!fs.existsSync(imagePath)) {
        console.error(`Archivo de imagen no encontrado: ${imagePath}`);
        return;
      }

      await sock.sendMessage(targetId, {
        image: { url: imagePath },
        caption: randomMessage
      });

      this.lastSentTimestamp = Date.now();
      console.info(`[${new Date().toLocaleTimeString()}] Publicidad enviada a ${targetId} (${randomImage})`);
    } catch (error) {
      console.error("Error enviando mensaje publicitario:", error);
    }
  }

  /**
   * Inicia el bucle de verificación periódica (cada 1 minuto)
   */
  startScheduler(sockProvider, getTargetId) {
    if (this.timerStarted) return;
    this.timerStarted = true;

    console.info(`Programador activo: Intentando envío cada ${this.config.HOURS_INTERVAL} horas.`);

    setInterval(async () => {
      const sock = sockProvider();
      const targetId = getTargetId();
      await this.send(sock, targetId, false);
    }, 60 * 1000); // Revisa cada minuto
  }
}

module.exports = AdvertiserTask;