import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data?.session) {
          const u = data.session.user;
          setUser(u);

          // Auto-register the signed-in org to the local list
          if (u && u.user_metadata?.role === 'organization') {
              const meta = u.user_metadata;
              let registeredFarms = [];
              try {
                  registeredFarms = JSON.parse(localStorage.getItem('surplix_registered_farms') || '[]');
              } catch (e) {}

              const exists = registeredFarms.find(f => f.name === meta.display_name || f.name === meta.org_name);
              if (!exists) {
                  let feedType = 'Various Feed';
                  let desc = 'A verified partner looking for safe food scraps to recycle.';
                  const orgType = meta.org_type || 'Farm';
                  
                  if (orgType === 'NGO') {
                     feedType = 'Donations / Compostable scraps';
                     desc = 'A verified NGO organization working with food waste and animal welfare.';
                  } else if (orgType !== 'Farm') {
                     feedType = 'General Donations';
                     desc = `A verified ${orgType} organization registered on our platform.`;
                  }

                  registeredFarms.push({
                      id: Date.now(),
                      name: meta.display_name || meta.org_name,
                      location: meta.location?.address || 'Registered Location',
                      types: feedType,
                      contact: meta.phone || 'Registration Phone',
                      desc: desc
                  });
                  localStorage.setItem('surplix_registered_farms', JSON.stringify(registeredFarms));
              }
          }
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        
        // Auto-register the signed-in org to the local list so it doesn't get lost
        if (u && u.user_metadata?.role === 'organization') {
            const meta = u.user_metadata;
            let registeredFarms = [];
            try {
                registeredFarms = JSON.parse(localStorage.getItem('surplix_registered_farms') || '[]');
            } catch (e) {}

            const exists = registeredFarms.find(f => f.name === meta.display_name || f.name === meta.org_name);
            if (!exists) {
                let feedType = 'Various Feed';
                let desc = 'A verified partner looking for safe food scraps to recycle.';
                const orgType = meta.org_type || 'Farm';
                
                if (orgType === 'NGO') {
                   feedType = 'Donations / Compostable scraps';
                   desc = 'A verified NGO organization working with food waste and animal welfare.';
                } else if (orgType !== 'Farm') {
                   feedType = 'General Donations';
                   desc = `A verified ${orgType} organization registered on our platform.`;
                }

                registeredFarms.push({
                    id: Date.now(),
                    name: meta.display_name || meta.org_name,
                    location: meta.location?.address || 'Registered Location',
                    types: feedType,
                    contact: meta.phone || 'Registration Phone',
                    desc: desc
                });
                localStorage.setItem('surplix_registered_farms', JSON.stringify(registeredFarms));
            }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, data) => supabase.auth.signUp({ email, password, options: { data } }),
    signOut: () => supabase.auth.signOut(),
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
