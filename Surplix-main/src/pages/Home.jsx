import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { usePricing } from '../context/PricingContext';
import { useLanguage } from '../context/LanguageContext';
import L from 'leaflet';

let DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Home = () => {
  const { items } = usePricing();
  const { t } = useLanguage();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize pure map instance only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([12.9716, 77.5946], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Clear old markers when items array changes (so it doesn't duplicate)
    markersGroupRef.current.clearLayers();

    const boundCoordinates = [];

    const visibleItems = items.filter(item => item.status === 'available');

    visibleItems.forEach(item => {
      if (item.lat && item.lng) {
        const isSoldOut = item.availableServings === 0 || item.status === 'donated';
        const buttonHtml = isSoldOut 
          ? `<div style="background-color: #d1c8b3; color: #3d2616; padding: 6px 12px; border-radius: 999px; text-align: center; font-weight: bold; font-size: 0.9rem;">${t('sold_out')}</div>`
          : `<a href="/browse" style="display: block; background-color: #2e7d32; color: #ffffff; padding: 6px 12px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 0.9rem; text-align: center;">🚀 ${t('claim')}</a>`;

        L.marker([item.lat, item.lng]).addTo(markersGroupRef.current)
         .bindPopup(`
           <div style="text-align: center; font-family: sans-serif; min-width: 150px; padding: 5px;">
             <h3 style="font-weight: bold; font-size: 1.1rem; color: #1f2937; margin: 0 0 5px 0;">${item.name}</h3>
             <p style="font-size: 0.8rem; color: #4b5563; margin: 0 0 10px 0;">📍 ${item.location}</p>
             <p style="color: #2e7d32; font-weight: 800; font-size: 1.5rem; margin: 0 0 15px 0;">₹${item.currentPrice}</p>
             ${buttonHtml}
           </div>
         `);
        boundCoordinates.push([item.lat, item.lng]);
      }
    });

    const mockNGOs = [
      { name: "Akshaya Patra Foundation", location: "Vasanth Nagar, Bengaluru", lat: 12.9830, lng: 77.5925, desc: "Large scale food distribution NGO" },
      { name: "Feeding India - South", location: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245, desc: "Surplus food redistribution" },
      { name: "Robin Hood Army Area 4", location: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408, desc: "Volunteer based food delivery" },
      { name: "Local Food Bank", location: "Jayanagar, Bengaluru", lat: 12.9299, lng: 77.5834, desc: "Community food storage and sharing" },
      { name: "Snehadeep Trust", location: "Frazer Town, Bengaluru", lat: 12.9968, lng: 77.6130, desc: "Welfare for the visually impaired and disabled" },
      { name: "Goonj Drop Centre", location: "HSR Layout, Bengaluru", lat: 12.9121, lng: 77.6446, desc: "Disaster relief and community development" },
      { name: "Sparsha Trust", location: "Banashankari, Bengaluru", lat: 12.9175, lng: 77.5562, desc: "Child rights and education focus" },
      { name: "Mitra Foundation", location: "Malleswaram, Bengaluru", lat: 13.0031, lng: 77.5643, desc: "Elderly care and meal support" },
      { name: "Seva Foundation", location: "Rajajinagar, Bengaluru", lat: 12.9881, lng: 77.5549, desc: "Community food sharing" },
      { name: "Raksha NGO", location: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7499, desc: "Food distribution for daily wage workers" }
    ];

    const ngoIcon = L.divIcon({
      className: 'bg-transparent',
      html: '<div style="background-color: #3b82f6; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; font-size: 18px;">🤝</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    mockNGOs.forEach(ngo => {
      L.marker([ngo.lat, ngo.lng], { icon: ngoIcon }).addTo(markersGroupRef.current)
       .bindPopup(`
         <div style="text-align: center; font-family: sans-serif; min-width: 180px; padding: 5px;">
           <div style="background-color: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.7rem; display: inline-block; margin-bottom: 8px;">VERIFIED NGO</div>
           <h3 style="font-weight: bold; font-size: 1.1rem; color: #1f2937; margin: 0 0 5px 0;">${ngo.name}</h3>
           <p style="font-size: 0.8rem; color: #4b5563; margin: 0 0 8px 0;">📍 ${ngo.location}</p>
           <p style="font-size: 0.85rem; color: #111827; margin: 0 0 10px 0; font-weight: 500;">${ngo.desc}</p>
           <a href="mailto:contact@${ngo.name.replace(/\s+/g, '').toLowerCase()}.org" style="display: block; background-color: #3b82f6; color: #ffffff; padding: 6px 12px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 0.9rem; text-align: center;">Donate Surplus Directly</a>
         </div>
       `);
      boundCoordinates.push([ngo.lat, ngo.lng]);
    });

    // Auto fit map bounds if we have at least one valid coordinate
    if (boundCoordinates.length > 0) {
      const bounds = L.latLngBounds(boundCoordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if ("geolocation" in navigator) {
      // Fallback to user location if empty
      navigator.geolocation.getCurrentPosition((position) => {
        if (mapInstanceRef.current) {
           mapInstanceRef.current.setView([position.coords.latitude, position.coords.longitude], 12);
        }
      });
    }

    // Cleanup happens on unmount
    return () => {
      // We don't remove mapInstanceRef.current here so we can reuse it during the component lifecycle
    };
  }, [items, t]);

  return (
    <div className="pt-24 min-h-screen bg-theme-cream flex flex-col items-center text-theme-dark overflow-x-hidden">
      
      {/* Hero Section Container */}
      <section className="w-full relative py-32 md:py-40 text-center flex flex-col items-center z-10 border-b border-theme-creamDark mx-auto">
        <div 
          className="absolute inset-0 z-[-5] bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: 'url("/hero-bg.png")' }}
        ></div>
        <div className="absolute inset-0 z-[-4] bg-stone-900/40"></div>
        <div className="absolute inset-0 z-[-3] bg-gradient-to-br from-theme-cream/30 to-theme-green/20 mix-blend-overlay"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-[900px] h-[130%] md:h-[600px] bg-theme-cream/85 blur-[90px] z-[-2] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] md:w-[600px] h-[80%] md:h-[400px] bg-theme-yellow/30 blur-[60px] z-[-1] rounded-full pointer-events-none"></div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight relative z-10 px-4">
          {t('hero_title')}
        </h1>
        <p className="mt-6 text-xl text-theme-dark/90 max-w-2xl px-4 font-medium whitespace-pre-wrap relative z-10">
          {t('hero_subtitle')}
        </p>
        <div className="mt-10 flex gap-4 relative z-10 px-4">
          <Link to="/browse" className="bg-theme-green text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-800 hover:shadow-xl transition-all shadow-md">
            {t('browse')}
          </Link>
          <Link to="/list" className="bg-white text-theme-green px-8 py-4 rounded-full font-bold text-lg border border-theme-creamDark hover:border-theme-green hover:shadow-xl transition-all shadow-md">
            {t('list_food')}
          </Link>
        </div>
      </section>

      {/* Map Interactive Section */}
      <section className="w-full py-20 bg-[#efebe1]/50 border-b border-theme-creamDark">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <h2 className="text-3xl font-extrabold mb-10 text-center">{t('map_title')} 🗺️</h2>
          <div className="h-[500px] w-full rounded-[32px] overflow-hidden shadow-lg border-2 border-theme-green/20 relative z-0 bg-white">
            <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
          </div>
        </div>
      </section>

      {/* How it Works block */}
      <section className="max-w-7xl mx-auto py-24 px-4 w-full text-center">
        <h2 className="text-3xl font-extrabold mb-16">{t('how_it_works')}</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-theme-lightGreen text-theme-green rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">🥘</div>
            <h3 className="text-xl font-bold mb-2">{t('upload_surplus')}</h3>
            <p className="text-theme-dark/70">{t('upload_desc')}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-orange-50 text-theme-orange rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">✨</div>
            <h3 className="text-xl font-bold mb-2">{t('smart_pricing')}</h3>
            <p className="text-theme-dark/70">{t('smart_desc')}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-yellow-50 text-theme-yellow rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">🤝</div>
            <h3 className="text-xl font-bold mb-2">{t('community_claims')}</h3>
            <p className="text-theme-dark/70">{t('community_desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
