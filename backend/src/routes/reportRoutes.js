/**
 * ==============================================================================
 * StockSense Report Routes Router
 * ==============================================================================
 * Hey team! Express router definitions for inventory reporting and analytics.
 * 
 * Endpoints:
 *   - GET /api/reports/summary
 *   - GET /api/reports/export/csv
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

router.get('/summary', verifyToken, reportController.getInventorySummary);
router.get('/export/csv', verifyToken, reportController.exportStockLedgerCSV);

module.exports = router;
