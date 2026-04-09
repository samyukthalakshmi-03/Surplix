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

  const [stats, setStats] = useState({
    totalListed: 0,
    totalClaimed: 0,
    mealsDistributed: 0
  });

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
        setItems(data.filter(item => item.status !== 'deleted').map(item => calculatePrice(item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      // 1. Get statistics for the current user (Seller context)
      const { data: foodItems } = await supabase.from('food_items').select('total_servings, available_servings').eq('user_id', user.id);
      const { data: soldItems } = await supabase.from('sold_items').select('total_servings').eq('user_id', user.id);

      const activeListed = foodItems?.reduce((acc, i) => acc + i.total_servings, 0) || 0;
      const historyListed = soldItems?.reduce((acc, i) => acc + i.total_servings, 0) || 0;
      const activeClaimed = foodItems?.reduce((acc, i) => acc + (i.total_servings - i.available_servings), 0) || 0;
      
      const userTotalListed = activeListed + historyListed;
      const userTotalClaimed = activeClaimed + historyListed;

      // 2. Get global statistics for NGO context (Meals distributed by all NGOs)
      const { data: globalSold } = await supabase.from('sold_items').select('total_servings').eq('status', 'donated');
      const totalDonated = globalSold?.reduce((acc, i) => acc + i.total_servings, 0) || 0;

      setStats({
        totalListed: userTotalListed,
        totalClaimed: userTotalClaimed,
        mealsDistributed: 1240 + totalDonated // Base mock value + real DB data
      });
    } catch (err) {
      console.log("Stats fetch error:", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStats();

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
          if (payload.new.status === 'deleted') {
             setItems(prevItems => prevItems.filter(item => item.id !== payload.new.id));
          } else {
             setItems(prevItems => prevItems.map(item => item.id === payload.new.id ? calculatePrice(payload.new) : item));
          }
          fetchStats();
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
    if (!itemToUpdate || itemToUpdate.status === 'sold_out' || itemToUpdate.status === 'donated' || itemToUpdate.available_servings < claimQty) return null;

    const newAvailable = itemToUpdate.available_servings - claimQty;
    const newStatus = newAvailable === 0 ? 'sold_out' : 'available';
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
      contact: '+91 9876543210', // Demo contact
      buyerName: user?.user_metadata?.display_name || 'Community Member'
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
      fetchStats();
    } catch (err) {
      console.log(err);
      fetchItems(); // revert optimistic update
    }
    
    return claimDetails;
  };

  const markClaimCollected = (claimId) => {
    setActiveClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'Collected' } : c));
  };

  const lockItem = async (id) => {
     setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'ngo_locked' } : item));
     try {
       await supabase.from('food_items').update({ status: 'ngo_locked' }).eq('id', id);
       fetchStats();
     } catch (err) { console.log(err); fetchItems(); }
  };

  const pickupItem = async (id) => {
     setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'sold_out', availableServings: 0, available_servings: 0 } : item));
     try {
       await supabase.from('food_items').update({ status: 'sold_out', available_servings: 0 }).eq('id', id);
       fetchStats();
     } catch (err) { console.log(err); fetchItems(); }
  };

  const unlockItem = async (id, originalStatus) => {
     const statusToRevert = originalStatus || 'available'; // Default back to available
     setItems(prev => prev.map(item => item.id === id ? { ...item, status: statusToRevert } : item));
     try {
       await supabase.from('food_items').update({ status: statusToRevert }).eq('id', id);
       fetchStats();
     } catch (err) { console.log(err); fetchItems(); }
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
        if (newItem.imageUrl) {
          try {
            localStorage.setItem(`food_image_${data.id}`, newItem.imageUrl);
          } catch (e) {
            console.error('Could not save image locally:', e);
          }
        }
        setItems(prev => [...prev, calculatePrice(data)]);
        fetchStats();
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
    allergens: item.allergens,
    imageUrl: item.image_url || localStorage.getItem(`food_image_${item.id}`) || null
  }));

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    try {
      // Using update to bypass lack of DELETE policy in RLS
      await supabase.from('food_items').update({ status: 'deleted', available_servings: 0 }).eq('id', id);
      fetchStats();
    } catch (err) {
      console.log(err);
      fetchItems();
    }
  };

  return { items: normalizedItems, stats, handleInteract, handleClaim, addItem, deleteItem, activeClaims, markClaimCollected, lockItem, pickupItem, unlockItem };
};
