import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';

// Public Components
import { AnnouncementBar } from './components/public/AnnouncementBar';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { RequestServicePage } from './pages/public/RequestServicePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { ReviewsPage } from './pages/public/ReviewsPage';
import { LeaveReviewPage } from './pages/public/LeaveReviewPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';

function AppContent() {
  const { isOwner } = useAuth();
  const { settings } = useData();

  // Dynamically synchronize browser favicon with uploaded PNG / custom logo
  useEffect(() => {
    const targetFavicon = settings?.symbolUrl || settings?.logoUrl;
    if (targetFavicon) {
      const link =
        (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
        document.createElement('link');
      link.type =
        targetFavicon.startsWith('data:image/svg') || targetFavicon.endsWith('.svg')
          ? 'image/svg+xml'
          : 'image/png';
      link.rel = 'icon';
      link.href = targetFavicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings?.symbolUrl, settings?.logoUrl]);

  // Determine initial route from URL
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const queryRoute = searchParams.get('route');

    if (queryRoute) return queryRoute;
    if (path === '/admin' || hash === '#admin') return 'admin';
    if (path === '/leave-review' || path === '/rate' || path === '/review' || hash === '#review') {
      return 'leave-review';
    }
    const cleanPath = path.replace(/^\//, '');
    return cleanPath || 'home';
  });

  const [routeParams, setRouteParams] = useState<any>({});

  // Sync with browser back/forward and hash
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const queryRoute = searchParams.get('route');

      if (queryRoute) {
        setCurrentRoute(queryRoute);
      } else if (path === '/admin' || hash === '#admin') {
        setCurrentRoute('admin');
      } else if (path === '/leave-review' || path === '/rate' || path === '/review' || hash === '#review') {
        setCurrentRoute('leave-review');
      } else {
        const cleanPath = path.replace(/^\//, '');
        setCurrentRoute(cleanPath || 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string, params: any = {}) => {
    setRouteParams(params);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (route === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', route === 'home' ? '/' : `/${route}`);
    }
  };

  // 1. Separate Private Administrative Dashboard Route (/admin)
  if (currentRoute === 'admin') {
    if (!isOwner) {
      return <AdminLogin onBackToPublic={() => navigate('home')} />;
    }
    return <AdminLayout onBackToPublic={() => navigate('home')} />;
  }

  // 2. Public Facing Website Experience
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EB] text-[#153B36] selection:bg-[#70A69A]/30 selection:text-[#153B36] overflow-x-hidden">
      <AnnouncementBar />
      <Navbar currentRoute={currentRoute} navigate={navigate} />

      <main className="flex-1">
        {currentRoute === 'home' && <HomePage navigate={navigate} />}
        {currentRoute === 'services' && <ServicesPage navigate={navigate} />}
        {currentRoute === 'service-detail' && (
          <ServiceDetailPage serviceId={routeParams.id} navigate={navigate} />
        )}
        {currentRoute === 'request' && (
          <RequestServicePage
            initialServiceId={routeParams.serviceId}
            navigate={navigate}
          />
        )}
        {currentRoute === 'about' && <AboutPage navigate={navigate} />}
        {currentRoute === 'contact' && <ContactPage navigate={navigate} />}
        {currentRoute === 'reviews' && <ReviewsPage navigate={navigate} />}
        {(currentRoute === 'leave-review' || currentRoute === 'rate' || currentRoute === 'review') && (
          <LeaveReviewPage navigate={navigate} />
        )}
        {currentRoute === 'privacy' && <PrivacyPolicyPage />}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
