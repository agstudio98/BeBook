import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * CartItem Interface
 * Defines the simplified structure of a product within the shopping cart.
 */
interface CartItem {
  _id: string;
  name: string;
  author: string;
  image: string;
  price: number;
  type: string;
}

/**
 * CartContextType Interface
 * Defines the state and operations for the shopping cart.
 */
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
}

/**
 * Global Cart Context
 * Manages the shopping cart state application-wide.
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider Component
 * Handles cart persistence via LocalStorage and computes total metrics.
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /**
   * Hydrates the cart state from LocalStorage on component mount.
   */
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  /**
   * Persists changes to the cart in LocalStorage.
   */
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Adds an item to the cart if it's not already present.
   * @param item Product to add.
   */
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  /**
   * Removes a specific item from the cart by its ID.
   * @param id ID of the product to remove.
   */
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  /**
   * Wipes the entire cart.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // Computed Values
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);
  const itemCount = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * useCart Hook
 * Custom hook for easy access to CartContext.
 * @throws Error if used outside of a CartProvider.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
