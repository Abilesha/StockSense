const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

exports.getWarehouses = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT w.*, COUNT(l.id)::int AS total_locations
      FROM warehouses w
      LEFT JOIN locations l ON w.id = l.warehouse_id
      GROUP BY w.id
      ORDER BY w.name ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.createWarehouse = async (req, res, next) => {
  try {
    const { name, code, address } = req.body;
    if (!name || !code) {
      return next(new AppError('Warehouse name and short code are required.', 400, 'MISSING_FIELDS'));
    }

    const result = await db.query(
      `INSERT INTO warehouses (name, code, address)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), code.trim().toUpperCase(), address ? address.trim() : '']
    );

    res.status(201).json({ success: true, message: 'Warehouse created.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.updateWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, address } = req.body;

    const result = await db.query(
      `UPDATE warehouses
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           address = COALESCE($3, address)
       WHERE id = $4
       RETURNING *`,
      [name ? name.trim() : null, code ? code.trim().toUpperCase() : null, address ? address.trim() : null, id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Warehouse not found.', 404, 'NOT_FOUND'));
    }

    res.json({ success: true, message: 'Warehouse updated.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.getLocations = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    let query = `
      SELECT l.*, w.name AS warehouse_name, w.code AS warehouse_code
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
    `;
    const params = [];

    if (warehouseId) {
      params.push(parseInt(warehouseId, 10));
      query += ` WHERE l.warehouse_id = $1`;
    }

    query += ` ORDER BY w.name, l.code ASC`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.createLocation = async (req, res, next) => {
  try {
    const { warehouse_id, name, code } = req.body;
    if (!warehouse_id || !name || !code) {
      return next(new AppError('Warehouse ID, location name, and code are required.', 400, 'MISSING_FIELDS'));
    }

    const result = await db.query(
      `INSERT INTO locations (warehouse_id, name, code)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [warehouse_id, name.trim(), code.trim()]
    );

    res.status(201).json({ success: true, message: 'Location created.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { warehouse_id, name, code } = req.body;

    const result = await db.query(
      `UPDATE locations
       SET warehouse_id = COALESCE($1, warehouse_id),
           name = COALESCE($2, name),
           code = COALESCE($3, code)
       WHERE id = $4
       RETURNING *`,
      [warehouse_id, name ? name.trim() : null, code ? code.trim() : null, id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Location not found.', 404, 'NOT_FOUND'));
    }

    res.json({ success: true, message: 'Location updated.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
