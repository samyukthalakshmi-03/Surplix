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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-3xl font-extrabold text-theme-green tracking-tight">{t('brand_name')}</Link>
            </div>
            <div className="hidden md:flex space-x-8 items-center font-medium">
              <Link to="/" className={isActive('/')}>{t('home')}</Link>
              <Link to="/browse" className={isActive('/browse')}>{t('browse')}</Link>
              <Link to="/about" className={isActive('/about')}>{t('about')}</Link>
              <Link to="/community" className={isActive('/community')}>{t('community')}</Link>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-theme-cream/50 border border-theme-creamDark text-theme-green font-bold rounded-[12px] px-3 py-2 outline-none focus:ring-2 focus:ring-theme-green/30"
              >
                <option value="en">English (EN)</option>
                <option value="kn">ಕನ್ನಡ (KN)</option>
                <option value="hi">हिंदी (HI)</option>
              </select>
              {user ? (
                <div className="hidden md:flex items-center gap-4 text-theme-dark/70 font-bold">
                  <span title={user.email}>{user.user_metadata?.display_name || user.email?.split('@')[0]}</span>
                  <button onClick={signOut} className="hover:text-theme-orange transition-colors">Logout</button>
                </div>
              ) : (
                <Link to="/login" className="text-theme-dark/70 font-bold hover:text-theme-green transition-colors hidden md:block">{t('login')}</Link>
              )}
              <Link to="/list" className="bg-theme-green text-white px-6 py-2.5 rounded-full font-bold hover:bg-green-800 hover:shadow-lg transition-all">{t('list_food')}</Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
