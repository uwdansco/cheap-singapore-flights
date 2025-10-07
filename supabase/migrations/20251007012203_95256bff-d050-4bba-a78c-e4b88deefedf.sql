-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  verification_token TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  airport_code TEXT NOT NULL UNIQUE,
  priority INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create price_alerts table
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  dates TEXT NOT NULL,
  tracking_threshold DECIMAL(10, 2),
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_to_subscribers BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Public policies for subscribers (anyone can sign up)
CREATE POLICY "Anyone can insert subscribers" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

-- Public read policies for destinations and price_alerts (anyone can view)
CREATE POLICY "Anyone can view destinations" 
ON public.destinations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view price alerts" 
ON public.price_alerts 
FOR SELECT 
USING (true);

-- Insert top 50 destinations
INSERT INTO public.destinations (city_name, country, airport_code, priority) VALUES
('London', 'United Kingdom', 'LHR', 1),
('Paris', 'France', 'CDG', 2),
('Tokyo', 'Japan', 'NRT', 3),
('Barcelona', 'Spain', 'BCN', 4),
('Amsterdam', 'Netherlands', 'AMS', 5),
('Rome', 'Italy', 'FCO', 6),
('Dubai', 'UAE', 'DXB', 7),
('Cancún', 'Mexico', 'CUN', 8),
('Punta Cana', 'Dominican Republic', 'PUJ', 9),
('San José', 'Costa Rica', 'SJO', 10),
('Mexico City', 'Mexico', 'MEX', 11),
('Montego Bay', 'Jamaica', 'MBJ', 12),
('Nassau', 'Bahamas', 'NAS', 13),
('Aruba', 'Aruba', 'AUA', 14),
('Grand Cayman', 'Cayman Islands', 'GCM', 15),
('Madrid', 'Spain', 'MAD', 16),
('Frankfurt', 'Germany', 'FRA', 17),
('Munich', 'Germany', 'MUC', 18),
('Lisbon', 'Portugal', 'LIS', 19),
('Athens', 'Greece', 'ATH', 20),
('Istanbul', 'Turkey', 'IST', 21),
('Tel Aviv', 'Israel', 'TLV', 22),
('Dublin', 'Ireland', 'DUB', 23),
('Reykjavik', 'Iceland', 'KEF', 24),
('Copenhagen', 'Denmark', 'CPH', 25),
('Stockholm', 'Sweden', 'ARN', 26),
('Oslo', 'Norway', 'OSL', 27),
('Zurich', 'Switzerland', 'ZRH', 28),
('Vienna', 'Austria', 'VIE', 29),
('Prague', 'Czech Republic', 'PRG', 30),
('Budapest', 'Hungary', 'BUD', 31),
('Warsaw', 'Poland', 'WAW', 32),
('Seoul', 'South Korea', 'ICN', 33),
('Hong Kong', 'Hong Kong', 'HKG', 34),
('Singapore', 'Singapore', 'SIN', 35),
('Bangkok', 'Thailand', 'BKK', 36),
('Bali', 'Indonesia', 'DPS', 37),
('Sydney', 'Australia', 'SYD', 38),
('Auckland', 'New Zealand', 'AKL', 39),
('São Paulo', 'Brazil', 'GRU', 40),
('Buenos Aires', 'Argentina', 'EZE', 41),
('Lima', 'Peru', 'LIM', 42),
('Bogotá', 'Colombia', 'BOG', 43),
('Santiago', 'Chile', 'SCL', 44),
('Cape Town', 'South Africa', 'CPT', 45),
('Marrakech', 'Morocco', 'RAK', 46),
('Cairo', 'Egypt', 'CAI', 47),
('Johannesburg', 'South Africa', 'JNB', 48),
('Nairobi', 'Kenya', 'NBO', 49),
('Mauritius', 'Mauritius', 'MRU', 50);

-- Insert some sample price alerts for display
INSERT INTO public.price_alerts (destination_id, price, dates, tracking_threshold) 
SELECT id, 
  CASE 
    WHEN priority <= 10 THEN 299.00
    WHEN priority <= 25 THEN 399.00
    ELSE 499.00
  END,
  'Dec 15-22, 2025',
  CASE 
    WHEN priority <= 10 THEN 250.00
    WHEN priority <= 25 THEN 350.00
    ELSE 450.00
  END
FROM public.destinations 
WHERE priority <= 6;