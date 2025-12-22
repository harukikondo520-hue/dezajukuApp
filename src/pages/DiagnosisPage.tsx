import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { diagnosisQuestions } from '../data/questions';
import { diagnosisExQuestions } from '../data/diagnosisExQuestions';
import { DiagnosisExAnswer } from '../types/diagnosisEx';

type Stage = 'basic' | 'ex';

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('basic');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [exAnswers, setExAnswers] = useState<DiagnosisExAnswer[]>([]);
  const [currentExAnswer, setCurrentExAnswer] = useState('');

  const currentQuestion = stage === 'basic'
    ? diagnosisQuestions[currentIndex]
    : diagnosisExQuestions[currentIndex];

  const totalQuestions = stage === 'basic'
    ? diagnosisQuestions.length
    : diagnosisExQuestions.length;

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [`q${currentQuestion.id}`]: value };
    setAnswers(newAnswers);

    if (currentIndex < diagnosisQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStage('ex');
      setCurrentIndex(0);
    }
  };

  const handleExNext = () => {
    const minLength = (currentQuestion as any).minLength || 50;

    if (currentExAnswer.length < minLength) {
      alert(`${minLength}文字以上入力してください（現在${currentExAnswer.length}文字）`);
      return;
    }

    const newExAnswers = [
      ...exAnswers,
      { questionId: currentQuestion.id, answer: currentExAnswer }
    ];
    setExAnswers(newExAnswers);
    setCurrentExAnswer('');

    if (currentIndex < diagnosisExQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/diagnosis/result', {
        state: {
          answers,
          exAnswers: newExAnswers
        }
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (stage === 'ex' && exAnswers.length > currentIndex - 1) {
        setCurrentExAnswer(exAnswers[currentIndex - 1].answer);
      }
    } else if (stage === 'ex') {
      setStage('basic');
      setCurrentIndex(diagnosisQuestions.length - 1);
    }
  };

  const ratingLabels = [
    '全く当てはまらない',
    'あまり当てはまらない',
    'どちらとも言えない',
    'やや当てはまる',
    'とても当てはまる'
  ];

  if (stage === 'basic') {
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

  const exQuestion = currentQuestion as any;
  const charCount = currentExAnswer.length;
  const minLength = exQuestion.minLength || 50;
  const isValid = charCount >= minLength;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-500">
              診断EX {currentIndex + 1} / {diagnosisExQuestions.length}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full mb-4">
            より深い自己分析
          </div>
          <h2 className="text-xl font-bold text-gray-800 leading-relaxed mb-2">
            {exQuestion.question}
          </h2>
          <p className="text-sm text-gray-500">
            最低{minLength}文字以上で回答してください
          </p>
        </div>

        <div className="mb-6">
          <textarea
            value={currentExAnswer}
            onChange={(e) => setCurrentExAnswer(e.target.value)}
            placeholder={exQuestion.placeholder}
            className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 resize-none"
          />
          <div className="flex justify-between mt-2 text-sm">
            <span className={charCount >= minLength ? 'text-green-600' : 'text-gray-400'}>
              {charCount} / {minLength}文字
            </span>
            {isValid && (
              <span className="text-green-600 font-medium">✓ 入力完了</span>
            )}
          </div>
        </div>

        <button
          onClick={handleExNext}
          disabled={!isValid}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl
            hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentIndex === diagnosisExQuestions.length - 1 ? '診断完了' : '次へ'}
        </button>
      </div>
    </div>
  );
}
