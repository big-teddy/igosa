/**
 * Validation Schemas
 * Zod 스키마를 사용한 입력 검증
 */

import { z } from 'zod';

// ==================== 공통 스키마 ====================

// 한국 전화번호 (010-XXXX-XXXX 형식)
export const phoneSchema = z
  .string()
  .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)');

// 한국 우편번호 (5자리 숫자)
export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}$/, '올바른 우편번호 형식이 아닙니다 (5자리 숫자)');

// 이메일
export const emailSchema = z
  .string()
  .email('올바른 이메일 주소가 아닙니다')
  .max(255, '이메일은 255자를 초과할 수 없습니다');

// 비밀번호 (최소 8자, 영문+숫자+특수문자)
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(100, '비밀번호는 100자를 초과할 수 없습니다')
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'
  );

// URL
export const urlSchema = z.string().url('올바른 URL이 아닙니다');

// 양수
export const positiveNumberSchema = z.number().positive('양수만 입력 가능합니다');

// 음수 아닌 정수
export const nonNegativeIntSchema = z.number().int().nonnegative('0 이상의 정수만 입력 가능합니다');

// ID (UUID 또는 nanoid 형식)
export const idSchema = z
  .string()
  .min(1, 'ID는 필수입니다')
  .max(100, 'ID가 너무 깁니다');

// ==================== 인증 스키마 ====================

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자를 초과할 수 없습니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글, 영문만 입력 가능합니다'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '이용약관에 동의해야 합니다',
  }),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// ==================== 검색 스키마 ====================

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, '검색어를 입력하세요')
    .max(200, '검색어는 200자를 초과할 수 없습니다')
    .transform((val) => val.trim()), // XSS 방지를 위한 trim
  mode: z.enum(['price', 'recommend']).optional(),
  limit: nonNegativeIntSchema.max(100, '최대 100개까지 조회 가능합니다').optional(),
  offset: nonNegativeIntSchema.optional(),
  sort: z.enum(['price', 'rating', 'reviews']).optional(),
});

export const productIdSchema = z.object({
  id: idSchema,
});

// ==================== 결제 스키마 ====================

export const shippingAddressSchema = z.object({
  name: z
    .string()
    .min(2, '받는 사람 이름은 최소 2자 이상이어야 합니다')
    .max(50, '받는 사람 이름은 50자를 초과할 수 없습니다'),
  phone: phoneSchema,
  zipCode: zipCodeSchema,
  address: z
    .string()
    .min(5, '주소는 최소 5자 이상이어야 합니다')
    .max(200, '주소는 200자를 초과할 수 없습니다'),
  addressDetail: z
    .string()
    .max(200, '상세주소는 200자를 초과할 수 없습니다')
    .optional(),
  message: z
    .string()
    .max(200, '배송 메시지는 200자를 초과할 수 없습니다')
    .optional(),
});

export const cartItemSchema = z.object({
  productId: idSchema,
  quantity: nonNegativeIntSchema.min(1, '수량은 최소 1개 이상이어야 합니다').max(99, '수량은 최대 99개까지 가능합니다'),
  price: positiveNumberSchema,
  dealId: idSchema.optional(),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, '장바구니가 비어있습니다'),
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(['standard', 'express', 'dawn']),
  paymentMethod: z.enum(['card', 'bank_transfer', 'virtual_account', 'phone', 'kakao_pay', 'naver_pay', 'toss']),
  memo: z.string().max(500, '주문 메모는 500자를 초과할 수 없습니다').optional(),
});

// ==================== 네고딜 스키마 ====================

export const createNegoDealSchema = z.object({
  productId: idSchema,
  targetPrice: positiveNumberSchema,
  minParticipants: nonNegativeIntSchema.min(2, '최소 참여자는 2명 이상이어야 합니다').max(100, '최대 100명까지 가능합니다'),
  expiresAt: z.string().datetime('올바른 날짜 형식이 아닙니다'),
  description: z.string().max(1000, '설명은 1000자를 초과할 수 없습니다').optional(),
});

export const joinNegoDealSchema = z.object({
  dealId: idSchema,
});

// ==================== AI 채팅 스키마 ====================

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, '메시지를 입력하세요')
    .max(2000, '메시지는 2000자를 초과할 수 없습니다')
    .transform((val) => val.trim()),
  conversationId: idSchema.optional(),
});

// ==================== 리뷰 스키마 ====================

export const reviewSchema = z.object({
  productId: idSchema,
  rating: z.number().int().min(1, '평점은 1점 이상이어야 합니다').max(5, '평점은 5점 이하여야 합니다'),
  content: z
    .string()
    .min(10, '리뷰는 최소 10자 이상이어야 합니다')
    .max(5000, '리뷰는 5000자를 초과할 수 없습니다'),
  images: z
    .array(urlSchema)
    .max(5, '이미지는 최대 5개까지 업로드 가능합니다')
    .optional(),
});

// ==================== 가격 알림 스키마 ====================

export const priceAlertSchema = z.object({
  productId: idSchema,
  targetPrice: positiveNumberSchema,
  email: emailSchema.optional(),
  notifyByApp: z.boolean().default(true),
});

// ==================== 추천인 스키마 ====================

export const referralSchema = z.object({
  code: z
    .string()
    .length(8, '추천인 코드는 8자여야 합니다')
    .regex(/^[A-Z0-9]+$/, '추천인 코드는 영문 대문자와 숫자만 가능합니다'),
});

// ==================== 프로필 업데이트 스키마 ====================

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자를 초과할 수 없습니다')
    .optional(),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, '자기소개는 500자를 초과할 수 없습니다').optional(),
});

// ==================== 헬퍼 함수 ====================

/**
 * Safely parse and validate data with Zod schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Format Zod validation errors for API responses
 */
export function formatValidationError(error: z.ZodError): {
  message: string;
  errors: Array<{ field: string; message: string }>;
} {
  return {
    message: '입력값 검증에 실패했습니다',
    errors: error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}
