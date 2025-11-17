import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { searchProducts } from '@/lib/data/mock-products';
import { getFriendPurchases, getSocialReviewsByProduct } from '@/lib/data/mock-social';
import { getInfluencerReviewsByProduct, getInfluencerReviewSummary } from '@/lib/data/mock-influencer';

// Edge Runtime for better performance
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, mode = 'price' } = await req.json();

    // 모드별 시스템 프롬프트
    const basePurpose = `당신은 한국 쇼핑 전문가 AI 어시스턴트 "이거사"입니다.`;

    const modeInstructions = mode === 'price'
      ? `
🎯 현재 모드: 가격 비교 모드 (💰)

주요 역할:
- 여러 쇼핑몰의 가격을 비교하여 최저가를 찾아드립니다
- 실시간 가격 정보를 제공합니다
- 할인율과 배송비를 고려한 실제 구매가를 계산합니다
- 가격 변동 추이를 안내합니다

응답 형식:
[제품명] 가격 비교 결과

💰 최저가: ₩XX,XXX (플랫폼명)
📦 배송비 포함: ₩XX,XXX

📊 다른 쇼핑몰 가격:
- 쿠팡: ₩XX,XXX
- 네이버: ₩XX,XXX
- 11번가: ₩XX,XXX

💡 구매 팁: [가격 관련 조언]
`
      : `
🎯 현재 모드: AI 추천 모드 (✨)

주요 역할:
- 사용자의 요구사항에 맞는 제품을 추천합니다
- 친구와 인플루언서의 리뷰를 우선적으로 고려합니다
- 가성비, 품질, 사용자 만족도를 종합 분석합니다
- 개인화된 추천을 제공합니다

신뢰 소스 우선순위:
1️⃣ 친구/지인 구매 및 리뷰 (최고 신뢰도)
2️⃣ 인플루언서/전문가 리뷰 (전문성)
3️⃣ 일반 사용자 리뷰 (대중 의견)

응답 형식:
[제품명] 추천

📊 추천 근거:
✅ [가장 중요한 근거 1] (친구 리뷰가 있다면 최우선)
✅ [근거 2] (인플루언서 리뷰)
✅ [근거 3] (일반 리뷰, 가격, 스펙)

💰 가격: [가격대 정보]
⭐ 평점: [평균 평점]

💡 추천 이유: [상세 설명]
`;

    const systemPrompt = `${basePurpose}

${modeInstructions}

공통 응답 스타일:
- 항상 존댓말(해요체) 사용
- 이모지를 적절히 사용하되 과하지 않게
- 간결하고 구조화된 형태
- 사용자의 예산과 용도를 고려

제약사항:
- 제공된 정보만 사용하고 추측하지 않음
- 친구/인플루언서 정보가 없으면 언급하지 않음`;

    // 마지막 사용자 메시지에서 검색어 추출
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // 간단한 키워드 매칭으로 제품 검색 (실제로는 AI가 더 똑똑하게 처리)
    let productsContext = '';
    const productKeywords = [
      '러닝화', '운동화', '신발',
      '노트북', '맥북',
      '이어폰', '에어팟', '버즈',
      '스마트워치', '애플워치', '갤럭시워치',
      '패딩', '다운재킷', '겨울옷',
      '공기청정기', '청정기',
      '스피커', '블루투스',
      '키보드', '기계식',
      '마우스',
      '백팩', '가방',
      '텀블러', '물통',
      '면도기', '전기면도기',
      '청소기', '로봇청소기'
    ];
    const hasProductQuery = productKeywords.some(keyword => lastUserMessage.includes(keyword));

    if (hasProductQuery) {
      // 검색어 추출 (간단한 구현)
      let searchQuery = '';
      if (lastUserMessage.includes('러닝화') || lastUserMessage.includes('운동화') || lastUserMessage.includes('신발')) {
        searchQuery = '러닝화';
      } else if (lastUserMessage.includes('노트북') || lastUserMessage.includes('맥북')) {
        searchQuery = '노트북';
      } else if (lastUserMessage.includes('이어폰') || lastUserMessage.includes('에어팟') || lastUserMessage.includes('버즈')) {
        searchQuery = '이어폰';
      } else if (lastUserMessage.includes('스마트워치') || lastUserMessage.includes('애플워치') || lastUserMessage.includes('갤럭시워치')) {
        searchQuery = '스마트워치';
      } else if (lastUserMessage.includes('패딩') || lastUserMessage.includes('다운재킷') || lastUserMessage.includes('겨울옷')) {
        searchQuery = '패딩';
      } else if (lastUserMessage.includes('공기청정기') || lastUserMessage.includes('청정기')) {
        searchQuery = '공기청정기';
      } else if (lastUserMessage.includes('스피커') || lastUserMessage.includes('블루투스')) {
        searchQuery = '스피커';
      } else if (lastUserMessage.includes('키보드') || lastUserMessage.includes('기계식')) {
        searchQuery = '키보드';
      } else if (lastUserMessage.includes('마우스')) {
        searchQuery = '마우스';
      } else if (lastUserMessage.includes('백팩') || lastUserMessage.includes('가방')) {
        searchQuery = '가방';
      } else if (lastUserMessage.includes('텀블러') || lastUserMessage.includes('물통')) {
        searchQuery = '텀블러';
      } else if (lastUserMessage.includes('면도기') || lastUserMessage.includes('전기면도기')) {
        searchQuery = '면도기';
      } else if (lastUserMessage.includes('청소기') || lastUserMessage.includes('로봇청소기')) {
        searchQuery = '청소기';
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

    // Determine appropriate error status and message
    let status = 500;
    let errorMessage = 'Failed to process chat request';
    let details = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof Error) {
      // Handle specific OpenAI API errors
      if (error.message.includes('API key')) {
        status = 401;
        errorMessage = 'Authentication failed';
        details = 'Invalid or missing API key';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        status = 429;
        errorMessage = 'Rate limit exceeded';
        details = 'Too many requests. Please try again later.';
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        status = 504;
        errorMessage = 'Request timeout';
        details = 'The request took too long to complete';
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        status = 503;
        errorMessage = 'Service unavailable';
        details = 'Unable to connect to AI service';
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: details,
        timestamp: new Date().toISOString()
      }),
      {
        status: status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
