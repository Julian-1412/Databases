// Multer: middleware para recibir archivos via multipart/form-data
const multer  = require('multer');
// csv-parse: convierte el texto CSV en un array de objetos JavaScript
const { parse } = require('csv-parse');
// Pool de conexiones a MySQL
const pool    = require('../db');

// ── Configuración de Multer ──────────────────────────────────────────────────
// memoryStorage guarda el archivo en RAM como Buffer, sin escribir nada en disco
// Ideal para procesar el CSV al vuelo antes de insertarlo en MySQL
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  // fileFilter se ejecuta antes de recibir el archivo
  // cb(null, true)  → aceptar el archivo
  // cb(error, false) → rechazarlo con un mensaje
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .csv'), false);
    }
  },
  // Tamaño máximo permitido: 5MB
  // Evita que alguien suba un archivo enorme y agote la RAM del servidor
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ── Controlador principal de importación ────────────────────────────────────
// Método HTTP: POST /api/import/cars
const importCars = async (req, res) => {

  // Si multer no encontró ningún archivo en el request, detenemos aquí
  if (!req.file) {
    return res.status(400).json({ message: 'No se envió ningún archivo CSV' });
  }

  try {
    // req.file.buffer contiene el CSV en bytes (Buffer de Node.js)
    // .toString('utf-8') lo convierte a texto plano legible
    const csvText = req.file.buffer.toString('utf-8');

    // parse() convierte el texto CSV en un array de objetos JS
    // Opciones:
    //   columns: true          → primera fila se usa como nombres de campo
    //   skip_empty_lines: true → ignora líneas en blanco entre filas
    //   trim: true             → elimina espacios alrededor de cada valor
    const rows = await new Promise((resolve, reject) => {
      parse(csvText, { columns: true, skip_empty_lines: true, trim: true },
        (err, records) => err ? reject(err) : resolve(records)
      );
    });

    // Si el CSV no tiene datos (solo encabezado o está vacío), detenemos
    if (rows.length === 0) {
      return res.status(400).json({ message: 'El archivo CSV está vacío' });
    }

    // ── Validación de columnas obligatorias ───────────────────────────────
    // Verificamos que el CSV tenga las columnas mínimas necesarias
    // Si falta alguna, informamos cuáles son antes de procesar cualquier fila
    const required = ['plate', 'brand', 'seller_phone', 'buyer_phone', 'entry_date', 'purchase_price'];
    const missing  = required.filter(col => !Object.keys(rows[0]).includes(col));
    if (missing.length > 0) {
      return res.status(400).json({ message: `Columnas faltantes: ${missing.join(', ')}` });
    }

    // Contadores para el reporte final que se envía al cliente
    let insertados = 0;  // filas procesadas exitosamente
    let errores    = []; // filas que fallaron con su motivo

    // ── Procesamiento fila por fila ───────────────────────────────────────
    // Usamos una transacción por fila (no una global para todo el CSV)
    // Ventaja: si la fila 40 falla, las filas 1-39 ya quedaron guardadas
    // Si usáramos una sola transacción, un error en la fila 40 
    // revertiría las 39 filas anteriores
    for (const row of rows) {

      // Pedimos una conexión dedicada del pool para esta fila
      const conn = await pool.getConnection();

      try {
        // Iniciamos la transacción para esta fila
        // Si algo falla, rollback revierte solo los cambios de esta fila
        await conn.beginTransaction();

        // ── 1. Insertar vendedor en person ────────────────────────────────
        // INSERT IGNORE: si el teléfono ya existe (viola UNIQUE),
        // no lanza error — simplemente no inserta nada
        // Así evitamos duplicar personas que aparecen en varias filas del CSV
        await conn.execute(
          'INSERT IGNORE INTO person (name, phone) VALUES (?, ?)',
          [row.seller_name, row.seller_phone]
        );
        // Recuperamos el id_person del vendedor buscando por su teléfono
        // (phone es UNIQUE, así que siempre retorna exactamente una fila)
        const [[seller]] = await conn.execute(
          'SELECT id_person FROM person WHERE phone = ?',
          [row.seller_phone]
        );

        // ── 2. Insertar comprador en person ───────────────────────────────
        // Misma lógica que el vendedor — INSERT IGNORE + SELECT por teléfono
        await conn.execute(
          'INSERT IGNORE INTO person (name, phone) VALUES (?, ?)',
          [row.buyer_name, row.buyer_phone]
        );
        const [[buyer]] = await conn.execute(
          'SELECT id_person FROM person WHERE phone = ?',
          [row.buyer_phone]
        );

        // ── 3. Insertar auto en car ───────────────────────────────────────
        // ON DUPLICATE KEY UPDATE: si la placa ya existe (viola UNIQUE),
        // en lugar de lanzar error, actualiza los campos con los nuevos valores
        // Útil para re-importar el mismo CSV con datos corregidos
        await conn.execute(`
          INSERT INTO car (plate, brand, color, kilometers, car_state, operational_status)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            brand              = VALUES(brand),
            color              = VALUES(color),
            kilometers         = VALUES(kilometers),
            car_state          = VALUES(car_state),
            operational_status = VALUES(operational_status)
        `, [row.plate, row.brand, row.color,
            row.kilometers || 0, row.car_state, row.operational_status]);

        // Recuperamos el id_car por placa para usarlo como FK en purchase y sale
        const [[car]] = await conn.execute(
          'SELECT id_car FROM car WHERE plate = ?',
          [row.plate]
        );

        // ── 4. Insertar compra en purchase ────────────────────────────────
        // IMPORTANTE: purchase debe insertarse ANTES que sale
        // El trigger trg_validate_sale verifica que exista un registro
        // en purchase antes de permitir el INSERT en sale
        // INSERT IGNORE evita duplicar la compra si el CSV se importa dos veces
        await conn.execute(
          `INSERT IGNORE INTO purchase (car_id, seller_id, entry_date, purchase_price)
           VALUES (?, ?, ?, ?)`,
          [car.id_car, seller.id_person, row.entry_date, row.purchase_price]
        );

        // ── 5. Insertar venta en sale (solo si tiene datos de venta) ──────
        // No todos los autos del CSV pueden estar vendidos aún
        // Si sale_date o sale_price están vacíos, omitimos el INSERT
        // INSERT IGNORE evita duplicar la venta en re-importaciones
        if (row.sale_date && row.sale_price) {
          await conn.execute(
            `INSERT IGNORE INTO sale (car_id, buyer_id, sale_date, sale_price)
             VALUES (?, ?, ?, ?)`,
            [car.id_car, buyer.id_person, row.sale_date, row.sale_price]
          );
        }

        // ── earning se omite intencionalmente ─────────────────────────────
        // earning = sale_price - purchase_price es un dato calculado
        // Almacenarlo violaría la 3FN — se obtiene con una query cuando se necesite

        // Todo salió bien para esta fila: confirmamos los cambios en la BD
        await conn.commit();
        insertados++;

      } catch (rowError) {
        // Algo falló en esta fila: revertimos SOLO los cambios de esta fila
        // Las filas anteriores ya se hicieron commit y no se ven afectadas
        await conn.rollback();
        // Guardamos el error con la placa para informar al cliente al final
        errores.push({ placa: row.plate, error: rowError.message });

      } finally {
        // finally siempre se ejecuta, haya error o no
        // Liberamos la conexión de vuelta al pool para que otras filas la usen
        conn.release();
      }
    }

    // ── Respuesta final con reporte completo ──────────────────────────────
    res.status(200).json({
      message:        'Importación completada',
      totalEnArchivo: rows.length,    // cuántas filas tenía el CSV
      filasExitosas:  insertados,     // cuántas se insertaron sin problema
      filasConError:  errores.length, // cuántas fallaron
      errores:        errores         // detalle de cada fila que falló y por qué
    });

  } catch (error) {
    // Este catch atrapa errores generales (parseo del CSV, conexión a BD, etc.)
    res.status(500).json({ message: 'Error al importar', error: error.message });
  }
};

// Exportamos el middleware de multer y el controlador juntos
// upload.single('file') le dice a multer que espera UN solo archivo
// con el nombre de campo 'file' en el form-data
module.exports = { upload: upload.single('file'), importCars };
