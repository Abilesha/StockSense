/**
 * ==============================================================================
 * StockSense Stock Movement Ledger Data Access Model
 * ==============================================================================
 * Hey team! Database access queries for the double-entry movement ledger.
 * Tracks incoming and outgoing movements by location ID and timestamp.
 * ==============================================================================
 */

const db = require('../config/db');

const getRecentMovements = async (limit = 50) => {
  const text = `
    SELECT sm.*, p.name as product_name, p.sku
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    ORDER BY sm.created_at DESC
    LIMIT $1
  `;
  const result = await db.query(text, [limit]);
  return result.rows;
};

module.exports = {
  getRecentMovements,
};
