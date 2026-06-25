CREATE OR REPLACE FUNCTION seed_default_categories(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO categories (user_id, name, icon, color, type) VALUES
    (p_user_id, 'Salary',            'briefcase',    '#10b981', 'income'),
    (p_user_id, 'Freelance',         'laptop',       '#06b6d4', 'income'),
    (p_user_id, 'Food & Dining',     'utensils',     '#f59e0b', 'expense'),
    (p_user_id, 'Transport',         'car',          '#6366f1', 'expense'),
    (p_user_id, 'Shopping',          'shopping-bag', '#ec4899', 'expense'),
    (p_user_id, 'Bills & Utilities', 'zap',          '#ef4444', 'expense'),
    (p_user_id, 'Health',            'heart',        '#14b8a6', 'expense'),
    (p_user_id, 'Entertainment',     'film',         '#8b5cf6', 'expense'),
    (p_user_id, 'Education',         'book',         '#3b82f6', 'expense'),
    (p_user_id, 'Travel',            'plane',        '#f97316', 'expense'),
    (p_user_id, 'Other',             'circle',       '#64748b', 'expense');
END;
$$;
