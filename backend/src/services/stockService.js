/**
 * ==============================================================================
 * StockSense Core Double-Entry Stock Service
 * ==============================================================================
 * Hey team! This service encapsulates core business rules for stock movements:
 *   - Verifying available inventory prior to delivery/transfer.
 *   - Computing location-specific stock balances dynamically from double-entry logs.
 *   - Executing multi-item stock transfers inside database transaction blocks.
 * ==============================================================================
 */

const db = require('../config/db');

/**
 * Calculate dynamic stock balance for a product at a given warehouse location
 */
const getProductLocationBalance = async (productId, locationId) => {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN dest_location_id = $2 THEN quantity ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN source_location_id = $2 THEN quantity ELSE 0 END), 0) AS current_balance
    FROM stock_movements
    WHERE product_id = $1 AND (source_location_id = $2 OR dest_location_id = $2)
  `;
  const result = await db.query(query, [productId, locationId]);
  return parseInt(result.rows[0].current_balance, 10);
};

module.exports = {
  getProductLocationBalance,
};
