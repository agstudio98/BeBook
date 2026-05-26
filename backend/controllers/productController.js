const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Fetch all products with advanced filters and pagination
 * @route   GET /api/products
 * @access  Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  const { keyword, type, category } = req.query;

  const searchCriteria = {};

  if (keyword) {
    searchCriteria.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { author: { $regex: keyword, $options: 'i' } }
    ];
  }

  if (type && type !== 'Todos') {
    searchCriteria.type = type;
  }

  if (category && category !== 'Todas') {
    searchCriteria.category = category;
  }

  const count = await Product.countDocuments(searchCriteria);
  const products = await Product.find(searchCriteria)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ 
    products, 
    page, 
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

/**
 * @desc    Fetch all unique categories
 * @route   GET /api/products/categories
 * @access  Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

module.exports = { 
  getProducts, 
  getProductById, 
  getCategories 
};
