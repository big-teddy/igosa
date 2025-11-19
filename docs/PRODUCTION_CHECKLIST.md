# Production Deployment Checklist

**Project**: 이거사 (Igosa) - NegoDeal 2.0
**Target Deployment**: Vercel (Frontend + API Routes)
**Database**: Supabase (PostgreSQL)
**Cache**: Redis (Upstash or Railway)
**Last Updated**: 2025-01-19

---

## Pre-Deployment Checklist

### 1. Environment Variables ⚙️

**Vercel Environment Variables** (Production):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (Choose one)
# Option A: Upstash (Recommended for serverless)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Option B: Railway (Alternative)
REDIS_URL=redis://default:password@host:port

# AI Providers (Optional - for future features)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
GOOGLE_AI_API_KEY=...

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry (Optional - Error Tracking)
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...

# Email (For notifications)
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://igosa.com
```

**Environment Variable Validation**:
- [ ] All required variables are set in Vercel
- [ ] Supabase connection tested
- [ ] Redis connection tested
- [ ] Email service configured

---

### 2. Database Setup 🗄️

**Supabase PostgreSQL**:

- [ ] **Tables Created**:
  - `price_tracking` ✅
  - `price_history` ✅
  - `price_notifications` ✅
  - `price_alerts` ✅
  - `demand_aggregation_view` (Materialized View) ✅

- [ ] **Row Level Security (RLS) Enabled**:
  - [ ] `price_tracking`: Users can only read/update their own trackings
  - [ ] `price_history`: Read-only for all authenticated users
  - [ ] `price_notifications`: Users can only read their own notifications

- [ ] **Database Indexes**:
  - [ ] `price_tracking(user_id, status)`
  - [ ] `price_tracking(product_id, status)`
  - [ ] `price_history(product_id, created_at DESC)`
  - [ ] `price_notifications(user_id, created_at DESC)`

- [ ] **Backup Strategy**:
  - [ ] Automatic daily backups enabled on Supabase
  - [ ] Point-in-time recovery configured

**Sample SQL for RLS**:
```sql
-- Price Tracking RLS
ALTER TABLE price_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trackings"
  ON price_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trackings"
  ON price_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trackings"
  ON price_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trackings"
  ON price_tracking FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 3. Redis Setup 🔴

**Upstash Redis** (Recommended):

- [ ] Create Upstash Redis database
- [ ] Enable TLS
- [ ] Set max connections (default: unlimited for serverless)
- [ ] Configure eviction policy: `allkeys-lru`
- [ ] Set max memory: 100MB (can adjust based on usage)

**Data Structure Validation**:
```bash
# Test demand aggregation
ZADD product:TEST001:demand 240000 "user123:1737276800000"
ZRANGE product:TEST001:demand 0 -1 WITHSCORES

# Expected: ["user123:1737276800000", "240000"]
```

**Performance Targets**:
- [ ] ZADD operations: <10ms (P95)
- [ ] ZRANGE operations: <15ms (P95)
- [ ] Cache hit rate: >80%

---

### 4. API Routes Testing 🔌

**Critical Endpoints**:

| Endpoint | Method | Status | Response Time (P95) |
|----------|--------|--------|---------------------|
| `/api/price-tracking` | POST | [ ] | <300ms |
| `/api/price-tracking` | GET | [ ] | <200ms |
| `/api/price-tracking/[id]` | GET | [ ] | <150ms |
| `/api/price-tracking/[id]` | PUT | [ ] | <250ms |
| `/api/price-tracking/[id]` | DELETE | [ ] | <150ms |
| `/api/demand/[productId]` | GET | [ ] | <200ms |

**Test with `curl`**:
```bash
# Create price tracking (requires auth token)
curl -X POST https://igosa.com/api/price-tracking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "PROD001",
    "targetPrice": 240000,
    "notificationChannels": ["push"]
  }'

# Get demand aggregation
curl https://igosa.com/api/demand/PROD001
```

---

### 5. Frontend Build 🏗️

**Build Validation**:

```bash
# Local build test
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages (XX/XX)
# ✓ Finalizing page optimization
```

**Build Checks**:
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All images optimized
- [ ] Bundle size <500KB (main chunk)
- [ ] No console errors in production build

**Performance Budgets**:
- [ ] First Contentful Paint (FCP): <1.8s
- [ ] Largest Contentful Paint (LCP): <2.5s
- [ ] Time to Interactive (TTI): <3.5s
- [ ] Cumulative Layout Shift (CLS): <0.1

---

### 6. Feature Flags 🚩

**Gradual Rollout Strategy**:

```typescript
// src/lib/feature-flags.ts
export const features = {
  priceTracking: process.env.NEXT_PUBLIC_ENABLE_PRICE_TRACKING === 'true',
  demandAggregation: process.env.NEXT_PUBLIC_ENABLE_DEMAND === 'true',
  sellerDashboard: process.env.NEXT_PUBLIC_ENABLE_SELLER_DASHBOARD === 'true',
  aiNegotiation: process.env.NEXT_PUBLIC_ENABLE_AI_NEGOTIATION === 'true', // Phase 4
};
```

**Rollout Plan**:
- [ ] Week 1: Enable for 10% of users (based on user ID hash)
- [ ] Week 2: Enable for 50% of users
- [ ] Week 3: Enable for 100% of users

---

### 7. Monitoring & Analytics 📊

**PostHog Analytics**:
- [ ] PostHog initialized
- [ ] Key events tracked:
  - `product_view`
  - `price_tracking_created`
  - `price_tracking_triggered`
  - `demand_viewed`
  - `nego_deal_participated`

**Sentry Error Tracking** (Optional):
- [ ] Sentry initialized
- [ ] Source maps uploaded
- [ ] Error alerts configured (Slack/Email)
- [ ] Performance monitoring enabled

**Vercel Analytics**:
- [ ] Web Vitals tracking enabled
- [ ] Custom events configured
- [ ] Error tracking enabled

---

### 8. Email Notifications 📧

**Resend Setup**:
- [ ] Domain verified
- [ ] DKIM/SPF records configured
- [ ] Email templates tested
- [ ] Unsubscribe link working

**Email Types**:
- [ ] Price drop alert
- [ ] NegoDeal goal reached
- [ ] Weekly digest (optional)

**Test Email**:
```typescript
// Test in dev-tools
await sendEmail({
  to: 'test@example.com',
  subject: 'Price Drop Alert',
  template: 'price-alert',
  data: {
    productName: '갤럭시 버즈3 Pro',
    targetPrice: 240000,
    currentPrice: 235000,
  },
});
```

---

### 9. Security Checklist 🔒

**Authentication**:
- [ ] Supabase Auth configured
- [ ] JWT validation working
- [ ] Session management tested
- [ ] Password reset flow tested

**API Security**:
- [ ] Rate limiting enabled (see src/lib/api/rate-limit.ts)
- [ ] CORS configured correctly
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (React escapes by default)

**Secrets Management**:
- [ ] No secrets in git history
- [ ] All sensitive keys in Vercel environment variables
- [ ] Service role key never exposed to client

---

### 10. Performance Optimization ⚡

**Image Optimization**:
- [ ] Next.js Image component used everywhere
- [ ] WebP format enabled
- [ ] Lazy loading for below-the-fold images
- [ ] Proper sizing (`fill`, `width`, `height`)

**Code Splitting**:
- [ ] Dynamic imports for heavy components
- [ ] Route-based code splitting (automatic with Next.js)
- [ ] Lazy load charts (Recharts)

**Caching Strategy**:
```typescript
// API Routes
export const revalidate = 60; // 60 seconds

// Static Pages
export const metadata = {
  cache: 'no-store', // for dynamic pages
};
```

**Database Optimization**:
- [ ] Indexes on frequently queried columns
- [ ] Materialized views for demand aggregation
- [ ] Connection pooling (Supabase default)

---

### 11. Backup & Disaster Recovery 💾

**Database Backups**:
- [ ] Supabase automatic daily backups
- [ ] Manual backup before major migrations
- [ ] Backup restoration tested

**Redis Backups**:
- [ ] Upstash automatic persistence
- [ ] Redis data is cache (can be rebuilt from PostgreSQL)

**Rollback Plan**:
1. Revert Vercel deployment to previous version
2. Restore database from latest backup if needed
3. Clear Redis cache
4. Monitor error rates

---

### 12. Documentation 📚

**User Documentation**:
- [ ] How to set price alerts
- [ ] How NegoDeal works
- [ ] FAQ section

**Developer Documentation**:
- [x] README.md updated
- [x] Architecture documentation (ARCHITECTURE.md)
- [x] Phase 1 implementation (negodeal-migration-plan.md)
- [x] Phase 2 implementation (PHASE_2_IMPLEMENTATION.md)
- [ ] API documentation (OpenAPI/Swagger)

---

### 13. Testing Checklist 🧪

**Manual Testing**:
- [ ] Sign up flow
- [ ] Login flow
- [ ] Set price tracking
- [ ] Receive notification (test mode)
- [ ] View demand distribution
- [ ] Seller insights dashboard
- [ ] My Page - Price Tracking tab
- [ ] Product detail page integration
- [ ] NegoDeal detail page integration

**Browser Testing**:
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible

---

### 14. Launch Day Checklist 🚀

**T-24 Hours**:
- [ ] Database backup created
- [ ] All environment variables verified
- [ ] Monitoring dashboards ready
- [ ] On-call rotation scheduled

**T-1 Hour**:
- [ ] Final smoke test on staging
- [ ] Clear Redis cache
- [ ] Warm up database connections

**Launch**:
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Check critical flows (sign up, price tracking)
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Check Redis hit rates

**T+1 Hour**:
- [ ] All systems green
- [ ] No critical errors
- [ ] Performance within SLA
- [ ] User feedback monitoring

**T+24 Hours**:
- [ ] Review analytics
- [ ] Check for any anomalies
- [ ] User feedback review
- [ ] Plan optimizations

---

## Post-Launch Monitoring

### Key Metrics to Watch

**User Engagement**:
- Daily Active Users (DAU)
- Price tracking creation rate
- Notification click-through rate
- NegoDeal participation rate

**Performance**:
- API response times
- Page load times
- Error rates
- Database query performance

**Business Metrics**:
- Number of price trackings created
- Number of deals triggered
- User retention (Day 1, Day 7, Day 30)
- Revenue (future: negotiation fees)

### Alerts to Configure

- [ ] Error rate >1% (5 minutes)
- [ ] API response time >500ms (P95)
- [ ] Database connection failures
- [ ] Redis unavailable
- [ ] Disk space >80%

---

## Rollback Procedure

If critical issues occur:

1. **Immediate**: Revert Vercel deployment
   ```bash
   vercel rollback
   ```

2. **Database**: Restore from backup (if schema changed)
   ```sql
   -- In Supabase dashboard
   -- Projects > Database > Backups > Restore
   ```

3. **Redis**: Clear cache and rebuild
   ```bash
   redis-cli FLUSHDB
   ```

4. **Communication**:
   - Update status page
   - Notify users via email/banner
   - Post-mortem document

---

## Success Criteria

**Phase 3 (Integration) Success**:
- [ ] Zero critical bugs in production
- [ ] API response times meet SLA (<200ms P95)
- [ ] >90% uptime in first week
- [ ] >100 users set price trackings
- [ ] >80% positive user feedback

---

**Prepared by**: Engineering Team
**Approved by**: Product & CTO
**Next Review**: Post-launch +1 week

---

