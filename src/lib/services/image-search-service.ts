import OpenAI from 'openai';
import { unifiedSearchService } from '@/services/unified-search';

// Lazy initialization to avoid build-time errors when API key is missing
let openai: OpenAI | null = null;

function getOpenAIClient() {
    if (!openai && process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    if (!openai) {
        throw new Error('OpenAI API key is not configured');
    }
    return openai;
}

interface ProductInfo {
    name: string;
    category?: string;
    brand?: string;
    features: string[];
    confidence: number; // 0-1
}

/**
 * ImageSearchService - AI Vision-based Product Search
 * Analyzes product images and finds matching items
 */
export class ImageSearchService {
    /**
     * Analyze product image using OpenAI Vision
     * @param base64Image Base64 encoded image
     */
    async analyzeImage(base64Image: string): Promise<ProductInfo> {
        try {
            const client = getOpenAIClient();
            const response = await client.chat.completions.create({
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analyze this product image and extract:
1. Product name
2. Category (electronics, fashion, home, etc.)
3. Brand (if visible)
4. Key features/attributes

Return ONLY valid JSON in this exact format:
{
  "name": "product name",
  "category": "category",
  "brand": "brand name or null",
  "features": ["feature1", "feature2"],
  "confidence": 0.95
}`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            });

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No response from OpenAI Vision');
            }

            // Parse JSON response
            const productInfo: ProductInfo = JSON.parse(content);
            return productInfo;
        } catch (error) {
            console.error('ImageSearchService.analyzeImage failed:', error);
            throw error;
        }
    }

    /**
     * Search products by image
     * @param base64Image Base64 encoded image
     */
    async searchByImage(base64Image: string) {
        try {
            // 1. Analyze image with AI
            const productInfo = await this.analyzeImage(base64Image);

            // 2. Generate search query
            const searchQuery = [
                productInfo.brand,
                productInfo.name,
                ...productInfo.features.slice(0, 2), // Top 2 features
            ]
                .filter(Boolean)
                .join(' ');

            // 3. Search using UnifiedSearchService
            const results = await unifiedSearchService.searchProducts({
                filters: {
                    query: searchQuery,
                    categories: productInfo.category ? [productInfo.category as any] : ['all'],
                },
                sort: 'price-asc', // Lowest price first
                page: 1,
                limit: 20,
            });

            return {
                productInfo,
                searchQuery,
                results: results.items,
                total: results.total,
            };
        } catch (error) {
            console.error('ImageSearchService.searchByImage failed:', error);
            throw error;
        }
    }
}

// Export singleton
export const imageSearchService = new ImageSearchService();
