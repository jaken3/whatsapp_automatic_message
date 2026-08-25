/**
 * Busca el ID de un grupo por su nombre exacto (case-insensitive)
 */
async function findIdGroupByName(sock, groupName) {
  try {
    const groups = await sock.groupFetchAllParticipating();
    for (const id in groups) {
      if (groups[id].subject.toLowerCase().trim() === groupName.toLowerCase().trim()) {
        return id;
      }
    }
  } catch (err) {
    console.error("Error al obtener la lista de grupos:", err.message);
  }
  return null;
}

/**
 * Resuelve el ID objetivo del envío (Grupo, Contacto por nombre o ID Fallback)
 */
async function resolveTargetId(sock, config, contactsStore) {
  let targetId = null;

  if (config.IS_GROUP) {
    console.info(`Buscando grupo: "${config.TARGET_GROUP_NAME}"...`);
    targetId = await findIdGroupByName(sock, config.TARGET_GROUP_NAME);
  } else {
    console.info(`Buscando contacto: ${config.TARGET_CONTACT_NAME}...`);
    for (const [id, name] of Object.entries(contactsStore)) {
      if (name.toLowerCase().trim() === config.TARGET_CONTACT_NAME.toLowerCase().trim()) {
        targetId = id;
        break;
      }
    }
  }

  if (!targetId) {
    console.warn(`Destinatario no encontrado en la agenda. Usando ID de respaldo: ${config.DESTINATARIO_ID_FALLBACK}`);
    return config.DESTINATARIO_ID_FALLBACK;
  }

  console.info(`Destinatario resuelto con éxito: ${targetId}`);
  return targetId;
}

module.exports = { findIdGroupByName, resolveTargetId };