/**
 * ==============================================================================
 * StockSense Request Validator Middleware
 * ==============================================================================
 * Hey team! This middleware acts as a gatekeeper for API payload validation.
 * Pass a validator schema (Joi, Zod, or custom rule function) to sanitize incoming
 * `req.body`, `req.query`, or `req.params`.
 * 
 * Usage example:
 *   router.post('/products', validate(productSchema), createProduct);
 * ==============================================================================
 */

const { AppError } = require('./errorHandler');

const validate = (schema) => {
  return (req, res, next) => {
    // Scaffold placeholder for schema validation logic
    if (schema && typeof schema.validate === 'function') {
      const { error } = schema.validate(req.body);
      if (error) {
        return next(new AppError(`Validation Error: ${error.message}`, 400, 'INVALID_INPUT'));
      }
    }
    next();
  };
};

module.exports = {
  validate,
};
