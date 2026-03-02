const pool = require("../config/mysql");
const PatientHistory = require("../models/patientHistory.model");

// GET /api/doctors (con y sin filtro de especialidad)
exports.getDoctors = async (req, res) => {
  const { specialty } = req.query; // Captura ?specialty=Cardiology
  try {
    let sql = "SELECT * FROM doctors";
    const params = [];

    if (specialty) {
      sql += " WHERE specialty = ?";
      params.push(specialty);
    }

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM doctors WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Médico no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/doctors/:id (EL QUE YA TENÍAS)
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { name, specialty } = req.body;
  try {
    // 1. Obtener nombre viejo para buscar en Mongo
    const [[oldDoc]] = await pool.execute("SELECT name FROM doctors WHERE id = ?", [id]);
    if (!oldDoc) return res.status(404).json({ message: "Médico no encontrado" });
    
    // 2. Actualizar SQL
    await pool.execute("UPDATE doctors SET name = ?, specialty = ? WHERE id = ?", [name, specialty, id]);

    // 3. Sincronizar con MongoDB (Actualiza el nombre del médico en todas las citas)
    await PatientHistory.updateMany(
      { "appointments.doctorName": oldDoc.name },
      { $set: { "appointments.$[elem].doctorName": name } },
      { arrayFilters: [{ "elem.doctorName": oldDoc.name }] }
    );

    res.json({ message: "Médico actualizado en MySQL y MongoDB" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};