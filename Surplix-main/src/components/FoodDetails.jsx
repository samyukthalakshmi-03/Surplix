import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const FoodDetails = ({ item, onClose, onInteract }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

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
        className="bg-theme-cream rounded-[32px] p-8 max-w-lg w-full max-h-[90vh] shadow-2xl relative border-2 border-theme-creamDark overflow-y-auto hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/50 hover:bg-white text-theme-dark font-bold text-xl flex items-center justify-center transition-colors"
        >
          ×
        </button>

        <div className="mb-4 mt-2">
          {item.imageUrl && (
            <div className="mb-4">
              <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover rounded-[24px] shadow-sm border border-theme-creamDark" />
            </div>
          )}
          <h2 className="text-3xl font-bold text-theme-dark">{t(item.name)}</h2>
          <div className="mt-2 text-theme-dark/70 text-lg flex items-center justify-center gap-2 flex-wrap">
            <span>📍 {t(item.location)} {item.distance ? `• ${item.distance.toFixed(1)} ${t('distance_km')}` : ''}</span>
            {item.lat && item.lng && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm bg-theme-green/10 text-theme-green hover:bg-theme-green hover:text-white px-3 py-1 rounded-full transition-colors font-bold ml-1 flex items-center gap-1 shadow-sm"
              >
                <span>🗺️</span> Exact Location
              </a>
            )}
          </div>
        </div>

        <div className="bg-white/60 p-6 rounded-[24px] border border-theme-creamDark my-6 text-center">
          {item.currentPrice < item.initialPrice && (
            <p className="text-theme-dark/50 line-through font-medium mb-1">₹{item.initialPrice}</p>
          )}
          <p className="text-5xl font-extrabold text-theme-yellow price-glow">₹{item.currentPrice}</p>
        </div>

        {user && user.id && item.user_id === user.id && (item.totalServings - item.availableServings) > 0 && (
          <div className="bg-[#e8f5e9] border border-theme-green p-5 rounded-[24px] mb-6 shadow-sm">
            <h3 className="font-extrabold text-theme-dark mb-4 border-b border-theme-mint/20 pb-3">📦 Order History</h3>
            <ul className="space-y-4">
              {(() => {
                const globalClaims = JSON.parse(localStorage.getItem('surplix_claims') || '[]');
                const relatedClaims = globalClaims.filter(c => c.itemId === item.id);
                const loops = Math.max(item.totalServings - item.availableServings, relatedClaims.length);
                
                return [...Array(loops)].map((_, i) => {
                  const claimInfo = relatedClaims[i] || { buyerName: 'Community Member', qty: 1, price: item.currentPrice };
                  return (
                    <li key={i} className="flex justify-between items-center text-sm bg-white/50 p-3 rounded-xl border border-theme-green/10">
                      <div>
                        <strong className="text-theme-dark block text-base leading-tight mb-0.5">Bought by <span className="text-theme-green">{claimInfo.buyerName}</span></strong>
                        <span className="text-theme-dark/80 text-[11px] font-extrabold uppercase tracking-wide bg-theme-creamDark/50 px-2 py-0.5 rounded-md inline-block">Surplix Community Member</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-theme-green block text-base font-extrabold">₹{claimInfo.price}</strong>
                        <span className="text-theme-dark/60 text-xs font-medium">{claimInfo.qty} serving(s)</span>
                      </div>
                    </li>
                  )
                });
              })()}
            </ul>
          </div>
        )}

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
