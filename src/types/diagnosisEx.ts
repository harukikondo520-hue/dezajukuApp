export interface DiagnosisExQuestion {
  id: number;
  category: 'values' | 'vision' | 'strength' | 'challenge' | 'style';
  question: string;
  placeholder: string;
  minLength: number;
}

export interface DiagnosisExAnswer {
  questionId: number;
  answer: string;
}

export interface DiagnosisExResult {
  id: string;
  user_id: string;
  answers: DiagnosisExAnswer[];
  ai_report: string;
  ai_summary: string;
  ai_key_points: string[];
  diagnosed_at: string;
}
