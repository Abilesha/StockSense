/**
 * ==============================================================================
 * StockSense Request Logging Middleware
 * ==============================================================================
 * Hey team! This middleware logs incoming HTTP requests, response times, and
 * status codes to console or external log files in development/production.
 * ==============================================================================
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  requestLogger,
};
