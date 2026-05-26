const Product = require('../models/Product');

const types = ['Libro', 'Apunte', 'Producto'];
const categories = {
  'Libro': ['Ficción', 'Historia', 'Ciencia', 'Poesía', 'Filosofía', 'Arte', 'Biografía', 'Suspenso', 'Clásicos'],
  'Apunte': ['Matemáticas', 'Física', 'Derecho', 'Medicina', 'Ingeniería', 'Psicología', 'Economía'],
  'Producto': ['Accesorios', 'Papelería', 'Tecnología', 'Decoración']
};

const authors = [
  'Gabriel García Márquez', 'Isabel Allende', 'Jorge Luis Borges', 'Julio Cortázar',
  'Mario Vargas Llosa', 'BeBook Academy', 'BeBook Design', 'Academic Experts',
  'Virginia Woolf', 'Franz Kafka', 'Fyodor Dostoevsky', 'Jane Austen', 'Haruki Murakami',
  'Alejandra Pizarnik', 'Ernesto Sabato', 'Silvina Ocampo'
];

const adjectives = ['Esencial', 'Completo', 'Moderno', 'Clásico', 'Definitivo', 'Inspirador', 'Técnico', 'Premium', 'Minimalista', 'Elegante'];
const nouns = {
  'Libro': ['Manual', 'Tratado', 'Crónica', 'Ensayos', 'Relatos', 'Poemas', 'Novela', 'Guía'],
  'Apunte': ['Resumen', 'Apuntes', 'Guía de Estudio', 'Compendio', 'Esquemas', 'Preparación', 'Lecciones'],
  'Producto': ['Cuaderno', 'Lápiz', 'Lámpara', 'Estuche', 'Marcador', 'Soporte', 'Bolso']
};

const images = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800',
  'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800'
];

const generateProducts = () => {
  const generatedProducts = [];
  const usedNames = new Set();

  for (let i = 0; i < 200; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[type][Math.floor(Math.random() * categories[type].length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[type][Math.floor(Math.random() * nouns[type].length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    
    let name = `${noun} ${adj}: ${category}`;
    if (usedNames.has(name)) {
      name = `${noun} ${adj} de ${author.split(' ').pop()}: ${category}`;
    }
    usedNames.add(name);

    const price = type === 'Apunte' ? (Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 500) + 100) : Math.floor(Math.random() * 5000) + 500;
    const isFree = price === 0;

    generatedProducts.push({
      name,
      author,
      image: images[Math.floor(Math.random() * images.length)],
      description: `Este ${type.toLowerCase()} ofrece una perspectiva única sobre ${category.toLowerCase()}. Ideal para aquellos que buscan profundizar su conocimiento con un enfoque ${adj.toLowerCase()}.`,
      category,
      type,
      price,
      countInStock: Math.floor(Math.random() * 50) + 1,
      isFree,
      pdfUrl: isFree ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : null,
      rating: (Math.random() * 2 + 3).toFixed(1),
      numReviews: Math.floor(Math.random() * 100)
    });
  }
  return generatedProducts;
};

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;

  const products = generateProducts();
  await Product.insertMany(products);
  return products.length;
};

module.exports = seedProducts;
