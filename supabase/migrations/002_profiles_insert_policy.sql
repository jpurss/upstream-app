-- Safety net: allow authenticated users to insert their own profile row.
-- Primary profile creation uses the admin client (service role) to bypass RLS,
-- but this policy provides a fallback if the approach changes.
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
