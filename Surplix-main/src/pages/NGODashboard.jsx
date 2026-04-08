import React, { useState } from 'react';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Building2, MapPin, CheckCircle, Package, Clock, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const NGODashboard = () => {
    const { items, handleClaim } = usePricing();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [autoAccept, setAutoAccept] = useState(true);

    if (!user || user.user_metadata?.role !== 'organization') {
        return (
            <div className="pt-32 text-center h-screen bg-theme-cream px-4">
                <h1 className="text-3xl font-extrabold mb-4 pb-2">Organization Access Required</h1>
                <p className="text-theme-dark/70 text-lg mb-6 max-w-md mx-auto">This dashboard is reserved for registered NGOs and charities.</p>
                <Link to="/" className="bg-theme-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 shadow-md">
                    Return Home
                </Link>
            </div>
        );
    }

    const orgName = user.user_metadata?.org_name || user.user_metadata?.display_name || 'Organization';

    // Prioritize food that is marked 'donated' or fully dropped to floor
    const incomingDonations = items.filter(i => i.status === 'donated');
    const nearingDonations = items.filter(i => i.status === 'available' && i.currentPrice <= i.priceFloor + 20 && i.availableServings > 0);

    const onAcceptDonation = (item) => {
        handleClaim(item.id, item.availableServings);
        alert(`Successfully accepted ${item.availableServings} servings of ${item.name}! A driver should be dispatched.`);
    };

    return (
        <div className="pt-24 max-w-7xl mx-auto px-4 pb-12 min-h-screen bg-theme-cream font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-theme-dark mb-2 tracking-tight flex items-center gap-3">
                        <Building2 className="w-10 h-10 text-theme-green" /> 
                        {orgName} Dashboard
                    </h1>
                    <p className="text-theme-dark/70 text-lg font-medium">Manage incoming surplus food donations and distribute meals effectively.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 md:pr-4 rounded-full border border-gray-200 shadow-sm">
                    <button 
                        onClick={() => setAutoAccept(!autoAccept)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${autoAccept ? 'bg-theme-green' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoAccept ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className="font-bold text-sm text-gray-700">Auto-Accept Donations</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-theme-mint/20 p-4 rounded-2xl text-theme-mint">
                        <Heart className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500">Meals Distributed</div>
                        <div className="text-3xl font-black text-theme-dark">1,240 pt</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-green-50 p-4 rounded-2xl text-theme-green">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500">Active Pickups</div>
                        <div className="text-3xl font-black text-theme-dark">{incomingDonations.length}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-orange-50 p-4 rounded-2xl text-orange-500">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500">Pending Approvals</div>
                        <div className="text-3xl font-black text-theme-dark">{nearingDonations.length}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Priority Donations */}
                <div>
                    <h2 className="text-2xl font-bold text-theme-dark mb-4 border-b-2 border-theme-green pb-2 inline-block">🚀 Priority Overstock (Ready for Pickup)</h2>
                    {incomingDonations.length === 0 ? (
                        <div className="bg-white p-8 rounded-[32px] text-center border border-gray-100 text-gray-500 font-medium">
                            No immediate donations available waiting for pickup right now.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {incomingDonations.map(item => (
                                <div key={item.id} className="bg-white border border-theme-creamDark p-6 rounded-[32px] shadow-sm transition-all hover:shadow-md hover:border-theme-green/50">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-theme-dark mb-2">{item.name}</h3>
                                            <p className="text-sm text-theme-dark/60 font-medium mb-5 flex items-center gap-1"><MapPin className="w-4 h-4"/> {item.location}</p>
                                            
                                            <div className="flex gap-6 mb-2">
                                                <div>
                                                    <div className="text-xs text-theme-green font-bold uppercase tracking-wider mb-1">Available Servings</div>
                                                    <div className="text-2xl font-black text-theme-green">{item.availableServings}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="lg:w-1/3 bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
                                            <button 
                                                onClick={() => onAcceptDonation(item)}
                                                className="w-full bg-theme-green text-white font-bold py-4 rounded-2xl hover:bg-green-800 transition shadow-lg shadow-theme-green/20"
                                            >
                                                Accept & Arrange Pickup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Upcoming Donations */}
                <div>
                    <h2 className="text-2xl font-bold text-theme-dark mb-4 border-b-2 border-orange-400 pb-2 inline-block">⏳ Approaching Surplus</h2>
                    <p className="text-gray-500 font-medium mb-4">These items are nearing their expiry or their price drop limit is extremely low. You get priority access.</p>
                    
                    {nearingDonations.length === 0 ? (
                        <div className="bg-white p-8 rounded-[32px] text-center border border-gray-100 text-gray-500 font-medium">
                            No approaching surplus currently in your vicinity.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {nearingDonations.map(item => (
                                <div key={item.id} className="bg-white border-2 border-orange-100 p-6 rounded-[32px] shadow-sm transition-all hover:border-orange-300">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                                            <div className="flex justify-between items-center mb-5">
                                                 <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4"/> {item.location}</p>
                                            </div>
                                            
                                            <div className="flex gap-6 mb-2">
                                                <div>
                                                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold">Qty Available</div>
                                                    <div className="text-2xl font-black text-gray-800">{item.availableServings}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-orange-400 uppercase tracking-widest mb-1 font-bold">Current Price</div>
                                                    <div className="text-2xl font-black text-orange-600">₹{item.currentPrice}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="lg:w-1/3 bg-orange-50/50 rounded-2xl p-5 border border-orange-100 flex flex-col justify-center">
                                            <button 
                                                onClick={() => {
                                                    alert("You have claimed this approaching surplus! This ensures members can no longer buy it.");
                                                    handleClaim(item.id, item.availableServings);
                                                }}
                                                className="w-full bg-white border-2 border-orange-300 text-orange-600 font-bold py-3.5 rounded-2xl hover:bg-orange-50 transition shadow-sm"
                                            >
                                                Pre-Claim Donation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;
