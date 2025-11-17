# NegoDeal 1.0 → 2.0 Migration Plan

## Executive Summary

This document outlines the direct transition strategy from NegoDeal 1.0 (group buying model) to NegoDeal 2.0 (AI-powered price negotiation marketplace).

Since the service is **not currently in production**, we can proceed with a **direct transition** rather than parallel operation.

## Current State: NegoDeal 1.0

**Business Model**: Group buying (Groupon-style)
- Fixed prices (e.g., ₩323,100)
- Pre-negotiated deals with sellers
- Participant count tracking (23/30)
- Time-limited offers

**Tech Stack**:
- Next.js 14 App Router
- TypeScript
- PostgreSQL (via Supabase)
- Mock data implementation

## Target State: NegoDeal 2.0

**Business Model**: AI-powered price negotiation
- User-set target prices
- Real-time demand aggregation
- AI-to-AI negotiation with sellers
- Dynamic pricing based on collective demand

**New Architecture**:
- Redis for demand aggregation (Sorted Sets)
- TimescaleDB for price history
- LangGraph for multi-agent negotiation
- PostgreSQL for core data
- Python FastAPI for price crawling

## Migration Strategy: Direct Transition

### Phase 0: Infrastructure Preparation (1 week)
**Goal**: Set up foundational infrastructure for 2.0

**Tasks**:
1. **Database Schema**:
   - Create `price_tracking` table
   - Create `price_history` table
   - Create `demand_aggregation` view
   - Migration scripts

2. **Redis Setup**:
   - Local Redis for development
   - Redis Sorted Sets for demand aggregation
   - Caching layer for price data

3. **API Routes**:
   - `POST /api/price-tracking` - Create tracking
   - `GET /api/price-tracking/:id` - Get tracking status
   - `GET /api/price-history/:productId` - Get price history
   - `GET /api/demand/:productId` - Get demand aggregation

**Deliverables**:
- DB migration files
- Redis connection setup
- API route skeletons
- Type definitions (`/src/types/price-tracking.ts`)

---

### Phase 1: Price Tracking MVP (2 weeks)
**Goal**: Allow users to set target prices and receive notifications

**Week 1: Core UI/UX**
1. **SetTargetPriceWidget Component** ✅
   - Price slider (current price ±30% to +10%)
   - Savings calculator
   - Probability estimation
   - Mock demand display

2. **Integration**:
   - Add widget to NegoDeal detail page
   - Add widget to Product detail page

3. **Backend**:
   - Implement `createPriceTracking` API
   - Store tracking records in PostgreSQL
   - Mock notification system

**Week 2: Persistence & Notifications**
1. **Database Integration**:
   - Save price tracking to DB
   - User dashboard showing active trackings
   - Mock price updates (simulate crawling)

2. **Basic Notifications**:
   - Email notifications (SendGrid)
   - Toast notifications in-app
   - Notification preferences UI

**Deliverables**:
- Functional price tracking system
- User can set target prices
- Basic notifications working
- My Page showing active trackings

---

### Phase 2: Demand Aggregation (2 weeks)
**Goal**: Aggregate user demand and show real-time insights

**Week 1: Demand Collection**
1. **Redis Integration**:
   - Store price points in Sorted Sets
   - Aggregate demand by price tier
   - Real-time updates

2. **Demand Visualization**:
   - Price distribution chart (D3.js or Recharts)
   - Show "234명이 비슷한 가격을 원해요"
   - Peak demand price indicator

**Week 2: Seller Insights (Basic)**
1. **Seller Dashboard**:
   - View demand aggregation per product
   - See price distribution
   - Mock recommendation system

2. **Integration**:
   - Connect demand data to widget
   - Real probability calculations
   - Update UI with live counts

**Deliverables**:
- Redis demand aggregation working
- Real-time demand visualization
- Basic seller insights dashboard

---

### Phase 3: Integration & Polish (2 weeks)
**Goal**: Merge 1.0 and 2.0, create unified experience

**Week 1: Unified Experience**
1. **Merge Flows**:
   - NegoDeal 1.0 pages show Price Tracking widget
   - Users can join group deals OR set target prices
   - Unified "My Deals" page

2. **Product Page Overhaul**:
   - Show both group deals and price tracking
   - Smart recommendations
   - Historical price charts

**Week 2: Testing & Launch Prep**
1. **Testing**:
   - E2E tests for price tracking flow
   - Load testing for Redis aggregation
   - Mock seller negotiations

2. **Launch Prep**:
   - Production Redis setup
   - Monitoring & alerts
   - Documentation

**Deliverables**:
- Unified NegoDeal experience
- Production-ready infrastructure
- Complete testing coverage

---

## Phase 4+: AI Negotiation Engine (Future)

This will be tackled after Phase 3 is complete and validated with real users.

**Components**:
- LangGraph multi-agent system
- Seller agent integration
- Automated negotiation workflows
- Price crawling pipeline (Python FastAPI)

---

## UI/UX Reusability

**Good News**: 80% of current UI/UX can be reused!

**Keep**:
- Product cards
- Grid layouts
- Time urgency indicators
- Progress bars
- Participant avatars
- Badge system

**Enhance**:
- Add price history charts
- Add demand distribution graphs
- Add negotiation status indicators
- Add seller insights widgets

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Redis complexity | Start with simple Sorted Sets, scale gradually |
| Price crawling legal issues | Start with partner sellers only, add crawling later |
| AI negotiation failures | Phase 4+ allows time to build robust system |
| User confusion | Clear onboarding, tooltips, progressive disclosure |

---

## Success Metrics

**Phase 1**:
- 50+ users setting target prices
- 80%+ completion rate on price tracking flow

**Phase 2**:
- 500+ price points in demand aggregation
- 10+ sellers viewing insights

**Phase 3**:
- 70%+ users prefer new flow over old
- 30%+ conversion from tracking to purchase

---

## Timeline Summary

| Phase | Duration | Completion Date |
|-------|----------|-----------------|
| Phase 0: Infrastructure | 1 week | Week 1 |
| Phase 1: Price Tracking MVP | 2 weeks | Week 3 |
| Phase 2: Demand Aggregation | 2 weeks | Week 5 |
| Phase 3: Integration | 2 weeks | Week 7 |
| **Total** | **7 weeks** | **~2 months** |

---

## Next Steps

1. ✅ Create this migration plan
2. ✅ Create TypeScript types (`price-tracking.ts`)
3. ✅ Create `SetTargetPriceWidget` component
4. 🔄 Integrate widget into NegoDeal detail page
5. ⏳ Set up database schema
6. ⏳ Implement API routes
7. ⏳ Set up Redis

---

**Last Updated**: 2025-11-17
**Status**: Phase 0 - In Progress
