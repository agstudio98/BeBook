const Sucursal = require('../models/Sucursal');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all sucursales with filters and proximity
 * @route   GET /api/sucursales
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSucursales = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  const { lat, lng, keyword, province } = req.query;

  const query = buildSucursalQuery(keyword, province);

  let sucursales;
  let count;

  if (lat && lng) {
    const { results, total } = await getSucursalesByProximity(lat, lng, query, pageSize, page);
    sucursales = results;
    count = total;
  } else {
    count = await Sucursal.countDocuments(query);
    sucursales = await Sucursal.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ name: 1 });
  }

  res.json({
    sucursales,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/**
 * @desc    Get all unique provinces
 * @route   GET /api/sucursales/provinces
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getProvinces = asyncHandler(async (req, res) => {
  const provinces = await Sucursal.distinct('province');
  res.json(provinces);
});

/**
 * @desc    Get sucursal by ID
 * @route   GET /api/sucursales/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getSucursalById = asyncHandler(async (req, res) => {
  const sucursal = await Sucursal.findById(req.params.id);
  
  if (!sucursal) {
    res.status(404);
    throw new Error('Sucursal no encontrada');
  }

  res.json(sucursal);
});

/**
 * Helper to build sucursal search query
 * @param {string} keyword 
 * @param {string} province 
 * @returns {object}
 */
const buildSucursalQuery = (keyword, province) => {
  let query = {};

  if (keyword && keyword !== 'Cerca de mí') {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { address: { $regex: keyword, $options: 'i' } },
      { city: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (province && province !== 'Todas') {
    query.province = province;
  }

  return query;
};

/**
 * Helper to get sucursales by proximity using aggregation
 * @param {string} lat 
 * @param {string} lng 
 * @param {object} query 
 * @param {number} pageSize 
 * @param {number} page 
 * @returns {Promise<{results: Array, total: number}>}
 */
const getSucursalesByProximity = async (lat, lng, query, pageSize, page) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Coordenadas inválidas');
  }

  const pipeline = [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [longitude, latitude] },
        distanceField: 'distance',
        query: query,
        spherical: true,
      },
    },
  ];

  const countResult = await Sucursal.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push({ $skip: pageSize * (page - 1) });
  pipeline.push({ $limit: pageSize });

  const results = await Sucursal.aggregate(pipeline);

  return { results, total };
};

module.exports = { getSucursales, getProvinces, getSucursalById };
