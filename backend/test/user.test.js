const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('User Controller', () => {
  describe('POST /api/users', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toEqual('Test User');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should return 400 if user already exists', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123!',
      });

      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('El usuario ya existe');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toEqual('login@example.com');
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Email o contraseña inválidos');
    });
  });
});
