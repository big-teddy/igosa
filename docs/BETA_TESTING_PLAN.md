# Beta Testing Plan - NegoDeal 2.0

**Version**: 1.0
**Created**: 2025-11-27
**Duration**: 2 weeks
**Target Users**: 5-10 beta testers

---

## Objectives

### Primary Goals

1. **Validate Core Functionality**
   - Price tracking widget works correctly
   - Demand aggregation calculates accurately
   - RLS policies secure user data
   - No critical bugs or errors

2. **Gather User Feedback**
   - Is the UI intuitive?
   - Are features valuable?
   - What improvements are needed?
   - Would users recommend it?

3. **Test Performance**
   - API response times acceptable?
   - Page loads quickly?
   - Mobile experience good?

---

## Beta Tester Recruitment

### Target Profile

**Ideal Beta Testers:**
- Age: 20-40
- Tech-savvy (comfortable with web apps)
- Regular online shoppers
- Willing to provide feedback
- Available for 2-week commitment

**Diversity Goals:**
- 2-3 heavy online shoppers (daily)
- 2-3 moderate shoppers (weekly)
- 1-2 light shoppers (monthly)
- Mix of mobile and desktop users

### Recruitment Channels

1. **Personal Network** (fastest)
   - Friends/family who shop online
   - University students
   - Colleagues

2. **Online Communities**
   - Reddit: r/korea, r/koreanbeauty
   - Facebook groups: Korean shopping
   - Twitter/X: Korean tech community

3. **Direct Outreach**
   - Email to existing contacts
   - LinkedIn posts
   - Slack/Discord communities

---

## Onboarding Process

### Step 1: Welcome Email

**Subject**: 🎉 You're invited to test NegoDeal 2.0!

**Template**:
```
안녕하세요!

이거사(Igosa)의 새로운 기능 "네고딜 2.0"을 테스트해주실 베타 테스터로 선정되셨습니다!

🎯 네고딜 2.0이란?
- AI가 자동으로 가격을 협상해주는 새로운 쇼핑 방식
- 원하는 가격을 설정하면 AI가 자동으로 협상
- 같은 제품을 원하는 사람들과 함께 구매하여 더 큰 할인

📱 베타 테스트 기간: 2주 (12/1 - 12/14)

🔗 접속 링크: https://igosa.vercel.app
📧 테스트 계정: (아래 참조)

✅ 테스트 방법:
1. 위 링크로 접속
2. 회원가입 또는 로그인
3. "네고딜" 메뉴 클릭
4. 원하는 제품에 희망 가격 설정
5. 2주 후 설문조사 응답

🎁 참여 혜택:
- 베타 테스터 전용 할인 쿠폰 (론칭 후)
- 피드백 제공 시 소정의 사례품
- 서비스 최초 사용자 배지

궁금한 점이 있으시면 이메일로 연락주세요!

감사합니다,
이거사 팀
```

### Step 2: Test Account Setup

```bash
# Create test accounts
Test Account 1: beta1@igosa.com / BetaTest2024!
Test Account 2: beta2@igosa.com / BetaTest2024!
Test Account 3: beta3@igosa.com / BetaTest2024!
# ... up to 10 accounts
```

### Step 3: Onboarding Call (Optional)

- 15-minute Zoom/Google Meet
- Walk through features
- Answer questions
- Set expectations

---

## Testing Scenarios

### Week 1: Core Functionality

**Day 1-3: Exploration**
- Sign up / Log in
- Navigate to /nego-deals
- Browse available deals
- Click on a deal to see details

**Day 4-7: Price Tracking**
- Set a target price on a product
- Adjust price slider
- Check "similar users" count
- Verify notification preferences

### Week 2: Advanced Features

**Day 8-10: Demand Aggregation**
- Check if demand data updates
- See how many users want similar prices
- Test with different products

**Day 11-14: Feedback**
- Complete survey
- Report any bugs
- Suggest improvements

---

## Data Collection

### Quantitative Metrics

**Track Automatically:**
- Number of page visits
- Price trackings created
- Slider interactions
- Demand API calls
- Error rates
- Page load times
- Device types (mobile vs desktop)

**Tools:**
- PostHog (if configured)
- Vercel Analytics
- Custom logging

### Qualitative Feedback

**Mid-Test Check-in (Day 7)**
```
간단한 설문:
1. 지금까지 경험은 어떠신가요? (1-5)
2. 어떤 기능이 가장 유용했나요?
3. 어떤 부분이 어려웠나요?
4. 버그나 오류를 발견하셨나요?
```

**Final Survey (Day 14)**
```
최종 설문:
1. 전체적인 만족도 (1-5)
2. 가장 좋았던 기능 3가지
3. 가장 불편했던 부분 3가지
4. 추가되었으면 하는 기능
5. 친구에게 추천하시겠습니까? (NPS)
6. 실제로 사용할 의향이 있나요?
```

---

## Success Criteria

### Must Have (Go/No-Go)

- ✅ Zero critical bugs (data loss, crashes)
- ✅ 80%+ feature completion rate
- ✅ Average satisfaction score ≥ 3.5/5
- ✅ No security issues (RLS working)

### Nice to Have

- 🎯 NPS score ≥ 30
- 🎯 70%+ would use in production
- 🎯 Average session duration > 5 minutes
- 🎯 50%+ mobile usage

---

## Bug Reporting Process

### For Beta Testers

**How to Report Bugs:**
1. Take a screenshot
2. Email to: beta@igosa.com (or create issue on GitHub)
3. Include:
   - What you were trying to do
   - What happened (error message, screenshot)
   - Device/browser (e.g., iPhone Safari, Chrome Desktop)

**Bug Priority Levels:**
- 🔴 Critical: Can't use the feature at all
- 🟡 High: Feature works but has major issues
- 🟢 Low: Minor UI/UX issues

### For Development Team

**Response Times:**
- 🔴 Critical: Fix within 24 hours
- 🟡 High: Fix within 3 days
- 🟢 Low: Note for next release

---

## Communication Plan

### Regular Updates

**Week 1 Monday**: Welcome email + onboarding
**Week 1 Wednesday**: "How's it going?" check-in
**Week 1 Sunday**: Mid-test survey reminder
**Week 2 Monday**: Mid-test results + improvements
**Week 2 Wednesday**: "Almost done!" encouragement
**Week 2 Sunday**: Final survey + thank you

### Channels

- **Email**: Primary communication
- **Slack/Discord** (optional): Real-time support
- **Google Forms**: Surveys

---

## Incentives & Rewards

### Participation Rewards

**For All Testers:**
- Beta tester badge on profile
- Early access to new features
- Name in "Beta Testers" hall of fame

**For Active Testers (50%+ tasks completed):**
- ₩10,000 Coupang gift card
- 20% lifetime discount

**For Top 3 Contributors (most feedback):**
- ₩50,000 gift card
- Personal thank you + feature named after you

---

## Timeline

### Pre-Beta (Now - Nov 30)

- [ ] Set up Upstash Redis
- [ ] Deploy to Vercel production
- [ ] Create test accounts
- [ ] Prepare welcome emails
- [ ] Set up feedback forms

### Beta Testing (Dec 1 - Dec 14)

**Week 1:**
- Mon: Send welcome emails
- Wed: Mid-week check-in
- Sun: Mid-test survey

**Week 2:**
- Mon: Share mid-test results
- Wed: Encourage final testing
- Sun: Final survey

### Post-Beta (Dec 15 - Dec 21)

- Analyze feedback
- Fix critical bugs
- Plan improvements
- Prepare for public launch

---

## Deliverables

### End of Beta

1. **Test Report** (`/docs/BETA_TEST_REPORT.md`)
   - Summary statistics
   - User feedback highlights
   - Bug list (fixed + pending)
   - Recommendations

2. **User Feedback Compilation**
   - Survey results
   - Feature requests
   - Pain points

3. **Go/No-Go Decision**
   - Ready for public launch?
   - What needs to be fixed first?
   - Timeline for full release

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low tester signup | Medium | High | Start recruiting now, offer incentives |
| Critical bugs found | Low | High | Have rollback plan ready |
| Poor user feedback | Medium | Medium | Iterate based on feedback, delay launch if needed |
| Low engagement | Medium | Low | Send reminders, make testing fun |

---

## Appendix

### A. Survey Questions (Full)

**Mid-Test Survey**:
```
1. 얼마나 자주 이거사를 사용했나요?
   - 매일 / 주 3-4회 / 주 1-2회 / 거의 안 함

2. 가장 좋았던 기능은?
   - 가격 추적 위젯
   - 수요 집계 정보
   - 네고딜 리스트
   - 기타: ___

3. 가장 불편했던 점은?
   [자유 응답]

4. 버그를 발견했나요?
   예 / 아니오
   (예라면: 어떤 버그인가요?)

5. 전반적인 만족도는?
   1 (매우 불만) - 5 (매우 만족)
```

**Final Survey**: (More comprehensive, includes NPS, feature requests, etc.)

### B. Test Account Credentials

```
Account 1: beta1@igosa.com / BetaTest2024!
Account 2: beta2@igosa.com / BetaTest2024!
...
(Will be sent individually to each tester)
```

---

**Contact**: beta@igosa.com
**Last Updated**: 2025-11-27
