import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { searchProducts } from '@/lib/data/mock-products';
import { getFriendPurchases, getSocialReviewsByProduct } from '@/lib/data/mock-social';
import { getInfluencerReviewsByProduct, getInfluencerReviewSummary } from '@/lib/data/mock-influencer';

// Edge Runtime for better performance
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 쇼핑 어시스턴트 시스템 프롬프트
    const systemPrompt = `당신은 한국 쇼핑 전문가 AI 어시스턴트 "이거사"입니다.

핵심 차별점: 다층 신뢰 소스 기반 추천
당신은 단순 가격 비교가 아닌, 신뢰할 수 있는 여러 출처의 정보를 종합하여 설명 가능한 추천을 제공합니다.

신뢰 소스 우선순위:
1️⃣ 친구/지인 (최고 신뢰도)
   - 친구가 구매했거나 리뷰를 남긴 제품은 반드시 우선 언급
   - "친구 OOO님이 구매하셨어요" 형태로 표현
   - 친구의 실제 리뷰 내용 인용

2️⃣ 인플루언서/유튜버 (전문성)
   - 해당 분야 전문가의 리뷰 요약
   - "테크리뷰어 (24만 팔로워) 리뷰에서..." 형태로 표현
   - 주요 장점/단점 강조

3️⃣ 일반 사용자 리뷰 (대중 의견)
   - 평균 평점과 리뷰 수
   - 주요 장점/단점 요약

추천 형식 (반드시 이 구조를 따르세요):
[제품명 추천]

📊 추천 근거:
✅ [가장 중요한 근거 1] (친구 리뷰가 있다면 최우선)
✅ [근거 2] (인플루언서 리뷰)
✅ [근거 3] (일반 리뷰, 가격, 스펙)

💰 가격: [최저가 정보]
⭐ 평점: [평균 평점]

[간단한 추가 설명]

응답 스타일:
- 항상 존댓말(해요체) 사용
- 추천 근거를 명확하게 제시 (설명 가능한 AI)
- 이모지를 적절히 사용하되 과하지 않게
- 간결하고 구조화된 형태

제약사항:
- 제공된 정보만 사용하고 추측하지 않음
- 친구/인플루언서 정보가 없으면 언급하지 않음
- 항상 사용자의 예산과 용도를 고려`;

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
          // Mock: 실제로는 로그인한 사용자 ID 사용
          const userId = 'user-1';

          productsContext = `\n\n검색된 제품 정보 (다층 신뢰 소스 포함):\n${products.slice(0, 3).map((p, i) => {
            const lowestPrice = p.prices.reduce((min, curr) =>
              curr.total < min.total ? curr : min, p.prices[0]
            );

            // 1️⃣ 친구 구매 및 리뷰 정보
            const friendPurchases = getFriendPurchases(userId, p.id);
            const socialReviews = getSocialReviewsByProduct(p.id);
            let friendContext = '';
            if (friendPurchases.length > 0) {
              friendContext = `\n   🙋 친구 구매: ${friendPurchases.map(f => f.name).join(', ')} (${friendPurchases.length}명)`;
            }
            if (socialReviews.length > 0) {
              friendContext += `\n   💬 친구 리뷰:\n${socialReviews.map(r =>
                `      - ${r.userName}: ⭐${r.rating}/5 "${r.content}"`
              ).join('\n')}`;
            }

            // 2️⃣ 인플루언서 리뷰 정보
            const influencerReviews = getInfluencerReviewsByProduct(p.id);
            const influencerSummary = getInfluencerReviewSummary(p.id);
            let influencerContext = '';
            if (influencerReviews.length > 0) {
              influencerContext = `\n   📹 인플루언서 리뷰 (${influencerReviews.length}개, ${influencerSummary?.recommendPercent}% 추천):\n${influencerReviews.slice(0, 2).map(r =>
                `      - ${r.influencerName} (${r.platform}, ${(r.influencerFollowers / 10000).toFixed(1)}만): ${r.summary}`
              ).join('\n')}`;

              if (influencerSummary) {
                influencerContext += `\n   ✅ 주요 장점: ${influencerSummary.topPros.join(', ')}`;
                if (influencerSummary.topCons.length > 0) {
                  influencerContext += `\n   ⚠️  주요 단점: ${influencerSummary.topCons.join(', ')}`;
                }
              }
            }

            return `${i + 1}. ${p.name}
   - 브랜드: ${p.brand}
   - 가격: ₩${p.price.toLocaleString()}
   - 최저가: ₩${lowestPrice.total.toLocaleString()} (${lowestPrice.platform})
   - 평점: ${p.rating}/5.0 (${p.reviewCount}개 리뷰)
   - 설명: ${p.description}${friendContext}${influencerContext}`;
          }).join('\n\n')}

위 정보를 바탕으로 다층 신뢰 소스 기반 추천을 제공하세요.
- 친구 정보가 있는 제품은 최우선으로 추천
- 인플루언서 리뷰의 핵심 포인트 강조
- 추천 근거를 명확하게 구조화하여 제시`;
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
