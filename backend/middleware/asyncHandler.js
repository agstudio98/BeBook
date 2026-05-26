/**
 * Middleware to handle asynchronous functions and pass any errors to the next middleware.
 * 
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {import('express').RequestHandler} An Express request handler that wraps the provided function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  if (typeof next !== 'function') {
    console.error('CRITICAL: next is not a function in asyncHandler!');
    console.log('Args:', { req: !!req, res: !!res, nextType: typeof next });
  }
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
