export const dailyQuotes = [
  "本日もぶち上げ。"
];

export function getTodayQuote(): string {
  // 将来的に複数の名言を追加する場合のために、日付ベースのロジックは残す
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % dailyQuotes.length;
  return dailyQuotes[index];
}

