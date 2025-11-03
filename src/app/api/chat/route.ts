import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { searchProducts } from '@/lib/data/mock-products';

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
- 항상 사용자의 예산과 용도를 고려

도구 사용:
- 사용자가 제품을 찾거나 추천을 요청하면 search_products 함수를 사용하세요
- 검색 결과가 있으면 구체적인 제품 정보를 포함하여 추천하세요
- 제품 정보에는 가격, 평점, 리뷰 수, 최저가 정보를 포함하세요`;

    // 마지막 사용자 메시지에서 검색어 추출
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // 간단한 키워드 매칭으로 제품 검색 (실제로는 AI가 더 똑똑하게 처리)
    let productsContext = '';
    const productKeywords = ['러닝화', '운동화', '신발', '노트북', '맥북', '이어폰', '에어팟', '스마트워치', '애플워치'];
    const hasProductQuery = productKeywords.some(keyword => lastUserMessage.includes(keyword));

    if (hasProductQuery) {
      // 검색어 추출 (간단한 구현)
      let searchQuery = '';
      if (lastUserMessage.includes('러닝화') || lastUserMessage.includes('운동화')) {
        searchQuery = '러닝화';
      } else if (lastUserMessage.includes('노트북') || lastUserMessage.includes('맥북')) {
        searchQuery = '노트북';
      } else if (lastUserMessage.includes('이어폰') || lastUserMessage.includes('에어팟')) {
        searchQuery = '이어폰';
      } else if (lastUserMessage.includes('스마트워치') || lastUserMessage.includes('애플워치')) {
        searchQuery = '스마트워치';
      }

      if (searchQuery) {
        const products = searchProducts(searchQuery);
        if (products.length > 0) {
          productsContext = `\n\n검색된 제품 정보:\n${products.slice(0, 3).map((p, i) => {
            const lowestPrice = p.prices.reduce((min, curr) =>
              curr.total < min.total ? curr : min, p.prices[0]
            );
            return `${i + 1}. ${p.name}
   - 브랜드: ${p.brand}
   - 가격: ₩${p.price.toLocaleString()}
   - 평점: ${p.rating}/5.0 (${p.reviewCount}개 리뷰)
   - 최저가: ₩${lowestPrice.total.toLocaleString()} (${lowestPrice.platform})
   - 설명: ${p.description}`;
          }).join('\n\n')}

위 제품들을 참고하여 사용자에게 추천해주세요.`;
        }
      }
    }

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
        { role: 'system', content: systemPrompt + productsContext },
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
