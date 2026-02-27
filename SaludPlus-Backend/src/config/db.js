const mysql = require('mysql2/promise'); // Cambiamos a promise

const connection = mysql.createPool({ // Usar Pool es mejor para APIs
    host: '127.0.0.1',
    user: 'root',      // Ajusta a tu usuario
    password: 'Qwe.123*',      // Ajusta a tu contraseña
    database: 'saludPlus'
});

module.exports = connection;