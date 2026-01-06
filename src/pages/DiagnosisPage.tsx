import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { diagnosisQuestions } from '../data/questions';

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(18).fill(null));
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // 現在のページ（0: 思考OS, 1: 武器種, 2: エンジン）
  const currentPage = Math.floor(activeQuestionIndex / 6);
  const pageStartIndex = currentPage * 6;
  const pageQuestions = diagnosisQuestions.slice(pageStartIndex, pageStartIndex + 6);

  // 軸名
  const axisNames = ['思考OS', '武器種', 'エンジン'];
  const axisDescriptions = [
    'Logic（論理） vs Emotion（感情）',
    'Craft（職人） vs Business（商売）',
    'Self（自分） vs Others（他者）'
  ];

  // 回答処理
  const handleAnswer = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);

    // 次の質問へ移動
    if (questionIndex < 17) {
      setActiveQuestionIndex(questionIndex + 1);
    }
  };

  // 次のページへ
  const handleNextPage = () => {
    if (currentPage < 2) {
      setActiveQuestionIndex((currentPage + 1) * 6);
    } else {
      // 全問回答完了 → 結果画面へ
      const finalAnswers = answers.map(a => a ?? 3);
      navigate('/diagnosis/result', {
        state: { answers: finalAnswers }
      });
    }
  };

  // 前のページへ
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setActiveQuestionIndex((currentPage - 1) * 6);
    }
  };

  // 現在のページの全質問に回答済みか
  const isPageComplete = pageQuestions.every((_, i) => answers[pageStartIndex + i] !== null);

  // 全体の進捗
  const answeredCount = answers.filter(a => a !== null).length;
  const progress = (answeredCount / 18) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {currentPage + 1} / 3
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

      {/* 軸タイトル */}
      <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {axisNames[currentPage]}
          </h2>
          <p className="text-sm text-slate-500">
            {axisDescriptions[currentPage]}
          </p>
        </div>
      </div>

      {/* 質問リスト */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {pageQuestions.map((question, index) => {
            const globalIndex = pageStartIndex + index;
            const isActive = globalIndex === activeQuestionIndex;
            const isAnswered = answers[globalIndex] !== null;
            const currentValue = answers[globalIndex] ?? 3;

            return (
              <div
                key={question.id}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'border-red-500 bg-white shadow-lg' 
                    : isAnswered 
                      ? 'border-slate-200 bg-white' 
                      : 'border-slate-100 bg-slate-50'
                  }`}
                onClick={() => setActiveQuestionIndex(globalIndex)}
                style={{
                  filter: isActive ? 'none' : 'grayscale(0.7)',
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                {/* 質問番号と質問文 */}
                <div className="flex items-start gap-3 mb-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${isActive ? 'bg-red-500 text-white' : isAnswered ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {isAnswered && !isActive ? '✓' : index + 1}
                  </span>
                  <p className={`text-sm font-medium leading-relaxed ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                    {question.text}
                  </p>
                </div>

                {/* 選択肢ラベル */}
                <div className="flex justify-between mb-2 px-1">
                  <span className="text-xs text-blue-600 max-w-[45%] leading-snug">
                    {question.labelA}
                  </span>
                  <span className="text-xs text-orange-600 max-w-[45%] text-right leading-snug">
                    {question.labelB}
                  </span>
                </div>

                {/* スライダー */}
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentValue}
                    onChange={(e) => handleAnswer(globalIndex, parseInt(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: isActive 
                        ? `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentValue - 1) * 25}%, #e2e8f0 ${(currentValue - 1) * 25}%, #e2e8f0 100%)`
                        : '#e2e8f0'
                    }}
                  />
                  
                  {/* 目盛り */}
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(globalIndex, val);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                          ${currentValue === val && isActive
                            ? 'bg-red-500 text-white scale-110'
                            : currentValue === val
                              ? 'bg-slate-400 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* フッター */}
      <div className="px-4 py-4 border-t border-slate-100 bg-white sticky bottom-0">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNextPage}
            disabled={!isPageComplete}
            className="w-full py-3 bg-red-500 text-white font-bold rounded-xl
              hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentPage === 2 ? '結果を見る' : '次へ'}
          </button>
        </div>
      </div>

      {/* スライダーのカスタムスタイル */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
}
