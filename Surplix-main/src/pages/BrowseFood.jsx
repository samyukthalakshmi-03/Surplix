import React, { useState, useEffect } from 'react';
import { usePricing } from '../context/PricingContext';
import { useLanguage } from '../context/LanguageContext';
import FoodCard from '../components/FoodCard';
import FoodDetails from '../components/FoodDetails';
import { getDistance } from '../utils/geo';
import { useAuth } from '../context/AuthContext';

const BrowseFood = () => {
  const { items, handleInteract, handleClaim, activeClaims, markClaimCollected, deleteItem } = usePricing();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [filterType, setFilterType] = useState('All');
  const [allergenFilter, setAllergenFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Distance');
  const [selectedRadius, setSelectedRadius] = useState(() => {
    return Number(localStorage.getItem('radius')) || 5;
  });

  useEffect(() => {
    localStorage.setItem('radius', selectedRadius);
  }, [selectedRadius]);

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

  const sellerOrders = processedItems.filter(
    item => user && user.id && item.user_id === user.id && item.totalServings > item.availableServings
  );

  const displayItems = processedItems
    .filter(item => {
      if (user && user.id && item.user_id === user.id) return false;
      return item.status === 'available' && item.availableServings > 0;
    })
    .filter(item => {
      if (!userLocation) return true;
      return item.distance <= selectedRadius;
    })
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

      {/* Seller Orders Banner */}
      {sellerOrders.length > 0 && (
        <div className="bg-[#e8f5e9] border-2 border-theme-green/30 px-6 py-5 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="shrink-0">
            <h3 className="font-extrabold text-2xl text-theme-dark mb-1">🔔 Your Food Was Claimed!</h3>
            <p className="font-medium text-theme-dark/70 text-lg">Please prepare these items for pickup.</p>
          </div>
          <div className="flex gap-4 overflow-x-auto w-full pb-2 md:pb-0 snap-x hide-scrollbar">
             {sellerOrders.map(order => {
                const orderClaims = activeClaims?.filter(c => c.itemId === order.id) || [];
                const lastBuyer = orderClaims.length > 0 ? orderClaims[orderClaims.length - 1].buyerName : "Community Member";
                
                return (
                  <div key={order.id} className="bg-white border border-theme-green/20 px-5 py-4 rounded-2xl min-w-[220px] shadow-sm shrink-0 snap-center">
                      <div className="bg-theme-yellow/20 text-yellow-800 text-xs font-bold inline-block px-2 py-1 rounded-lg mb-2">
                         Claimed by: {lastBuyer}
                      </div>
                    <p className="font-extrabold text-xl text-theme-dark mb-1">
                       <span className="text-theme-green">{order.totalServings - order.availableServings}x</span> {order.name}
                    </p>
                    <p className="text-sm text-theme-dark/60 font-medium">📍 {order.location}</p>
                    <button 
                      onClick={() => deleteItem(order.id)}
                      className="mt-3 w-full bg-theme-green/10 text-theme-green text-xs font-bold py-2 rounded-xl hover:bg-theme-green hover:text-white transition-all"
                    >
                       Done • Clear
                    </button>
                </div>
                )
             })}
          </div>
        </div>
      )}

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
              <option value="All">{t('show_all') || 'All types'}</option>
              <option value="Veg">{t('Veg') || 'Veg'}</option>
              <option value="Non-Veg">{t('Non-Veg') || 'Non-Veg'}</option>
              <option value="Vegan">{t('Vegan') || 'Vegan'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-bold text-theme-dark whitespace-nowrap">{t('dietary_needs_label')}</label>
            <select 
              value={allergenFilter} 
              onChange={e => setAllergenFilter(e.target.value)}
              className="bg-theme-cream/50 border border-theme-creamDark px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-theme-green w-full md:w-40 font-medium"
            >
              <option value="All">{t('show_all')}</option>
              <option value="Gluten-Free">{t('gluten_free')}</option>
              <option value="Dairy-Free">{t('dairy_free')}</option>
              <option value="Nut-Free">{t('nut_free')}</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-white border border-theme-creamDark px-3 py-1.5 rounded-xl">
            <label className="font-bold text-theme-dark whitespace-nowrap">{t('radius_label')}</label>
            <input 
              type="range" 
              min="2" max="15" step="1" 
              value={selectedRadius}
              onChange={e => setSelectedRadius(Number(e.target.value))}
              className="w-24 md:w-32 h-1.5 bg-theme-creamDark rounded-lg appearance-none cursor-pointer accent-theme-green"
              title={`Showing food within ${selectedRadius} km`}
            />
            <span className="font-bold text-theme-green text-sm min-w-[45px] text-right">{selectedRadius} km</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <span className="text-theme-dark/70 text-sm font-bold hidden xl:inline-block bg-theme-cream/50 px-3 py-1.5 rounded-xl border border-theme-creamDark">
            Showing food within {selectedRadius} km
          </span>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="font-bold text-theme-dark whitespace-nowrap">{t('sort_by_label')}</label>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="bg-theme-cream/50 border border-theme-creamDark px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-theme-green w-full md:w-48 font-medium"
          >
            <option value="Distance">{t('nearest_distance')}</option>
            <option value="Newest">{t('newest_first')}</option>
            <option value="Quantity">{t('highest_quantity')}</option>
            <option value="PriceLowHigh">{t('price_low_high')}</option>
            <option value="PriceHighLow">{t('price_high_low')}</option>
          </select>
        </div>
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
            {t('no_listings').replace('10', selectedRadius)}
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

      {/* Active Claims Banner */}
      {activeClaims?.filter(c => c.status === 'Pending Pickup').length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-theme-creamDark p-4 md:p-6 z-[100] pb-8 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xl font-bold text-theme-dark mb-4">🛒 Active Pickups ({activeClaims.filter(c => c.status === 'Pending Pickup').length})</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
              {activeClaims.filter(c => c.status === 'Pending Pickup').map(claim => (
                <div key={claim.id} className="min-w-[300px] bg-theme-cream/40 border border-theme-creamDark rounded-[24px] p-5 snap-center shrink-0 shadow-sm relative transition-all">
                  <div className="absolute top-4 right-4 bg-theme-yellow/20 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold border border-yellow-200">
                    {claim.status}
                  </div>
                  <h4 className="font-extrabold text-xl text-theme-dark mb-1">{claim.qty}x {claim.name}</h4>
                  <div className="text-sm text-theme-dark/80 mb-4 space-y-1.5">
                    <p className="flex items-center gap-2"><span>📍</span> <span className="font-medium">{claim.location}</span></p>
                    <p className="flex items-center gap-2"><span>🕒</span> <span className="font-medium">{claim.pickupWindow}</span></p>
                    <p className="flex items-center gap-2"><span>📞</span> <span className="font-medium">{claim.contact}</span></p>
                  </div>
                  <button 
                    onClick={() => markClaimCollected(claim.id)} 
                    className="w-full bg-theme-dark text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-gray-800 transition-all hover:shadow-lg"
                  >
                    Mark as Collected ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BrowseFood;
