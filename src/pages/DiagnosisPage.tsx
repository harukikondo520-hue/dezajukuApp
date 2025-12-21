import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { diagnosisQuestions } from '../data/questions';

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = diagnosisQuestions[currentIndex];
  const progress = ((currentIndex + 1) / diagnosisQuestions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [`q${currentQuestion.id}`]: value };
    setAnswers(newAnswers);

    if (currentIndex < diagnosisQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/diagnosis/result', { state: { answers: newAnswers } });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const ratingLabels = [
    '全く当てはまらない',
    'あまり当てはまらない',
    'どちらとも言えない',
    'やや当てはまる',
    'とても当てはまる'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {diagnosisQuestions.length}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleAnswer(value)}
              className={`w-full py-4 px-6 rounded-2xl border-2 transition-all duration-200 text-left
                ${answers[`q${currentQuestion.id}`] === value
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${answers[`q${currentQuestion.id}`] === value
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {value}
                </span>
                <span className="text-sm">{ratingLabels[value - 1]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
