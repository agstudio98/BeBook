import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Book, 
  FileText, 
  ShoppingBag, 
  X, 
  Download, 
  ShoppingCart,
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
  Heart,
  AlertCircle,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import CommentSection from '../../components/CommentSection';
import { translateProductName, translateProductDescription } from '../../utils/translate';

/**
 * Product Interface
 * Defines the structure of a product (Book, Note, or General Product) in the catalog.
 */
interface Product {
  _id: string;
  name: string;
  author: string;
  image: string;
  description: string;
  category: string;
  type: 'Libro' | 'Apunte' | 'Producto';
  price: number;
  isFree: boolean;
  pdfUrl?: string;
  rating: number;
  numReviews: number;
}

/**
 * Catalog Component
 * 
 * The main product listing page. It provides advanced filtering, searching, 
 * and pagination for the bookstore's inventory.
 * 
 * Key Features:
 * - Real-time search with debounce.
 * - Categorical and type-based filtering.
 * - Paginated results with smooth scroll-to-top.
 * - Detailed product view in a modal.
 * - Integration with Cart and Auth contexts for purchases and wishlists.
 * - Purchase flow with confirmation and error handling.
 * 
 * @returns {JSX.Element} The rendered Catalog page.
 */
export const Catalog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();
  
  /** @state {Product[]} products - List of products matching current filters. */
  const [products, setProducts] = useState<Product[]>([]);
  
  /** @state {boolean} loading - Loading state for the product grid. */
  const [loading, setLoading] = useState(true);
  
  /** @state {string} keyword - Search term for filtering products by name or author. */
  const [keyword, setKeyword] = useState('');
  
  /** @state {string} activeType - Filter for product type (Libro, Apunte, etc.). */
  const [activeType, setActiveType] = useState<string>('Todos');
  
  /** @state {string} activeCategory - Filter for product genre/category. */
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  
  /** @state {string[]} categories - List of available categories fetched from the API. */
  const [categories, setCategories] = useState<string[]>([]);
  
  /** @state {number} page - Current page number for pagination. */
  const [page, setPage] = useState(1);
  
  /** @state {number} pages - Total number of pages available. */
  const [pages, setPages] = useState(1);
  
  /** @state {number} total - Total count of products matching current filters. */
  const [total, setTotal] = useState(0);
  
  /** @state {Product | null} selectedProduct - Product currently displayed in the detail modal. */
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Purchase State Management ---
  /** @state {boolean} showConfirm - Visibility of the purchase confirmation modal. */
  const [showConfirm, setShowConfirm] = useState(false);
  
  /** @state {boolean} purchaseLoading - Loading state during the order creation process. */
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  /** @state {string | null} purchaseError - Stores any error messages during purchase. */
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  
  /** @state {boolean} purchaseSuccess - Indicates if the purchase was completed successfully. */
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  /**
   * Fetches all unique product categories from the API.
   */
  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/products/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories", error);
      setCategories([]);
    }
  };

  /**
   * Fetches products based on current search keyword, type, category, and page.
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products?keyword=${keyword}&type=${activeType}&category=${activeCategory}&pageNumber=${page}`);
      if (data && data.products) {
        setProducts(data.products);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } else {
        setProducts([]);
        setPages(1);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching products", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /** Initial load of categories. */
  useEffect(() => {
    fetchCategories();
  }, []);

  /** Debounced product fetching on filter/search change. */
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, activeType, activeCategory, page]);

  /** Reset to first page when filters change. */
  useEffect(() => {
    setPage(1);
  }, [keyword, activeType, activeCategory]);

  /** Product Types for filter buttons. */
  const TYPES = [
    { label: t('CATALOG.TABS.ALL'), value: 'Todos', icon: <Filter size={14} /> },
    { label: t('CATALOG.TABS.BOOK'), value: 'Libro', icon: <Book size={14} /> },
    { label: t('CATALOG.TABS.NOTE'), value: 'Apunte', icon: <FileText size={14} /> },
    { label: t('CATALOG.TABS.PRODUCT'), value: 'Producto', icon: <ShoppingBag size={14} /> },
  ];

  /**
   * Handles pagination click events.
   * @param {number} newPage - The page number to navigate to.
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Pre-purchase validation.
   * Checks for user authentication and registered payment methods.
   */
  const handlePurchaseClick = () => {
    if (!user) {
      setPurchaseError(t('CATALOG.PURCHASE.ERRORS.LOGIN_REQUIRED'));
      setShowConfirm(true);
      return;
    }

    if (!user.paymentMethods || user.paymentMethods.length === 0) {
      setPurchaseError(t('CATALOG.PURCHASE.ERRORS.NO_PAYMENT'));
      setShowConfirm(true);
      return;
    }

    setPurchaseError(null);
    setShowConfirm(true);
  };

  /**
   * Executes the actual purchase API call.
   * Creates an order with the selected product.
   */
  const confirmPurchase = async () => {
    if (!selectedProduct) return;

    try {
      setPurchaseLoading(true);
      const orderData = {
        orderItems: [{
          name: selectedProduct.name,
          qty: 1,
          image: selectedProduct.image,
          price: selectedProduct.price,
          product: selectedProduct._id
        }],
        paymentMethod: user?.paymentMethods?.find(m => m.isDefault)?.cardType || user?.paymentMethods?.[0].cardType || 'Tarjeta',
        totalPrice: selectedProduct.price,
        shippingAddress: {
            address: 'Digital',
            city: 'Digital',
            postalCode: '0000',
            country: 'Digital'
        }
      };

      await API.post('/orders', orderData);

      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        setShowConfirm(false);
        setSelectedProduct(null);
      }, 3000);
    } catch (err: any) {
      setPurchaseError(err.response?.data?.message || "Error processing purchase");
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 bg-light-bg">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search/Filter Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <span className="text-[10px] font-bold tracking-[.4em] uppercase text-light-primary block mb-2">{t('CATALOG.SUBTITLE')}</span>
            <h2 className="text-6xl md:text-7xl font-heading italic tracking-tighter">{t('CATALOG.TITLE')}</h2>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest opacity-40">{t('CATALOG.FOUND_COUNT', { count: total })}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-auto flex flex-col sm:flex-row gap-4"
          >
            {/* Keyword Search */}
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-light-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={t('CATALOG.SEARCH_PLACEHOLDER')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-white border border-light-primary/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-light-primary/20 transition-all font-body italic"
              />
            </div>
            
            {/* Category Select */}
            <div className="relative group">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full sm:w-64 appearance-none bg-white border border-light-primary/10 rounded-2xl py-4 pl-12 pr-10 focus:ring-2 ring-light-primary/20 transition-all font-body italic cursor-pointer"
              >
                <option value="Todas">{t('CATALOG.ALL_GENRES')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{t(`DATA.CATEGORIES.${cat}`, cat)}</option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>

        {/* Types Filter Buttons */}
        <div className="flex flex-wrap gap-4 mb-12">
          {TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                activeType === type.value 
                ? 'bg-light-primary text-white shadow-xl shadow-light-primary/20' 
                : 'bg-white border border-light-primary/5 hover:border-light-primary/30 opacity-60 hover:opacity-100'
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        {/* Products Display Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
              <div key={i} className="aspect-[3/4] bg-white rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Product Card Image & Hover Actions */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl bg-white">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                    />
                    
                    {/* Price/Free Badge */}
                    <div className="absolute top-6 right-6 flex flex-col gap-2">
                      <span className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border ${
                        product.isFree 
                        ? 'bg-light-primary/20 text-light-primary border-light-primary/20' 
                        : 'bg-black/20 text-white border-white/20'
                      }`}>
                        {product.isFree ? t('CATALOG.FREE') : `$${product.price}`}
                      </span>
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className={`p-4 rounded-full transition-all duration-500 hover:scale-110 ${
                          cartItems.find(i => i._id === product._id) 
                          ? 'bg-light-primary text-white' 
                          : 'bg-white text-black hover:bg-light-primary hover:text-white'
                        }`}
                       >
                          <Heart size={20} fill={cartItems.find(i => i._id === product._id) ? "currentColor" : "none"} />
                       </button>
                       <div className="p-4 rounded-full bg-white text-black scale-0 group-hover:scale-100 transition-transform duration-500">
                          <Eye size={20} />
                       </div>
                    </div>
                  </div>

                  {/* Product Metadata */}
                  <div className="mt-6 px-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-[.2em] opacity-40">
                      {t(`DATA.TYPES.${product.type}`, product.type)} • {t(`DATA.CATEGORIES.${product.category}`, product.category)}
                    </span>
                    <h3 className="text-xl font-heading italic truncate">{translateProductName(product.name, t, i18n.language)}</h3>
                    <p className="text-xs font-bold tracking-widest uppercase opacity-60 truncate">{product.author}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Not Found State */}
        {!loading && products.length === 0 && (
          <div className="py-40 text-center opacity-30">
            <ShoppingBag size={48} className="mx-auto mb-6" />
            <p className="text-xl font-heading italic">{t('CATALOG.NOT_FOUND')}</p>
          </div>
        )}

        {/* Pagination Controls */}
        {pages > 1 && (
          <div className="mt-20 flex justify-center items-center gap-4">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-4 rounded-full border border-light-primary/10 hover:bg-light-primary hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {[...Array(pages)].map((_, i) => {
                const pageNum = i + 1;
                // Complex pagination logic to show ellipsis
                if (
                  pages > 7 && 
                  pageNum !== 1 && 
                  pageNum !== pages && 
                  Math.abs(pageNum - page) > 1
                ) {
                  if (pageNum === 2 || pageNum === pages - 1) return <span key={pageNum} className="px-2 opacity-30">...</span>;
                  return null;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-12 h-12 rounded-full text-xs font-bold transition-all ${
                      page === pageNum 
                      ? 'bg-light-primary text-white shadow-lg shadow-light-primary/20' 
                      : 'hover:bg-light-primary/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pages}
              className="p-4 rounded-full border border-light-primary/10 hover:bg-light-primary hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-8 right-8 z-10 p-3 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Product Image Section */}
              <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Content Section */}
              <div className="flex-1 p-8 md:p-16 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-8">
                  <div>
                    <span className="text-xs font-bold tracking-[.4em] uppercase text-light-primary mb-4 block">
                      {t(`DATA.CATEGORIES.${selectedProduct.category}`, selectedProduct.category)}
                    </span>
                    <h2 className="text-5xl font-heading italic leading-tight mb-2">{translateProductName(selectedProduct.name, t, i18n.language)}</h2>
                    <p className="text-lg font-bold tracking-widest uppercase opacity-60">
                      {t('CATALOG.BY')} {selectedProduct.author}
                    </p>
                  </div>

                  {/* Rating & Review Info */}
                  <div className="flex items-center gap-6 pb-8 border-b border-light-primary/10">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[1,2,3,4,5].map(s => (
                          <Star 
                            key={s} 
                            size={14} 
                            fill={s <= Math.round(selectedProduct.rating) ? "currentColor" : "none"} 
                            className={s <= Math.round(selectedProduct.rating) ? "text-yellow-500" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold opacity-60">({selectedProduct.rating})</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('COMENTARIOS.COUNT', { count: selectedProduct.numReviews })}</span>
                  </div>

                  {/* Description / Summary */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('CATALOG.SUMMARY')}</h4>
                    <p className="text-lg leading-relaxed italic opacity-80 font-body">
                      {translateProductDescription(selectedProduct.description, selectedProduct.type, selectedProduct.category, t)}
                    </p>
                  </div>

                  {/* Reviews/Comments Component */}
                  <CommentSection productId={selectedProduct._id} />
                </div>

                {/* Main Action Buttons (Download or Buy) */}
                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
                  {selectedProduct.isFree ? (
                    <a 
                      href={selectedProduct.pdfUrl || '#'} 
                      target="_blank"
                      className="w-full sm:w-auto flex-1 bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-light-primary/20"
                    >
                      <Download size={18} /> {t('CATALOG.VIEW_PDF')}
                    </a>
                  ) : (
                    <button 
                      onClick={handlePurchaseClick}
                      className="w-full sm:w-auto flex-1 bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-light-primary/20"
                    >
                      <ShoppingCart size={18} /> {t('CATALOG.ACQUIRE')} ${selectedProduct.price}
                    </button>
                  )}
                  
                  {/* Wishlist Toggle Button */}
                  <button 
                    onClick={() => addToCart(selectedProduct)}
                    className={`w-full sm:w-auto px-8 py-5 border rounded-2xl font-bold tracking-widest uppercase text-[10px] transition-all flex items-center justify-center gap-3 ${
                      cartItems.find(i => i._id === selectedProduct._id)
                      ? 'bg-light-primary/10 border-light-primary text-light-primary'
                      : 'border-light-primary/20 hover:bg-light-primary/5'
                    }`}
                  >
                    <Heart size={16} fill={cartItems.find(i => i._id === selectedProduct._id) ? "currentColor" : "none"} />
                    {cartItems.find(i => i._id === selectedProduct._id) ? t('CATALOG.IN_WISHLIST') : t('CATALOG.ADD_WISHLIST')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Confirmation & Feedback Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => !purchaseLoading && setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8"
            >
              {purchaseSuccess ? (
                /* Success Feedback */
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="space-y-6 py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-heading italic">{t('CATALOG.PURCHASE.SUCCESS_TITLE')}</h3>
                  <p className="opacity-60 text-sm">{t('CATALOG.PURCHASE.SUCCESS_TEXT')}</p>
                </motion.div>
              ) : (
                /* Confirmation or Error Form */
                <>
                  <div className="space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${purchaseError ? 'bg-red-100 text-red-600' : 'bg-light-primary/10 text-light-primary'}`}>
                      {purchaseError ? <AlertCircle size={30} /> : <CreditCard size={30} />}
                    </div>
                    <h3 className="text-3xl font-heading italic">{purchaseError ? t('CATALOG.PURCHASE.ERROR_TITLE') : t('CATALOG.PURCHASE.CONFIRM_TITLE')}</h3>
                    <p className="opacity-60 text-sm italic">
                      {purchaseError ? (
                        purchaseError
                      ) : t('CATALOG.PURCHASE.CONFIRM_SUBTITLE', { name: translateProductName(selectedProduct?.name || '', t, i18n.language), price: selectedProduct?.price })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {!purchaseError ? (
                      <>
                        <button
                          disabled={purchaseLoading}
                          onClick={confirmPurchase}
                          className="w-full bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {purchaseLoading ? '...' : t('CATALOG.PURCHASE.YES')}
                        </button>
                        <button
                          disabled={purchaseLoading}
                          onClick={() => setShowConfirm(false)}
                          className="w-full py-5 rounded-2xl font-bold tracking-widest uppercase text-[10px] opacity-40 hover:opacity-100 transition-all"
                        >
                          {t('CATALOG.PURCHASE.NO')}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="w-full bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs hover:brightness-110 transition-all"
                      >
                        {t('CATALOG.PURCHASE.UNDERSTOOD')}
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Catalog;
