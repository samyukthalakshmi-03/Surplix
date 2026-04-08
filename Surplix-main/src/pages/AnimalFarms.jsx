import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_FARMS_DATA = [
  { id: 101, name: "MUTTA KOZHI FARMS", location: "Registered NGO Location", types: "Donations / Scraps", contact: "+91 9876543210 (Demo Contact)", desc: "A registered NGO organization on our platform ready to distribute or recycle received food." },
  { id: 1, name: "Green Pastures Pig Farm", location: "Rural Karnataka, 45km away", types: "Pigs", contact: "+91 9876543201", desc: "Accepts vegetable peels and safe cooked leftovers." },
  { id: 2, name: "Happy Herd Dairy", location: "Nelamangala Highway", types: "Cows & Buffaloes", contact: "+91 9876543202", desc: "Looking for fresh produce scraps (no meat)." },
  { id: 3, name: "Cluckington Poultry", location: "East Bangalore Outskirts", types: "Chickens", contact: "+91 9876543203", desc: "Accepts grain, rice, and bread waste." },
  { id: 4, name: "Eco-Roots Composting Hub", location: "Whitefield, Zone B", types: "Soil/Compost", contact: "+91 9876543204", desc: "We take highly spoiled plant matter for our industrial composting worm bins." },
];

const AnimalFarms = () => {
    const { t } = useLanguage();
    const [farmsData, setFarmsData] = useState(INITIAL_FARMS_DATA);

    useEffect(() => {
        const registeredFarms = JSON.parse(localStorage.getItem('surplix_registered_farms') || '[]');
        if (registeredFarms.length > 0) {
            setFarmsData(prevFarms => [...prevFarms, ...registeredFarms]);
        }
    }, []);

    return (
        <div className="pt-24 max-w-7xl mx-auto px-4 pb-12 min-h-screen bg-theme-cream font-sans">
            <h1 className="text-4xl font-extrabold text-theme-dark mb-2 tracking-tight">Agricultural Recycling & NGOs 🚜</h1>
            <p className="text-theme-dark/70 text-lg font-medium mb-10 max-w-3xl">
                Has your food gone bad? Don't throw it in the landfill! Local animal farms, composting centers, and NGOs happily take spoiled veggies and leftovers to safely feed animals or create fertilizer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {farmsData.map(farm => (
                    <div key={farm.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-theme-creamDark hover:-translate-y-1 transition-transform">
                        <div className="bg-orange-100 text-orange-800 text-xs font-extrabold inline-block px-3 py-1.5 rounded-full mb-4 border border-orange-200 shadow-sm uppercase tracking-wider">
                           Accepts {farm.types} Feed
                        </div>
                        <h3 className="text-2xl font-bold text-theme-dark mb-1">{farm.name}</h3>
                        <p className="text-theme-dark/60 font-medium text-sm mb-4">📍 {farm.location}</p>
                        
                        <p className="text-sm text-theme-dark bg-theme-cream/40 p-4 rounded-xl border border-theme-creamDark mb-6 leading-relaxed font-medium">
                           {farm.desc}
                        </p>
                        
                        <button className="w-full bg-theme-green text-white font-bold py-3.5 rounded-[20px] text-sm flex items-center justify-center gap-2 hover:bg-green-800 transition-colors shadow-sm">
                           <span className="text-lg">📞</span> Call {farm.contact}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 bg-theme-mint/20 border border-theme-mint p-6 rounded-3xl max-w-3xl">
               <h4 className="font-extrabold text-theme-dark mb-2 text-lg">⚠️ Critical Notice for Donors:</h4>
               <p className="text-sm text-theme-dark/70 font-medium leading-relaxed">
                   Please ensure there is absolutely no plastic, glass, wrappers, or harmful household chemicals mixed into your organic food waste before handing it over to farmers. What is just trash to you is an actual meal for these animals — plastic can be deadly!
               </p>
            </div>
        </div>
    );
};
export default AnimalFarms;
