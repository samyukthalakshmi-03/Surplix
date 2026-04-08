import React, { createContext, useContext } from 'react';
import { useDynamicPricing } from '../hooks/useDynamicPricing';

const PricingContext = createContext();

export const PricingProvider = ({ children }) => {
  const pricingData = useDynamicPricing();
  
  return (
    <PricingContext.Provider value={pricingData}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => useContext(PricingContext);
