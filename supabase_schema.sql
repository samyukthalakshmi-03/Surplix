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
    prepared_before VARCHAR(255),
    food_type VARCHAR(50),
    allergens VARCHAR(255),
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

-- Enable Realtime for the food_items table so changes reflect instantly across accounts
ALTER PUBLICATION supabase_realtime ADD TABLE food_items;

-- Create sold_items table to store donated or sold out items
CREATE TABLE sold_items (
    id UUID PRIMARY KEY,
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    total_servings INTEGER NOT NULL,
    sold_price INTEGER,
    views INTEGER,
    interested INTEGER,
    status VARCHAR(50),
    category VARCHAR(255),
    prepared_before VARCHAR(255),
    food_type VARCHAR(50),
    allergens VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function to move item out of public view when it is sold out or donated
CREATE OR REPLACE FUNCTION move_to_sold_items()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('donated', 'sold_out') THEN
        INSERT INTO sold_items (id, user_id, name, location, lat, lng, total_servings, sold_price, views, interested, status, category, prepared_before, food_type, allergens, created_at)
        VALUES (NEW.id, NEW.user_id, NEW.name, NEW.location, NEW.lat, NEW.lng, NEW.total_servings, NEW.initial_price, NEW.views, NEW.interested, NEW.status, NEW.category, NEW.prepared_before, NEW.food_type, NEW.allergens, NEW.created_at)
        ON CONFLICT (id) DO NOTHING;
        
        DELETE FROM food_items WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_move_sold_items
AFTER UPDATE ON food_items
FOR EACH ROW EXECUTE FUNCTION move_to_sold_items();
