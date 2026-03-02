const pool = require("../config/mysql");

exports.getRevenueReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const query = `
      SELECT 
        COALESCE(i.name, 'Sin Seguro') AS insurance, 
        SUM(a.amount_paid) AS total 
      FROM appointments a 
      LEFT JOIN insurances i ON a.insurance_id = i.id 
      WHERE a.appointment_date BETWEEN ? AND ? 
      GROUP BY i.name`;

    // Si no hay fechas, cubrimos un rango amplio
    const [rows] = await pool.execute(query, [
      startDate || '1900-01-01', 
      endDate || '2100-12-31'
    ]);

    const totalRevenue = rows.reduce((acc, row) => acc + Number(row.total), 0);

    res.json({
      totalRevenue,
      byInsurance: rows
    });
  } catch (error) {
    console.error("Error en reporte:", error);
    res.status(500).json({ error: error.message });
  }
};