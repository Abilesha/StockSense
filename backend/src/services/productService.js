/**
 * ==============================================================================
 * StockSense Product Service
 * ==============================================================================
 * Hey team! Service logic for product catalogue management, SKU generation,
 * and low stock alert evaluations.
 * ==============================================================================
 */

const productModel = require('../models/productModel');

const checkLowStockAlerts = async () => {
  const products = await productModel.findAll();
  // Filter products below minimum reorder threshold
  return products.filter((p) => p.current_stock <= p.min_stock);
};

module.exports = {
  checkLowStockAlerts,
};
