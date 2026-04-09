import React, { useState } from 'react';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FoodCard from '../components/FoodCard';
import FoodDetails from '../components/FoodDetails';
import { Link } from 'react-router-dom';

const MyListings = () => {
    const { items, stats, handleInteract, handleClaim } = usePricing();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [selectedItemId, setSelectedItemId] = useState(null);

    if (!user) {
        return (
            <div className="pt-32 text-center h-screen bg-theme-cream px-4 flex flex-col items-center">
                <h1 className="text-3xl font-extrabold mb-4">{t('my_listings') || 'My Listings'}</h1>
                <p className="text-theme-dark/70 text-lg mb-6 max-w-md">You need to connect an account to see the surplus foods you have placed on the market.</p>
                <Link to="/login" className="bg-theme-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 shadow-md">
                   {t('login') || 'Log In'}
                </Link>
            </div>
        );
    }

    const myItems = items.filter(i => i.user_id === user.id);
    myItems.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Compute simple stats
    const totalListed = stats.totalListed;
    const totalClaimedParts = stats.totalClaimed;

    return (
        <div className="pt-24 max-w-7xl mx-auto px-4 pb-12 min-h-screen bg-theme-cream font-sans">
            <h1 className="text-4xl font-extrabold text-theme-dark mb-2 tracking-tight">{t('my_listings') || 'My Food Listings'} 📦</h1>
            <p className="text-theme-dark/70 text-lg font-medium mb-8">Manage the surplus food you have posted to Surplix.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-theme-green mb-1">{totalListed}</span>
                    <span className="text-theme-dark/70 font-medium text-sm text-center">Total Listings Posted</span>
                </div>
                <div className="bg-[#e8f5e9] p-6 rounded-3xl border border-theme-mint/20 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-theme-mint mb-1">{totalClaimedParts}</span>
                    <span className="text-theme-dark/70 font-medium text-sm text-center">Meals Saved & Claimed</span>
                </div>
            </div>

            {myItems.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm px-4">
                   <div className="text-6xl mb-4 opacity-50">🍽️</div>
                   <p className="text-theme-dark/60 mb-6 text-lg font-medium">You haven't listed any surplus food yet.</p>
                   <Link to="/list" className="bg-theme-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 shadow-md">
                     {t('list_food') || 'List Some Food'}
                   </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myItems.map(item => (
                       <FoodCard 
                          key={item.id} 
                          item={item} 
                          onInteract={handleInteract} 
                          onClaim={handleClaim}
                          onOpenDetails={setSelectedItemId}
                          isDashboardMode={true}
                       />
                    ))}
                </div>
            )}

            {selectedItemId && (
                <FoodDetails 
                    item={myItems.find(item => item.id === selectedItemId)} 
                    onClose={() => setSelectedItemId(null)}
                    onInteract={handleInteract}
                />
            )}
        </div>
    );
};
export default MyListings;
