const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');

describe('Product Controller', () => {
  beforeEach(async () => {
    await Product.create([
      {
        name: 'The Aleph',
        author: 'Jorge Luis Borges',
        image: '/images/aleph.jpg',
        description: 'Classic literature',
        category: 'Fiction',
        type: 'Libro',
        price: 25.0,
        countInStock: 10,
        isFree: false
      },
      {
        name: 'Fictions',
        author: 'Jorge Luis Borges',
        image: '/images/fictions.jpg',
        description: 'Short stories',
        category: 'Fiction',
        type: 'Libro',
        price: 0,
        countInStock: 100,
        isFree: true,
        pdfUrl: '/files/fictions.pdf'
      }
    ]);
  });

  describe('GET /api/products', () => {
    it('should fetch all products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body).toHaveProperty('pages');
    });

    it('should filter products by keyword', async () => {
      const res = await request(app).get('/api/products?keyword=Aleph');
      expect(res.statusCode).toEqual(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toEqual('The Aleph');
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=Fiction');
      expect(res.statusCode).toEqual(200);
      expect(res.body.products).toHaveLength(2);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should fetch a single product by ID', async () => {
      const product = await Product.findOne({ name: 'The Aleph' });
      const res = await request(app).get(`/api/products/${product._id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('The Aleph');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '60d5ecb8b392d70015f8e2a1';
      const res = await request(app).get(`/api/products/${fakeId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Producto no encontrado');
    });
  });
});
