const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.category,
        p.uom,
        p.reorder_point,
        COALESCE(SUM(sl.quantity), 0)::numeric AS on_hand,
        p.created_at
      FROM products p
      LEFT JOIN stock_levels sl ON p.id = sl.product_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.category ILIKE $${params.length})`;
    }

    query += `
      GROUP BY p.id
      ORDER BY p.name ASC
    `;

    const result = await db.query(query, params);

    // Calculate reserved quantity per product across all pending Ready/Waiting delivery orders
    const reservedRes = await db.query(`
      SELECT ol.product_id, COALESCE(SUM(ol.quantity), 0)::numeric AS reserved
      FROM operation_lines ol
      JOIN operations o ON ol.operation_id = o.id
      WHERE o.type = 'delivery' AND o.status IN ('Ready', 'Waiting')
      GROUP BY ol.product_id
    `);

    const reservedMap = {};
    reservedRes.rows.forEach(r => {
      reservedMap[r.product_id] = parseFloat(r.reserved);
    });

    const products = result.rows.map(p => {
      const onHand = parseFloat(p.on_hand);
      const reserved = reservedMap[p.id] || 0;
      const free = Math.max(0, onHand - reserved);
      const isLow = onHand <= parseFloat(p.reorder_point);
      return {
        ...p,
        on_hand: onHand,
        reserved,
        free_to_use: free,
        is_low_stock: isLow,
      };
    });

    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prodRes = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (prodRes.rows.length === 0) {
      return next(new AppError('Product not found.', 404, 'NOT_FOUND'));
    }
    const product = prodRes.rows[0];

    // Get stock by location
    const stockRes = await db.query(
      `SELECT l.id AS location_id, l.name AS location_name, l.code AS location_code,
              w.name AS warehouse_name, COALESCE(sl.quantity, 0)::numeric AS quantity
       FROM locations l
       JOIN warehouses w ON l.warehouse_id = w.id
       LEFT JOIN stock_levels sl ON sl.location_id = l.id AND sl.product_id = $1
       ORDER BY w.name, l.code`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        stock_by_location: stockRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, uom, reorder_point, initial_stock } = req.body;
    if (!name || !sku || !category) {
      return next(new AppError('Name, SKU/Code, and Category are required.', 400, 'MISSING_FIELDS'));
    }

    const result = await db.withTransaction(async (client) => {
      // 1. Insert product
      const insertRes = await client.query(
        `INSERT INTO products (name, sku, category, uom, reorder_point)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name.trim(), sku.trim().toUpperCase(), category.trim(), uom ? uom.trim() : 'unit', reorder_point || 0]
      );
      const product = insertRes.rows[0];

      // 2. Initial stock (optional per location)
      if (initial_stock && Array.isArray(initial_stock)) {
        for (const item of initial_stock) {
          const qty = parseFloat(item.quantity) || 0;
          if (qty > 0 && item.location_id) {
            await client.query(
              `INSERT INTO stock_levels (product_id, location_id, quantity)
               VALUES ($1, $2, $3)
               ON CONFLICT (product_id, location_id)
               DO UPDATE SET quantity = stock_levels.quantity + $3`,
              [product.id, item.location_id, qty]
            );

            // Log initial stock move
            const locRes = await client.query('SELECT code FROM locations WHERE id = $1', [item.location_id]);
            const locCode = locRes.rows[0] ? locRes.rows[0].code : 'WH/Stock';

            await client.query(
              `INSERT INTO stock_moves (reference, date, operation_type, from_location, to_location, product_id, product_name, quantity, status)
               VALUES ('INITIAL', CURRENT_DATE, 'Initial Inventory', 'Inventory Adjustment', $1, $2, $3, $4, 'Done')`,
              [locCode, product.id, `${product.name} (${product.uom})`, qty]
            );
          }
        }
      }

      return product;
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, category, uom, reorder_point, stock_by_location } = req.body;

    if (!name || !sku || !category) {
      return next(new AppError('Name, SKU/Code, and Category are required.', 400, 'MISSING_FIELDS'));
    }

    const updatedProduct = await db.withTransaction(async (client) => {
      const updateRes = await client.query(
        `UPDATE products
         SET name = $1, sku = $2, category = $3, uom = $4, reorder_point = $5
         WHERE id = $6
         RETURNING *`,
        [name.trim(), sku.trim().toUpperCase(), category.trim(), uom ? uom.trim() : 'unit', reorder_point || 0, id]
      );

      if (updateRes.rows.length === 0) {
        throw new AppError('Product not found.', 404, 'NOT_FOUND');
      }

      // If stock update provided
      if (stock_by_location && Array.isArray(stock_by_location)) {
        for (const locItem of stock_by_location) {
          const qty = parseFloat(locItem.quantity) || 0;
          await client.query(
            `INSERT INTO stock_levels (product_id, location_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (product_id, location_id)
             DO UPDATE SET quantity = $3`,
            [id, locItem.location_id, qty]
          );
        }
      }

      return updateRes.rows[0];
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product is in any active operations
    const opCheck = await db.query(
      `SELECT 1 FROM operation_lines WHERE product_id = $1 LIMIT 1`,
      [id]
    );

    if (opCheck.rows.length > 0) {
      return next(
        new AppError(
          'Cannot delete product because it is referenced in past or pending operations.',
          400,
          'PRODUCT_IN_USE'
        )
      );
    }

    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
