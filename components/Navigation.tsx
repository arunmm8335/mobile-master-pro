import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ViewState, User } from '../types';
import { ShoppingBag, Menu, X, Smartphone, Wrench, RefreshCcw, Moon, Sun, MapPin, LogIn, User as UserIcon, LogOut, ShoppingCart, Heart, PackageSearch, Package, Users, Truck } from 'lucide-react';
import { STORE_NAME } from '../constants';
import { db } from '../services/db';
import { useCart } from '../context/CartContext';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  onLogout: () => void;
  adminTab?: 'orders' | 'products' | 'sellers' | 'delivery';
  setAdminTab?: (tab: 'orders' | 'products' | 'sellers' | 'delivery') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, darkMode, toggleDarkMode, user, onLogout, adminTab, setAdminTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { items, setIsCartOpen } = useCart();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Define navigation items based on user role
  const navItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { id: ViewState.ADMIN, label: 'Orders', icon: ShoppingBag, tab: 'orders' as const },
        { id: ViewState.ADMIN, label: 'Products', icon: Package, tab: 'products' as const },
        { id: ViewState.ADMIN, label: 'Sellers', icon: Users, tab: 'sellers' as const },
        { id: ViewState.ADMIN, label: 'Delivery', icon: Truck, tab: 'delivery' as const },
      ];
    }
    
    if (user?.role === 'seller') {
      return [
        { id: ViewState.HOME, label: 'Home', icon: null },
        { id: ViewState.SHOP, label: 'Shop', icon: Smartphone },
        { id: ViewState.SELLER_DASHBOARD, label: 'My Store', icon: ShoppingBag },
      ];
    }
    
    if (user?.role === 'delivery') {
      return [
        { id: ViewState.HOME, label: 'Home', icon: null },
        { id: ViewState.DELIVERY_DASHBOARD, label: 'Deliveries', icon: Truck },
      ];
    }
    
    // Regular user or not logged in
    return [
      { id: ViewState.HOME, label: 'Home', icon: null },
      { id: ViewState.SHOP, label: 'Shop', icon: Smartphone },
      { id: ViewState.REPAIRS, label: 'Repairs', icon: Wrench },
      { id: ViewState.CONTACT, label: 'Contact', icon: MapPin },
    ];
  }, [user?.role]);

  const handleNavClick = (view: ViewState, tab?: 'orders' | 'products' | 'sellers' | 'delivery') => {
    setView(view);
    if (tab && setAdminTab) {
      setAdminTab(tab);
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
      onLogout();
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
  };

  const handleUserMenuClick = (view: ViewState) => {
    setView(view);
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-slate-950/60 shadow-sm transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            <div className="flex-shrink-0 flex items-center text-slate-900 dark:text-white">
              <Smartphone className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl tracking-tight">{STORE_NAME}</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item, index) => {
              const isActive = item.tab 
                ? (currentView === item.id && adminTab === item.tab)
                : currentView === item.id;
              
              return (
                <button
                  key={`${item.id}-${item.tab || index}`}
                  onClick={() => handleNavClick(item.id, item.tab)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? user?.role === 'admin' 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-6">
              {/* Only show cart for non-admin users */}
              {user?.role !== 'admin' && user?.role !== 'delivery' && (
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {items.length > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {items.length}
                    </span>
                  )}
                </button>
              )}

              <button 
                onClick={toggleDarkMode}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {user ? (
                 <div className="relative" ref={userMenuRef}>
                     <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                     >
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover border-2 border-white dark:border-slate-700"
                          />
                        ) : (
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            user.role === 'admin' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                            user.role === 'seller' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                            user.role === 'delivery' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                            'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                     </button>
                     
                     {isUserMenuOpen && (
                       <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                         <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                           <span className={`inline-block mt-2 px-2 py-1 rounded-full text-[10px] font-bold ${
                             user.role === 'admin' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                             user.role === 'seller' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                             user.role === 'delivery' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                             'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                           }`}>{user.role.toUpperCase()}</span>
                         </div>
                         
                         {/* Only show customer options for regular users */}
                         {user.role === 'user' && (
                           <>
                             <button
                               onClick={() => handleUserMenuClick(ViewState.PROFILE)}
                               className="w-full flex items-center px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                             >
                               <UserIcon className="h-4 w-4 mr-3" />
                               My Profile
                             </button>
                             <button
                               onClick={() => handleUserMenuClick(ViewState.WISHLIST)}
                               className="w-full flex items-center px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                             >
                               <Heart className="h-4 w-4 mr-3" />
                               Wishlist
                             </button>
                             <button
                               onClick={() => handleUserMenuClick(ViewState.ORDERS)}
                               className="w-full flex items-center px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                             >
                               <PackageSearch className="h-4 w-4 mr-3" />
                               My Orders
                             </button>
                             <button
                               onClick={() => handleUserMenuClick(ViewState.SELLER_REGISTER)}
                               className="w-full flex items-center px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                             >
                               <ShoppingBag className="h-4 w-4 mr-3" />
                               Become a Seller
                             </button>
                           </>
                         )}
                         
                         <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                           <button
                             onClick={handleLogout}
                             className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           >
                             <LogOut className="h-4 w-4 mr-3" />
                             Logout
                           </button>
                         </div>
                       </div>
                     )}
                 </div>
              ) : (
                <button 
                    onClick={() => handleNavClick(ViewState.LOGIN)}
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden space-x-4">
             <button 
                onClick={toggleDarkMode}
                className="p-2 text-slate-500 dark:text-slate-400"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item, index) => {
              const isActive = item.tab 
                ? (currentView === item.id && adminTab === item.tab)
                : currentView === item.id;
              
              return (
                <button
                  key={`${item.id}-${item.tab || index}`}
                  onClick={() => handleNavClick(item.id, item.tab)}
                  className={`block w-full text-left px-4 py-3 rounded-2xl text-base font-medium ${
                    isActive
                      ? 'text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center">
                     {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                     {item.label}
                  </div>
                </button>
              );
            })}


            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                {user ? (
                    <div className="px-3 space-y-2">
                        <div className="flex items-center mb-3 px-3 py-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                              user.role === 'admin' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                              user.role === 'seller' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                              user.role === 'delivery' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                              'bg-gradient-to-br from-blue-500 to-purple-600'
                            }`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  user.role === 'admin' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  user.role === 'seller' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  user.role === 'delivery' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>{user.role.toUpperCase()}</span>
                            </div>
                        </div>
                        
                        {/* Only show for regular users */}
                        {user.role === 'user' && (
                          <>
                            <button
                                onClick={() => handleUserMenuClick(ViewState.WISHLIST)}
                                className="w-full flex items-center px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <Heart className="h-5 w-5 mr-3" />
                                Wishlist
                            </button>
                            <button
                                onClick={() => handleUserMenuClick(ViewState.ORDERS)}
                                className="w-full flex items-center px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <PackageSearch className="h-5 w-5 mr-3" />
                                My Orders
                            </button>
                          </>
                        )}
                        
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-3 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => handleNavClick(ViewState.LOGIN)}
                        className="w-full block px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold mx-2 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        Sign In
                    </button>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};