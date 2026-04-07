import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/browse');
      } else {
        const { error } = await signUp(email, password, { display_name: email.split('@')[0] });
        if (error) throw error;
        // Supabase returns no error on success, but user might need to check email.
        alert('Success! Please check your email for confirmation link if email confirmation is turned on. Otherwise, you can login directly.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-theme-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-theme-creamDark w-full max-w-md transform transition-all">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-theme-green mb-2 tracking-tight">
            {isLogin ? t('login_welcome') || 'Welcome Back!' : 'Create an Account'}
          </h1>
          <p className="text-theme-dark/70 font-medium">
            {isLogin ? t('login_desc') || 'Login to continue reducing food waste' : 'Sign up to start saving food'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('login_email') || 'Email Address'}</label>
            <input 
              type="email" 
              required
              placeholder="you@email.com"
              className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-theme-dark mb-2">{t('login_password') || 'Password'}</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-theme-cream/30 text-theme-dark placeholder-theme-dark/40 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

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
            {loading ? 'Processing...' : (isLogin ? (t('login_button') || 'Login') : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-theme-dark/70">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            className="text-theme-green hover:underline font-bold"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
