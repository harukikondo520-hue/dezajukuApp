import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { diagnosisQuestions } from '../data/questions';

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentValue, setCurrentValue] = useState(3); // デフォルトは中央

  const currentQuestion = diagnosisQuestions[currentIndex];
  const totalQuestions = diagnosisQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // 軸ごとの進捗表示
  const getAxisLabel = () => {
    if (currentIndex < 6) return '思考OS';
    if (currentIndex < 12) return '武器種';
    return 'エンジン';
  };

  const getAxisProgress = () => {
    if (currentIndex < 6) return `${currentIndex + 1}/6`;
    if (currentIndex < 12) return `${currentIndex - 5}/6`;
    return `${currentIndex - 11}/6`;
  };

  const handleNext = () => {
    const newAnswers = [...answers, currentValue];
    setAnswers(newAnswers);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(3); // 次の質問は中央にリセット
    } else {
      // 診断完了 → 結果画面へ
      navigate('/diagnosis/result', {
        state: { answers: newAnswers }
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevAnswer = answers[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setCurrentValue(prevAnswer || 3);
      setAnswers(answers.slice(0, -1));
    }
  };

  const sliderLabels = ['', '', '', '', ''];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-full hover:bg-gray-100 text-slate-500 transition"
                title="ホームへ戻る"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* プログレスバー */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 軸表示 */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
              {getAxisLabel()}
            </span>
            <span className="text-xs text-gray-400">
              {getAxisProgress()}
            </span>
          </div>
        </div>

        {/* マスコット */}
        <div className="flex justify-center mb-6">
          <img
            src="https://i.ibb.co/cKzhRLcc/DEZAHUKU-red-1.png"
            alt="デザジュク"
            className="w-32 h-32 object-contain"
          />
        </div>

        {/* 質問 */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        {/* スライダーエリア */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          {/* ラベル */}
          <div className="flex justify-between mb-4">
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-blue-600 leading-tight">
                {currentQuestion.labelA}
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium text-orange-600 leading-tight">
                {currentQuestion.labelB}
              </p>
            </div>
          </div>

          {/* スライダー */}
          <div className="relative py-4">
            <input
              type="range"
              min="1"
              max="5"
              value={currentValue}
              onChange={(e) => setCurrentValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentValue - 1) * 25}%, #e5e7eb ${(currentValue - 1) * 25}%, #e5e7eb 100%)`
              }}
            />
            
            {/* 目盛り */}
            <div className="flex justify-between mt-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setCurrentValue(val)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${currentValue === val
                      ? 'bg-red-500 text-white scale-110 shadow-lg'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* 説明 */}
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Aに近い</span>
              <span>どちらでもない</span>
              <span>Bに近い</span>
            </div>
          </div>
        </div>

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl
            hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
        >
          {currentIndex === totalQuestions - 1 ? '診断結果を見る' : '次へ'}
        </button>
      </div>

      {/* スライダーのカスタムスタイル */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
