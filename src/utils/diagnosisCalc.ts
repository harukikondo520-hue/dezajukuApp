import { AxisScores, AxisResult, DesignerTypeCode, DesignerTypeInfo } from '../types/diagnosis';
import { designerTypes } from '../data/questions';

/**
 * A側スコアを計算（1,2を選んだ場合に加算）
 * 回答値1 → +2, 回答値2 → +1, 回答値3,4,5 → 0
 */
function calcSideA(answers: number[]): number {
  return answers.reduce((sum, val) => sum + Math.max(0, 3 - val), 0);
}

/**
 * B側スコアを計算（4,5を選んだ場合に加算）
 * 回答値1,2,3 → 0, 回答値4 → +1, 回答値5 → +2
 */
function calcSideB(answers: number[]): number {
  return answers.reduce((sum, val) => sum + Math.max(0, val - 3), 0);
}

/**
 * 回答配列から各軸のスコアを計算
 * @param answers 18問の回答配列（1-5の値）
 */
export function calcAxisScores(answers: number[]): AxisScores {
  const thinkingAnswers = answers.slice(0, 6);   // Q1-Q6
  const weaponAnswers = answers.slice(6, 12);    // Q7-Q12
  const engineAnswers = answers.slice(12, 18);   // Q13-Q18

  return {
    logic: calcSideA(thinkingAnswers),
    emotion: calcSideB(thinkingAnswers),
    craft: calcSideA(weaponAnswers),
    business: calcSideB(weaponAnswers),
    self: calcSideA(engineAnswers),
    others: calcSideB(engineAnswers),
  };
}

/**
 * スコアから各軸の判定を行う
 * 同点の場合はA側（Logic/Craft/Self）を優先
 */
export function determineAxes(scores: AxisScores): AxisResult {
  return {
    thinking: scores.logic >= scores.emotion ? 'Logic' : 'Emotion',
    weapon: scores.craft >= scores.business ? 'Craft' : 'Business',
    engine: scores.self >= scores.others ? 'Self' : 'Others',
  };
}

/**
 * 軸の判定結果からタイプコードを生成
 * 例: Logic × Craft × Self → 'LCS'
 */
export function generateTypeCode(axes: AxisResult): DesignerTypeCode {
  const t = axes.thinking === 'Logic' ? 'L' : 'E';
  const w = axes.weapon === 'Craft' ? 'C' : 'B';
  const e = axes.engine === 'Self' ? 'S' : 'O';
  return `${t}${w}${e}` as DesignerTypeCode;
}

/**
 * タイプコードからタイプ情報を取得
 */
export function getTypeInfo(typeCode: DesignerTypeCode): DesignerTypeInfo {
  return designerTypes[typeCode];
}

/**
 * 回答配列から診断結果を一括計算
 */
export function calculateDiagnosisResult(answers: number[]): {
  scores: AxisScores;
  axes: AxisResult;
  typeCode: DesignerTypeCode;
  typeInfo: DesignerTypeInfo;
} {
  const scores = calcAxisScores(answers);
  const axes = determineAxes(scores);
  const typeCode = generateTypeCode(axes);
  const typeInfo = getTypeInfo(typeCode);

  return { scores, axes, typeCode, typeInfo };
}

/**
 * 軸のパーセンテージを計算（表示用）
 * @returns 0-100のパーセンテージ（B側の割合）
 */
export function calcAxisPercentage(scoreA: number, scoreB: number): number {
  const total = scoreA + scoreB;
  if (total === 0) return 50;
  return Math.round((scoreB / total) * 100);
}

