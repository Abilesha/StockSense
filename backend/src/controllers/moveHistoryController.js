const db = require('../config/db');

exports.getMoveHistory = async (req, res, next) => {
  try {
    const { search, type, dateFrom, dateTo } = req.query;

    let query = `
      SELECT 
        id,
        reference,
        date,
        operation_type,
        from_location,
        to_location,
        product_id,
        product_name,
        quantity,
        status,
        created_at
      FROM stock_moves
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      params.push(type);
      query += ` AND operation_type ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      query += ` AND (
        reference ILIKE $${params.length} 
        OR product_name ILIKE $${params.length} 
        OR from_location ILIKE $${params.length} 
        OR to_location ILIKE $${params.length}
      )`;
    }

    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND date >= $${params.length}`;
    }

    if (dateTo) {
      params.push(dateTo);
      query += ` AND date <= $${params.length}`;
    }

    query += ` ORDER BY date DESC, id DESC LIMIT 200`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
