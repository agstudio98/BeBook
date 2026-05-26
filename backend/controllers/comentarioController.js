const Comentario = require('../models/Comentario');
const Product = require('../models/Product');
const Sucursal = require('../models/Sucursal');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('./activityController');

/**
 * Helper function to update the average rating of a product or sucursal.
 * @param {string} [productId] - The ID of the product.
 * @param {string} [sucursalId] - The ID of the sucursal.
 * @returns {Promise<void>}
 */
const updateTargetRating = async (productId, sucursalId) => {
  const targetModel = productId ? Product : (sucursalId ? Sucursal : null);
  if (!targetModel) return;

  const query = productId ? { product: productId } : { sucursal: sucursalId };
  const targetId = productId || sucursalId;

  const comentarios = await Comentario.find(query);
  const numReviews = comentarios.length;
  const rating = numReviews > 0 
    ? comentarios.reduce((acc, item) => item.rating + acc, 0) / numReviews 
    : 0;

  await targetModel.findByIdAndUpdate(targetId, {
    rating: Number(rating.toFixed(1)),
    numReviews,
  });
};

/**
 * @desc    Add a comment
 * @route   POST /api/comentarios
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const addComentario = asyncHandler(async (req, res) => {
  const { text, rating, productId, sucursalId } = req.body;
  const userId = req.user._id;

  if (!text || !rating) {
    res.status(400);
    throw new Error('Por favor, añade un comentario y una valoración');
  }

  const comentario = new Comentario({
    user: userId,
    text,
    rating: Number(rating),
    product: productId || null,
    sucursal: sucursalId || null,
  });

  const createdComentario = await comentario.save();
  
  await logActivity(
    userId,
    'COMMENT',
    `Dejaste un comentario con una valoración de ${rating} estrellas`,
    createdComentario._id,
    null,
    { rating }
  );

  await updateTargetRating(productId, sucursalId);

  const populatedComentario = await Comentario.findById(createdComentario._id)
    .populate('user', 'name');

  res.status(201).json(populatedComentario);
});

/**
 * @desc    Get comments by Product or Sucursal
 * @route   GET /api/comentarios
 * @access  Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getComentarios = asyncHandler(async (req, res) => {
  const { productId, sucursalId } = req.query;
  
  if (!productId && !sucursalId) {
    res.status(400);
    throw new Error('Se requiere productId o sucursalId');
  }

  const query = {};
  if (productId) query.product = productId;
  if (sucursalId) query.sucursal = sucursalId;

  const comentarios = await Comentario.find(query)
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json(comentarios);
});

/**
 * @desc    Update a comment
 * @route   PUT /api/comentarios/:id
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const updateComentario = asyncHandler(async (req, res) => {
  const { text, rating } = req.body;
  const comentarioId = req.params.id;
  const userId = req.user._id;

  const comentario = await Comentario.findById(comentarioId);

  if (!comentario) {
    res.status(404);
    throw new Error('Comentario no encontrado');
  }

  if (comentario.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error('No tienes permiso para editar este comentario');
  }

  comentario.text = text || comentario.text;
  comentario.rating = rating ? Number(rating) : comentario.rating;

  const updatedComentario = await comentario.save();
  
  await updateTargetRating(comentario.product, comentario.sucursal);

  res.json(updatedComentario);
});

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comentarios/:id
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const deleteComentario = asyncHandler(async (req, res) => {
  const comentarioId = req.params.id;
  const { _id: userId, isAdmin } = req.user;

  const comentario = await Comentario.findById(comentarioId);

  if (!comentario) {
    res.status(404);
    throw new Error('Comentario no encontrado');
  }

  if (comentario.user.toString() !== userId.toString() && !isAdmin) {
    res.status(401);
    throw new Error('No tienes permiso para eliminar este comentario');
  }

  const { product: productId, sucursal: sucursalId } = comentario;

  await Comentario.deleteOne({ _id: comentarioId });
  
  await updateTargetRating(productId, sucursalId);

  res.json({ message: 'Comentario eliminado' });
});

module.exports = {
  addComentario,
  getComentarios,
  updateComentario,
  deleteComentario,
};
