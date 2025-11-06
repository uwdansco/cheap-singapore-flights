-- Create enum for subscription plan types
CREATE TYPE subscription_plan_type AS ENUM ('monthly', 'annual', 'grandfathered');

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid');

-- Create enum for guarantee claim status
CREATE TYPE guarantee_claim_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');

-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  plan_type subscription_plan_type NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_type subscription_plan_type,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,
  is_grandfathered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create booking_guarantee_claims table
CREATE TABLE booking_guarantee_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  subscription_year_start TIMESTAMPTZ NOT NULL,
  subscription_year_end TIMESTAMPTZ NOT NULL,
  claim_status guarantee_claim_status NOT NULL DEFAULT 'pending',
  user_statement TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  refund_amount_cents INTEGER,
  stripe_refund_id TEXT,
  refund_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_guarantee_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (publicly readable)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans
  FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON user_subscriptions
  FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for booking_guarantee_claims
CREATE POLICY "Users can view own claims"
  ON booking_guarantee_claims
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims"
  ON booking_guarantee_claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims"
  ON booking_guarantee_claims
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create trigger to update updated_at column
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_guarantee_claims_updated_at
  BEFORE UPDATE ON booking_guarantee_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grandfather existing users
INSERT INTO user_subscriptions (user_id, stripe_customer_id, plan_type, status, is_grandfathered)
SELECT 
  id, 
  'grandfathered_' || id, 
  'grandfathered', 
  'active', 
  true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions);