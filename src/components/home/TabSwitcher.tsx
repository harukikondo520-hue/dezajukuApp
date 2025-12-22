interface TabSwitcherProps {
  activeTab: 'mypage' | 'community';
  onTabChange: (tab: 'mypage' | 'community') => void;
}

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
      <button
        onClick={() => onTabChange('mypage')}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200
          ${activeTab === 'mypage'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        マイページ
      </button>
      <button
        onClick={() => onTabChange('community')}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200
          ${activeTab === 'community'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        デザジュク
      </button>
    </div>
  );
}
