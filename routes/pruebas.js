var express = require('express');
const ytDlp = require('yt-dlp-exec');
var path = require('path');
var router = express.Router();

// 1. Función asíncrona para descargar el video
async function descarga(url) {
    try {
        console.log('Iniciando descarga con yt-dlp...');
        const rutaCookie = path.join(__dirname, '../cookie.txt');
        const info = await ytDlp(url, { dumpSingleJson: true, cookies: rutaCookie, });
        const title = info.title.replace(/[^a-zA-Z0-9 _-]/g, "");
        const ext = 'mp4'
        const nombreArchivo = `${title}.${ext}`;

        // Definimos la ruta exacta donde se guardará el archivo en tu servidor
        var rutaDestino = path.join(__dirname, '../source');
        rutaDestino = path.join(rutaDestino, nombreArchivo);


        // Retornamos la promesa para que el servidor pueda "esperar" a que termine
        await ytDlp(url, {
            output: rutaDestino,
            format: 'bestaudio/best[height<=720]',
            cookies: rutaCookie,
            mergeOutputFormat: 'mp4'
        })
        return [rutaDestino, nombreArchivo]
    }
    catch (error) {
        console.error("Url no valida");
        return [undefined, undefined]
    }

}

// 2. RUTA POST: El cliente la llama para iniciar la descarga del video
router.post('/descargar', async function(req, res, next) {
    try {
        // Esperamos a que la función de yt-dlp termine de descargar el video
        const [path, name] = await descarga(req.body.link);
        if (!path || !name)
        {
            res.json({
                mensaje: "Url no valida",
                estado: "incompleto",
                path: path,
                name: name
            });
            return
        }
        // Una vez que terminó, le respondemos al HTML con un JSON de éxito
        res.json({
            mensaje: "El video se descargó en el servidor correctamente.",
            estado: "completado",
            path: path,
            name: name
        });
    } catch (error) {
        console.error('Error al descargar:', error);
        res.status(500).json({ mensaje: "Hubo un error al descargar el video."});
    }
});

// 3. RUTA GET: El cliente es redirigido aquí para llevarse el archivo físico
router.get('/obtener-archivo', function(req, res, next) {
    // Buscamos el video que acabamos de descargar
    const directorio = req.query.path;
    const name = req.query.name;
    if (!directorio || !name)
    {
        console.log("Holaaaa ", error);
        return
    }

    // Se lo enviamos al usuario
    res.download(directorio, name, function(error) {
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