import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, ArrowRight, ShoppingCart, BookOpen, Loader2 } from 'lucide-react';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';

/**
 * TopRated Component
 * 
 * This component fetches and displays the highest-rated products (books) from the catalog.
 * It is designed for the Home page to showcase a curated selection of exclusive works.
 * 
 * Key Features:
 * - Fetches products from the API and sorts them by rating.
 * - Displays a maximum of 3 top-rated items.
 * - Includes hover effects for detailed information and quick actions (Buy/Read).
 * - Implements responsive grid layout and reveal animations using Framer Motion.
 * 
 * @returns {JSX.Element} The rendered TopRated section.
 */
export const TopRated: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  /** @state {any[]} books - Stores the list of top-rated products fetched from the API. */
  const [books, setBooks] = useState<any[]>([]);
  
  /** @state {boolean} loading - Tracks the data fetching status to display a loading state. */
  const [loading, setLoading] = useState(true);

  /**
   * Side effect to fetch products on component mount.
   * Sorts the results by rating and limits the display to the top 3 items.
   */
  useEffect(() => {
    const fetchTopBooks = async () => {
      try {
        // Fetch top rated products, limit to 3 for the home page
        const { data } = await API.get('/products');
        // Sort by rating descending and take the first 3
        const top3 = data
          .sort((a: any, b: any) => b.rating - a.rating)
          .slice(0, 3);
        setBooks(top3);
      } catch (err) {
        console.error("Error fetching top rated books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopBooks();
  }, []);

  /**
   * Loading State
   * Renders a spinner while the data is being fetched.
   */
  if (loading) {
    return (
      <div className="py-32 flex justify-center items-center">
        <Loader2 className="animate-spin text-light-primary" size={40} />
      </div>
    );
  }

  return (
    <section className="py-32 px-4 bg-light-accent/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with dynamic navigation to catalog */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <span className="text-light-primary font-bold uppercase tracking-[.4em] text-xs">Curaduría Exclusiva</span>
            <h2 className="text-6xl md:text-8xl font-heading italic tracking-tighter leading-tight">Obras Destacadas</h2>
          </div>
          <button 
            onClick={() => navigate('/catalog')}
            className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
          >
            VER CATÁLOGO COMPLETO <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {books.map((book, i) => (
            <motion.div 
              key={book._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              {/* Product Card Image & Actions */}
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden mb-8 shadow-2xl group-hover:shadow-light-primary/20 transition-all duration-700">
                <img 
                  src={book.image} 
                  alt={book.name} 
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                />
                
                {/* Hover Overlay with Product Details and CTA Buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 space-y-6">
                   <div className="space-y-2">
                     {/* Rating Stars */}
                     <div className="flex gap-1 text-yellow-500">
                       {[...Array(5)].map((_, starIndex) => (
                         <Star key={`star-${book._id}-${starIndex}`} size={14} fill={starIndex < Math.floor(book.rating) ? "currentColor" : "none"} />
                       ))}
                     </div>
                     <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{book.category}</p>
                     <h3 className="text-white text-2xl font-heading italic leading-tight">{book.name}</h3>
                   </div>

                   {/* Action Buttons: Purchase or Read Free */}
                   <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => navigate(`/product/${book._id}`)}
                        className="w-full bg-white text-light-text py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-light-primary hover:text-white transition-all"
                      >
                        <ShoppingCart size={14} /> Comprar ${book.price}
                      </button>
                      {book.isFree && (
                        <button 
                          onClick={() => window.open(book.pdfUrl, '_blank')}
                          className="w-full bg-light-primary/20 backdrop-blur-md border border-white/20 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-light-primary transition-all"
                        >
                          <BookOpen size={14} /> Leer Gratis
                        </button>
                      )}
                   </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-light-primary font-bold shadow-xl">
                  {book.rating}
                </div>
              </div>

              {/* Product Info Footer */}
              <div className="space-y-2 px-2">
                 <p className="text-[10px] font-bold uppercase tracking-[.3em] opacity-40">{book.category}</p>
                 <h4 className="text-2xl font-heading italic text-light-text">{book.name}</h4>
                 <p className="text-sm opacity-60 italic font-body">por {book.author}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
