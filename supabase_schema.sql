-- Create a table for food items
CREATE TABLE food_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    total_servings INTEGER NOT NULL,
    available_servings INTEGER NOT NULL,
    initial_price INTEGER NOT NULL,
    price_floor INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    interested INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    category VARCHAR(255) DEFAULT 'Surplus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access"
ON food_items FOR SELECT
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert"
ON food_items FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own items, or any authenticated user to update views/interests/servings
CREATE POLICY "Authenticated users can update"
ON food_items FOR UPDATE
USING (auth.role() = 'authenticated');
