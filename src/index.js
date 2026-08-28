const config = require("./config/env");
const { createWhatsAppSocket } = require("./services/whatsapp");
const { resolveTargetId } = require("./utils/groupHelper");
const AdvertiserTask = require("./tasks/advertiser");

let currentSock = null;
let currentTargetId = null;

const advertiser = new AdvertiserTask(config);
const onOpen = async (sock, contactsStore) => {
  currentSock = sock;

  if (!currentTargetId) {
    // Espera técnica para sincronizar agenda de contactos
    await new Promise((resolve) => setTimeout(resolve, 3000));
    currentTargetId = await resolveTargetId(sock, config, contactsStore);
  }

  // Ejecución inicial de prueba (o validación de Cooldown)
  if (advertiser.lastSentTimestamp === 0) {
    console.log("Ejecutando primer envío de prueba...");
    await advertiser.send(currentSock, currentTargetId, true);
  } else {
    await advertiser.send(currentSock, currentTargetId, false);
  }

  // Arrancar el scheduler de fondo
  advertiser.startScheduler(
    () => currentSock,
    () => currentTargetId,
  );
};
const onClose = (shouldReconnect) => {
  if (shouldReconnect) {
    main();
  }
};
async function main() {
  currentSock = await createWhatsAppSocket(
    config,
    // Callback cuando la conexión se abre
    onOpen,
    // Callback cuando la conexión se cierra
    onClose,
  );
}

main();
