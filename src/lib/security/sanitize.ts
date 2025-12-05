/**
 * Input Sanitization Utilities
 * XSS 및 인젝션 공격 방지
 */

/**
 * HTML 태그 제거 (기본 XSS 방어)
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * HTML 엔티티 이스케이프
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * SQL 인젝션 방지용 문자열 이스케이프
 */
export function escapeSql(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, (char) => {
    switch (char) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  });
}

/**
 * JavaScript 코드 제거
 */
export function removeJavaScript(input: string): string {
  // Remove javascript: protocols
  let sanitized = input.replace(/javascript:/gi, '');

  // Remove on* event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  return sanitized;
}

/**
 * URL 검증 및 sanitize
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

/**
 * 파일명 sanitize (경로 탐색 공격 방지)
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory traversal attempts
  let sanitized = filename.replace(/\.\./g, '');

  // Remove path separators
  sanitized = sanitized.replace(/[/\\]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Limit to alphanumeric, dash, underscore, dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.slice(0, 255 - (ext ? ext.length + 1 : 0));
    sanitized = ext ? `${name}.${ext}` : name;
  }

  return sanitized;
}

/**
 * 검색 쿼리 sanitize
 */
export function sanitizeSearchQuery(query: string): string {
  // Trim whitespace
  let sanitized = query.trim();

  // Remove special characters that could be used for injection
  sanitized = sanitized.replace(/[<>'"]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.slice(0, 200);
  }

  return sanitized;
}

/**
 * JSON sanitize (재귀적으로 문자열 필드 정리)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, options: {
  stripHtml?: boolean;
  escapeHtml?: boolean;
  maxDepth?: number;
} = {}): T {
  const {
    stripHtml: shouldStripHtml = false,
    escapeHtml: shouldEscapeHtml = false,
    maxDepth = 10,
  } = options;

  function sanitizeValue(value: any, depth: number): any {
    if (depth > maxDepth) {
      return value;
    }

    if (typeof value === 'string') {
      let sanitized = value;
      if (shouldStripHtml) {
        sanitized = stripHtml(sanitized);
      }
      if (shouldEscapeHtml) {
        sanitized = escapeHtml(sanitized);
      }
      return sanitized;
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item, depth + 1));
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val, depth + 1);
      }
      return sanitized as T;
    }

    return value;
  }

  return sanitizeValue(obj, 0);
}

/**
 * NoSQL 인젝션 방지
 */
export function sanitizeNoSqlQuery(input: any): any {
  if (typeof input === 'string') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeNoSqlQuery);
  }

  if (input !== null && typeof input === 'object') {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      // Remove dangerous operators
      if (key.startsWith('$')) {
        continue;
      }

      sanitized[key] = sanitizeNoSqlQuery(value);
    }

    return sanitized;
  }

  return input;
}

/**
 * 전화번호 포맷 검증 및 정규화
 */
export function normalizePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if valid Korean mobile number (010-XXXX-XXXX)
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return null;
}

/**
 * 이메일 정규화
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * 통합 입력 sanitize
 */
export function sanitizeInput(input: string, options: {
  allowHtml?: boolean;
  allowUrls?: boolean;
  maxLength?: number;
} = {}): string {
  const {
    allowHtml = false,
    allowUrls = true,
    maxLength = 10000,
  } = options;

  let sanitized = input.trim();

  // Remove HTML if not allowed
  if (!allowHtml) {
    sanitized = stripHtml(sanitized);
    sanitized = removeJavaScript(sanitized);
  }

  // Escape HTML entities
  if (allowHtml) {
    sanitized = escapeHtml(sanitized);
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}
