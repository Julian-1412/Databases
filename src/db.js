// Cargamos las variables del archivo .env
require('dotenv').config();

// Importamos mysql2 en su versión con promesas
// (permite usar async/await en lugar de callbacks anidados)
const mysql = require('mysql2/promise');

// createPool crea un "grupo" de conexiones reutilizables.
// Es mejor que createConnection porque maneja múltiples
// peticiones simultáneas sin abrir/cerrar conexión cada vez.
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Exportamos el pool para usarlo en otros archivos
module.exports = pool;
