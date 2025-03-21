-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create irrigation_plans table
CREATE TABLE irrigation_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  crop_id TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create irrigation_events table (optional - for tracking actual irrigation events)
CREATE TABLE irrigation_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES irrigation_plans(id) ON DELETE CASCADE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_irrigation_plans_user_id ON irrigation_plans(user_id);
CREATE INDEX idx_irrigation_plans_crop_id ON irrigation_plans(crop_id);
CREATE INDEX idx_irrigation_events_plan_id ON irrigation_events(plan_id);

-- Enable Row Level Security (RLS)
ALTER TABLE irrigation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_events ENABLE ROW LEVEL SECURITY;

-- Create policies for irrigation_plans
CREATE POLICY "Users can view their own irrigation plans" ON irrigation_plans
  FOR SELECT USING (requesting_user_id() = user_id);

CREATE POLICY "Users can insert their own irrigation plans" ON irrigation_plans
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY "Users can update their own irrigation plans" ON irrigation_plans
  FOR UPDATE USING (requesting_user_id() = user_id);

CREATE POLICY "Users can delete their own irrigation plans" ON irrigation_plans
  FOR DELETE USING (requesting_user_id() = user_id);

-- Create policies for irrigation_events
CREATE POLICY "Users can view events for their plans" ON irrigation_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM irrigation_plans 
      WHERE irrigation_plans.id = irrigation_events.plan_id 
      AND irrigation_plans.user_id = requesting_user_id()
    )
  );

CREATE POLICY "Users can insert events for their plans" ON irrigation_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM irrigation_plans 
      WHERE irrigation_plans.id = plan_id 
      AND irrigation_plans.user_id = requesting_user_id()
    )
  );

CREATE POLICY "Users can update events for their plans" ON irrigation_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM irrigation_plans 
      WHERE irrigation_plans.id = irrigation_events.plan_id 
      AND irrigation_plans.user_id = requesting_user_id()
    )
  );

CREATE POLICY "Users can delete events for their plans" ON irrigation_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM irrigation_plans 
      WHERE irrigation_plans.id = irrigation_events.plan_id 
      AND irrigation_plans.user_id = requesting_user_id()
    )
  );
