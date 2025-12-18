import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ShopView } from './components/ShopView';
import { RepairsView } from './components/RepairsView';
import { ContactView } from './components/ContactView';
import { ChatWidget } from './components/ChatWidget';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { AdminView } from './components/AdminView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { WishlistView } from './components/WishlistView';
import { OrdersView } from './components/OrdersView';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { SellerDashboard } from './components/SellerDashboard';
import { DeliveryDashboard } from './components/DeliveryDashboard';
import { SellerRegisterView } from './components/SellerRegisterView';
import { ProfileView } from './components/ProfileView';
import { ViewState, User } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<ViewState>(ViewState.HOME);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [adminTab, setAdminTab] = useState<'orders' | 'products' | 'sellers' | 'delivery'>('orders');

  useEffect(() => {
    // Check for existing session
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLoginSuccess = () => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    setCurrentView(ViewState.HOME);
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setCurrentView(ViewState.HOME);
  };

  const openProduct = (productId: string) => {
    setPreviousView(currentView);
    setSelectedProductId(productId);
    setCurrentView(ViewState.PRODUCT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return (
          <>
            <HeroSection onCtaClick={() => setCurrentView(ViewState.SHOP)} />
            
            {/* Features Section */}
            <div className="py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                   <div className="text-center mb-16">
                       <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Why Choose MobileMaster Pro?</h2>
                       <p className="text-xl text-slate-600 dark:text-slate-400">The best mobile shopping experience, guaranteed</p>
                   </div>
                   
                   <div className="grid md:grid-cols-3 gap-8">
                       <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                           <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                               <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                           </div>
                           <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">Original Parts</h3>
                           <p className="text-slate-600 dark:text-slate-400">We only sell genuine products and use OEM parts for repairs. Quality guaranteed.</p>
                       </div>
                       
                       <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                           <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                               <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                               </svg>
                           </div>
                           <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">Expert Staff</h3>
                           <p className="text-slate-600 dark:text-slate-400">Our technicians are certified and our sales team knows tech inside and out.</p>
                       </div>
                       
                       <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                           <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                               <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                           </div>
                           <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">Best Value</h3>
                           <p className="text-slate-600 dark:text-slate-400">Competitive pricing on new phones and highest trade-in rates in the market.</p>
                       </div>
                   </div>
               </div>
            </div>
          </>
        );
      case ViewState.SHOP:
        return <ShopView onOpenProduct={openProduct} />;
      case ViewState.PRODUCT:
        return selectedProductId ? (
          <ProductDetailsPage
            productId={selectedProductId}
            onBack={() => setCurrentView(previousView)}
            onGoCheckout={() => setCurrentView(ViewState.CHECKOUT)}
          />
        ) : (
          <ShopView onOpenProduct={openProduct} />
        );
      case ViewState.REPAIRS:
        return <RepairsView />;
      case ViewState.CONTACT:
        return <ContactView />;
      case ViewState.CHECKOUT:
        return <CheckoutPage onBack={() => setCurrentView(ViewState.SHOP)} />;
      case ViewState.LOGIN:
        return <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />;
      case ViewState.REGISTER:
        return <RegisterView onRegisterSuccess={handleLoginSuccess} onNavigateLogin={() => setCurrentView(ViewState.LOGIN)} />;
      case ViewState.ADMIN:
        return user?.role === 'admin' ? <AdminView initialTab={adminTab} /> : <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />;
      case ViewState.WISHLIST:
        return user ? (
          <WishlistView user={user} onOpenProduct={openProduct} />
        ) : (
          <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />
        );
      case ViewState.ORDERS:
        return user ? <OrdersView user={user} /> : <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />;
      case ViewState.SELLER_DASHBOARD:
        return user?.role === 'seller' ? (
          <SellerDashboard user={user} />
        ) : (
          <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />
        );
      case ViewState.DELIVERY_DASHBOARD:
        return user?.role === 'delivery' ? (
          <DeliveryDashboard user={user} />
        ) : (
          <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />
        );
      case ViewState.SELLER_REGISTER:
        return user ? (
          <SellerRegisterView 
            user={user} 
            onSuccess={() => {
              handleLoginSuccess(); // Refresh user data
              setCurrentView(ViewState.HOME);
            }}
            onBack={() => setCurrentView(ViewState.HOME)}
          />
        ) : (
          <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />
        );
      case ViewState.PROFILE:
        return user ? (
          <ProfileView user={user} onUpdate={handleLoginSuccess} />
        ) : (
          <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />
        );
      case ViewState.PROFILE:
        return user ? (
          <ProfileView user={user} onUpdate={handleLoginSuccess} />
        ) : (
          <LoginView onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentView(ViewState.REGISTER)} />
        );
      default:
        return <HeroSection onCtaClick={() => setCurrentView(ViewState.SHOP)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        onLogout={handleLogout}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
      />
      <main className="flex-1">
        {renderView()}
      </main>
      <CartDrawer />
      <ChatWidget />
    </div>
  );
};

export default App;