-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND ('admin' = ANY(roles) OR 'president' = ANY(roles) OR 'co_president' = ANY(roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is president or co-president
CREATE OR REPLACE FUNCTION is_president()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND ('president' = ANY(roles) OR 'co_president' = ANY(roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is participant in conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id 
    AND auth.uid()::text = ANY(participant_ids)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Anyone can view user profiles
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON users FOR UPDATE
  USING (is_admin());

-- Only admins can insert users (registration handled by auth)
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (is_admin());

-- ============================================
-- USER PROFILES TABLE POLICIES
-- ============================================

-- Anyone can view profiles
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile data"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile data"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TOURNAMENTS TABLE POLICIES
-- ============================================

-- Anyone can view tournaments
CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  USING (true);

-- Admins can manage tournaments
CREATE POLICY "Admins can insert tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update tournaments"
  ON tournaments FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete tournaments"
  ON tournaments FOR DELETE
  USING (is_admin());

-- ============================================
-- TEAMS TABLE POLICIES
-- ============================================

-- Anyone can view teams
CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  USING (true);

-- Team captains can update their team
CREATE POLICY "Captains can update their team"
  ON teams FOR UPDATE
  USING (auth.uid() = captain_id);

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- MATCHES TABLE POLICIES
-- ============================================

-- Anyone can view matches
CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  USING (true);

-- Admins can manage matches
CREATE POLICY "Admins can manage matches"
  ON matches FOR ALL
  USING (is_admin());

-- ============================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid()::text = ANY(participant_ids));

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid()::text = ANY(participant_ids));

-- Participants can update conversations
CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid()::text = ANY(participant_ids));

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (is_conversation_participant(conversation_id));

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    is_conversation_participant(conversation_id) 
    AND auth.uid()::text = sender_id
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid()::text = sender_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (auth.uid()::text = sender_id);

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR is_admin());

-- Admins can manage products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin());

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin());

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update orders
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- ============================================
-- ANNOUNCEMENTS TABLE POLICIES
-- ============================================

-- Anyone can view announcements
CREATE POLICY "Anyone can view announcements"
  ON announcements FOR SELECT
  USING (true);

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (is_admin());

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

-- Anyone can view events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

-- Admins can manage events
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (is_admin());

-- ============================================
-- ENABLE REALTIME FOR MESSAGING
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

