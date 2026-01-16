-- 1. PROFILES: User profile information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. GROUPS: Expense circles
CREATE TABLE public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Apartment',
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8), -- For sharing links
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. GROUP MEMBERS: Mapping users to groups
CREATE TABLE public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(group_id, user_id)
);

-- 4. EXPENSES: The actual spendings
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  paid_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  split_type TEXT DEFAULT 'equal', -- equal, exact, percentage
  category TEXT DEFAULT 'General',
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. EXPENSE SPLITS: How each expense is shared among users
CREATE TABLE public.expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  share_value DECIMAL(12,2), -- for percentage or custom shares
  UNIQUE(expense_id, user_id)
);

-- Enable RLS (Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified for dev, restrict as needed for prod)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Groups are viewable by members" ON groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid())
  OR auth.uid() = created_by
);
CREATE POLICY "Anyone can create a group" ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can view membership" ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Anyone can join with invite" ON group_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can view expenses" ON expenses FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = expenses.group_id AND group_members.user_id = auth.uid())
  OR auth.uid() = (SELECT created_by FROM groups WHERE groups.id = expenses.group_id)
);
CREATE POLICY "Members can add expenses" ON expenses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = expenses.group_id AND group_members.user_id = auth.uid())
);

CREATE POLICY "Members can view splits" ON expense_splits FOR SELECT USING (
  EXISTS (SELECT 1 FROM expenses JOIN group_members ON expenses.group_id = group_members.group_id WHERE expenses.id = expense_splits.expense_id AND group_members.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM expenses JOIN groups ON expenses.group_id = groups.id WHERE expenses.id = expense_splits.expense_id AND groups.created_by = auth.uid())
);
CREATE POLICY "Members can add splits" ON expense_splits FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM expenses JOIN group_members ON expenses.group_id = group_members.group_id WHERE expenses.id = expense_splits.expense_id AND group_members.user_id = auth.uid())
);
