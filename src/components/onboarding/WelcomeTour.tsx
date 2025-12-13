"use client";

import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

const TOUR_STEPS: Step[] = [
    {
        target: "body",
        content: (
            <div className="space-y-2">
                <h3 className="text-lg font-bold">이거사에 오신 것을 환영합니다! 👋</h3>
                <p>AI가 최저가를 찾아드리는 쇼핑 플랫폼입니다.</p>
                <p className="text-sm text-muted-foreground">
                    주요 기능을 빠르게 둘러보시겠어요? (건너뛰기 가능)
                </p>
            </div>
        ),
        placement: "center",
        disableBeacon: true,
    },
    {
        target: '[data-tour="search"]',
        content: (
            <div className="space-y-2">
                <h4 className="font-semibold">🔍 AI 비주얼 검색</h4>
                <p className="text-sm">
                    상품 사진만 있어도 찾을 수 있어요! 이미지를 업로드하면 AI가 자동으로 분석합니다.
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: '[data-tour="chat"]',
        content: (
            <div className="space-y-2">
                <h4 className="font-semibold">💬 AI 쇼핑 어시스턴트</h4>
                <p className="text-sm">
                    궁금한 걸 물어보세요! "10만원대 노트북 추천해줘" 같은 질문도 OK!
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: '[data-tour="watchlist"]',
        content: (
            <div className="space-y-2">
                <h4 className="font-semibold">❤️ 찜 & 가격 알림</h4>
                <p className="text-sm">
                    관심 상품을 찜하면 가격이 떨어질 때 알려드려요!
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: "body",
        content: (
            <div className="space-y-2">
                <h3 className="text-lg font-bold">준비 완료! 🎉</h3>
                <p>이제 AI와 함께 스마트한 쇼핑을 시작하세요!</p>
                <p className="text-xs text-muted-foreground mt-4">
                    * 이 가이드는 설정에서 다시 볼 수 있습니다.
                </p>
            </div>
        ),
        placement: "center",
    },
];

interface WelcomeTourProps {
    run?: boolean;
    onFinish?: () => void;
}

export function WelcomeTour({ run = false, onFinish }: WelcomeTourProps) {
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        setRunTour(run);
    }, [run]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRunTour(false);
            localStorage.setItem("welcomeTourCompleted", "true");
            onFinish?.();
        }
    };

    return (
        <Joyride
            steps={TOUR_STEPS}
            run={runTour}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: "hsl(250 100% 65%)",
                    textColor: "hsl(222.2 84% 4.9%)",
                    backgroundColor: "hsl(0 0% 100%)",
                    overlayColor: "rgba(0, 0, 0, 0.5)",
                    arrowColor: "hsl(0 0% 100%)",
                    zIndex: 10000,
                },
                tooltip: {
                    borderRadius: 12,
                    padding: 20,
                },
                buttonNext: {
                    backgroundColor: "hsl(250 100% 65%)",
                    borderRadius: 8,
                    padding: "8px 16px",
                },
                buttonBack: {
                    marginRight: 10,
                    color: "hsl(215.4 16.3% 46.9%)",
                },
                buttonSkip: {
                    color: "hsl(215.4 16.3% 46.9%)",
                },
            }}
            locale={{
                back: "이전",
                close: "닫기",
                last: "완료",
                next: "다음",
                skip: "건너뛰기",
            }}
        />
    );
}
