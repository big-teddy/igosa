# Production Environment Variables Setup Guide

**Last Updated**: 2025-11-27
**Status**: Ready for Deployment

---

## Required Environment Variables

### 1. Supabase (Database & Auth)

```bash
# Already configured - from .env.local
NEXT_PUBLIC_SUPABASE_URL="https://gaceyqigufvasshjifnl.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2V5cWlndWZ2YXNzaGppZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mjk1MzgsImV4cCI6MjA3OTMwNTUzOH0.lxOrPZgHkIvkGwERhCqBeV5qjoaWbIL_8hU7IpE5xlw"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2V5cWlndWZ2YXNzaGppZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcyOTUzOCwiZXhwIjoyMDc5MzA1NTM4fQ.EwBoL29DLCePGsS8_3LQeo1hqxlYjsF8yW-0u5zX_H0"
```

**Status**: ✅ Working
**Migration Status**: All migrations applied (including RLS policies)

---

### 2. Redis (Upstash) - **ACTION REQUIRED**

**Current**: Using local Redis (`redis://localhost:6379`)
**Production**: Need to set up Upstash Redis

#### Steps to Set Up Upstash Redis:

1. **Create Upstash Account**
   - Go to https://console.upstash.com/
   - Sign up with GitHub/Google

2. **Create Redis Database**
   - Click "Create Database"
   - Name: `igosa-production`
   - Type: Regional (for lower latency)
   - Region: `ap-southeast-1` (Singapore - close to Supabase)
   - Enable TLS: Yes

3. **Get Connection Details**
   ```bash
   # From Upstash Console → Database → REST API
   UPSTASH_REDIS_REST_URL="https://YOUR-REDIS.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AXX0ASQXXX..."
   ```

4. **Add to Vercel**
   ```bash
   vercel env add UPSTASH_REDIS_REST_URL
   vercel env add UPSTASH_REDIS_REST_TOKEN
   ```

**Fallback**: If Upstash is not set up, system will use mock client (no errors, but no real demand aggregation)

---

### 3. Feature Flags

```bash
# Already configured - keep same for production
NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL="true"
NEXT_PUBLIC_ENABLE_NEGODEAL_V2_PAGE="true"
NEXT_PUBLIC_ENABLE_NEW_NAVIGATION="true"
NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS="true"
NEXT_PUBLIC_ROLLOUT_PERCENT="100"
```

**Status**: ✅ No changes needed

---

### 4. App Configuration

```bash
# Update for production
NEXT_PUBLIC_APP_URL="https://igosa.vercel.app"  # Or custom domain
NODE_ENV="production"
```

---

## Optional Environment Variables

### Analytics (PostHog)

```bash
# If you want analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

**Status**: ⏸️ Optional for beta

### Error Tracking (Sentry)

```bash
# If you want error tracking
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."
```

**Status**: ⏸️ Optional for beta

---

## Deployment Checklist

### Pre-Deployment

- [x] Supabase database configured
- [x] RLS policies enabled
- [x] Database indexes created
- [x] Migrations applied
- [ ] Upstash Redis configured
- [x] E2E tests passing (16/16)
- [x] Local testing complete

### Deployment Steps

1. **Set up Upstash Redis** (15 minutes)
   ```bash
   # Follow steps in Section 2 above
   ```

2. **Configure Vercel Environment Variables** (5 minutes)
   ```bash
   # Login to Vercel
   vercel login

   # Link project (if not already)
   vercel link

   # Add environment variables
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   vercel env add UPSTASH_REDIS_REST_URL production
   vercel env add UPSTASH_REDIS_REST_TOKEN production
   vercel env add NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL production
   vercel env add NEXT_PUBLIC_ENABLE_NEGODEAL_V2_PAGE production
   vercel env add NEXT_PUBLIC_ENABLE_NEW_NAVIGATION production
   vercel env add NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS production
   vercel env add NEXT_PUBLIC_APP_URL production
   ```

3. **Deploy to Production** (2 minutes)
   ```bash
   # Deploy
   git push origin main

   # Or manual deploy
   vercel --prod
   ```

4. **Post-Deployment Verification** (5 minutes)
   - Visit https://your-domain.vercel.app
   - Test navigation to /nego-deals
   - Verify price tracking widget appears
   - Check demand aggregation API: `/api/demand/test-product-001`
   - Test with browser console (check for errors)

### Post-Deployment Testing

```bash
# Test Demand API
curl https://your-domain.vercel.app/api/demand/test-product-001 | jq

# Expected response:
{
  "data": {
    "productId": "test-product-001",
    "totalUsers": 0,  # Initially 0, will grow as users interact
    "priceTiers": [],
    ...
  },
  "meta": {
    "cached": true,
    ...
  }
}
```

---

## Monitoring

### Key Metrics to Watch

1. **Performance**
   - API response times (should be < 200ms)
   - Page load times (should be < 3s)
   - Redis operations (should be < 50ms)

2. **Errors**
   - Check Vercel logs: `vercel logs --follow`
   - Watch for RLS policy errors
   - Monitor Redis connection issues

3. **Usage**
   - Number of price trackings created
   - Demand aggregation requests
   - User engagement with widgets

---

## Rollback Plan

If issues occur:

```bash
# Rollback to previous deployment
vercel rollback

# Or disable feature flags
vercel env rm NEXT_PUBLIC_ENABLE_NEW_NAVIGATION production
vercel env add NEXT_PUBLIC_ENABLE_NEW_NAVIGATION production
# Enter: false
```

---

## Cost Estimation

### Current Stack Costs

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Hobby | $0 (free) |
| Supabase | Free | $0 |
| Upstash Redis | Free | $0 (10k commands/day) |
| **Total** | | **$0** |

### Scaling Costs (if needed)

| Service | Pro Tier | Monthly Cost |
|---------|----------|--------------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Upstash Redis | Pay-as-you-go | ~$10 (100k commands/day) |
| **Total** | | **~$55** |

---

## Beta Testing Preparation

### Beta User Limits

- Free tier limits:
  - Vercel: 100GB bandwidth
  - Supabase: 500MB database, 5GB bandwidth
  - Upstash: 10,000 commands/day

- Recommended beta size: **5-10 users**
- Expected usage:
  - ~100 price trackings/day
  - ~500 API requests/day
  - Well within free tier limits ✅

---

## Support & Troubleshooting

### Common Issues

**Issue 1: RLS Policy Blocking Users**
```sql
-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'price_tracking';

-- Verify user can access their data
SELECT * FROM price_tracking
WHERE user_id = 'test@example.com';
```

**Issue 2: Redis Connection Failed**
- Check Upstash dashboard for connection stats
- Verify environment variables are set correctly
- System will fallback to mock client (no errors)

**Issue 3: Slow API Responses**
- Check Redis cache hit rate
- Verify database indexes are created
- Monitor Vercel function logs

---

## Next Steps

1. ✅ Review this document
2. ⏳ Set up Upstash Redis (~15 min)
3. ⏳ Configure Vercel environment variables (~5 min)
4. ⏳ Deploy to production (~2 min)
5. ⏳ Run post-deployment tests (~5 min)
6. ⏳ Recruit beta users (~1 week)

**Total Time to Production**: ~30 minutes of configuration + testing

---

**Questions or Issues?**
Refer to:
- `/docs/PRODUCTION_CHECKLIST.md`
- `/docs/PRODUCTION_TESTING_GUIDE.md`
- `/docs/PHASE_3.5_COMPLETION.md`
