import { z } from 'zod';

/**
 * 로그인 폼 스키마
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, '이메일을 입력해주세요')
        .email('올바른 이메일 형식이 아닙니다'),
    password: z
        .string()
        .min(1, '비밀번호를 입력해주세요')
        .min(8, '비밀번호는 8자 이상이어야 합니다'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 회원가입 폼 스키마
 */
export const signupSchema = z.object({
    name: z
        .string()
        .min(1, '이름을 입력해주세요')
        .min(2, '이름은 2자 이상이어야 합니다')
        .max(50, '이름은 50자 이하여야 합니다'),
    email: z
        .string()
        .min(1, '이메일을 입력해주세요')
        .email('올바른 이메일 형식이 아닙니다'),
    password: z
        .string()
        .min(1, '비밀번호를 입력해주세요')
        .min(8, '비밀번호는 8자 이상이어야 합니다')
        .regex(/[A-Z]/, '대문자를 포함해야 합니다')
        .regex(/[0-9]/, '숫자를 포함해야 합니다'),
    passwordConfirm: z
        .string()
        .min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * 가격 알림 설정 스키마
 */
export const priceAlertSchema = z.object({
    productUrl: z
        .string()
        .min(1, '상품 URL을 입력해주세요')
        .url('올바른 URL 형식이 아닙니다'),
    targetPrice: z
        .number()
        .min(100, '최소 100원 이상이어야 합니다')
        .max(100000000, '1억원 이하여야 합니다'),
    notifyEmail: z.boolean().default(true),
    notifyPush: z.boolean().default(true),
});

export type PriceAlertFormData = z.infer<typeof priceAlertSchema>;

/**
 * 프로필 수정 스키마
 */
export const profileSchema = z.object({
    name: z
        .string()
        .min(2, '이름은 2자 이상이어야 합니다')
        .max(50, '이름은 50자 이하여야 합니다'),
    phone: z
        .string()
        .regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요')
        .optional()
        .or(z.literal('')),
    bio: z
        .string()
        .max(200, '자기소개는 200자 이하여야 합니다')
        .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * 협상 제안 스키마
 */
export const negotiationOfferSchema = z.object({
    price: z
        .number()
        .min(1000, '최소 1,000원 이상이어야 합니다'),
    message: z
        .string()
        .max(500, '메시지는 500자 이하여야 합니다')
        .optional(),
    expiresIn: z
        .enum(['1h', '6h', '24h', '72h'])
        .default('24h'),
});

export type NegotiationOfferFormData = z.infer<typeof negotiationOfferSchema>;

/**
 * 폼 유효성 검사 헬퍼
 */
export function validateForm<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
            errors[path] = err.message;
        }
    });

    return { success: false, errors };
}
