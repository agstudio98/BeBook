import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import SupportChat from './components/SupportChat';
import { Home } from './pages/Home';
import { User } from './pages/user/User';
import { Profile } from './pages/user/Profile';
import { Catalog } from './pages/catalog/Catalog';
import { Sucursals } from './pages/sucursals/Sucursals';
import { Forum } from './pages/Forum';

/**
 * AppRoutes Component
 * Defines the main routing structure of the application.
 * Handles protected routes and redirects based on authentication state.
 */
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Home route: Redirects to /auth if user is not logged in */}
      <Route path="/" element={user ? <Home /> : <Navigate to="/auth" />} />
      
      {/* Publicly accessible routes */}
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/sucursales" element={<Sucursals />} />
      <Route path="/foro" element={<Forum />} />
      
      {/* Auth route: Redirects to / if user is already logged in */}
      <Route path="/auth" element={!user ? <User /> : <Navigate to="/" />} />
      
      {/* Protected Profile route: Redirects to /auth if user is not logged in */}
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
    </Routes>
  );
};

/**
 * App Component
 * Main entry point for the React application.
 * Sets up global providers (Auth, Cart), Suspense for code splitting, and the Router.
 */
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Suspense handles the loading state for lazy-loaded components */}
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center bg-light-bg text-light-primary font-bold uppercase tracking-widest">
            Cargando Experiencia...
          </div>
        }>
          <Router>
            <div className="min-h-screen bg-light-bg text-light-text">
              <Navbar />
              <main>
                <AppRoutes />
              </main>
              <Footer />
              <SupportChat />
            </div>
          </Router>
        </Suspense>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
