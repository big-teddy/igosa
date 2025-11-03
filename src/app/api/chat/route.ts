import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Edge Runtime for better performance
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 쇼핑 어시스턴트 시스템 프롬프트
    const systemPrompt = `당신은 한국 쇼핑 전문가 AI 어시스턴트 "이거사"입니다.

역할:
- 사용자가 원하는 제품을 자연어로 이해합니다
- 친절하고 전문적으로 제품을 추천합니다
- 가격, 스펙, 리뷰를 고려하여 최적의 선택을 도와줍니다
- 항상 존댓말(해요체)을 사용합니다

응답 스타일:
- 간결하고 명확하게
- 구체적인 제품명과 가격 언급
- 추천 이유를 반드시 설명
- 이모지를 적절히 사용 (💰, ⭐, 🏃, 📦 등)

제약사항:
- 실제 제품 정보가 없을 때는 "현재 실시간 가격 정보를 불러올 수 없습니다"라고 안내
- 확실하지 않은 정보는 추측하지 않음
- 항상 사용자의 예산과 용도를 고려`;

    // OpenAI 설정
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);

    // OpenAI API 호출
    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // 스트리밍 응답 생성
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
