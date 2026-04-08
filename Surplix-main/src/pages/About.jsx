import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-32 min-h-screen bg-theme-cream flex flex-col items-center px-4 pb-12">
      <div className="max-w-2xl w-full text-center space-y-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-theme-dark tracking-tight mb-8">
          {t('about_title')}
        </h1>
        
        <div className="space-y-8 text-xl text-theme-dark/80 leading-loose font-medium">
          <p>
            {t('about_p1')}
          </p>
          
          <p className="text-theme-green font-bold text-2xl">
            {t('about_p2')}
          </p>
          
          <p>
            {t('about_p3')}
          </p>
          
          <p>
            {t('about_p4')}
          </p>
          
          <p className="font-bold text-theme-dark">
            {t('about_p5')}
          </p>
        </div>

        <div className="mt-16 pt-10 border-t border-theme-creamDark">
          <p className="text-lg font-bold text-theme-orange bg-white border border-theme-orange/20 inline-block px-8 py-4 rounded-full shadow-sm">
            {t('about_footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
