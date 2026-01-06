import { DiagnosisQuestion, DesignerTypeInfo, DesignerTypeCode, SkillCategory } from '../types/diagnosis';

// === 新タイプ診断の質問（18問） ===
export const diagnosisQuestions: DiagnosisQuestion[] = [
  // 思考OS（Q1-Q6）: Logic vs Emotion
  {
    id: 1,
    axis: 'thinking',
    text: 'デザインを褒められるとき、嬉しいのはどっち？',
    labelA: '「構成がロジカルで分かりやすい」',
    labelB: '「なんか雰囲気いいね」'
  },
  {
    id: 2,
    axis: 'thinking',
    text: 'デザインを作るとき、最初に考えるのは？',
    labelA: '情報の優先順位と導線',
    labelB: '全体のトーンや世界観'
  },
  {
    id: 3,
    axis: 'thinking',
    text: '参考デザインを見るとき、気になるのは？',
    labelA: 'なぜこの配置なのか（構造）',
    labelB: 'なぜこの色・素材なのか（感覚）'
  },
  {
    id: 4,
    axis: 'thinking',
    text: 'クライアントに説明するとき、得意なのは？',
    labelA: '根拠を数字やロジックで示す',
    labelB: 'ストーリーや想いで伝える'
  },
  {
    id: 5,
    axis: 'thinking',
    text: '「良いデザイン」の定義に近いのは？',
    labelA: '目的を達成できるデザイン',
    labelB: '心を動かすデザイン'
  },
  {
    id: 6,
    axis: 'thinking',
    text: '自分のデザインに自信が持てるのは？',
    labelA: '理由を論理的に説明できるとき',
    labelB: '「これだ」と直感で確信したとき'
  },

  // 武器種（Q7-Q12）: Craft vs Business
  {
    id: 7,
    axis: 'weapon',
    text: '時間を忘れて没頭できるのは？',
    labelA: 'ツールを極める・細部を詰める',
    labelB: '売り方を考える・戦略を練る'
  },
  {
    id: 8,
    axis: 'weapon',
    text: '嬉しい褒め言葉はどっち？',
    labelA: '「クオリティ高いね」',
    labelB: '「売上上がったよ」'
  },
  {
    id: 9,
    axis: 'weapon',
    text: '理想の働き方に近いのは？',
    labelA: '黙々と制作に集中したい',
    labelB: '人と話しながら案件を回したい'
  },
  {
    id: 10,
    axis: 'weapon',
    text: '苦にならないのはどっち？',
    labelA: '1pxのズレを直す作業',
    labelB: '見積もり・交渉のやり取り'
  },
  {
    id: 11,
    axis: 'weapon',
    text: 'スキルアップで学びたいのは？',
    labelA: '新しいツールや技術',
    labelB: 'マーケティングや営業手法'
  },
  {
    id: 12,
    axis: 'weapon',
    text: '案件で燃えるのはどっち？',
    labelA: '難しい表現を実現できたとき',
    labelB: 'クライアントの課題を解決できたとき'
  },

  // エンジン（Q13-Q18）: Self vs Others
  {
    id: 13,
    axis: 'engine',
    text: 'デザインをする一番の動機は？',
    labelA: '自分の表現・作品を残したい',
    labelB: '誰かの役に立ちたい'
  },
  {
    id: 14,
    axis: 'engine',
    text: 'ポートフォリオで見せたいのは？',
    labelA: '自分らしさ・世界観',
    labelB: 'クライアントの成果・実績'
  },
  {
    id: 15,
    axis: 'engine',
    text: 'モチベーションが上がるのは？',
    labelA: '「自分の好き」を形にできたとき',
    labelB: '「ありがとう」と言われたとき'
  },
  {
    id: 16,
    axis: 'engine',
    text: '受けたい案件はどっち？',
    labelA: '自由に作らせてくれる案件',
    labelB: '明確な課題がある案件'
  },
  {
    id: 17,
    axis: 'engine',
    text: 'SNS発信の目的に近いのは？',
    labelA: '自分のブランドを作りたい',
    labelB: '信頼を得て仕事につなげたい'
  },
  {
    id: 18,
    axis: 'engine',
    text: '将来の理想に近いのは？',
    labelA: '自分の名前で仕事がくる状態',
    labelB: 'チームや顧客に必要とされる状態'
  }
];

// === 8タイプの定義 ===
export const designerTypes: Record<DesignerTypeCode, DesignerTypeInfo> = {
  LCS: {
    code: 'LCS',
    name: '孤高のテック職人',
    combination: 'Logic × Craft × Self',
    group: 'A',
    color: '#3b82f6',
    tagline: '機能美で世界を圧倒する',
    features: [
      'ツールオタク',
      'Figmaの機能を極めたい',
      '美しいコードや設計が好き'
    ],
    action: '接客や営業は捨てろ。「機能美」で殴れ。',
    weapons: [
      'Webflow/Studio実装',
      'Figmaのコンポーネント作成',
      'UIキット販売'
    ],
    winningStrategy: '「技術力が高いので、実装だけ請け負います」というポジション。'
  },
  ECS: {
    code: 'ECS',
    name: '夢想する芸術家',
    combination: 'Emotion × Craft × Self',
    group: 'A',
    color: '#ef4444',
    tagline: '世界観で人を魅了する',
    features: [
      '自分の世界観がある',
      'イラスト、グラフィック、アート寄り',
      '感性で勝負する'
    ],
    action: 'クライアントワークで消耗するな。自分の作品を「素材」として見せろ。',
    weapons: [
      'ロゴデザイン',
      'イラスト制作',
      'CDジャケット',
      'アパレル'
    ],
    winningStrategy: 'ポートフォリオサイトを世界観全開で作る。「このテイストが好き」という指名買いを待つ（そのためにSNSで発信する）。'
  },
  LBS: {
    code: 'LBS',
    name: 'プロダクト・ハッカー',
    combination: 'Logic × Business × Self',
    group: 'A',
    color: '#8b5cf6',
    tagline: '自分の商品で市場を制する',
    features: [
      '自分のサービスを作って当てたい',
      '起業家気質',
      '戦略的思考'
    ],
    action: '受託案件を受けるな。「自分の商品」を作って売る練習をしろ。',
    weapons: [
      'Design to Code',
      'テンプレート販売',
      '自分のメディア運営'
    ],
    winningStrategy: '自分でLPを作って、自分で広告を回して、商品を売る。その実績自体が最強のポートフォリオになる。'
  },
  EBS: {
    code: 'EBS',
    name: 'カリスマ・インフルエンサー',
    combination: 'Emotion × Business × Self',
    group: 'A',
    color: '#f59e0b',
    tagline: '自分自身がコンテンツ',
    features: [
      '自分が主役になりたい',
      '目立ちたい',
      '発信が好き'
    ],
    action: 'デザインスキルは60点でいい。「お前自身」をコンテンツ化しろ。',
    weapons: [
      'Instagram運用',
      'YouTubeサムネ（演者込み）',
      'ライブ配信の枠デザイン'
    ],
    winningStrategy: '「私が使っているデザイン」として発信し、ファンを顧客にする。アンバサダー的な動きがハマる。'
  },
  LCO: {
    code: 'LCO',
    name: '改善の鬼',
    combination: 'Logic × Craft × Others',
    group: 'B',
    color: '#06b6d4',
    tagline: '既存を完璧に磨き上げる',
    features: [
      '頼まれたことを完璧にこなす',
      '整列、整理整頓が得意',
      '細部への徹底したこだわり'
    ],
    action: '0から作るな。「既存のものを直す」仕事を取りに行け。',
    weapons: [
      '資料作成（パワポ）',
      '名刺リデザイン',
      'バナーのサイズ展開',
      '修正業務'
    ],
    winningStrategy: '「今のデザイン、使いにくいですよね？整理します」と言って入る。ディレクターから最も愛される下請けになれ。'
  },
  ECO: {
    code: 'ECO',
    name: '翻訳するデザイナー',
    combination: 'Emotion × Craft × Others',
    group: 'B',
    color: '#22c55e',
    tagline: '想いを形に変換する',
    features: [
      '相手の想いを形にしたい',
      'ヒアリングして「そう、これ！」と言わせたい',
      '共感力が高い'
    ],
    action: 'ヒアリング力を磨け。スキルより「共感」を売れ。',
    weapons: [
      '個人事業主のロゴ・名刺セット',
      'クラウドファンディングのLP'
    ],
    winningStrategy: 'クライアントの想いを憑依させて作る。「あなたの想いを可視化します」がキラーワード。'
  },
  LBO: {
    code: 'LBO',
    name: '戦略的パートナー',
    combination: 'Logic × Business × Others',
    group: 'B',
    color: '#6366f1',
    tagline: '数字で顧客を勝たせる',
    features: [
      '数字を上げたい',
      'マーケティング視点で顧客を勝たせたい',
      '成果にこだわる'
    ],
    action: '「デザイン」を売るな。「売上アップ」を売れ。ただし最初は自分で作るしかない。',
    weapons: [
      'LPO（ランディングページ最適化）',
      'Lステップ構築',
      'セールスライティング込みのデザイン'
    ],
    winningStrategy: '「綺麗なデザインじゃなくて、売れる構成を作ります」と提案する。デザインはテンプレート活用で時短しろ。'
  },
  EBO: {
    code: 'EBO',
    name: 'チームの演出家',
    combination: 'Emotion × Business × Others',
    group: 'B',
    color: '#ec4899',
    tagline: '場の空気を創り出す',
    features: [
      'みんなで何かを成し遂げたい',
      '場の空気を作りたい',
      'CS気質・サポート精神'
    ],
    action: 'コミュニティに潜り込め。デザインができる「何でも屋」になれ。',
    weapons: [
      'イベントのチラシ',
      'コミュニティのバナー',
      'アイキャッチ画像'
    ],
    winningStrategy: '人当たりとレスの速さで勝負。「あいつに頼めばなんとかなる」というポジションを取る。'
  }
};

// タイプコードからタイプ情報を取得
export const getDesignerType = (code: DesignerTypeCode): DesignerTypeInfo => {
  return designerTypes[code];
};

// スキルラベル（旧システム互換用）
export const skillLabels: Record<SkillCategory, string> = {
  design: '造形力',
  planning: '設計力',
  client: 'クライアントワーク力',
  business: 'ビジネス力',
  mindset: 'マインド力'
};
