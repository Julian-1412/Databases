  //1. Servidor y Conexión (index.js)
//Este archivo es el corazón de la aplicación. Configura Express y se conecta a  MongoDB local.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/backend_local')
    .then(() => console.log(" Conectado a MongoDB (DB: backend_local)"))
    .catch(err => console.error(" Error de conexión:", err));

// Cambio de 'tasks' a 'users' para que sea intuitivo
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);


const PORT = 5000;
app.listen(PORT, () => {
    console.log(` Servidor listo en http://localhost:${PORT}`);
});