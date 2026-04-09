import React, { useState } from 'react';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Building2, MapPin, CheckCircle, Package, Clock, Heart, X, ExternalLink, Phone, Navigation, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodCard from '../components/FoodCard';

const NGODashboard = () => {
    const { items, handleClaim, lockItem, pickupItem, unlockItem, stats } = usePricing();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [autoAccept, setAutoAccept] = useState(true);
    const [activeModalItem, setActiveModalItem] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);

    if (!user || user.user_metadata?.role !== 'organization') {
        return (
            <div className="pt-32 text-center h-screen bg-theme-cream px-4">
                <h1 className="text-3xl font-extrabold mb-4 pb-2">{t('org_access_req')}</h1>
                <p className="text-theme-dark/70 text-lg mb-6 max-w-md mx-auto">{t('org_access_desc')}</p>
                <Link to="/" className="bg-theme-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 shadow-md">
                    Return Home
                </Link>
            </div>
        );
    }

    const orgName = user.user_metadata?.org_name || user.user_metadata?.display_name || 'Organization';

    // Prioritize food that is marked 'donated' or fully dropped to floor, and includes those explicitly locked by this NGO
    const incomingDonations = items.filter(i => i.status === 'donated' || i.status === 'ngo_locked');
    const nearingDonations = items.filter(i => i.status === 'available' && i.currentPrice <= i.priceFloor + 20 && i.availableServings > 0);

    const onAcceptDonation = async (item) => {
        // Lock it natively so it doesn't get swept by others
        await lockItem(item.id);
        setActiveModalItem({ ...item, status: 'ngo_locked' });
    };

    const handleMarkPickedUp = async () => {
        if (!activeModalItem) return;
        setIsConfirming(true);
        await pickupItem(activeModalItem.id);
        alert("Pickup confirmed.");
        setActiveModalItem(null);
        setIsConfirming(false);
    };

    const handleCancelRequest = async () => {
        if (!activeModalItem) return;
        // Determine whether to return to available or donated based on price
        const originalStatus = activeModalItem.currentPrice <= activeModalItem.priceFloor ? 'donated' : 'available';
        await unlockItem(activeModalItem.id, originalStatus);
        setActiveModalItem(null);
    };

    return (
        <div className="pt-24 max-w-7xl mx-auto px-4 pb-12 min-h-screen bg-theme-cream font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-theme-creamDark pb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-theme-dark mb-1 tracking-tight flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-theme-green" />
                        {orgName}{t('s_dashboard')}
                    </h1>
                    <p className="text-theme-dark/70 text-sm font-medium">{t('manage_incoming')}</p>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-theme-creamDark shadow-sm">
                    <button
                        onClick={() => setAutoAccept(!autoAccept)}
                        className={`w-10 h-5 rounded-full p-1 transition-colors relative ${autoAccept ? 'bg-theme-green' : 'bg-theme-creamDark'}`}
                    >
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoAccept ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                    <span className="font-bold text-xs text-theme-dark">{t('auto_accept')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-theme-creamDark shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform">
                    <div className="bg-theme-mint/20 p-2 rounded-xl text-theme-mint">
                        <Heart className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-theme-dark/60 tracking-wider uppercase">{t('meals_distributed')}</div>
                        <div className="text-xl font-black text-theme-dark">{stats.mealsDistributed} pt</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-theme-creamDark shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform">
                    <div className="bg-theme-green/20 p-2 rounded-xl text-theme-green">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-theme-dark/60 tracking-wider uppercase">{t('active_pickups')}</div>
                        <div className="text-xl font-black text-theme-dark">{incomingDonations.length}</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-theme-creamDark shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform">
                    <div className="bg-theme-orange/20 p-2 rounded-xl text-theme-orange">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-theme-dark/60 tracking-wider uppercase">{t('pending_approvals')}</div>
                        <div className="text-xl font-black text-theme-dark">{nearingDonations.length}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Priority Donations */}
                <div>
                    <h2 className="text-2xl font-bold text-theme-dark mb-4 border-b-2 border-theme-green pb-2 inline-block">🚀 {t('priority_overstock')}</h2>
                    {incomingDonations.length === 0 ? (
                        <div className="bg-theme-cream/40 p-8 rounded-[32px] text-center border border-theme-creamDark text-theme-dark/60 font-bold">
                            {t('no_immediate_donations')}
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {incomingDonations.map(item => (
                            <FoodCard 
                                key={item.id} 
                                item={item} 
                                customActions={
                                    <div className="space-y-2 mt-4">
                                        <button
                                            onClick={() => onAcceptDonation(item)}
                                            className="w-full bg-theme-green text-white font-bold py-3.5 rounded-[20px] transition-all hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Package className="w-5 h-5" /> {t('accept_pickup')}
                                        </button>
                                        <p className="text-xs text-theme-dark/60 text-center font-bold">{t('driver_matched')}</p>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Upcoming Donations */}
            <div>
                <h2 className="text-2xl font-bold text-theme-dark mb-4 border-b-2 border-theme-orange pb-2 inline-block">⏳ {t('approaching_surplus')}</h2>
                <p className="text-theme-dark/60 font-bold mb-4">{t('nearing_expiry')}</p>

                {nearingDonations.length === 0 ? (
                    <div className="bg-theme-cream/40 p-8 rounded-[32px] text-center border border-theme-creamDark text-theme-dark/60 font-bold">
                        {t('no_approaching_surplus')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nearingDonations.map(item => (
                            <FoodCard 
                                key={item.id} 
                                item={{...item, status: 'available'}} 
                                customActions={
                                    <div className="space-y-2 mt-4">
                                        <button
                                            onClick={() => {
                                                alert(t('prevent_buy'));
                                                handleClaim(item.id, item.availableServings);
                                            }}
                                            className="w-full bg-orange-50 border-2 border-theme-orange text-theme-orange font-bold py-3.5 rounded-[20px] transition-all hover:bg-orange-100 flex items-center justify-center gap-2"
                                        >
                                            <Clock className="w-5 h-5" /> {t('pre_claim')}
                                        </button>
                                        <p className="text-xs text-theme-orange/70 text-center font-bold">{t('prevent_zero')}</p>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
            </div>

            {activeModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-dark/60 backdrop-blur-sm shadow-2xl transition-opacity">
                    <div className="bg-white max-w-[500px] w-[90%] mx-auto rounded-[16px] max-h-[80vh] overflow-y-auto border border-theme-creamDark flex flex-col">
                        <div className="bg-theme-cream/50 border-b border-theme-creamDark p-5 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-xl font-extrabold text-theme-dark flex items-center gap-2">
                                <Package className="w-5 h-5 text-theme-green" />
                                Pickup Details
                            </h2>
                            <button onClick={handleCancelRequest} disabled={isConfirming} className="p-1.5 bg-white rounded-full border border-theme-creamDark hover:bg-gray-100 transition-colors disabled:opacity-50">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Status Warning */}
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-3 text-amber-800 shadow-sm">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Item Locked for You.</p>
                                    <p className="text-xs font-medium mt-0.5">Please collect within 30 minutes. This item has been removed from the public pool.</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">📦 Food Name</div>
                                    <div className="text-lg font-bold text-theme-dark">{activeModalItem.name}</div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">👤 Seller</div>
                                        <div className="text-sm font-bold text-theme-dark flex items-center gap-2">
                                            Community Member
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">📞 Contact</div>
                                        <div className="text-sm font-bold text-theme-dark flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-theme-green" />
                                            +91 9876543210
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">🕒 Listed / Prep Time</div>
                                    <div className="text-sm font-medium text-theme-dark">{activeModalItem.preparedBefore || 'Prepared Today'}</div>
                                </div>

                                <div className="bg-theme-cream/30 p-3 rounded-lg border border-dashed border-theme-creamDark">
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">📊 Quantity & Instructions</div>
                                    <div className="font-bold text-theme-green text-base mb-1.5">{activeModalItem.availableServings} Total Servings ({Math.floor(activeModalItem.availableServings * 1.5)} people depending on portions)</div>
                                    <p className="text-[12px] font-medium text-gray-600 mb-0.5">• Bring containers to collect the food.</p>
                                    <p className="text-[12px] font-medium text-gray-600">• Call the seller 5 minutes before arrival.</p>
                                </div>

                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">📍 Exact Location</div>
                                    <div className="text-sm font-bold text-theme-dark mb-2">{activeModalItem.location}</div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${activeModalItem.lat || 12.9716},${activeModalItem.lng || 77.5946}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-3 py-1.5 text-sm rounded-lg transition-colors border border-blue-200 shadow-sm"
                                    >
                                        <Navigation className="w-3.5 h-3.5" /> Open in Google Maps <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2.5 pt-4 border-t border-theme-creamDark mt-5">
                                <button
                                    onClick={handleMarkPickedUp}
                                    disabled={isConfirming}
                                    className="w-full bg-theme-green text-white font-bold py-3 text-sm rounded-xl hover:bg-green-800 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {isConfirming ? "Confirming..." : "Confirm Pickup"}
                                </button>
                                <button
                                    onClick={handleCancelRequest}
                                    disabled={isConfirming}
                                    className="w-full bg-white border border-gray-300 text-gray-600 font-bold py-2.5 text-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NGODashboard;
