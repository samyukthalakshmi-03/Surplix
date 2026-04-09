import React, { useState, useEffect } from 'react';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Package, TrendingDown, Clock, MapPin, Phone, MessageSquare, CheckCircle, AlertCircle, ExternalLink, Leaf, User, Trash2 } from 'lucide-react';

const SellerDashboard = () => {
    const { items, stats, deleteItem } = usePricing();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 10000); // 10s tick
        return () => clearInterval(interval);
    }, []);

    if (!user) {
        return (
            <div className="pt-32 text-center h-screen bg-theme-cream px-4 flex flex-col items-center">
                <h1 className="text-3xl font-extrabold mb-4 pb-2">{t('seller_dash_login')}</h1>
                <p className="text-theme-dark/70 text-lg mb-6 max-w-md">{t('seller_login_desc')}</p>
                <Link to="/login" className="bg-theme-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 shadow-md">
                   Log In
                </Link>
            </div>
        );
    }

    const myItems = items.filter(i => i.user_id === user.id);
    myItems.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalListed = stats.totalListed;
    const totalClaimedParts = stats.totalClaimed;
    const foodSavedMeals = stats.totalClaimed; 

    // Generate mock mock notifications
    const notifications = myItems
        .filter(i => i.totalServings > i.availableServings && i.availableServings > 0)
        .map(i => `Your food "${i.name}" was partially claimed!`)
        .concat(myItems.filter(i => i.status === 'sold_out' || i.availableServings === 0).map(i => `Your food "${i.name}" was fully claimed!`))
        .concat(myItems.filter(i => i.status === 'donated').map(i => `Food "${i.name}" sent to NGO`));

    return (
        <div className="pt-24 max-w-7xl mx-auto px-4 pb-12 min-h-screen bg-theme-cream font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-theme-dark mb-2 tracking-tight flex items-center gap-3">
                        <Package className="w-10 h-10 text-theme-mint" /> 
                        {user?.user_metadata?.display_name ? `${user.user_metadata.display_name}${t('s_dashboard')}` : t('my_dashboard')}
                    </h1>
                    <p className="text-theme-dark/70 text-lg font-medium">{t('track_surplus')}</p>
                </div>
                <Link to="/list" className="bg-theme-green text-white px-6 py-3 rounded-full font-bold hover:bg-green-800 shadow-md whitespace-nowrap transition-transform hover:scale-105">
                    + List More Food
                </Link>
            </div>

            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[32px] border border-theme-creamDark shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="bg-theme-mint/20 p-4 rounded-2xl text-theme-mint">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-theme-dark/60">{t('total_listed')}</div>
                        <div className="text-3xl font-black text-theme-dark">{totalListed} pt</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-theme-creamDark shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="bg-theme-green/20 p-4 rounded-2xl text-theme-green">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-theme-dark/60">{t('total_claimed')}</div>
                        <div className="text-3xl font-black text-theme-dark">{totalClaimedParts} pt</div>
                    </div>
                </div>
                <div className="bg-theme-mint/10 p-6 rounded-3xl border border-theme-mint/20 shadow-sm flex items-center gap-4">
                    <div className="bg-theme-mint p-4 rounded-2xl text-white shadow-lg shadow-theme-mint/40">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-theme-mint mix-blend-multiply">{t('food_saved')}</div>
                        <div className="text-3xl font-black text-theme-mint mix-blend-multiply">{foodSavedMeals}</div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-theme-dark">
                        <AlertCircle className="w-5 h-5 text-orange-400" /> {t('notifications')}
                    </h3>
                    <div className="flex flex-col gap-3">
                        {notifications.slice(0, 3).map((notif, idx) => (
                            <div key={idx} className="bg-orange-50/50 text-orange-800 px-4 py-3 rounded-xl text-sm font-medium border border-orange-100/50">
                                🔔 {notif}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {myItems.length === 0 ? (
                <div className="text-center py-24 bg-theme-cream/40 rounded-[32px] border border-theme-creamDark shadow-sm px-4">
                   <div className="text-6xl mb-4 opacity-50">🍽️</div>
                   <p className="text-theme-dark/60 mb-6 text-lg font-bold">{t('no_food_listed')}</p>
                   <Link to="/list" className="bg-theme-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 shadow-md">
                     Create Your First Listing
                   </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-theme-dark mb-4">{t('listings_status')}</h2>
                    {myItems.map(item => {
                        const claimedQty = item.totalServings - item.availableServings;
                        const isFullyClaimed = item.availableServings === 0 || item.status === 'sold_out';
                        const isDonated = item.status === 'donated';
                        const isPartial = claimedQty > 0 && !isFullyClaimed;
                        
                        let statusColor = "bg-orange-100 text-orange-700 border-orange-200"; // Available
                        let statusText = "Available";
                        if (isFullyClaimed) {
                            statusColor = "bg-theme-mint/20 text-theme-green border-theme-mint/30";
                            statusText = "Fully Claimed";
                        } else if (isPartial) {
                            statusColor = "bg-amber-100 text-amber-700 border-amber-200";
                            statusText = "Partially Claimed";
                        } else if (isDonated) {
                            statusColor = "bg-blue-100 text-blue-700 border-blue-200";
                            statusText = "Sent to NGO";
                        } else if (item.availableServings > 0 && claimedQty === 0) {
                            statusColor = "bg-red-50 text-red-600 border-red-100";
                            statusText = "Not Claimed";
                        }

                        // Time Track
                        const timeSince = Math.floor((currentTime - new Date(item.created_at).getTime()) / 60000); // mins
                        const timeDropStr = 30 - (timeSince % 30); // 30 min interval

                        return (
                            <div key={item.id} className={`bg-white rounded-3xl p-6 border shadow-sm transition-all hover:shadow-md ${statusColor.replace('bg-', 'hover:border-').split(' ')[0]}`}>
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    {/* Left Info */}
                                    <div className="flex-1">
                                         <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => { if(window.confirm('Are you sure you want to delete this listing?')) deleteItem(item.id) }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete Listing"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="text-gray-500 font-medium mb-4 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> {item.location}
                                        </div>
                                        
                                        <div className="flex gap-6 mb-6">
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Listed</div>
                                                <div className="text-xl font-black text-gray-800">{item.totalServings}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-theme-green font-bold uppercase tracking-wider mb-1">Claimed</div>
                                                <div className="text-xl font-black text-theme-green">{claimedQty}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Remaining</div>
                                                <div className="text-xl font-black text-gray-800">{item.availableServings}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Current Price</div>
                                                <div className="text-xl font-black text-blue-600 flex items-center gap-1">
                                                    ₹{item.currentPrice} 
                                                    {item.currentPrice < item.initialPrice && <TrendingDown className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time Tracking */}
                                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-6 border border-gray-100">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                Listed {timeSince} min ago
                                            </div>
                                            {!isFullyClaimed && !isDonated && (
                                                <div className="flex items-center gap-2 text-sm font-bold text-orange-500 bg-orange-100/50 px-3 py-1.5 rounded-lg">
                                                    <TrendingDown className="w-4 h-4" /> Next price drop in {timeDropStr} min
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Context (Buyer / NGO) */}
                                    <div className="lg:w-1/3 bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
                                        {isDonated ? (
                                            <div className="text-center">
                                                <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-500 flex items-center justify-center rounded-full mb-3">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">Transferred to NGO successfully</h4>
                                                <p className="text-sm text-gray-500 font-medium">This food was redirected to a nearby NGO partner to prevent waste.</p>
                                            </div>
                                        ) : isFullyClaimed || isPartial ? (
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <User className="w-5 h-5 text-theme-mint" /> Buyer Details
                                                </h4>
                                                <div className="bg-white rounded-xl p-4 border border-gray-100 mb-3 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-bold text-sm">Community Member</div>
                                                            <div className="text-xs text-gray-500 font-medium mt-0.5">Claimed: {claimedQty} pt</div>
                                                        </div>
                                                        <span className="bg-yellow-100 text-yellow-700 text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-wider">Pending Pickup</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-gray-50 hover:text-theme-mint transition-colors">
                                                        <Phone className="w-4 h-4" /> Call
                                                    </button>
                                                    <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-gray-50 hover:text-blue-500 transition-colors">
                                                        <MessageSquare className="w-4 h-4" /> Message
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="text-4xl mb-3 opacity-60">⏳</div>
                                                <p className="text-sm font-bold text-gray-600 mb-2">Awaiting Claims...</p>
                                                <p className="text-xs text-gray-400 font-medium px-4">This food will be automatically redirected to a nearby NGO if it reaches its price floor.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
