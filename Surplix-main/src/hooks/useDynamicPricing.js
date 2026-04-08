import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useDynamicPricing = () => {
  const [items, setItems] = useState([]);
  const [activeClaims, setActiveClaims] = useState(() => {
    const saved = localStorage.getItem('surplix_claims');
    return saved ? JSON.parse(saved) : [];
  });
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('surplix_claims', JSON.stringify(activeClaims));
  }, [activeClaims]);

  // Fetch initial data
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*');

      if (error) {
        console.error('Error fetching items:', error);
        return;
      }
      if (data) {
        setItems(data.map(item => calculatePrice(item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();

    // Set up real-time subscription for live updates across devices
    const subscription = supabase
      .channel('food_items_public_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, payload => {
        if (payload.eventType === 'INSERT') {
          setItems(prevItems => {
            // Prevent duplication if this client was the one who inserted it 
            // (since addItem already updates local state)
            if (prevItems.some(item => item.id === payload.new.id)) return prevItems;
            return [...prevItems, calculatePrice(payload.new)];
          });
        }
        if (payload.eventType === 'UPDATE') {
          setItems(prevItems => prevItems.map(item => 
            item.id === payload.new.id ? calculatePrice(payload.new) : item
          ));
        }
        if (payload.eventType === 'DELETE') {
          setItems(prevItems => prevItems.filter(item => item.id === payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const calculatePrice = (item) => {
    // Reverse Auction Model
    if (item.status !== 'available' || item.available_servings === 0) return item;

    // 1. Fixed Configuration
    const DROP_INTERVAL_MS = 30 * 60 * 1000; // Fixed interval (30 minutes)
    const DROP_AMOUNT = Math.max(1, Math.floor(item.initial_price * 0.15)); // Configurable drop amount (e.g., 15%)

    // 2. Use Timestamps
    const createdAt = new Date(item.created_at).getTime();
    const currentTime = Date.now(); // Reliable client-side timestamp synchronized globally
    
    // 3. Calculate intervals passed
    const timeElapsed = currentTime - createdAt;
    const intervalsPassed = Math.max(0, Math.floor(timeElapsed / DROP_INTERVAL_MS));

    // 4. Formula: currentPrice = initialPrice - (numberOfIntervals * dropAmount)
    let currentPrice = item.initial_price - (intervalsPassed * DROP_AMOUNT);

    // 5. Ensure price never goes below minimum price (floor price)
    // 6. Stop price reduction once minimum price is reached + Trigger NGO Allocation
    if (currentPrice <= item.price_floor) {
      return {
        ...item,
        current_price: item.price_floor,
        status: 'donated',
        ngo: { name: "Local Food Bank", distance: "1.2 km" }
      };
    }

    return { ...item, current_price: currentPrice };
  };

  useEffect(() => {
    // Engine Tick on the frontend to recalculate currentPrice 
    // mathematically based on time rather than DB queries
    const DROP_INTERVAL = 10000;

    // We update prices locally every 10 seconds so the UI updates
    const interval = setInterval(() => {
      setItems(prevItems => prevItems.map(item => {
        const calculatedItem = calculatePrice(item);
        
        // If it naturally hit donated state via math, sync it to the DB so the trigger moves it to sold_items
        if (calculatedItem.status === 'donated' && item.status !== 'donated') {
           supabase.from('food_items').update({ status: 'donated' }).eq('id', item.id).then();
        }
        
        return calculatedItem;
      }));
    }, DROP_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleInteract = async (id, type) => {
    // Optimistic local update
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          views: type === 'view' ? item.views + 1 : item.views,
          interested: type === 'interest' ? item.interested + 1 : item.interested
        };
      }
      return item;
    }));

    // Update in Supabase
    try {
      const itemToUpdate = items.find(item => item.id === id);
      if (!itemToUpdate) return;

      const newViews = type === 'view' ? itemToUpdate.views + 1 : itemToUpdate.views;
      const newInterested = type === 'interest' ? itemToUpdate.interested + 1 : itemToUpdate.interested;

      await supabase.from('food_items').update({
        views: newViews,
        interested: newInterested
      }).eq('id', id);
    } catch (e) {
      console.log(e);
    }
  };

  const handleClaim = async (id, claimQty = 1) => {
    if (!user) {
      alert("Please login to claim food items!");
      return null;
    }

    const itemToUpdate = items.find(item => item.id === id);
    if (!itemToUpdate || itemToUpdate.status === 'claimed' || itemToUpdate.status === 'donated' || itemToUpdate.available_servings < claimQty) return null;

    const newAvailable = itemToUpdate.available_servings - claimQty;
    const newStatus = newAvailable === 0 ? 'claimed' : 'available';
    const newInterested = itemToUpdate.interested + 1;

    const claimDetails = {
      id: "claim_" + Date.now(),
      itemId: id,
      name: itemToUpdate.name,
      location: itemToUpdate.location,
      price: itemToUpdate.current_price,
      qty: claimQty,
      time: new Date().toISOString(),
      status: 'Pending Pickup',
      pickupWindow: 'Today before 8:00 PM',
      contact: '+91 9876543210' // Demo contact
    };

    setActiveClaims(prev => [...prev, claimDetails]);

    // Optimistic update
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          available_servings: newAvailable,
          status: newStatus,
          interested: newInterested
        };
      }
      return item;
    }));

    // DB Update
    try {
      await supabase.from('food_items').update({
        available_servings: newAvailable,
        status: newStatus,
        interested: newInterested
      }).eq('id', id);
    } catch (err) {
      console.log(err);
      fetchItems(); // revert optimistic update
    }
    
    return claimDetails;
  };

  const markClaimCollected = (claimId) => {
    setActiveClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'Collected' } : c));
  };

  const addItem = async (newItem) => {
    if (!user) {
      alert("Please login to list food items!");
      return;
    }

    if (newItem.initialPrice > 200) return;

    const dbItem = {
      user_id: user.id,
      name: newItem.name,
      location: newItem.location,
      lat: newItem.lat || 12.9716,
      lng: newItem.lng || 77.5946,
      total_servings: newItem.totalServings,
      available_servings: newItem.availableServings,
      initial_price: newItem.initialPrice,
      price_floor: Math.floor(newItem.initialPrice * 0.2), // 80% discount floor
      views: 0,
      interested: 0,
      status: 'available',
      category: newItem.category || "Surplus",
      prepared_before: newItem.preparedBefore || '',
      food_type: newItem.foodType || 'Veg',
      allergens: newItem.allergens || ''
    };

    try {
      const { data, error } = await supabase
        .from('food_items')
        .insert([dbItem])
        .select()
        .single();

      if (error) {
        console.error("Error creating item:", error);
        return;
      }

      if (data) {
        setItems(prev => [...prev, calculatePrice(data)]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Normalize data map to match component prop expectations
  // since the DB might use snake_case
  const normalizedItems = items.map(item => ({
    ...item,
    totalServings: item.total_servings,
    availableServings: item.available_servings,
    initialPrice: item.initial_price,
    currentPrice: item.current_price,
    priceFloor: item.price_floor,
    preparedBefore: item.prepared_before,
    foodType: item.food_type,
    allergens: item.allergens
  }));

  return { items: normalizedItems, handleInteract, handleClaim, addItem, activeClaims, markClaimCollected };
};
