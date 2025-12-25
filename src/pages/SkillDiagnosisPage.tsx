import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { skillQuestions, skillCategoryNames } from '../data/skillQuestions';

export default function SkillDiagnosisPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(((currentQuestion + 1) / skillQuestions.length) * 100);
  }, [currentQuestion]);

  const handleAnswer = (score: number) => {
    const question = skillQuestions[currentQuestion];
    const newAnswers = { ...answers, [question.id]: score };
    setAnswers(newAnswers);

    if (currentQuestion < skillQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 最後の質問が終わったら結果ページへ
      navigate('/skill-diagnosis/result', {
        state: { answers: newAnswers }
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigate(-1);
    }
  };

  const question = skillQuestions[currentQuestion];
  const categoryName = skillCategoryNames[question.category];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-4"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">戻る</span>
          </button>

          <div className="mb-2">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span className="font-medium">{categoryName}</span>
              <span>{currentQuestion + 1} / {skillQuestions.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 質問カード */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = answers[question.id] === option.score;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.score)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-blue-900' : 'text-slate-700'
                    }`}>
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ナビゲーションヒント */}
        {answers[question.id] !== undefined && currentQuestion < skillQuestions.length - 1 && (
          <div className="text-center">
            <button
              onClick={() => handleAnswer(answers[question.id])}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
            >
              次の質問へ
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

