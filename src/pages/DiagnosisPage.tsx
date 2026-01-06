import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { diagnosisQuestions } from '../data/questions';

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentValue, setCurrentValue] = useState(3);

  const currentQuestion = diagnosisQuestions[currentIndex];
  const totalQuestions = diagnosisQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleNext = () => {
    const newAnswers = [...answers, currentValue];
    setAnswers(newAnswers);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(3);
    } else {
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ヘッダー */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full h-1 bg-slate-100">
        <div
          className="h-full bg-red-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* 質問 */}
          <h2 className="text-xl font-bold text-slate-900 text-center mb-12 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* 選択肢ラベル */}
          <div className="flex justify-between mb-6 px-2">
            <p className="text-sm text-slate-600 max-w-[140px] leading-snug">
              {currentQuestion.labelA}
            </p>
            <p className="text-sm text-slate-600 max-w-[140px] text-right leading-snug">
              {currentQuestion.labelB}
            </p>
          </div>

          {/* スライダー */}
          <div className="mb-8">
            <input
              type="range"
              min="1"
              max="5"
              value={currentValue}
              onChange={(e) => setCurrentValue(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentValue - 1) * 25}%, #e2e8f0 ${(currentValue - 1) * 25}%, #e2e8f0 100%)`
              }}
            />
            
            {/* 目盛りボタン */}
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setCurrentValue(val)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${currentValue === val
                      ? 'bg-red-500 text-white shadow-lg scale-110'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* 次へボタン */}
          <button
            onClick={handleNext}
            className="w-full py-4 bg-red-500 text-white font-bold rounded-xl
              hover:bg-red-600 transition-all duration-200"
          >
            {currentIndex === totalQuestions - 1 ? '結果を見る' : '次へ'}
          </button>
        </div>
      </div>

      {/* スライダーのカスタムスタイル */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
}
