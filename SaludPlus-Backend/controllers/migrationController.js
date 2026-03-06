const fs = require("fs");
const csv = require("csv-parser");
const pool = require("../config/mysql");
const PatientHistory = require("../models/patientHistory.model");

exports.migrateData = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió archivo" });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      // ESTA PARTE ES CLAVE: Limpia espacios y pasa todo a minúsculas
      const cleanRow = {};
      Object.keys(data).forEach(key => {
        cleanRow[key.trim().toLowerCase()] = data[key];
      });
      results.push(cleanRow);
    })
    .on("end", async () => {
      try {
        if (results.length === 0) throw new Error("CSV vacío");
        const headers = Object.keys(results[0]);

        for (const row of results) {
          // CASO: SEGUROS (Detecta coverage_percentage)
          if (headers.includes('coverage_percentage')) {
            await pool.execute(
              "INSERT IGNORE INTO insurances (id, name, coverage_percentage) VALUES (?, ?, ?)",
              [row.id, row.name, row.coverage_percentage]
            );
          } 
          // CASO: MÉDICOS (Detecta specialty - antes era Specialty con mayúscula)
          else if (headers.includes('specialty')) {
            await pool.execute(
              "INSERT IGNORE INTO doctors (id, name, email, specialty) VALUES (?, ?, ?, ?)",
              [row.id, row.name, row.email, row.specialty]
            );
          }
          // CASO: PACIENTES
          else if (headers.includes('address')) {
            await pool.execute(
              "INSERT IGNORE INTO patients (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)",
              [row.id, row.name, row.email, row.phone, row.address]
            );
          }
          // CASO: CITAS (Sincronización Híbrida)
          else if (headers.includes('appointment_id')) {
            await pool.execute(
              `INSERT IGNORE INTO appointments (id, appointment_id, appointment_date, patient_id, doctor_id, insurance_id, treatment_code, treatment_description, treatment_cost, amount_paid) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [row.id, row.appointment_id, row.appointment_date, row.patient_id, row.doctor_id, row.insurance_id, row.treatment_code, row.treatment_description, row.treatment_cost, row.amount_paid]
            );

            // Buscar datos para Mongo
            const [p] = await pool.execute("SELECT name, email FROM patients WHERE id = ?", [row.patient_id]);
            const [d] = await pool.execute("SELECT name, specialty FROM doctors WHERE id = ?", [row.doctor_id]);

            if (p.length > 0 && d.length > 0) {
              await PatientHistory.findOneAndUpdate(
                { patientEmail: p[0].email },
                {
                  $set: { patientName: p[0].name },
                  $addToSet: {
                    appointments: {
                      appointmentId: row.appointment_id,
                      date: row.appointment_date,
                      doctorName: d[0].name,
                      specialty: d[0].specialty,
                      treatmentDescription: row.treatment_description,
                      amountPaid: Number(row.amount_paid)
                    }
                  }
                },
                { upsert: true }
              );
            }
          }
        }
        res.json({ message: "Migración exitosa", filas: results.length });
      } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: err.message });
      } finally {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      }
    });
};