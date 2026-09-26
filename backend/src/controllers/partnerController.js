const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

exports.getPartners = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM partners';
    const params = [];

    if (type) {
      params.push(type);
      query += ' WHERE type = $1';
    }

    query += ' ORDER BY name ASC';
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.createPartner = async (req, res, next) => {
  try {
    const { name, type, email, phone, address } = req.body;
    if (!name || !type || !['vendor', 'customer'].includes(type)) {
      return next(new AppError('Partner name and valid type (vendor/customer) are required.', 400, 'MISSING_FIELDS'));
    }

    const result = await db.query(
      `INSERT INTO partners (name, type, email, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), type, email ? email.trim() : null, phone ? phone.trim() : null, address ? address.trim() : null]
    );

    res.status(201).json({ success: true, message: 'Partner created.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
