require("dotenv").config();
const path = require("path");

const parseArray = (envVar, defaultValue = [], delimiter = ",") => {
  if (!envVar) return defaultValue;
  try {
    // Si viene formateado como un JSON válido [ ... ]
    if (envVar.trim().startsWith("[")) {
      return JSON.parse(envVar);
    }
    // Si viene como una lista separada por caracter ( | o , )
    return envVar
      .split(delimiter)
      .map((item) => item.trim().replace(/\\n/g, "\n"))
      .filter((item) => item.length > 0);
  } catch (err) {
    console.warn(
      "Error parseando variable de entorno, usando valor por defecto:",
      err.message,
    );
    return defaultValue;
  }
};

module.exports = {
  DESTINATARIO_ID_FALLBACK:
    process.env.DESTINATARIO_ID || "573003272408@s.whatsapp.net", 
  HOURS_INTERVAL: parseFloat(process.env.HOURS_INTERVAL || "3"),
  IS_GROUP: (process.env.IS_GROUP || "false").toLowerCase() === "true",
  TARGET_GROUP_NAME:
    process.env.TARGET_GROUP_NAME || "grupo de prueba",
  TARGET_CONTACT_NAME: process.env.TARGET_CONTACT_NAME || "user_demo",

  // Lista de imágenes separadas por comas
  IMAGES: parseArray(process.env.IMAGE_NAMES, ["image-1.jpg"], ","),

  // Lista de mensajes separados por pipe |
  MESSAGES: parseArray(
    process.env.MESSAGES_LIST,
    [
      `lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      `Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    ],
    "|",
  ),

  PATHS: {
    AUTH: path.join(process.cwd(), "auth_info_baileys"),
    IMAGES: path.join(process.cwd(), "images"),
  },
};
