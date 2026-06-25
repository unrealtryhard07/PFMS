CREATE TYPE account_type AS ENUM ('cash','bank','credit','savings','investment');
CREATE TYPE category_type AS ENUM ('income','expense');
CREATE TYPE transaction_type AS ENUM ('income','expense','transfer');
CREATE TYPE recurrence_frequency AS ENUM ('daily','weekly','monthly','yearly');

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  currency   TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type             account_type NOT NULL DEFAULT 'bank',
  starting_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  color            TEXT NOT NULL DEFAULT '#3b82f6',
  icon             TEXT NOT NULL DEFAULT 'wallet',
  archived_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  icon           TEXT NOT NULL DEFAULT 'circle',
  color          TEXT NOT NULL DEFAULT '#64748b',
  type           category_type NOT NULL,
  monthly_budget NUMERIC(12,2),
  archived_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE savings_goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  deadline      DATE,
  color         TEXT NOT NULL DEFAULT '#3b82f6',
  icon          TEXT NOT NULL DEFAULT 'target',
  archived_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE import_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  row_count   INTEGER NOT NULL DEFAULT 0,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recurring_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  type          transaction_type NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  frequency     recurrence_frequency NOT NULL,
  start_date    DATE NOT NULL,
  next_due_date DATE NOT NULL,
  end_date      DATE,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id       UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  goal_id          UUID REFERENCES savings_goals(id) ON DELETE SET NULL,
  type             transaction_type NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'USD',
  note             TEXT NOT NULL DEFAULT '',
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring     BOOLEAN NOT NULL DEFAULT false,
  recurring_id     UUID REFERENCES recurring_rules(id) ON DELETE SET NULL,
  transfer_pair_id UUID,
  import_id        UUID REFERENCES import_sessions(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_date     ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_transfer_pair ON transactions(transfer_pair_id);
CREATE INDEX idx_recurring_next_due         ON recurring_rules(next_due_date) WHERE active = true;
