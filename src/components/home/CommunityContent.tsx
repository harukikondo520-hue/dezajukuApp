import { useCommunityStats } from '../../hooks/useCommunityStats';
import { Users, Trophy, Wallet, TrendingUp } from 'lucide-react';

export default function CommunityContent() {
  const { data: stats, isLoading } = useCommunityStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}千万円`;
    } else if (value >= 10000) {
      return `${Math.round(value / 10000)}万円`;
    }
    return `${value.toLocaleString()}円`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm opacity-90">累計収益化金額</span>
        </div>
        <div className="text-4xl font-bold">
          ¥{stats.cumulativeRevenue.toLocaleString()}
        </div>
        <p className="text-sm opacity-75 mt-2">
          デザジュク生徒全員の収益合計
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">今月の合計収益</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(stats.totalMonthlyRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">今月の平均月収</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(stats.averageMonthlyIncome)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              今月のMVP
            </span>
          </div>
          <p className="text-xs text-gray-500">今月最高収益</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.mvpIncome)}
          </p>
        </div>
      </div>
    </div>
  );
}
