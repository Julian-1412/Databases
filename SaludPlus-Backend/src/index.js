const express = require('express');
const db = require('./bd'); // Tu archivo MySQL
const mongoose = require('mongoose');
const PatientHistory = require('./models/History');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/saludPlus')
    then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error(' Error Mongo:', err));

const upload = multer({ dest: 'uploads/' });

app.post('/api/migrate', upload.single('archivo'), (req, res) => {
    const resultados = [];
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => resultados.push(data))
        .on('end', async () => {
            try {
                for (const fila of resultados) {
                    // 1. Insertar Maestros en MySQL (INSERT IGNORE evita duplicados)
                    await db.query('INSERT IGNORE INTO doctors (name, email, speciality) VALUES (?, ?, ?)', 
                        [fila.doctor_name, fila.doctor_email, fila.specialty]);
                    
                    await db.query('INSERT IGNORE INTO patients (name, email, phone, address) VALUES (?, ?, ?, ?)', 
                        [fila.patient_name, fila.patient_email, fila.patient_phone, fila.patient_address]);

                    await db.query('INSERT IGNORE INTO insurances (name, coverage_percentage) VALUES (?, ?)', 
                        [fila.insurance_provider, fila.coverage_percentage]);

                    await db.query('INSERT IGNORE INTO treatments (treatment_code, description, cost) VALUES (?, ?, ?)', 
                        [fila.treatment_code, fila.treatment_description, fila.treatment_cost]);

                    // 2. Obtener IDs para conectar la cita
                    const [d] = await db.query('SELECT id_doctor FROM doctors WHERE email = ?', [fila.doctor_email]);
                    const [p] = await db.query('SELECT id FROM patients WHERE email = ?', [fila.patient_email]);
                    const [ins] = await db.query('SELECT id_insurance FROM insurances WHERE name = ?', [fila.insurance_provider]);
                    const [t] = await db.query('SELECT id_treatment FROM treatments WHERE treatment_code = ?', [fila.treatment_code]);

                    // VALIDACIÓN SEGURA: Solo insertamos la cita si encontramos los IDs
                    if (d.length > 0 && p.length > 0 && t.length > 0) {
                        await db.query('INSERT IGNORE INTO appointments (appointment_id, appointment_date, id_patient, id_doctor, id_insurance, id_treatment, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                            [
                                fila.appointment_id, 
                                fila.appointment_date, 
                                p[0].id, 
                                d[0].id_doctor, 
                                ins[0]?.id_insurance || null, // Si no hay seguro, pone NULL
                                t[0].id_treatment, 
                                fila.amount_paid
                            ]);
                    }

                    // 3. MongoDB: Actualizar historial del paciente
                    await PatientHistory.findOneAndUpdate(
                        { patientEmail: fila.patient_email },
                        { 
                            $set: { patientName: fila.patient_name },
                            $addToSet: { 
                                appointments: {
                                    appointmentId: fila.appointment_id,
                                    date: fila.appointment_date,
                                    doctorName: fila.doctor_name,
                                    specialty: fila.specialty,
                                    treatmentDescription: fila.treatment_description,
                                    amountPaid: parseFloat(fila.amount_paid)
                                }
                            }
                        },
                        { upsert: true }
                    );
                }

                // Borramos el archivo temporal para no llenar el servidor de basura
                fs.unlinkSync(req.file.path); 
                res.json({ mensaje: 'Migración SaludPlus completada con éxito' });

            } catch (error) {
                console.error("Error en migración:", error);
                res.status(500).json({ error: 'Hubo un error en el proceso', detalle: error.message });
            } 
        });
});