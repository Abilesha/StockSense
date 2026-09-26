/**
 * ==============================================================================
 * StockSense Operation Data Access Model
 * ==============================================================================
 * Hey team! Data layer wrapper for inventory operations (Receipts, Transfers,
 * Deliveries) and line item management.
 * ==============================================================================
 */

const db = require('../config/db');

const findById = async (id) => {
  const text = `SELECT * FROM operations WHERE id = $1`;
  const result = await db.query(text, [id]);
  return result.rows[0] || null;
};

module.exports = {
  findById,
};
