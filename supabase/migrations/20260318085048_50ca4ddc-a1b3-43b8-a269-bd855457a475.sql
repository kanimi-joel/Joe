-- Create listing categories enum
CREATE TYPE public.listing_category AS ENUM (
  'jobs', 'housing', 'for_sale', 'services', 'community', 'gigs'
);

-- Create listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category listing_category NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Everyone can read listings
CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT USING (true);

-- Users can create their own listings
CREATE POLICY "Users can create their own listings"
  ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);