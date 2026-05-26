const Sucursal = require('../models/Sucursal');

const provinces = [
  'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Salta', 'Misiones', 'Chaco', 'Corrientes',
  'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro', 'Neuquén', 'Entre Ríos', 'San Luis', 'Chubut', 'Catamarca', 'La Pampa',
  'La Rioja', 'Santa Cruz', 'Tierra del Fuego'
];

const realStreets = ['Av. Rivadavia', 'Av. Santa Fe', 'Av. del Libertador', 'Calle San Martín', 'Av. Corrientes', 'Calle Belgrano', 'Calle Moreno', 'Av. 9 de Julio', 'Calle Mitre', 'Calle Sarmiento'];
const branches = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro', 'Palacio', 'Plaza', 'Estación', 'Puerto', 'Mirador'];
const libraryNames = ['Biblioteca', 'Librería', 'Santuario', 'Rincón', 'Espacio', 'Refugio', 'Cuna'];
const iconNames = ['BookOpen', 'Bookmark', 'Library', 'MapPin', 'Book', 'GraduationCap'];
const serviceOptions = ['VR Room', 'Study Area', 'Cafeteria', 'Digital Archives', 'Kids Zone', 'Workshop Room', 'Co-Working Space'];

const generateSucursales = () => {
  const sucursales = [];
  const usedNames = new Set();

  for (let i = 0; i < 200; i++) {
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const libBase = libraryNames[Math.floor(Math.random() * libraryNames.length)];
    const branchType = branches[Math.floor(Math.random() * branches.length)];
    const street = realStreets[Math.floor(Math.random() * realStreets.length)];
    
    let name = `${libBase} ${branchType}`;
    if (usedNames.has(name)) {
        name = `${libBase} BeBook ${branchType}`;
    }
    usedNames.add(name);

    const lat = -34.6037 + (Math.random() - 0.5) * 15;
    const lng = -58.3816 + (Math.random() - 0.5) * 15;

    sucursales.push({
      name: name,
      address: `${street} ${Math.floor(Math.random() * 5000) + 1}`,
      city: province === 'CABA' ? 'CABA' : 'Ciudad BeBook',
      province: province,
      postalCode: `${Math.floor(Math.random() * 8000) + 1000}`,
      country: 'Argentina',
      phone: `+54 (11) 4${Math.floor(Math.random() * 9000000 + 1000000)}`,
      email: `contacto@bebook.com`,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      services: serviceOptions.sort(() => 0.5 - Math.random()).slice(0, 3),
      image: iconNames[Math.floor(Math.random() * iconNames.length)]
    });
  }
  return sucursales;
};

const seedSucursales = async () => {
  const count = await Sucursal.countDocuments();
  if (count > 0) return;

  const sucursales = generateSucursales();
  await Sucursal.insertMany(sucursales);
  return sucursales.length;
};

module.exports = seedSucursales;
