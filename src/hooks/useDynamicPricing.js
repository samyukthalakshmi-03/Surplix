import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useDynamicPricing = () => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

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
    // Math-based dynamic pricing drop algorithm
    if (item.status !== 'available' || item.available_servings === 0) return item;

    const DROP_AMOUNT = 10;
    const intervalMs = 10000; // 10 seconds
    const createdAt = new Date(item.created_at).getTime();

    const timeElapsed = Date.now() - createdAt;
    const intervalsPassed = Math.floor(timeElapsed / intervalMs);

    let currentPrice = item.initial_price - (intervalsPassed * DROP_AMOUNT);

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
      setItems(prevItems => prevItems.map(item => calculatePrice(item)));
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

  const handleClaim = async (id) => {
    // Check if user is logged in
    if (!user) {
      alert("Please login to claim food items!");
      return;
    }

    const itemToUpdate = items.find(item => item.id === id);
    if (!itemToUpdate || itemToUpdate.available_servings <= 0) return;

    const newAvailable = itemToUpdate.available_servings - 1;
    const newStatus = newAvailable === 0 ? 'sold_out' : 'available';
    const newInterested = itemToUpdate.interested + 1;

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
      category: newItem.category || "Surplus"
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
    priceFloor: item.price_floor
  }));

  return { items: normalizedItems, handleInteract, handleClaim, addItem };
};
