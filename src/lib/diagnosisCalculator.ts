import { SkillCategory, SkillScores, DesignerType } from '../types/diagnosis';

export function calculateSkillScores(answers: Record<string, number>): SkillScores {
  const categoryQuestions: Record<SkillCategory, number[]> = {
    design: [1, 2, 3, 4],
    planning: [5, 6, 7, 8],
    client: [9, 10, 11, 12],
    business: [13, 14, 15, 16],
    mindset: [17, 18, 19, 20]
  };

  const scores: SkillScores = {
    design: 0,
    planning: 0,
    client: 0,
    business: 0,
    mindset: 0
  };

  for (const [category, questionIds] of Object.entries(categoryQuestions)) {
    const sum = questionIds.reduce((acc, id) => acc + (answers[`q${id}`] || 1), 0);
    scores[category as SkillCategory] = Math.round(((sum - 4) / 16) * 100);
  }

  return scores;
}

export function determineDesignerType(scores: SkillScores): DesignerType {
  const entries = Object.entries(scores) as [SkillCategory, number][];
  const max = Math.max(...Object.values(scores));
  const min = Math.min(...Object.values(scores));

  if (max - min <= 20) {
    return 'all_rounder';
  }

  const priority: SkillCategory[] = ['design', 'planning', 'client', 'business', 'mindset'];

  for (const category of priority) {
    if (scores[category] === max) {
      const typeMap: Record<SkillCategory, DesignerType> = {
        design: 'artist',
        planning: 'strategist',
        client: 'partner',
        business: 'business_designer',
        mindset: 'growth'
      };
      return typeMap[category];
    }
  }

  return 'all_rounder';
}
