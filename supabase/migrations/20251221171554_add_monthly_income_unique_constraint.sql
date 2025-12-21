/*
  # Add unique constraint to monthly_income table

  1. Changes
    - Add unique constraint on (user_id, year_month) combination
    - This allows safe upsert operations when updating monthly income data

  2. Security
    - No changes to RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'monthly_income_user_id_year_month_key'
  ) THEN
    ALTER TABLE monthly_income
    ADD CONSTRAINT monthly_income_user_id_year_month_key
    UNIQUE (user_id, year_month);
  END IF;
END $$;
