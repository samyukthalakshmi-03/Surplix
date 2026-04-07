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

  const [filterType, setFilterType] = useState('All');
  const [allergenFilter, setAllergenFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Distance');

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
    return { ...item, distance: Number.MAX_VALUE };
  });

  const displayItems = processedItems
    .filter(item => item.status !== 'donated' && item.status !== 'sold_out' && item.availableServings > 0)
    .filter(item => filterType === 'All' || item.foodType === filterType)
    .filter(item => {
      if (allergenFilter === 'All') return true;
      const allergensStr = (item.allergens || '').toLowerCase();
      if (allergenFilter === 'Gluten-Free') return !allergensStr.includes('gluten');
      if (allergenFilter === 'Dairy-Free') return !allergensStr.includes('dairy') && !allergensStr.includes('lactose');
      if (allergenFilter === 'Nut-Free') return !allergensStr.includes('nut') && !allergensStr.includes('peanut');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Distance') return a.distance - b.distance;
      if (sortBy === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'Quantity') return b.availableServings - a.availableServings;
      if (sortBy === 'PriceLowHigh') return a.currentPrice - b.currentPrice;
      if (sortBy === 'PriceHighLow') return b.currentPrice - a.currentPrice;
      return 0;
    });

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-theme-cream">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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

      {/* Filter and Sort Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-theme-creamDark mb-10 flex flex-col md:flex-row gap-4 items-center justify-between flex-wrap">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="font-bold text-theme-dark whitespace-nowrap">Food Type:</label>
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="bg-theme-cream/50 border border-theme-creamDark px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-theme-green w-full md:w-40 font-medium"
            >
              <option value="All">All types</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-bold text-theme-dark whitespace-nowrap">Dietary Needs:</label>
            <select 
              value={allergenFilter} 
              onChange={e => setAllergenFilter(e.target.value)}
              className="bg-theme-cream/50 border border-theme-creamDark px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-theme-green w-full md:w-40 font-medium"
            >
              <option value="All">None (Show All)</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Dairy-Free">Dairy-Free</option>
              <option value="Nut-Free">Nut-Free</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="font-bold text-theme-dark whitespace-nowrap">Sort By:</label>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="bg-theme-cream/50 border border-theme-creamDark px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-theme-green w-full md:w-48 font-medium"
          >
            <option value="Distance">Nearest Distance</option>
            <option value="Newest">Newest First</option>
            <option value="Quantity">Highest Quantity</option>
            <option value="PriceLowHigh">Price: Low to High</option>
            <option value="PriceHighLow">Price: High to Low</option>
          </select>
        </div>
      </div>

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
