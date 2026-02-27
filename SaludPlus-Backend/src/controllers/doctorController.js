const db = require('../config/db'); // Tu archivo de conexión MySQL

const doctorController = {
    // GET /api/doctors y GET /api/doctors?specialty=...
    getAll: async (req, res) => {
        try {
            const { specialty } = req.query;
            let sql = 'SELECT * FROM doctors';
            const params = [];

            if (specialty) {
                sql += ' WHERE speciality = ?';
                params.push(specialty);
            }

            const [rows] = await db.query(sql, params);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener médicos' });
        }
    },

    // GET /api/doctors/:id
    getById: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM doctors WHERE id_doctor = ?', [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ mjs: 'No encontrado' });
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Error' });
        }
    }
};

module.exports = doctorController;