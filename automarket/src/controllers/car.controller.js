// Importamos el pool de conexiones que creamos en db.js
const pool = require('../db');

// ─────────────────────────────────────────────
// CREATE — Registrar un nuevo vehículo
// Método HTTP: POST /api/cars
// ─────────────────────────────────────────────
const createCar = async (req, res) => {
  // req.body contiene los datos enviados en el JSON del request
  const { plate, brand, color, kilometers, car_state, operational_status } = req.body;

  // Validación básica: la placa es obligatoria
  if (!plate) {
    return res.status(400).json({ message: 'La placa es obligatoria' });
  }

  try {
    // pool.execute() envía la consulta SQL a MySQL.
    // Los signos ? son marcadores de posición (prepared statements)
    // que previenen inyección SQL — NUNCA concatenes valores directo.
    const sql = `
      INSERT INTO car (plate, brand, color, kilometers, car_state, operational_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      plate, brand, color, kilometers, car_state, operational_status
    ]);

    // result.insertId contiene el id_car asignado automáticamente por MySQL
    res.status(201).json({
      message: 'Vehículo creado exitosamente',
      id_car: result.insertId,
    });
  } catch (error) {
    // Código ER_DUP_ENTRY es el error de MySQL cuando viola un UNIQUE
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un vehículo con esa placa' });
    }
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// ─────────────────────────────────────────────
// READ ALL — Listar todos los vehículos
// Método HTTP: GET /api/cars
// ─────────────────────────────────────────────
const getAllCars = async (req, res) => {
  try {
    // SELECT * trae todas las filas de la tabla car
    const [rows] = await pool.execute('SELECT * FROM car');

    // rows es un array de objetos; si está vacío, devolvemos array vacío
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// ─────────────────────────────────────────────
// READ ONE — Buscar vehículo por placa
// Método HTTP: GET /api/cars/:plate
// ─────────────────────────────────────────────
const getCarByPlate = async (req, res) => {
  // req.params contiene los segmentos dinámicos de la URL
  // Ej: GET /api/cars/ABC123 → req.params.plate = 'ABC123'
  const { plate } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM car WHERE plate = ?',
      [plate]
    );

    // Si no encontró ninguna fila, rows estará vacío
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // rows[0] es el primer (y único) resultado, ya que plate es UNIQUE
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE — Actualizar información técnica
// Método HTTP: PUT /api/cars/:id
// ─────────────────────────────────────────────
const updateCar = async (req, res) => {
  // El id viene por la URL: PUT /api/cars/5
  const { id } = req.params;

  // Los campos a actualizar vienen en el body
  const { brand, color, kilometers, car_state, operational_status } = req.body;

  try {
    const sql = `
      UPDATE car
      SET brand = ?, color = ?, kilometers = ?,
          car_state = ?, operational_status = ?
      WHERE id_car = ?
    `;
    const [result] = await pool.execute(sql, [
      brand, color, kilometers, car_state, operational_status, id
    ]);

    // affectedRows indica cuántas filas fueron modificadas.
    // Si es 0, el id no existe en la tabla.
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.status(200).json({ message: 'Vehículo actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE — Eliminar vehículo con validación
// Método HTTP: DELETE /api/cars/:id
// ─────────────────────────────────────────────
const deleteCar = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM car WHERE id_car = ?', [id]);
    res.status(200).json({ message: 'Vehículo eliminado exitosamente' });
  } catch (error) {
    // ER_ROW_IS_REFERENCED_2 ocurre cuando MySQL bloquea el DELETE
    // porque existe un registro en purchase o sale que referencia ese id_car.
    // Esto lo maneja automáticamente el ON DELETE RESTRICT que definimos en la BD.
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'No se puede eliminar: el vehículo tiene transacciones asociadas',
      });
    }
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// Exportamos todas las funciones para usarlas en las rutas
module.exports = { createCar, getAllCars, getCarByPlate, updateCar, deleteCar };
