const request = require('supertest');
const app = require('../app');
const Sucursal = require('../models/Sucursal');

describe('Sucursal Controller', () => {
  beforeEach(async () => {
    // Ensure index for 2dsphere
    await Sucursal.ensureIndexes();

    await Sucursal.create([
      {
        name: 'BeBook Central',
        address: 'Av. Corrientes 1234',
        city: 'CABA',
        province: 'Buenos Aires',
        location: { type: 'Point', coordinates: [-58.3816, -34.6037] },
        rating: 4.5
      },
      {
        name: 'BeBook Córdoba',
        address: 'Colon 500',
        city: 'Córdoba',
        province: 'Córdoba',
        location: { type: 'Point', coordinates: [-64.1888, -31.4167] },
        rating: 4.8
      }
    ]);
  });

  describe('GET /api/sucursales', () => {
    it('should fetch all sucursales', async () => {
      const res = await request(app).get('/api/sucursales');
      expect(res.statusCode).toEqual(200);
      expect(res.body.sucursales).toHaveLength(2);
    });

    it('should filter by province', async () => {
      const res = await request(app).get('/api/sucursales?province=Córdoba');
      expect(res.statusCode).toEqual(200);
      expect(res.body.sucursales).toHaveLength(1);
      expect(res.body.sucursales[0].name).toEqual('BeBook Córdoba');
    });

    it('should search by keyword', async () => {
      const res = await request(app).get('/api/sucursales?keyword=Central');
      expect(res.statusCode).toEqual(200);
      expect(res.body.sucursales).toHaveLength(1);
      expect(res.body.sucursales[0].name).toEqual('BeBook Central');
    });
  });

  describe('GET /api/sucursales/provinces', () => {
    it('should fetch unique provinces', async () => {
      const res = await request(app).get('/api/sucursales/provinces');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toContain('Buenos Aires');
      expect(res.body).toContain('Córdoba');
    });
  });

  describe('GET /api/sucursales/:id', () => {
    it('should fetch single sucursal by ID', async () => {
      const sucursal = await Sucursal.findOne({ name: 'BeBook Central' });
      const res = await request(app).get(`/api/sucursales/${sucursal._id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('BeBook Central');
    });
  });
});
