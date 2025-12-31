import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Shield, HelpCircle, FileText, Mail } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  const settingsItems = [
    { icon: Bell, label: '通知設定', description: 'プッシュ通知の設定', disabled: true },
    { icon: Shield, label: 'プライバシー', description: 'プライバシー設定', disabled: true },
    { icon: HelpCircle, label: 'ヘルプ', description: 'よくある質問', disabled: true },
    { icon: FileText, label: '利用規約', description: '利用規約を確認', disabled: true },
    { icon: Mail, label: 'お問い合わせ', description: 'サポートに連絡', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="font-bold text-slate-900">設定</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl overflow-hidden">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === settingsItems.length - 1;
            
            return (
              <button
                key={item.label}
                disabled={item.disabled}
                className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-all ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
                } ${!isLast ? 'border-b border-slate-100' : ''}`}
              >
                <Icon size={20} className="text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
                {item.disabled && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">準備中</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Dezajuku App v1.0.0
        </p>
      </div>
    </div>
  );
}

