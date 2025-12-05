/**
 * Bundle Size Analyzer Next.js Config
 * npm run analyze 로 번들 분석
 */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 이미지 최적화
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },

    // 실험적 기능
    experimental: {
        // 서버 액션 최적화
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },

    // 번들 최적화
    compiler: {
        // 프로덕션에서 console.log 제거
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // 헤더 설정
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                ],
            },
            {
                // 정적 자산 캐싱
                source: '/(.*).(jpg|jpeg|png|gif|webp|svg|ico)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Webpack 최적화
    webpack: (config, { dev, isServer }) => {
        // 프로덕션 최적화
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000,
                cacheGroups: {
                    default: false,
                    vendors: false,
                    framework: {
                        chunks: 'all',
                        name: 'framework',
                        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                        priority: 40,
                        enforce: true,
                    },
                    lib: {
                        test(module) {
                            return module.size() > 160000 &&
                                /node_modules[/\\]/.test(module.identifier());
                        },
                        name(module) {
                            const hash = require('crypto')
                                .createHash('sha1')
                                .update(module.identifier())
                                .digest('hex')
                                .substring(0, 8);
                            return `lib-${hash}`;
                        },
                        priority: 30,
                        minChunks: 1,
                        reuseExistingChunk: true,
                    },
                },
            };
        }
        return config;
    },
};

module.exports = withBundleAnalyzer(nextConfig);
