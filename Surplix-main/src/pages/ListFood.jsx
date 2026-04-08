import React, { useState, useEffect, useRef } from 'react';
import { usePricing } from '../context/PricingContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ListFood = () => {
  const { addItem } = usePricing();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const ObjectState = {
    name: '',
    location: '',
    totalServings: '',
    initialPrice: '',
    preparedBefore: '',
    foodType: 'Veg',
    allergens: '',
    lat: null,
    lng: null
  }
  const [formData, setFormData] = useState({ ...ObjectState });
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!showMap || !mapRef.current) return;
    
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([formData.lat || 12.9716, formData.lng || 77.5946], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      if (formData.lat && formData.lng) {
        markerRef.current = L.marker([formData.lat, formData.lng]).addTo(mapInstanceRef.current);
      }

      // Fix for Leaflet conditional rendering width/height race condition (grey tiles)
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      mapInstanceRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        if (markerRef.current) {
           markerRef.current.setLatLng([lat, lng]);
        } else {
           markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
        }

        // Show immediate visual feedback
        setFormData(prev => ({ ...prev, location: 'Fetching address...', lat, lng }));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}`);
          const data = await res.json();
          const cityName = data.address?.neighbourhood || data.address?.suburb || data.address?.village || data.address?.town || data.address?.city || data.name || 'Selected Map Location';
          setFormData(prev => ({ ...prev, location: cityName, lat, lng }));
        } catch (err) {
          setFormData(prev => ({ ...prev, location: 'Selected Map Location', lat, lng }));
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap]);

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}`);
            const data = await res.json();
            const cityName = data.address?.neighbourhood || data.address?.suburb || data.address?.village || data.address?.town || data.address?.city || data.name || 'Current Location';
            setFormData(prev => ({ ...prev, location: cityName, lat, lng }));
          } catch (err) {
            console.error("Geocoding failed:", err);
            setFormData(prev => ({ ...prev, lat, lng }));
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.error("Location error:", err);
          setIsLocating(false);
          alert("Could not acquire location. Please input manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (parseInt(formData.initialPrice) > 200) {
      setError(t('price_cap_error'));
      return;
    }
    setError('');

    addItem({
      name: formData.name,
      location: formData.location,
      totalServings: parseInt(formData.totalServings),
      availableServings: parseInt(formData.totalServings),
      initialPrice: parseInt(formData.initialPrice),
      preparedBefore: formData.preparedBefore,
      foodType: formData.foodType,
      allergens: formData.allergens,
      lat: formData.lat || null,
      lng: formData.lng || null,
      imageUrl: formData.imageBase64 || (imageFile ? URL.createObjectURL(imageFile) : null)
    });
    navigate('/browse');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    setIsCheckingImage(true);
    setAiAnalysis(null);
    setError('');

    // Convert to base64 for persistent local display
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData((prev) => ({ ...prev, imageBase64: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      setAiAnalysis(data);
      if (data.spoiled) {
         setError('Warning: Our AI detected that this food might be spoiled. Please do not list spoiled food.');
      }
    } catch (err) {
      console.error('AI Check failed:', err);
    } finally {
      setIsCheckingImage(false);
    }
  };

  return (
    <div className="pt-24 max-w-2xl mx-auto px-4 py-10 min-h-screen">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-theme-creamDark mt-10">
        <h1 className="text-3xl font-bold text-theme-dark mb-2">{t('list_food')}</h1>
        <p className="text-theme-dark/70 font-medium mb-8">{t('list_food_desc')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('upload_photo_label')}</label>
            <input 
              type="file" 
              accept="image/*" 
              className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" 
              onChange={handleImageUpload} 
            />
            {isCheckingImage && <p className="text-theme-dark/70 text-sm mt-2 font-medium">{t('ai_checking')}</p>}
            {aiAnalysis && (
              <div className={`mt-3 p-4 rounded-xl border ${aiAnalysis.spoiled ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                {aiAnalysis.spoiled ? (
                    <div>
                      <p className="font-bold text-red-700 text-base mb-2">
                        ⚠️ AI Analysis: This food appears to be spoiled or rotting!
                      </p>
                      <p className="text-sm text-red-600 mb-4 font-medium">For health and safety reasons, spoiled food cannot be listed on the main marketplace for human consumption.</p>
                      <button 
                        type="button"
                        onClick={() => navigate('/farms')} 
                        className="bg-orange-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center gap-2 w-full"
                      >
                        <span className="text-lg">🚜</span> Sell/Donate to Animal Farms Instead
                      </button>
                    </div>
                ) : (
                    <p className="font-bold text-sm text-green-700">
                      ✅ AI Analysis: This food looks fresh and safe!
                    </p>
                )}
              </div>
            )}
            {imageFile && (
              <div className="mt-4">
                <img src={URL.createObjectURL(imageFile)} alt="Food preview" className="w-full max-h-64 object-cover rounded-[20px] shadow-sm border border-theme-creamDark" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('food_name_label')}</label>
            <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder={t('food_name_placeholder')} />
          </div>
          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('location_label')}</label>
            
            <div className="flex flex-col gap-3 mb-4">
              <div 
                onClick={handleUseCurrentLocation}
                className="w-full px-5 py-4 bg-white border border-theme-creamDark rounded-[20px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 text-theme-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                  </svg>
                  <span className="font-bold text-[17px] leading-tight">{isLocating ? 'Detecting...' : 'Use current location'}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>

              <div 
                onClick={() => setShowMap(!showMap)}
                className="w-full px-5 py-4 bg-white border border-theme-creamDark rounded-[20px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 text-theme-dark/70">
                  <span className="text-xl">🗺️</span>
                  <span className="font-bold text-[17px] leading-tight">{showMap ? 'Hide map' : 'Choose on map'}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showMap ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>

            <input required type="text" className="w-full px-4 py-3 bg-white rounded-[20px] border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder={t('location_placeholder') + ' (or manual)'} />

            {showMap && (
              <div className="mt-4 h-[300px] w-full rounded-[24px] overflow-hidden shadow-sm border border-theme-creamDark relative z-0">
                <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('prepared_time_label')}</label>
            <input required type="text" className="w-full px-4 py-3 rounded-[20px] shadow-sm border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-white" value={formData.preparedBefore} onChange={e => setFormData({ ...formData, preparedBefore: e.target.value })} placeholder={t('prepared_time_placeholder')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-bold text-theme-dark mb-2">{t('food_type_label')}</label>
              <select className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" value={formData.foodType} onChange={e => setFormData({ ...formData, foodType: e.target.value })}>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-theme-dark mb-2">{t('allergens_label')}</label>
              <select className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30" value={formData.allergens} onChange={e => setFormData({ ...formData, allergens: e.target.value })}>
                <option value="">None (Safe for most)</option>
                <option value="Contains Gluten">Contains Gluten</option>
                <option value="Contains Dairy">Contains Dairy / Lactose</option>
                <option value="Contains Nuts">Contains Nuts</option>
                <option value="Contains Gluten, Dairy">Contains Gluten & Dairy</option>
              </select>
            </div>
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
