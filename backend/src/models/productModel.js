/**
 * ==============================================================================
 * StockSense Product Data Access Model
 * ==============================================================================
 * Hey team! This file acts as the database query layer for product catalog management.
 * Models encapsulate parameterized SQL queries to keep controllers and services clean.
 * 
 * Target Duties:
 *   - CRUD queries on `products` table.
 *   - Fetching live stock quantities grouped by warehouse location.
 *   - Threshold alerts checking (`min_stock`).
 * ==============================================================================
 */

const db = require('../config/db');

/**
 * Fetch all active product records from database
 */
const findAll = async () => {
  const text = `
    SELECT id, name, sku, category, unit, min_stock, cost_price, created_at
    FROM products
    ORDER BY name ASC
  `;
  const result = await db.query(text);
  return result.rows;
};

/**
 * Find product entry by primary key ID
 */
const findById = async (id) => {
  const text = `SELECT * FROM products WHERE id = $1`;
  const result = await db.query(text, [id]);
  return result.rows[0] || null;
};

/**
 * Find product entry by SKU identifier
 */
const findBySKU = async (sku) => {
  const text = `SELECT * FROM products WHERE sku = $1`;
  const result = await db.query(text, [sku]);
  return result.rows[0] || null;
};

module.exports = {
  findAll,
  findById,
  findBySKU,
};
