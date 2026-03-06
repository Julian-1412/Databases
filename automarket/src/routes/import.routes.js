const { Router } = require('express');
const router = Router();

// Importamos el middleware de multer Y el controlador juntos
const { upload, importCars } = require('../controllers/import.controller');

// upload va ANTES de importCars en la ruta:
// primero multer procesa el archivo y lo pone en req.file,
// luego importCars lo lee y lo inserta en MySQL
router.post('/cars', upload, importCars);

module.exports = router;
