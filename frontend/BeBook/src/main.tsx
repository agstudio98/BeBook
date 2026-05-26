import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

/**
 * Google Client ID for OAuth authentication.
 * Retrieved from environment variables for security.
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Application entry point.
 * Renders the React component tree into the root DOM element.
 * Includes Google OAuth provider and internal Auth provider at the highest level.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>
)
