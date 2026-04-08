import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { MessageSquare, Star, Utensils, ThumbsUp } from 'lucide-react';

const MOCK_POSTS = [
  {
    id: 1,
    user: 'Aarav Sharma',
    avatar: 'https://i.pravatar.cc/150?u=aarav',
    rating: 5,
    food: 'Masala Dosa & Vada',
    restaurant: 'Udupi Grand, Jayanagar',
    content: 'Absolutely loved the surplus meal! The dosa was still surprisingly crisp and the chutney was fresh. Great to see such good food saved from being wasted.',
    likes: 24,
    time: '2 hours ago'
  },
  {
    id: 2,
    user: 'Priya R.',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    rating: 4,
    food: 'Chicken Biryani',
    restaurant: 'Meghana Foods, Indiranagar',
    content: 'Got the end-of-day biryani box using Surplix. Excellent value and the taste was authentic as always. Only giving 4 stars because the raita was missing, but still highly recommended!',
    likes: 15,
    time: '5 hours ago'
  },
  {
    id: 3,
    user: 'Karthik N.',
    avatar: 'https://i.pravatar.cc/150?u=karthik',
    rating: 5,
    food: 'Paneer Butter Masala Combo',
    restaurant: 'Nandhini Deluxe, Kormangala',
    content: 'Such a generous portion for the ₹80 discounted price. The gravies were delicious and the environmental impact savings made it taste even better!',
    likes: 42,
    time: '1 day ago'
  }
];

const Community = () => {
  const { t, lang } = useLanguage();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newFood, setNewFood] = useState('');
  const [newRestaurant, setNewRestaurant] = useState('');

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim() || !newFood.trim() || !newRestaurant.trim()) {
      alert(t('please_fill_all') || "Please fill all fields!");
      return;
    }

    const post = {
      id: posts.length + 1,
      user: 'You',
      avatar: 'https://i.pravatar.cc/150?u=you',
      rating: newRating,
      food: newFood,
      restaurant: newRestaurant,
      content: newPost,
      likes: 0,
      time: 'Just now'
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setNewFood('');
    setNewRestaurant('');
    setNewRating(5);
  };

  return (
    <div className="pt-24 max-w-4xl mx-auto px-4 pb-12 min-h-screen">
      <div className="bg-white rounded-[32px] shadow-sm overflow-hidden mb-8 border border-theme-creamDark mt-10">
        <div className="bg-theme-cream/50 p-8 border-b border-theme-creamDark">
          <h1 className="text-4xl font-extrabold text-theme-dark mb-4 flex items-center gap-3 tracking-tight">
            <MessageSquare className="w-10 h-10 text-theme-green" />
            {t('community_title')}
          </h1>
          <p className="text-theme-dark/70 text-lg font-medium">
            {t('community_subtitle')}
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handlePostSubmit} className="mb-10 bg-theme-cream/30 p-6 rounded-[24px] border border-theme-creamDark">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-theme-dark mb-2">{t('food_item_label')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-white font-medium"
                  placeholder={t('food_item_placeholder')}
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-theme-dark mb-2">{t('seller_label')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl border border-theme-creamDark focus:ring-2 focus:ring-theme-green outline-none bg-white font-medium"
                  placeholder={t('seller_placeholder')}
                  value={newRestaurant}
                  onChange={(e) => setNewRestaurant(e.target.value)}
                />
              </div>
            </div>
            <textarea
              className="w-full px-4 py-3 border border-theme-creamDark rounded-2xl focus:ring-2 focus:ring-theme-green outline-none bg-white font-medium resize-none mb-4"
              rows="3"
              placeholder={t('share_experience_placeholder')}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            ></textarea>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              <div className="flex gap-2 text-theme-green items-center">
                 <span className="text-sm font-bold text-theme-dark mr-2">{t('rate_label')}</span>
                 {[1, 2, 3, 4, 5].map((star) => (
                   <Star 
                     key={star} 
                     className={`w-8 h-8 cursor-pointer transition-colors ${star <= newRating ? 'text-theme-yellow fill-current' : 'text-gray-200'}`} 
                     onClick={() => setNewRating(star)}
                   />
                 ))}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-theme-green text-white px-8 py-3.5 rounded-[20px] font-bold hover:bg-green-800 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {t('post_review_btn')}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-theme-creamDark rounded-[24px] p-6 hover:-translate-y-1 transition-transform shadow-sm group">
                <div className="flex items-start gap-4">
                  <img
                    src={post.avatar}
                    alt={post.user}
                    className="w-14 h-14 rounded-full object-cover border-2 border-theme-cream"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-theme-dark text-lg">{post.user}</h3>
                        <p className="text-sm text-theme-dark/50 font-medium">{post.time}</p>
                      </div>
                      <div className="flex text-theme-yellow">
                        {[...Array(post.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 bg-theme-mint/20 text-theme-green px-3 py-1.5 rounded-full text-sm font-bold mb-4 border border-theme-mint/30">
                      <Utensils className="w-4 h-4" />
                      {post.food} @ {post.restaurant}
                    </div>
                    
                    <p className="text-theme-dark/80 font-medium leading-relaxed bg-theme-cream/30 p-4 rounded-xl border border-theme-creamDark">
                      {post.content}
                    </p>
                    
                    <div className="mt-5 flex items-center gap-4">
                      <button className="flex items-center gap-2 text-theme-dark/50 hover:text-theme-green transition-colors font-bold">
                        <ThumbsUp className="w-5 h-5" />
                        <span>{post.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
