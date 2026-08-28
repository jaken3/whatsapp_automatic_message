const baileys = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const makeWASocket = baileys.default || baileys;
const { useMultiFileAuthState, DisconnectReason, fetchLatestWaWebVersion, Browsers } = baileys;

/**
 * @description Crea un socket de WhatsApp utilizando la librería Baileys y maneja eventos de conexión, QR y contactos.
 * @param {Object} config - Configuración del entorno, incluyendo rutas y parámetros de conexión.
 * @param {Function} onOpen - Callback que se ejecuta cuando la conexión se abre exitosamente.
 * @param {Function} onClose - Callback que se ejecuta cuando la conexión se cierra, indicando si debe reconectarse.
 * @returns {Promise<Object>} - Retorna una promesa que resuelve con el socket de WhatsApp creado.
 * @returns 
 */
async function createWhatsAppSocket(config, onOpen, onClose) {
  const { state, saveCreds } = await useMultiFileAuthState(config.PATHS.AUTH);
  const { version, isLatest } = await fetchLatestWaWebVersion();

  console.info(`Iniciando Baileys v${version.join(".")} (Última versión: ${isLatest})`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ quiet: "true" }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Desktop"),
  });

  const contactsStore = {};

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("contacts.upsert", (contacts) => {
    for (const contact of contacts) {
      if (contact.name || contact.notify) {
        contactsStore[contact.id] = contact.name || contact.notify;
      }
    }
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.info("\nEscanea el siguiente código QR con tu celular:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("\n=======================================================");
      console.log("🚀 CONEXIÓN ESTABLECIDA CON ÉXITO");
      console.log("=======================================================\n");
      if (onOpen) await onOpen(sock, contactsStore);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Conexión cerrada (Código: ${statusCode}). Reconectando: ${shouldReconnect}`);

      if (!shouldReconnect && fs.existsSync(config.PATHS.AUTH)) {
        fs.rmSync(config.PATHS.AUTH, { recursive: true, force: true });
      }

      if (onClose) onClose(shouldReconnect);
    }
  });

  return sock;
}

module.exports = { createWhatsAppSocket };