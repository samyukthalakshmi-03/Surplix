import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const FoodCard = ({ item, onInteract, onClaim, onOpenDetails, isDashboardMode = false }) => {
  const [prevPrice, setPrevPrice] = useState(item.currentPrice);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isClaimMode, setIsClaimMode] = useState(false);
  const [claimQty, setClaimQty] = useState(1);
  const cardRef = useRef(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (item.currentPrice !== prevPrice) {
      if (item.currentPrice < prevPrice) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 800);
      }
      setPrevPrice(item.currentPrice);
    }
  }, [item.currentPrice, prevPrice]);

  const engagementScore = item.views + (item.interested * 5);
  const isHighDemand = engagementScore > 30;
  const isLowInterest = engagementScore < 10 && item.currentPrice < item.initialPrice;
  const isDonated = item.status === 'donated';
  const isOutsideRadius = item.distance && item.distance > 10;

  return (
    <div 
      className="bg-theme-lightGreen rounded-[32px] p-6 shadow-sm border border-green-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col relative cursor-pointer" 
      ref={cardRef} 
      onClick={() => {
        if (onOpenDetails) onOpenDetails(item.id);
      }}
    >


      {item.imageUrl && (
        <div className="mb-3 -mx-2 -mt-2">
          <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-[24px] shadow-sm border border-green-200/50" />
        </div>
      )}

      <div className="flex justify-between items-start mb-2 mt-4">
        <div>
          <h3 className="text-2xl font-bold text-theme-dark">{t(item.name)}</h3>
          {item.foodType && (
            <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded ${item.foodType === 'Veg' ? 'bg-green-100 text-green-700' : item.foodType === 'Vegan' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {item.foodType}
            </span>
          )}
          {item.preparedBefore && (
            <span className="inline-block mt-1 ml-2 text-xs font-medium text-theme-dark/60 bg-gray-100 px-2 py-0.5 rounded">
              ⏱ {item.preparedBefore}
            </span>
          )}
          <div className="flex items-center mt-2 text-sm text-theme-dark/70 flex-wrap gap-2">
             <span>📍 {t(item.location)} {item.distance ? `• ${item.distance.toFixed(1)} ${t('distance_km')}` : ''}</span>
             {item.lat && item.lng && (
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold bg-blue-50 px-2 py-0.5 rounded-full"
               >
                 🗺 View exact on Maps
               </a>
             )}
          </div>
        </div>
      </div>

      <div className="text-center my-6 bg-white/60 py-8 rounded-[24px] border border-theme-creamDark relative overflow-hidden backdrop-blur-sm">
        {item.currentPrice < item.initialPrice && (
          <span className="block text-theme-dark/40 line-through font-medium mb-1 tracking-wide">
            ₹{item.initialPrice}
          </span>
        )}
        <div className={`text-5xl font-extrabold flex items-center justify-center gap-2 transition-all duration-500 ${isPulsing ? 'price-decrease' : 'text-theme-yellow price-glow'}`}>
          ₹{item.currentPrice}
          <span className={`text-theme-orange text-3xl transition-opacity duration-300 ${isPulsing ? 'opacity-100' : 'opacity-0'}`}>↓</span>
        </div>
        
        <div className="mt-4 h-6">
          {isDonated ? (
            <span className="inline-block bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
              🤝 {t('donated_to_ngo')} ({item.ngo?.name === 'Local Food Bank' ? t('local_food_bank') : item.ngo?.name})
            </span>
          ) : isLowInterest ? (
            <span className="inline-block bg-orange-50 text-theme-orange border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
              {t('low_interest')}
            </span>
          ) : isHighDemand ? (
            <span className="inline-block bg-theme-lightGreen text-theme-green border border-green-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
              {t('high_demand')}
            </span>
          ) : (
            <span className="inline-block bg-theme-cream text-theme-dark/60 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
              {t('monitoring')}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-8 mb-8 text-theme-dark/60 font-semibold text-sm">
        <div className="flex items-center gap-1">👁 {item.views}</div>
        <div className="flex items-center gap-1">❤️ {item.interested}</div>
        <div className="flex items-center gap-1">🍽️ {item.availableServings}/{item.totalServings}</div>
      </div>

      {isDashboardMode ? (
        <button 
          className="w-full bg-theme-dark text-white font-bold text-lg py-4 rounded-[20px] transition-all hover:-translate-y-1 hover:shadow-lg"
          onClick={(e) => {
             e.stopPropagation();
             if (onOpenDetails) onOpenDetails(item.id);
          }}
        >
          ⚙️ Manage Listing
        </button>
      ) : !isClaimMode ? (
        <button 
          className="w-full bg-theme-green text-white font-bold text-lg py-4 rounded-[20px] transition-all hover:-translate-y-1 hover:shadow-lg disabled:bg-theme-creamDark disabled:text-theme-dark/40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          onClick={(e) => {
            e.stopPropagation();
            setIsClaimMode(true);
            setClaimQty(1);
            onInteract(item.id, 'interest');
          }}
          disabled={item.availableServings === 0 || isDonated || isOutsideRadius}
        >
          {item.availableServings === 0 ? t('sold_out') : isDonated ? t('donated_to_ngo') : isOutsideRadius ? t('outside_radius') : `🚀 ${t('claim')} (₹${item.currentPrice})`}
        </button>
      ) : (
        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-theme-green outline-none" onClick={e => e.stopPropagation()}>
          <label className="block text-sm font-bold text-theme-dark mb-2 text-center">Select Quantity</label>
          <div className="flex justify-center items-center gap-4 mb-4">
            <button 
              className="w-10 h-10 rounded-full bg-theme-cream/80 text-theme-dark font-bold text-xl hover:bg-theme-green hover:text-white transition-colors"
              onClick={() => setClaimQty(Math.max(1, claimQty - 1))}
            >-</button>
            <span className="text-2xl font-bold text-theme-dark w-12 text-center">{claimQty}</span>
            <button 
              className="w-10 h-10 rounded-full bg-theme-cream/80 text-theme-dark font-bold text-xl hover:bg-theme-green hover:text-white transition-colors"
              onClick={() => setClaimQty(Math.min(item.availableServings, claimQty + 1))}
            >+</button>
          </div>
          <p className="text-center text-xs text-theme-dark/60 font-bold mb-3">Available: {item.availableServings}</p>
          <div className="flex gap-2">
            <button 
              className="w-1/3 bg-gray-100 text-theme-dark/70 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
              onClick={() => setIsClaimMode(false)}
            >Cancel</button>
            <button 
              className="w-2/3 bg-theme-green text-white font-bold py-3 rounded-2xl hover:bg-green-800 transition-colors shadow-sm whitespace-nowrap"
              onClick={async () => {
                const claimDetails = await onClaim(item.id, claimQty);
                setIsClaimMode(false);
                if (claimDetails) {
                   alert(`✅ Claim Confirmed!\n\nYou claimed ${claimQty}x ${item.name} for ₹${item.currentPrice * claimQty}.\n\n📍 Pickup at: ${item.location}\n🕒 Time Window: ${claimDetails.pickupWindow}\n📞 Contact: ${claimDetails.contact}`);
                }
              }}
            >Confirm • ₹{item.currentPrice * claimQty}</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default FoodCard;
