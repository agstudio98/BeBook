const Comentario = require('../models/Comentario');
const User = require('../models/User');
const Product = require('../models/Product');
const Sucursal = require('../models/Sucursal');

const seedComentarios = async () => {
  const count = await Comentario.countDocuments();
  if (count > 0) return 0;

  const user = await User.findOne();
  const product = await Product.findOne();
  const sucursal = await Sucursal.findOne();

  if (!user || !product || !sucursal) return 0;

  const comentarios = [
    {
      user: user._id,
      product: product._id,
      text: '¡Excelente producto! Me encantó la calidad.',
      rating: 5,
    },
    {
      user: user._id,
      product: product._id,
      text: 'Buen producto, pero tardó un poco en llegar.',
      rating: 4,
    },
    {
      user: user._id,
      sucursal: sucursal._id,
      text: 'La atención en esta sucursal es increíble.',
      rating: 5,
    },
    {
      user: user._id,
      sucursal: sucursal._id,
      text: 'Un lugar muy acogedor para leer.',
      rating: 4,
    }
  ];

  await Comentario.insertMany(comentarios);
  return comentarios.length;
};

module.exports = seedComentarios;
