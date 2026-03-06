// Carga las variables de .env antes que cualquier otra cosa
require('dotenv').config();

const express = require('express');
const app = express();

// Middleware que permite a Express leer JSON del body de los requests
app.use(express.json());
app.use(express.static('public'));

// Importamos las rutas del auto y las montamos bajo el prefijo /api/cars
// Esto significa que todas las rutas en car.routes.js serán /api/cars/...
const carRoutes = require('./src/routes/car.routes');
const importRoutes = require('./src/routes/import.routes');

app.use('/api/cars', carRoutes);
app.use('/api/import', importRoutes); 

// Ruta raíz para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ message: 'AutoMarket API funcionando ' });
});

// Leemos el puerto del .env o usamos 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
