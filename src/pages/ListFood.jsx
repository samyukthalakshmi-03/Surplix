import React, { useState } from 'react';
import { usePricing } from '../context/PricingContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ListFood = () => {
  const { addItem } = usePricing();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const ObjectState = {
    name: '',
    location: '',
    totalServings: '',
    initialPrice: ''
  }
  const [formData, setFormData] = useState({ ...ObjectState });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (parseInt(formData.initialPrice) > 200) {
      setError(t('price_cap_error'));
      return;
    }
    setError('');

    const doSubmit = (lat, lng) => {
      addItem({
        name: formData.name,
        location: formData.location,
        totalServings: parseInt(formData.totalServings),
        availableServings: parseInt(formData.totalServings),
        initialPrice: parseInt(formData.initialPrice),
        lat: lat,
        lng: lng
      });
      navigate('/browse');
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          doSubmit(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Location error:", error);
          doSubmit(null, null); // fallback to central coords
        }
      );
    } else {
      doSubmit(null, null);
    }
  };

  return (
    <div className="pt-24 max-w-2xl mx-auto px-4 py-10 min-h-screen">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-theme-creamDark mt-10">
        <h1 className="text-3xl font-bold text-theme-dark mb-2">{t('list_food')}</h1>
        <p className="text-theme-dark/70 font-medium mb-8">{t('list_food_desc')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('food_name_label')}</label>
            <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder={t('food_name_placeholder')} />
          </div>
          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('location_label')}</label>
            <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder={t('location_placeholder')} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-theme-dark mb-2">{t('quantity_label')}</label>
              <input required type="number" className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" value={formData.totalServings} onChange={e => setFormData({ ...formData, totalServings: e.target.value })} placeholder={t('quantity_placeholder')} min="1" />
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-dark mb-2">{t('original_price_label')}</label>
              <input required type="number" className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" value={formData.initialPrice} onChange={e => setFormData({ ...formData, initialPrice: e.target.value })} placeholder={t('original_price_placeholder')} min="1" max="200" />
              <span className="text-xs text-theme-dark/60 font-medium mt-1 block">{t('price_cap_helper')}</span>
            </div>
          </div>
          
          {error && <p className="text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</p>}
          <button type="submit" className="w-full bg-theme-green text-white font-bold text-lg py-4 rounded-[20px] hover:bg-green-800 hover:shadow-lg transition-all mt-4">
            {t('list_food')}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ListFood;
