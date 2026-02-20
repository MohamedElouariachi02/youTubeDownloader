var express = require('express');
const ytDlp = require('yt-dlp-exec');
var path = require('path');
var router = express.Router();

// 1. Función asíncrona para descargar el video
async function descarga() {
    console.log('Iniciando descarga con yt-dlp...');
    const url = 'https://youtu.be/NvNKO31H8_M?si=YF8cz5h-W9fdIgJK';

    // Definimos la ruta exacta donde se guardará el archivo en tu servidor
    const rutaDestino = path.join(__dirname, '../source/mi_video.mp4');

    // Retornamos la promesa para que el servidor pueda "esperar" a que termine
    return ytDlp(url, {
        output: rutaDestino, // Le decimos exactamente dónde guardarlo
        format: 'bestaudio/best[height<=720]',
        mergeOutputFormat: 'mp4'
    }).then(() => {
        console.log('¡Descarga finalizada en el servidor!');
    });
}

// 2. RUTA POST: El cliente la llama para iniciar la descarga del video
router.post('/descargar', async function(req, res, next) {
    try {
        // Esperamos a que la función de yt-dlp termine de descargar el video
        await descarga();

        // Una vez que terminó, le respondemos al HTML con un JSON de éxito
        res.json({
            mensaje: "El video se descargó en el servidor correctamente.",
            estado: "completado"
        });
    } catch (error) {
        console.error('Error al descargar:', error);
        res.status(500).json({ mensaje: "Hubo un error al descargar el video." });
    }
});

// 3. RUTA GET: El cliente es redirigido aquí para llevarse el archivo físico
router.get('/obtener-archivo', function(req, res, next) {
    // Buscamos el video que acabamos de descargar
    const directorio = path.join(__dirname, '../source/mi_video.mp4');

    // Se lo enviamos al usuario
    res.download(directorio, 'video_youtube.mp4', function(error) {
        if (error) {
            console.log("Hubo un error al enviar el archivo al navegador:", error);
            if (!res.headersSent) {
                res.status(500).send("Error al descargar el archivo.");
            }
        } else {
            console.log("¡Archivo enviado al cliente correctamente!");
        }
    });
});

module.exports = router;