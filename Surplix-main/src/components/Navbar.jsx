import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { user, signOut } = useAuth();
  const isActive = (path) => location.pathname === path ? "text-theme-green font-bold" : "text-theme-dark/70 hover:text-theme-green";

  return (
    <>
      <nav className="fixed top-0 w-full bg-theme-cream/90 backdrop-blur-md border-b border-theme-creamDark z-50 shadow-sm transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Left Side: Logo & Main Links */}
            <div className="flex items-center gap-8 lg:gap-12">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                {/* Logo Image */}
                <img src="/logo.png" alt="Surplix Logo" className="h-14 mix-blend-multiply object-contain -ml-2" />
                {/* Brand Name */}
                <span className="text-3xl font-extrabold text-theme-green tracking-tight">{t('brand_name')}</span>
              </Link>
              
              <div className="hidden xl:flex space-x-6 lg:space-x-8 items-center font-medium text-sm lg:text-base whitespace-nowrap">
                <Link to="/" className={isActive('/')}>{t('home')}</Link>
                {user?.user_metadata?.role === 'organization' ? (
                    <Link to="/ngo-dashboard" className={isActive('/ngo-dashboard')}>Dashboard</Link>
                ) : (
                    <Link to="/seller-dashboard" className={isActive('/seller-dashboard')}>Dashboard</Link>
                )}
                <Link to="/browse" className={isActive('/browse')}>{t('browse')}</Link>
                <Link to="/about" className={isActive('/about')}>{t('about')}</Link>
                <Link to="/community" className={isActive('/community')}>{t('community')}</Link>
              </div>
            </div>

            {/* Right Side: Tools & Auth */}
            <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0 ml-auto">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-theme-cream/50 border border-theme-creamDark text-theme-green font-bold rounded-[12px] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-theme-green/30"
              >
                <option value="en">English (EN)</option>
                <option value="kn">ಕನ್ನಡ (KN)</option>
                <option value="hi">हिंदी (HI)</option>
              </select>
              
              {user ? (
                <div className="hidden lg:flex items-center gap-4 text-theme-dark/70 font-bold">
                  <span className="truncate max-w-[120px] 2xl:max-w-[200px]" title={user.user_metadata?.display_name || user.email}>
                      {user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </span>
                  <button onClick={signOut} className="hover:text-theme-orange transition-colors">Logout</button>
                </div>
              ) : (
                <Link to="/login" className="text-theme-dark/70 font-bold hover:text-theme-green transition-colors hidden lg:block whitespace-nowrap">{t('login')}</Link>
              )}
              
              <Link to="/list" className="bg-theme-green text-white px-5 py-2.5 rounded-full font-bold text-sm lg:text-base hover:bg-green-800 hover:shadow-lg transition-all whitespace-nowrap">
                  {t('list_food')}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
