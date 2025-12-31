import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs';
import Home from './pages/Home';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ContributePage from './pages/ContributePage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { auth, apiEvents } from './services/api';
import './styles/main.css';
import './styles/components.css';

// Composant pour scroller vers le haut lors des changements de page
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Desactiver temporairement le smooth scroll pour un changement instantane
    const htmlElement = document.documentElement;
    const originalScrollBehavior = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = 'auto';

    // Scroll vers le haut immediatement
    window.scrollTo(0, 0);

    // Restaurer le smooth scroll apres un court delai
    const timeoutId = setTimeout(() => {
      htmlElement.style.scrollBehavior = originalScrollBehavior || '';
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

// Composant pour afficher les breadcrumbs conditionnellement
const BreadcrumbsWrapper = () => {
  const location = useLocation();
  // Ne pas afficher sur la page d'accueil
  if (location.pathname === '/') return null;
  return <Breadcrumbs />;
};

// Composant pour gérer les événements API globaux avec les toasts
const ApiEventHandler = ({ onSessionExpired }) => {
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      toast.warning('Votre session a expiré. Veuillez vous reconnecter.');
      onSessionExpired();
      navigate('/login');
    };

    const handleUnauthorized = () => {
      toast.error('Accès non autorisé. Veuillez vous connecter.');
    };

    const handleForbidden = () => {
      toast.error('Vous n\'avez pas les droits pour effectuer cette action.');
    };

    const handleServerError = () => {
      toast.error('Une erreur serveur s\'est produite. Veuillez réessayer.');
    };

    const handleNetworkError = () => {
      toast.error('Erreur de connexion. Vérifiez votre connexion internet.');
    };

    apiEvents.on('SESSION_EXPIRED', handleSessionExpired);
    apiEvents.on('UNAUTHORIZED', handleUnauthorized);
    apiEvents.on('FORBIDDEN', handleForbidden);
    apiEvents.on('SERVER_ERROR', handleServerError);
    apiEvents.on('NETWORK_ERROR', handleNetworkError);

    return () => {
      apiEvents.off('SESSION_EXPIRED', handleSessionExpired);
      apiEvents.off('UNAUTHORIZED', handleUnauthorized);
      apiEvents.off('FORBIDDEN', handleForbidden);
      apiEvents.off('SERVER_ERROR', handleServerError);
      apiEvents.off('NETWORK_ERROR', handleNetworkError);
    };
  }, [toast, navigate, onSessionExpired]);

  return null;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = auth.getCurrentUser();
    if (currentUser && auth.isAuthenticated()) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <ApiEventHandler onSessionExpired={handleLogout} />
        <div className="app">
          <Header user={user} onLogout={handleLogout} />
          <BreadcrumbsWrapper />
          <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/campaigns/:id"
              element={<CampaignDetail user={user} />}
            />
            <Route
              path="/campaigns/create"
              element={<CreateCampaign user={user} />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard user={user} /> : <Navigate to="/login?from=/dashboard" />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />}
            />
            {/* Routes de mot de passe */}
            <Route
              path="/forgot-password"
              element={user ? <Navigate to="/" /> : <ForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={user ? <Navigate to="/" /> : <ResetPassword />}
            />
            {/* Routes de paiement */}
            <Route
              path="/campaigns/:id/contribute"
              element={<ContributePage user={user} />}
            />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            {/* Pages statiques */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;

