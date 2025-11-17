# PostHog Dashboard Configuration

이 문서는 Igosa 프로젝트의 PostHog 대시보드 설정을 정의합니다.

## 📊 핵심 지표 (Key Metrics)

### 1. 전환 퍼널 (Conversion Funnel)

**Funnel Name:** 사용자 구매 여정
**Steps:**
1. Search Performed (검색 수행)
2. Product Viewed (상품 조회)
3. Add to Cart (장바구니 추가 / 네고딜 참여)
4. Checkout Started (결제 시작)
5. Purchase Completed (구매 완료)

**Key Metrics:**
- Overall conversion rate: Step 1 → Step 5
- Drop-off rates at each step
- Time to convert

---

### 2. 검색 성과 (Search Performance)

#### Insights:
- **Total Searches**: Trend of "Search Performed" event
- **Search Success Rate**:
  - Filter: `results_count > 0`
  - Formula: `(Successful Searches / Total Searches) * 100`
- **Popular Search Queries**:
  - Breakdown by `query` property
  - Top 10 most frequent searches
- **Average Results per Search**:
  - Average of `results_count` property
- **Search Mode Distribution**:
  - Breakdown by `search_mode` (price vs recommend)

#### Actions:
- Monitor searches with 0 results to improve keyword matching
- Track which search mode is more popular

---

### 3. 상품 성과 (Product Performance)

#### Insights:
- **Most Viewed Products**:
  - "Product Viewed" event
  - Breakdown by `product_name`
  - Top 20 products
- **Most Added to Cart**:
  - "Add to Cart" event
  - Breakdown by `product_name`
  - Top 20 products
- **View-to-Cart Conversion**:
  - Formula: `(Add to Cart / Product Viewed) * 100`
  - Per product analysis
- **Average Product Price Viewed**:
  - Average of `price` property from "Product Viewed"

---

### 4. 구매 지표 (Purchase Metrics)

#### Insights:
- **Total Revenue**:
  - Sum of `total_amount` from "Purchase Completed"
  - Trend over time (daily, weekly, monthly)
- **Total Orders**:
  - Count of "Purchase Completed" events
- **Average Order Value (AOV)**:
  - Formula: `Total Revenue / Total Orders`
- **Checkout Conversion Rate**:
  - Formula: `(Purchase Completed / Checkout Started) * 100`
- **Cart Abandonment Rate**:
  - Formula: `((Checkout Started - Purchase Completed) / Checkout Started) * 100`

---

### 5. 사용자 참여도 (User Engagement)

#### Insights:
- **Daily Active Users (DAU)**:
  - Unique users per day
- **Monthly Active Users (MAU)**:
  - Unique users per month
- **Session Duration**:
  - Average session length
- **Pages per Session**:
  - Average pageviews per session
- **Returning Users**:
  - Users with multiple sessions
- **User Retention**:
  - Cohort analysis (Day 1, 7, 30 retention)

---

### 6. 네고딜 성과 (NegoDeal Performance)

#### Insights:
- **Most Popular Deals**:
  - "Product Viewed" filtered by deal pages
  - Breakdown by deal name
- **Deal Participation Rate**:
  - Formula: `(Add to Cart on Deal Pages / Deal Page Views) * 100`
- **Deal Completion**:
  - Deals that reached target participants
  - Time to reach target

---

## 🎯 대시보드 레이아웃 (Dashboard Layout)

### Dashboard 1: 비즈니스 개요 (Business Overview)
- Total Revenue (current month)
- Total Orders (current month)
- Average Order Value
- Conversion Rate
- Revenue Trend (last 30 days)
- Orders Trend (last 30 days)
- Top 5 Products by Revenue
- Funnel Visualization

### Dashboard 2: 사용자 행동 (User Behavior)
- DAU/MAU Trend
- User Retention Cohort
- Session Duration Distribution
- Popular Search Queries
- Search Success Rate
- Most Viewed Products
- Most Added to Cart Products

### Dashboard 3: 전환 최적화 (Conversion Optimization)
- Full Conversion Funnel
- Drop-off Analysis by Step
- View-to-Cart Conversion by Product
- Checkout-to-Purchase Conversion
- Cart Abandonment Rate
- Time to Convert Distribution

### Dashboard 4: 네고딜 분석 (NegoDeal Analysis)
- Active Deals Count
- Deal Participation Rate
- Most Popular Deals
- Deal Completion Rate
- Average Participants per Deal
- Deal Revenue Contribution

---

## 🔔 알림 설정 (Alerts Configuration)

### Critical Alerts:
1. **Conversion Rate Drop**: Alert if overall conversion rate drops below 2%
2. **Revenue Drop**: Alert if daily revenue drops more than 30% compared to 7-day average
3. **High Cart Abandonment**: Alert if cart abandonment rate exceeds 80%
4. **Search Failure Spike**: Alert if searches with 0 results exceed 40%

### Warning Alerts:
1. **DAU Decline**: Alert if DAU drops more than 20% week-over-week
2. **Checkout Drop-off**: Alert if checkout-to-purchase rate drops below 50%
3. **Session Duration Drop**: Alert if average session duration drops below 2 minutes

---

## 📈 주간 리포트 (Weekly Reports)

**Automated Weekly Report includes:**
- Revenue vs Previous Week
- Orders vs Previous Week
- Top 10 Products
- Funnel Conversion Rates
- User Growth Metrics
- Key Insights and Anomalies

---

## 🛠 구현 단계 (Implementation Steps)

### Step 1: PostHog Console Setup
1. Log into PostHog dashboard
2. Navigate to "Insights" → "New Insight"
3. Create each metric as defined above
4. Save to appropriate dashboard

### Step 2: Funnel Configuration
1. Go to "Insights" → "Funnels"
2. Create "User Purchase Journey" funnel
3. Add 5 steps as defined
4. Configure time window: 7 days
5. Save to "Conversion Optimization" dashboard

### Step 3: Dashboard Creation
1. Create 4 dashboards as defined
2. Add relevant insights to each dashboard
3. Arrange in logical order
4. Pin critical metrics to top

### Step 4: Alert Configuration
1. Go to "Project Settings" → "Alerts"
2. Create alerts as defined above
3. Configure notification channels (Slack, Email)
4. Test alert triggers

### Step 5: Automation
1. Set up weekly report automation
2. Configure email distribution list
3. Schedule for Monday mornings

---

## 📊 Success Metrics for Analytics

**We'll know our analytics are successful when:**
- ✅ All critical business metrics are visible in one dashboard
- ✅ We can identify funnel drop-off points within 5 minutes
- ✅ We receive alerts for anomalies within 1 hour
- ✅ Weekly reports are automatically delivered every Monday
- ✅ Product team makes data-driven decisions using these dashboards

---

## 🔍 Next Steps

After dashboard setup:
1. A/B Testing Framework (Week 2, Task 3)
2. Performance Monitoring with Web Vitals (Week 2, Task 5)
3. Advanced Segmentation (User cohorts, behavior patterns)
4. Custom Event Properties for deeper analysis
