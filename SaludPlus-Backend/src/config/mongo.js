const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/saludPlusHistorial');
        console.log(' MongoDB Conectado');
    } catch (err) {
        console.error(' Error conexion Mongo:', err);
    }
};

module.exports = connectMongo;