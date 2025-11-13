/**
 * 공동구매 (Negotiate Deal) 서비스
 *
 * 기능:
 * - 딜 참여 관리
 * - 참여자 추적
 * - 할인 단계 계산
 * - 레퍼럴 시스템 연동
 * - 알림 생성
 */

import {
  NegoDeal,
  UserNegoDealParticipation,
  NegoDealStats,
  NegoDealNotification,
  NegoDealParticipant,
} from '@/types/nego-deal';
import { referralService } from './referral-service';

const STORAGE_KEY_PARTICIPATIONS = 'igosa_nego_participations';
const STORAGE_KEY_NOTIFICATIONS = 'igosa_nego_notifications';
const REFERRAL_COMMISSION_RATE = 0.02; // 초대 시 2% 수수료

class NegoDealService {
  private static instance: NegoDealService;

  private constructor() {}

  static getInstance(): NegoDealService {
    if (!NegoDealService.instance) {
      NegoDealService.instance = new NegoDealService();
    }
    return NegoDealService.instance;
  }

  /**
   * 딜에 참여
   */
  joinDeal(
    deal: NegoDeal,
    userId: string,
    userName: string,
    userAvatar?: string,
    referralCode?: string
  ): UserNegoDealParticipation {
    // 이미 참여했는지 확인
    if (this.hasJoined(deal.id, userId)) {
      throw new Error('이미 참여한 딜입니다');
    }

    // 참여 기록 생성
    const participation: UserNegoDealParticipation = {
      dealId: deal.id,
      userId,
      userName,
      joinedAt: new Date().toISOString(),
      status: 'active',
      notified: false,
      invitedBy: referralCode ? this.getUserIdFromReferralCode(referralCode) : undefined,
    };

    // localStorage에 저장
    const participations = this.getAllParticipations();
    participations.push(participation);
    localStorage.setItem(STORAGE_KEY_PARTICIPATIONS, JSON.stringify(participations));

    // 레퍼럴 보상 처리 (친구 초대한 경우)
    if (referralCode && participation.invitedBy) {
      this.processReferralReward(participation.invitedBy, userId, deal);
    }

    // 목표 달성 확인 및 알림
    this.checkGoalReached(deal.id);

    return participation;
  }

  /**
   * 딜 참여 취소
   */
  leaveDeal(dealId: string, userId: string): void {
    const participations = this.getAllParticipations();
    const filtered = participations.filter(
      (p) => !(p.dealId === dealId && p.userId === userId)
    );
    localStorage.setItem(STORAGE_KEY_PARTICIPATIONS, JSON.stringify(filtered));
  }

  /**
   * 사용자가 특정 딜에 참여했는지 확인
   */
  hasJoined(dealId: string, userId: string): boolean {
    const participations = this.getAllParticipations();
    return participations.some((p) => p.dealId === dealId && p.userId === userId);
  }

  /**
   * 특정 딜의 모든 참여자 가져오기
   */
  getDealParticipants(dealId: string): UserNegoDealParticipation[] {
    const participations = this.getAllParticipations();
    return participations.filter((p) => p.dealId === dealId);
  }

  /**
   * 사용자의 모든 참여 내역 가져오기
   */
  getUserParticipations(userId: string): UserNegoDealParticipation[] {
    const participations = this.getAllParticipations();
    return participations.filter((p) => p.userId === userId);
  }

  /**
   * 현재 참여자 수 계산
   */
  getCurrentParticipantCount(dealId: string): number {
    return this.getDealParticipants(dealId).length;
  }

  /**
   * 진행률 계산
   */
  calculateProgress(dealId: string, targetParticipants: number): number {
    const current = this.getCurrentParticipantCount(dealId);
    return Math.min((current / targetParticipants) * 100, 100);
  }

  /**
   * 현재 할인율 계산 (할인 단계 기반)
   */
  getCurrentDiscountRate(deal: NegoDeal): number {
    if (!deal.discountTiers) return deal.discountRate;

    const currentCount = this.getCurrentParticipantCount(deal.id);

    // 달성한 가장 높은 단계 찾기
    let currentTier = deal.discountTiers[0];
    for (const tier of deal.discountTiers) {
      if (currentCount >= tier.participantCount) {
        currentTier = tier;
      }
    }

    return currentTier.discountRate;
  }

  /**
   * 현재 가격 계산
   */
  getCurrentPrice(deal: NegoDeal): number {
    const discountRate = this.getCurrentDiscountRate(deal);
    return Math.round(deal.originalPrice * (1 - discountRate / 100));
  }

  /**
   * 다음 할인 단계까지 필요한 인원
   */
  getNextTierInfo(deal: NegoDeal): { count: number; discount: number } | null {
    if (!deal.discountTiers) return null;

    const currentCount = this.getCurrentParticipantCount(deal.id);

    for (const tier of deal.discountTiers) {
      if (currentCount < tier.participantCount) {
        return {
          count: tier.participantCount - currentCount,
          discount: tier.discountRate,
        };
      }
    }

    return null;
  }

  /**
   * 사용자 통계 가져오기
   */
  getUserStats(userId: string): NegoDealStats {
    const participations = this.getUserParticipations(userId);

    const activeDeals = participations.filter((p) => p.status === 'active').length;
    const completedDeals = participations.filter((p) => p.status === 'completed').length;

    // 초대한 친구 수 계산
    const allParticipations = this.getAllParticipations();
    const friendsInvited = allParticipations.filter((p) => p.invitedBy === userId).length;

    // TODO: 실제 딜 데이터와 연동하여 총 절약 금액 계산
    const totalSavings = completedDeals * 50000; // 임시값

    // 레퍼럴 수익 계산
    const referralEarnings = friendsInvited * 1000; // 임시값

    return {
      totalDeals: participations.length,
      activeDeals,
      participatedDeals: participations.length,
      completedDeals,
      totalSavings,
      friendsInvited,
      referralEarnings,
    };
  }

  /**
   * 레퍼럴 링크 생성 (딜 공유용)
   */
  createReferralLink(dealId: string, userId: string): string {
    const referralCode = `${userId.slice(0, 6)}_${dealId.slice(0, 6)}_${Date.now()}`;
    return referralCode;
  }

  /**
   * 목표 달성 확인 및 알림 생성
   */
  private checkGoalReached(dealId: string): void {
    // TODO: 실제 딜 데이터와 연동
    // 목표 달성 시 참여자들에게 알림 생성
  }

  /**
   * 레퍼럴 보상 처리
   */
  private processReferralReward(inviterId: string, inviteeId: string, deal: NegoDeal): void {
    // 레퍼럴 서비스에 구매 기록
    // 딜 참여도 구매로 간주하여 커미션 지급
    const commissionAmount = deal.targetPrice * REFERRAL_COMMISSION_RATE;

    // TODO: 레퍼럴 서비스와 통합
    console.log(`Referral reward: ${inviterId} earned ₩${commissionAmount} from ${inviteeId}`);
  }

  /**
   * 레퍼럴 코드에서 userId 추출
   */
  private getUserIdFromReferralCode(referralCode: string): string {
    // 레퍼럴 코드 형식: userId_dealId_timestamp
    return referralCode.split('_')[0];
  }

  /**
   * 알림 생성
   */
  createNotification(
    dealId: string,
    userId: string,
    type: NegoDealNotification['type'],
    message: string
  ): NegoDealNotification {
    const notification: NegoDealNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dealId,
      userId,
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const notifications = this.getAllNotifications();
    notifications.push(notification);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));

    return notification;
  }

  /**
   * 사용자의 알림 가져오기
   */
  getUserNotifications(userId: string): NegoDealNotification[] {
    const notifications = this.getAllNotifications();
    return notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 알림 읽음 처리
   */
  markNotificationAsRead(notificationId: string): void {
    const notifications = this.getAllNotifications();
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    }
  }

  /**
   * 모든 참여 기록 가져오기 (private)
   */
  private getAllParticipations(): UserNegoDealParticipation[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_PARTICIPATIONS);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 모든 알림 가져오기 (private)
   */
  private getAllNotifications(): NegoDealNotification[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 딜 업데이트 (참여자 수 동기화)
   */
  updateDealWithParticipants(deal: NegoDeal): NegoDeal {
    const currentCount = this.getCurrentParticipantCount(deal.id);
    const progress = this.calculateProgress(deal.id, deal.targetParticipants);
    const currentPrice = this.getCurrentPrice(deal);
    const currentDiscountRate = this.getCurrentDiscountRate(deal);

    return {
      ...deal,
      currentParticipants: currentCount,
      progress,
      targetPrice: currentPrice,
      discountRate: currentDiscountRate,
      savings: deal.originalPrice - currentPrice,
      status: progress >= 100 ? 'goal_reached' : deal.status,
    };
  }
}

export const negoDealService = NegoDealService.getInstance();
