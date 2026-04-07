import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const FoodDetails = ({ item, onClose, onInteract }) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (!item) return;

    const key = `viewed_${item.id}`;
    const alreadyViewed = localStorage.getItem(key);

    if (!alreadyViewed) {
      if (onInteract) {
        onInteract(item.id, 'view');
      }
      localStorage.setItem(key, "true");
    }
  }, [item, onInteract]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-theme-cream rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative border-2 border-theme-creamDark overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/50 hover:bg-white text-theme-dark font-bold text-xl flex items-center justify-center transition-colors"
        >
          ×
        </button>

        <div className="mb-4 mt-2">
          <span className="inline-block bg-white text-theme-green px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-theme-creamDark mb-4">
            {t('freshly_cooked')}
          </span>
          <h2 className="text-3xl font-bold text-theme-dark">{t(item.name)}</h2>
          <p className="mt-2 text-theme-dark/70 text-lg">
            📍 {t(item.location)} {item.distance ? `• ${item.distance.toFixed(1)} ${t('distance_km')}` : ''}
          </p>
        </div>

        <div className="bg-white/60 p-6 rounded-[24px] border border-theme-creamDark my-6 text-center">
          {item.currentPrice < item.initialPrice && (
            <p className="text-theme-dark/50 line-through font-medium mb-1">₹{item.initialPrice}</p>
          )}
          <p className="text-5xl font-extrabold text-theme-yellow price-glow">₹{item.currentPrice}</p>
        </div>

        <div className="bg-white p-4 rounded-[20px] mb-6 flex flex-col gap-2 shadow-sm border border-theme-creamDark">
          {item.foodType && <p className="text-sm"><strong>Food Type:</strong> {item.foodType}</p>}
          {item.preparedBefore && <p className="text-sm"><strong>Prepared Time:</strong> {item.preparedBefore}</p>}
          {item.allergens && <p className="text-sm"><strong>Allergens:</strong> {item.allergens}</p>}
        </div>

        <div className="flex justify-around items-center bg-white p-4 rounded-[20px] shadow-sm mb-6">
          <div className="text-center">
            <div className="text-sm text-theme-dark/60 font-semibold mb-1">Views</div>
            <div className="font-bold text-lg">👁 {item.views}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-theme-dark/60 font-semibold mb-1">Interests</div>
            <div className="font-bold text-lg">❤️ {item.interested}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-theme-dark/60 font-semibold mb-1">Servings</div>
            <div className="font-bold text-lg">🍽️ {item.availableServings}/{item.totalServings}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FoodDetails;
