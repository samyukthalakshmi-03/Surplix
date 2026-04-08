import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('surplix_lang') || 'en';
  });

  const [dynamicTranslations, setDynamicTranslations] = useState({});

  useEffect(() => {
    localStorage.setItem('surplix_lang', lang);
  }, [lang]);

  const t = (key) => {
    if (!key) return key;
    const lowerKey = typeof key === 'string' ? key.toLowerCase().trim() : key;
    
    // 1. Check static dictionary
    if (translations[lang] && translations[lang][key]) return translations[lang][key];
    if (translations[lang] && translations[lang][lowerKey]) return translations[lang][lowerKey];
    if (translations['en'] && translations['en'][key]) return translations['en'][key];
    
    // If English, return as-is
    if (lang === 'en') return key;

    // 2. Check dynamic cache
    const cacheKey = `${lang}_${lowerKey}`;
    if (dynamicTranslations[cacheKey] && dynamicTranslations[cacheKey] !== 'fetching...') {
       return dynamicTranslations[cacheKey];
    }

    // 3. Fetch dynamically if not in cache
    if (dynamicTranslations[cacheKey] === undefined && typeof window !== 'undefined') {
       // Mark as fetching immediately to prevent duplicate requests
       setDynamicTranslations(prev => ({ ...prev, [cacheKey]: 'fetching...' }));
       
       fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(key)}&langpair=en|${lang}`)
         .then(res => res.json())
         .then(data => {
            if (data && data.responseData && data.responseData.translatedText) {
               setDynamicTranslations(prev => ({ 
                  ...prev, 
                  [cacheKey]: data.responseData.translatedText 
               }));
            }
         })
         .catch(err => console.error("Dynamic translation error:", err));
    }

    return key; // Fallback to original English key while fetching
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
