const express = require('express');
const router = express.Router();
const {
  addComentario,
  getComentarios,
  updateComentario,
  deleteComentario,
} = require('../controllers/comentarioController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/comentarios
 * @route   GET /api/comentarios
 * @desc    Add a comment or get comments for a specific entity
 * @access  Private/Public
 */
router.route('/')
  .post(protect, addComentario)
  .get(getComentarios);

/**
 * @route   PUT /api/comentarios/:id
 * @route   DELETE /api/comentarios/:id
 * @desc    Update or delete a comment
 * @access  Private
 */
router.route('/:id')
  .put(protect, updateComentario)
  .delete(protect, deleteComentario);

module.exports = router;
