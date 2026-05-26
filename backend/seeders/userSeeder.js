const User = require('../models/User');

const seedUsers = async () => {
  const userCount = await User.countDocuments();
  if (userCount > 0) return null;

  const admin = await User.create({
    name: 'Admin BeBook',
    email: 'admin@bebook.com',
    password: 'password123',
    isAdmin: true
  });

  return admin;
};

module.exports = seedUsers;
