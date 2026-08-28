# WhatsApp Advertising Bot

Bot de automatización en Node.js para el envío programado de publicidad (imágenes + texto) en WhatsApp (vía Baileys). Diseñado para operar en contenedores **Docker** ligeros, autónomos y con soporte de reconexión automática.

---

## 🚀 Características

* **Sustitución de variables dinámica:** Soporta múltiples mensajes e imágenes con selección aleatoria por intervalo.
* **Resiliente y autónomo:** Gestión de sesión persistente con reconexión automática en caso de pérdida de red o reinicio del contenedor.
* **Formato multi-línea en `.env`:** Soporta mensajes con emojis y saltos de línea sin romper la variable de entorno.
* **100% Dockerizable:** Configurado para ejecutarse de forma aislada o mediante `docker-compose`.

---

## 🛠️ Requisitos Previos

* **Node.js** v24+
* **Docker** y **Docker Compose** (opcional para despliegue en contenedores)

---

## 📂 Estructura del Proyecto

```text
.
├── auth_info_baileys/     # Credenciales de sesión de WhatsApp (generado automáticamente)
├── images/                # Carpeta física con las imágenes publicitarias (.jpg, .png)
├── src/
│   ├── config/
│   │   └── env.js         # Módulo de carga y validación de variables de entorno
│   ├── tasks/
│   │   └── advertiser.js  # Lógica del temporizador y envío de mensajes/imágenes
│   └── index.js           # Punto de entrada y gestión de la conexión Baileys
├── .env                   # Variables de entorno locales (no subir a repositorios públicos)
```
---
## Instalación de dependencias

```bash
npm install
```
## Ejecución
```bash
node src/index.js
```
Escanea el codigo QR que aparecerá en consola desde tu aplicación whatsapp

## 🪪 Autor
Luis Felipe Fernandez
