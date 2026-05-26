const request = require('supertest');
const app = require('../app');
const Comentario = require('../models/Comentario');
const Product = require('../models/Product');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

describe('Comentario Controller', () => {
  let userToken;
  let productId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Reviewer',
      email: 'reviewer@example.com',
      password: 'Password123!',
    });
    userToken = generateToken(user._id);

    const product = await Product.create({
      name: 'Reviewable Book',
      author: 'Author',
      image: '/image.jpg',
      description: 'Desc',
      category: 'Cat',
      type: 'Libro',
      price: 10
    });
    productId = product._id;
  });

  describe('POST /api/comentarios', () => {
    it('should add a comment and update product rating', async () => {
      const res = await request(app)
        .post('/api/comentarios')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: 'Great book!',
          rating: 5,
          productId: productId
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.text).toEqual('Great book!');
      
      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct.rating).toEqual(5);
      expect(updatedProduct.numReviews).toEqual(1);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/comentarios')
        .send({
          text: 'No auth',
          rating: 1,
          productId: productId
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/comentarios', () => {
    it('should fetch comments for a product', async () => {
      const user = await User.findOne({ email: 'reviewer@example.com' });
      await Comentario.create({
        user: user._id,
        text: 'Existing review',
        rating: 4,
        product: productId
      });

      const res = await request(app).get(`/api/comentarios?productId=${productId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].text).toEqual('Existing review');
    });
  });
});
