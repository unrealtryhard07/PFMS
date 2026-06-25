ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own"          ON profiles        FOR ALL USING (auth.uid() = id);
CREATE POLICY "accounts_own"          ON accounts        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "categories_own_system" ON categories      FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "transactions_own"      ON transactions    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "recurring_own"         ON recurring_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_own"             ON savings_goals   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "imports_own"           ON import_sessions FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'USD')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
