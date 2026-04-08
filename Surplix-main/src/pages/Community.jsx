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
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-theme-mint/20">
        <div className="bg-theme-mint/10 p-8 border-b border-theme-mint/20">
          <h1 className="text-4xl font-bold text-theme-dark mb-4 flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-theme-mint" />
            {t('community_title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('community_subtitle')}
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handlePostSubmit} className="mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('food_item_label')}</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-mint focus:border-transparent outline-none bg-white transition-all font-sans"
                  placeholder={t('food_item_placeholder')}
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('seller_label')}</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-mint focus:border-transparent outline-none bg-white transition-all font-sans"
                  placeholder={t('seller_placeholder')}
                  value={newRestaurant}
                  onChange={(e) => setNewRestaurant(e.target.value)}
                />
              </div>
            </div>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-mint focus:border-transparent outline-none resize-none bg-white transition-all font-sans"
              rows="3"
              placeholder={t('share_experience_placeholder')}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            ></textarea>
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2 text-theme-mint items-center">
                 <span className="text-sm font-bold text-gray-600 mr-2">{t('rate_label')}</span>
                 {[1, 2, 3, 4, 5].map((star) => (
                   <Star 
                     key={star} 
                     className={`w-7 h-7 cursor-pointer transition-colors ${star <= newRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                     onClick={() => setNewRating(star)}
                   />
                 ))}
              </div>
              <button
                type="submit"
                className="bg-theme-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 transition-colors shadow-lg shadow-theme-mint/20 flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {t('post_review_btn')}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <img
                    src={post.avatar}
                    alt={post.user}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{post.user}</h3>
                        <p className="text-sm text-gray-500">{post.time}</p>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(post.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 bg-theme-mint/10 text-theme-dark px-3 py-1 rounded-full text-sm font-medium mb-3">
                      <Utensils className="w-4 h-4 text-theme-mint" />
                      {post.food} @ {post.restaurant}
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      {post.content}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-4">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-theme-primary transition-colors">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-medium">{post.likes}</span>
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
