// Dify API との通信を行う関数

interface DifyResponse {
  answer: string;
  conversation_id: string;
  message_id: string;
}

interface DifyStreamChunk {
  event: string;
  conversation_id?: string;
  message_id?: string;
  answer?: string;
}

interface UserContext {
  name?: string;
  designerType?: string;
  designerTypeDescription?: string;
  designSkill?: number;
  planningSkill?: number;
  clientSkill?: number;
  businessSkill?: number;
  mindsetSkill?: number;
  values?: Array<{ question: string; answer: string }>;
  goal?: string;
  currentProblem?: string;
  monthlyIncome?: number;
  averagePrice?: number;
  activeProjects?: number;
  projects?: Array<{ name: string; reward: number; status: string }>;
}

export async function sendMessageToDify(
  message: string,
  conversationId?: string,
  onStream?: (text: string) => void,
  userContext?: UserContext,
  mode?: 'project_support' | 'self_analysis' | 'free_talk'
): Promise<DifyResponse> {
  const apiKey = import.meta.env.VITE_DIFY_API_KEY;
  const apiUrl = import.meta.env.VITE_DIFY_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error('Dify API の設定が完了していません');
  }

  // ユーザーコンテキストをinputsとして構築
  const inputs: Record<string, any> = {
    // モード情報を追加
    chat_mode: mode || 'free_talk',
  };
  
  if (userContext) {
    if (userContext.name) {
      inputs.user_name = userContext.name;
    }
    
    if (userContext.designerType) {
      inputs.designer_type = userContext.designerType;
      inputs.designer_type_description = userContext.designerTypeDescription || '';
    }
    
    // スキルレベルの情報
    if (userContext.designSkill !== undefined) {
      inputs.design_skill = userContext.designSkill;
      inputs.planning_skill = userContext.planningSkill || 0;
      inputs.client_skill = userContext.clientSkill || 0;
      inputs.business_skill = userContext.businessSkill || 0;
      inputs.mindset_skill = userContext.mindsetSkill || 0;
      
      // 平均スキルスコアも追加
      const avgSkill = Math.round(
        (userContext.designSkill +
          (userContext.planningSkill || 0) +
          (userContext.clientSkill || 0) +
          (userContext.businessSkill || 0) +
          (userContext.mindsetSkill || 0)) / 5
      );
      inputs.average_skill = avgSkill;
    }

    // 価値観
    if (userContext.values && userContext.values.length > 0) {
      inputs.user_values = userContext.values.map(v => `${v.question}: ${v.answer}`).join('\n');
    }

    // 目標と悩み
    if (userContext.goal) {
      inputs.user_goal = userContext.goal;
    }
    if (userContext.currentProblem) {
      inputs.user_problem = userContext.currentProblem;
    }

    // 収入情報
    if (userContext.monthlyIncome !== undefined) {
      inputs.monthly_income = userContext.monthlyIncome;
    }
    if (userContext.averagePrice !== undefined) {
      inputs.average_price = userContext.averagePrice;
    }
    if (userContext.activeProjects !== undefined) {
      inputs.active_projects = userContext.activeProjects;
    }

    // 案件情報
    if (userContext.projects && userContext.projects.length > 0) {
      inputs.projects_list = userContext.projects
        .map(p => `${p.name}: ${p.reward.toLocaleString()}円（${p.status === 'in_progress' ? '進行中' : '完了'}）`)
        .join('\n');
    }
  }

  const response = await fetch(`${apiUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: inputs,
      query: message,
      response_mode: onStream ? 'streaming' : 'blocking',
      conversation_id: conversationId || '',
      user: 'user',
    }),
  });

  if (!response.ok) {
    throw new Error(`Dify API エラー: ${response.status}`);
  }

  // ストリーミングモードの場合
  if (onStream && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullAnswer = '';
    let conversationIdResult = '';
    let messageIdResult = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data: DifyStreamChunk = JSON.parse(line.slice(6));
            
            if (data.event === 'message') {
              if (data.answer) {
                fullAnswer += data.answer;
                onStream(data.answer);
              }
            } else if (data.event === 'message_end') {
              conversationIdResult = data.conversation_id || '';
              messageIdResult = data.message_id || '';
            }
          } catch (e) {
            console.error('JSON parse error:', e);
          }
        }
      }
    }

    return {
      answer: fullAnswer,
      conversation_id: conversationIdResult,
      message_id: messageIdResult,
    };
  }

  // ブロッキングモードの場合
  const data = await response.json();
  return {
    answer: data.answer,
    conversation_id: data.conversation_id,
    message_id: data.message_id,
  };
}

// 会話履歴を取得する関数
export async function getConversationHistory(conversationId: string) {
  const apiKey = import.meta.env.VITE_DIFY_API_KEY;
  const apiUrl = import.meta.env.VITE_DIFY_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error('Dify API の設定が完了していません');
  }

  const response = await fetch(`${apiUrl}/messages?conversation_id=${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Dify API エラー: ${response.status}`);
  }

  return await response.json();
}

