import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PricingProvider } from './context/PricingContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BrowseFood from './pages/BrowseFood';
import ListFood from './pages/ListFood';
import About from './pages/About';
import Login from './pages/Login';
import Community from './pages/Community';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <PricingProvider>
          <BrowserRouter>
          <div className="min-h-screen bg-theme-cream flex flex-col font-sans text-theme-dark overflow-x-hidden">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<BrowseFood />} />
                <Route path="/list" element={<ListFood />} />
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </PricingProvider>
    </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
