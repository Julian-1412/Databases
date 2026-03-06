const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors()); // Permite que el navegador se comunique con el servidor
app.use(express.json()); // Permite leer datos en formato JSON
app.use(express.static('.')); // Sirve tus archivos HTML/JS automáticamente

// CONFIGURACIÓN DE TU BASE DE DATOS
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Tu usuario de MySQL
    password: 'Qwe.123*',      // Tu contraseña de MySQL
    database: 'jardineria' // El nombre de tu base de datos
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a MySQL con éxito');
});

// ESTA ES TU API: Recibe el comando SQL del navegador
app.post('/ejecutar-sql', (req, res) => {
    const { sql } = req.body;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result });
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});