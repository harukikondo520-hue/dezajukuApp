export interface CommunityStats {
  totalMonthlyRevenue: number;
  averageMonthlyIncome: number;
  mvpIncome: number;
  mvpUserName: string;
  cumulativeRevenue: number;
  activeUsersCount: number;
  monthlyRevenueHistory: {
    month: string;
    total: number;
  }[];
}
