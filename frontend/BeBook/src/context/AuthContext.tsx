import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * UserInfo Interface
 * Defines the structure of the authenticated user's data.
 */
interface UserInfo {
  _id: string;
  name: string;
  email: string;
  token: string;
  isAdmin: boolean;
  avatar?: string;
  readingStats?: {
    timeRead: number;
    booksFinished: number;
    preferredGenres: string[];
  };
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  paymentMethods?: Array<{
    _id?: string;
    methodType: 'CARD' | 'MERCADO_PAGO';
    cardType?: string;
    lastFour?: string;
    emailMP?: string;
    isDefault: boolean;
  }>;
}

/**
 * AuthContextType Interface
 * Defines the state and methods provided by the AuthContext.
 */
interface AuthContextType {
  user: UserInfo | null;
  login: (userData: UserInfo) => void;
  logout: () => void;
  updateUser: (userData: UserInfo) => void;
}

/**
 * Global Authentication Context
 * Manages user session across the entire application.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Persists user state in LocalStorage and provides auth methods to children.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);

  /**
   * Initializes user state from LocalStorage on mount.
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('userInfo');
        }
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  /**
   * Updates user state and LocalStorage upon login.
   * @param userData User information from the API.
   */
  const login = (userData: UserInfo) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  /**
   * Clears user state and LocalStorage upon logout.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  /**
   * Updates user information without logging out (e.g., profile changes).
   * @param userData Updated user information.
   */
  const updateUser = (userData: UserInfo) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * Custom hook for easy access to AuthContext.
 * @throws Error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
