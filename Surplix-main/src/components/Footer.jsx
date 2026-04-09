import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  return (
    <footer className="relative bg-gradient-to-br from-[#5C3A21] to-[#3D2616] text-theme-cream pt-16 pb-8 border-t-[6px] border-theme-yellow mt-auto overflow-hidden">

      {/* Subtle Grain / Kraft Pattern Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06] mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-4xl font-extrabold tracking-tight text-theme-yellow mb-4">{t('brand_name')}</h2>
            <p className="text-theme-cream/90 text-lg max-w-xs font-medium">
              {t('footer_tagline')}
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-6 text-theme-cream tracking-wide">{t('footer_contact')}</h3>
            <ul className="space-y-4 text-theme-cream/90 font-medium">
              <li className="flex items-center justify-center md:justify-start gap-3 w-full">
                <span className="text-theme-yellow">📧</span>
                <a href="mailto:support@surplix.com" className="hover:text-theme-yellow transition-colors duration-300">support@surplix.com</a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 w-full">
                <span className="text-theme-yellow">📞</span>
                <a href="tel:+919876543210" className="hover:text-theme-yellow transition-colors duration-300">+91 9876543210</a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 w-full">
                <span className="text-theme-yellow">📍</span>
                <span>{t('footer_location')}</span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-6 text-theme-cream tracking-wide">{t('footer_connect')}</h3>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-theme-yellow hover:text-[#3D2616] transition-all duration-300 backdrop-blur-sm shadow-md hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" aria-label="Twitter" className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-theme-yellow hover:text-[#3D2616] transition-all duration-300 backdrop-blur-sm shadow-md hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-theme-yellow hover:text-[#3D2616] transition-all duration-300 backdrop-blur-sm shadow-md hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="mt-16 pt-8 border-t border-theme-cream/15 flex flex-col items-center">
          <p className="text-theme-cream/70 text-sm font-medium tracking-wide">
            © 2026 {t('brand_name')}. {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
