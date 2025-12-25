-- PostgreSQL関数を作成して全ユーザーの統計を取得できるようにする
-- SECURITY DEFINERを使用してRLSをバイパス

-- 累計収益化金額を取得する関数
CREATE OR REPLACE FUNCTION get_cumulative_revenue()
RETURNS BIGINT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COALESCE(SUM(reward), 0)
  INTO total
  FROM projects;
  
  RETURN total;
END;
$$;

-- 今月の統計を取得する関数
CREATE OR REPLACE FUNCTION get_monthly_stats()
RETURNS TABLE (
  total_monthly_revenue BIGINT,
  active_users_count BIGINT,
  avg_monthly_income BIGINT,
  mvp_income BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  start_of_month TIMESTAMPTZ;
BEGIN
  start_of_month := date_trunc('month', NOW());
  
  RETURN QUERY
  WITH monthly_projects AS (
    SELECT 
      reward,
      user_id
    FROM projects
    WHERE 
      (completed_at >= start_of_month OR 
       (completed_at IS NULL AND created_at >= start_of_month))
  ),
  user_totals AS (
    SELECT 
      user_id,
      SUM(reward) as user_total
    FROM monthly_projects
    GROUP BY user_id
  )
  SELECT
    COALESCE(SUM(mp.reward), 0)::BIGINT as total_monthly_revenue,
    COUNT(DISTINCT mp.user_id)::BIGINT as active_users_count,
    CASE 
      WHEN COUNT(DISTINCT mp.user_id) > 0 
      THEN (SUM(mp.reward) / COUNT(DISTINCT mp.user_id))::BIGINT
      ELSE 0::BIGINT
    END as avg_monthly_income,
    COALESCE(MAX(ut.user_total), 0)::BIGINT as mvp_income
  FROM monthly_projects mp
  LEFT JOIN user_totals ut ON true;
END;
$$;

-- 過去6ヶ月の履歴を取得する関数
CREATE OR REPLACE FUNCTION get_monthly_history()
RETURNS TABLE (
  month TEXT,
  total BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  start_date TIMESTAMPTZ;
BEGIN
  start_date := date_trunc('month', NOW() - INTERVAL '5 months');
  
  RETURN QUERY
  SELECT 
    to_char(date_trunc('month', COALESCE(p.completed_at, p.created_at)), 'YYYY年MM月') as month,
    COALESCE(SUM(p.reward), 0)::BIGINT as total
  FROM projects p
  WHERE 
    (p.completed_at >= start_date OR 
     (p.completed_at IS NULL AND p.created_at >= start_date))
  GROUP BY date_trunc('month', COALESCE(p.completed_at, p.created_at))
  ORDER BY date_trunc('month', COALESCE(p.completed_at, p.created_at));
END;
$$;

-- 関数の実行権限を認証済みユーザーに付与
GRANT EXECUTE ON FUNCTION get_cumulative_revenue() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_history() TO authenticated;


