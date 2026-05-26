const Support = require('../models/Support');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Send support message
 * @route   POST /api/support
 * @access  Public
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const sendSupportMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Por favor completa todos los campos');
  }

  // Implementation logic for sending support message
  // For now, we'll just return a success message
  res.json({ message: 'Mensaje de soporte enviado con éxito' });
});

module.exports = { sendSupportMessage };
