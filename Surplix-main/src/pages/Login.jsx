import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, Building2, MapPin, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signIn, signUp, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('user'); // 'user' or 'organization'
  
  // Form States
  const [name, setName] = useState(''); // Also used as Org Name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Org Specific
  const [orgType, setOrgType] = useState('NGO'); // NGO, Shelter, Charity
  const [contactPerson, setContactPerson] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [website, setWebsite] = useState('');

  
  // Location
  const [locationObj, setLocationObj] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [locDisabled, setLocDisabled] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
     if (user && !loading) {
         if (user.user_metadata?.role === 'organization') {
             navigate('/ngo-dashboard');
         } else {
             navigate('/browse');
         }
     }
  }, [user, navigate, loading]);

  const detectLocation = () => {
      setLocating(true);
      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
              async (position) => {
                  const { latitude, longitude } = position.coords;
                  try {
                      // Reverse geocoding (basic mock or native placeholder, real app uses Google Maps / openstreetmap)
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                      const data = await res.json();
                      const address = data.display_name || 'Detected Location';
                      setLocationObj({ lat: latitude, lng: longitude, address });
                      setManualAddress(address);
                      setLocDisabled(false);
                      setError(null);
                  } catch(e) {
                      setLocationObj({ lat: latitude, lng: longitude, address: "Detected Location" });
                      setManualAddress("Detected Location");
                      setLocDisabled(false);
                      setError(null);
                  }
                  setLocating(false);
              },
              (error) => {
                  console.error("Location error", error);
                  setLocating(false);
                  setLocDisabled(true);
                  setError("Location access denied. Please enter manually.");
              }
          );
      } else {
          setLocating(false);
          setLocDisabled(true);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        
        // Post Login Routing
        const userRole = data?.user?.user_metadata?.role;
        if (userRole === 'organization') {
             navigate('/ngo-dashboard');
        } else {
             navigate('/browse');
        }
      } else {
        // Signup
        const metadata = {
            display_name: name,
            role,
            phone,
            location: locationObj || { address: manualAddress }
        };
        
        if (role === 'organization') {
            metadata.org_type = orgType;
            metadata.contact_person = contactPerson;
            metadata.org_name = name;
            metadata.registration_number = regNumber;
            metadata.website = website;
        }

        const { data, error } = await signUp(email, password, metadata);
        if (error) throw error;
        
        // Push to local registered list
        if (role === 'organization') {
            const registeredFarms = JSON.parse(localStorage.getItem('surplix_registered_farms') || '[]');
            let feedType = 'Various Feed';
            let desc = 'A newly verified partner looking for safe food scraps to recycle.';
            
            if (orgType === 'NGO') {
               feedType = 'Donations / Compostable scraps';
               desc = 'A verified NGO organization working with food waste and animal welfare.';
            } else if (orgType !== 'Farm') {
               feedType = 'General Donations';
               desc = `A verified ${orgType} organization registered on our platform.`;
            }

            registeredFarms.push({
                id: Date.now(),
                name: name,
                location: locationObj?.address || manualAddress || 'Unknown Location',
                types: feedType,
                contact: phone || 'Registration Phone',
                desc: desc
            });
            localStorage.setItem('surplix_registered_farms', JSON.stringify(registeredFarms));
        }
        
        // Supabase returns no error on success, user created
        alert('Account created successfully! Logging you in...');
        
        // We simulate automatic routing if signUp logs them in vs email confirmation
        if (data?.session) {
             if (role === 'organization') navigate('/ngo-dashboard');
             else navigate('/browse');
        } else {
             // In case email verification is required
             setIsLogin(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-theme-cream flex items-center justify-center p-4">
      <div className={`bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-theme-creamDark w-full ${!isLogin && role === 'organization' ? 'max-w-2xl' : 'max-w-md'} transform transition-all`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-theme-green mb-2 tracking-tight">
            {isLogin ? (t('login_welcome') || 'Welcome Back!') : t('create_account')}
          </h1>
          <p className="text-theme-dark/70 font-medium">
            {isLogin ? (t('login_desc') || 'Login to continue reducing food waste') : t('signup_desc')}
          </p>
        </div>

        <div className="flex gap-4 mb-8">
            <button 
              type="button" 
              onClick={() => { setRole('user'); setError(null); }}
              className={`flex-1 py-4 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === 'user' ? 'border-theme-green bg-theme-mint/20 text-theme-green' : 'border-theme-creamDark bg-theme-cream/30 text-theme-dark/50 hover:border-theme-green/50'}`}
            >
                <User className="w-6 h-6" />
                <span className="font-bold text-sm">{t('user_role')}</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setRole('organization'); setError(null); }}
              className={`flex-1 py-4 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === 'organization' ? 'border-theme-orange bg-theme-yellow/20 text-theme-orange' : 'border-theme-creamDark bg-theme-cream/30 text-theme-dark/50 hover:border-theme-orange/50'}`}
            >
                <Building2 className="w-6 h-6" />
                <span className="font-bold text-sm">{t('org_role')}</span>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin ? (
            <div className={`grid ${role === 'organization' ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1 gap-6'}`}>
              <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-theme-dark mb-2">{role === 'organization' ? t('org_name') : t('full_name')}</label>
                    <input 
                      type="text" required
                      placeholder={role === 'organization' ? "e.g. Hope Foundation" : "e.g. Rahul Sharma"}
                      className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  {role === 'organization' && (
                     <>
                        <div>
                            <label className="block text-sm font-bold text-theme-dark mb-2">{t('org_type')}</label>
                            <select 
                                className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark transition-colors"
                                value={orgType} onChange={(e) => setOrgType(e.target.value)}
                            >
                                <option value="NGO">NGO</option>
                                <option value="Shelter">Shelter</option>
                                <option value="Charity">Charity</option>
                                <option value="Farm">Farm</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-theme-dark mb-2">{t('contact_person')}</label>
                            <input 
                              type="text" required
                              placeholder="e.g. Sarah Connor"
                              className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                              value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-theme-dark mb-2">{t('reg_number')}</label>
                            <input 
                              type="text" required
                              placeholder="e.g. NGO-12345"
                              className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                              value={regNumber} onChange={(e) => setRegNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-theme-dark mb-2">{t('website_url')}</label>
                            <input 
                              type="url"
                              placeholder="https://example.org"
                              className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                              value={website} onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>
                     </>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-theme-dark mb-2">{role === 'organization' ? t('official_email') : (t('login_email') || 'Email Address')}</label>
                    <input 
                      type="email" required
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
              </div>

              <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-theme-dark mb-2">{t('login_password') || 'Password'}</label>
                    <input 
                      type="password" required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-theme-dark mb-2">{t('phone_number')} {role === 'user' && '(Optional)'}</label>
                    <input 
                      type="tel" required={role === 'organization'}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="bg-theme-cream/20 p-4 rounded-2xl border border-theme-creamDark">
                     <label className="block text-sm font-bold text-theme-dark mb-2 flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-theme-mint" /> {t('location_label_login')}
                     </label>
                     {!locationObj && !locDisabled ? (
                         <button
                            type="button"
                            onClick={detectLocation}
                            className="w-full bg-white border border-theme-creamDark text-theme-dark/70 font-bold px-4 py-3 rounded-[20px] hover:border-theme-green hover:text-theme-green flex justify-center items-center gap-2 transition-colors"
                         >
                            {locating ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('detecting')}</> : t('auto_detect')}
                         </button>
                     ) : (
                         <div>
                             <input 
                                type="text" required
                                placeholder={t('enter_address')}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-theme-mint outline-none text-sm"
                                value={manualAddress}
                                onChange={(e) => {
                                    setManualAddress(e.target.value);
                                    if (locationObj) setLocationObj(null);
                                }}
                             />
                             {locationObj && <p className="text-xs text-green-600 font-bold mt-2">✓ Precise location acquired.</p>}
                         </div>
                     )}
                  </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-theme-dark mb-2">{t('login_email') || 'Email Address'}</label>
                <input 
                  type="email" required
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-theme-dark mb-2">{t('login_password') || 'Password'}</label>
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-theme-green text-white font-bold text-lg py-4 rounded-[20px] hover:bg-green-800 hover:-translate-y-1 hover:shadow-xl transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? t('processing') : (isLogin ? (t('login_button') || 'Login') : t('signup_btn'))}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-theme-dark/70">
          {isLogin ? t('dont_have') : t('already_have')}
          <button 
            type="button"
            className="text-theme-green hover:underline font-bold"
            onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
            }}
          >
            {isLogin ? t('sign_up_action') : t('login_action')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
