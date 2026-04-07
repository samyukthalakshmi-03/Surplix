import React, { useState, useEffect } from 'react';
import { usePricing } from '../context/PricingContext';
import { useLanguage } from '../context/LanguageContext';
import FoodCard from '../components/FoodCard';
import FoodDetails from '../components/FoodDetails';
import { getDistance } from '../utils/geo';

const BrowseFood = () => {
  const { items, handleInteract, handleClaim } = usePricing();
  const { t } = useLanguage();
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          setGeoError(true);
        }
      );
    } else {
      setGeoError(true);
    }
  }, []);

  const processedItems = items.map(item => {
    if (userLocation && item.lat && item.lng) {
      const dist = getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
      return { ...item, distance: dist };
    }
    return { ...item, distance: 0 };
  });

  const displayItems = userLocation 
    ? processedItems.filter(item => item.distance <= 10)
    : processedItems;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-theme-cream">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-theme-dark mb-2 tracking-tight">{t('browse')} 🍛</h1>
          <p className="text-theme-dark/70 text-lg font-medium">{t('browse_subtitle')}</p>
          {geoError && <p className="text-rose-500 text-sm mt-2 font-bold">{t('location_error')}</p>}
          {!userLocation && !geoError && <p className="text-theme-yellow font-bold text-sm mt-2">{t('location_calculating')}</p>}
        </div>
        <div className="text-left md:text-right">
          <div className="flex items-center md:justify-end gap-2 text-theme-green font-bold text-lg">
            <span className="glow-bolt text-2xl">⚡</span> {t('engine_active')}
          </div>
          <div className="text-sm text-theme-dark/60 mb-1 font-medium">{t('engine_desc')}</div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayItems.map(item => (
           <FoodCard 
              key={item.id} 
              item={item} 
              onInteract={handleInteract} 
              onClaim={handleClaim} 
              onOpenDetails={setSelectedItemId}
            />
        ))}
        {displayItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-theme-dark/60 text-lg bg-white rounded-[32px] border border-theme-creamDark shadow-sm">
            {t('no_listings')}
          </div>
        )}
      </main>

      {selectedItemId && (
        <FoodDetails 
          item={displayItems.find(item => item.id === selectedItemId)} 
          onClose={() => setSelectedItemId(null)}
          onInteract={handleInteract}
        />
      )}
    </div>
  );
};
export default BrowseFood;
