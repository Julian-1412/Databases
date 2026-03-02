const express = require("express");
const app = express();
const connectMongo = require("./config/mongo");
const pool = require("./config/mysql");

// 1. MIDDLEWARES (Configuración de entrada)
// Deben ir antes de las rutas para que el PUT y el POST puedan leer los datos
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 2. CONEXIÓN A BASES DE DATOS
connectMongo();

// 3. RUTAS (Importación)
const migrationRoutes = require("./routes/migrationRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const patientRoutes = require("./routes/patientRoutes");

// 4. MONTAJE DE RUTAS (Prefijos de la API)
app.use("/api/migration", migrationRoutes); // Punto 3: Migración
app.use("/api/doctors", doctorRoutes);     // Punto 4: Endpoints Médicos
app.use("/api/reports", reportRoutes);     // Punto 4: Reportes Revenue
app.use("/api/patients", patientRoutes);   // Punto 4: Historial MongoDB

// Ruta base para probar
app.get("/", (req, res) => {
  res.send("SaludPlus API running");
});

// 5. TEST DE CONEXIÓN MYSQL
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL conectado exitosamente");
    connection.release();
  } catch (error) {
    console.error("Error MySQL:", error.message);
  }
}
testConnection();

// 6. LANZAMIENTO
const PORT = 3000;
app.listen(PORT, () => {
  console.log(` Servidor en http://localhost:${PORT}`);
});