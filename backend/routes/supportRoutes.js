const express = require('express');
const router = express.Router();
const { sendSupportMessage } = require('../controllers/supportController');

/**
 * @route   POST /api/support
 * @desc    Send a support message
 * @access  Public
 */
router.route('/').post(sendSupportMessage);

module.exports = router;
