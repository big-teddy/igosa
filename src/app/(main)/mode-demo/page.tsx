"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/mode-selectors/toggle-switch";
import { SegmentedControl } from "@/components/mode-selectors/segmented-control";
import { FloatingActionButton } from "@/components/mode-selectors/floating-action-button";
import { ChipSelector } from "@/components/mode-selectors/chip-selector";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ModeDemoPage() {
  const [toggleMode, setToggleMode] = useState<"price" | "recommend">("price");
  const [segmentedMode, setSegmentedMode] = useState<"price" | "recommend">("price");
  const [fabMode, setFabMode] = useState<"price" | "recommend">("price");
  const [chipMode, setChipMode] = useState<"price" | "recommend">("price");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">모드 전환 UI 스타일 비교</h1>
            <p className="text-muted-foreground mt-1">
              4가지 스타일을 직접 체험해보고 선택하세요
            </p>
          </div>
        </div>

        {/* Style 1: Toggle Switch */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">1. Toggle Switch</h2>
                  <Badge variant="secondary">iOS 스타일</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Perplexity Focus 모드처럼 좌우로 토글하는 스위치. 두 모드 간 명확한 전환을 제공합니다.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>직관적이고 익숙한 인터페이스</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>공간 효율적 (좁은 화면에 적합)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Binary 선택에 최적화</span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">현재 모드:</p>
                <Badge className="text-sm">
                  {toggleMode === 'price' ? '💰 가격비교 모드' : '✨ 추천템 모드'}
                </Badge>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-xl bg-muted/20">
              <ToggleSwitch mode={toggleMode} onModeChange={setToggleMode} />
            </div>
          </div>
        </Card>

        {/* Style 2: Segmented Control */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">2. Segmented Control</h2>
                  <Badge variant="secondary">macOS 스타일</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  둥근 배경이 슬라이드되는 탭. 애플스러운 고급스러운 느낌과 부드러운 애니메이션이 특징입니다.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>프리미엄하고 세련된 디자인</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>부드러운 슬라이드 애니메이션</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>텍스트와 아이콘 모두 표시 가능</span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">현재 모드:</p>
                <Badge className="text-sm">
                  {segmentedMode === 'price' ? '💰 가격비교 모드' : '✨ 추천템 모드'}
                </Badge>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-xl bg-muted/20">
              <SegmentedControl mode={segmentedMode} onModeChange={setSegmentedMode} />
            </div>
          </div>
        </Card>

        {/* Style 3: Floating Action Button */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">3. Floating Action Button</h2>
                  <Badge variant="secondary">Material Design</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  우측 하단 떠있는 버튼으로 모드 선택 메뉴 펼침. 모던하고 공간 효율적입니다.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>화면 공간 최대 활용</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>모바일 친화적</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>항상 접근 가능 (sticky)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">⚠</span>
                  <span className="text-muted-foreground">처음 사용 시 발견 가능성 낮음</span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">현재 모드:</p>
                <Badge className="text-sm">
                  {fabMode === 'price' ? '💰 가격비교 모드' : '✨ 추천템 모드'}
                </Badge>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-xl bg-muted/20 relative overflow-hidden">
              <p className="text-sm text-muted-foreground">
                우측 하단 버튼을 확인해보세요 →
              </p>
              <FloatingActionButton mode={fabMode} onModeChange={setFabMode} />
            </div>
          </div>
        </Card>

        {/* Style 4: Chip Selector */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">4. Chip Selector</h2>
                  <Badge variant="secondary">Material Design</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  선택된 칩에 체크마크와 그라디언트. 구글스러운 느낌의 인터랙티브 디자인입니다.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>명확한 시각적 피드백</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>확장 가능 (3개 이상 옵션)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>체크마크로 선택 상태 명확</span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">현재 모드:</p>
                <Badge className="text-sm">
                  {chipMode === 'price' ? '💰 가격비교 모드' : '✨ 추천템 모드'}
                </Badge>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-xl bg-muted/20">
              <ChipSelector mode={chipMode} onModeChange={setChipMode} />
            </div>
          </div>
        </Card>

        {/* Recommendation */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-bold mb-2">💡 추천</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>데스크톱 중심 서비스:</strong> Segmented Control 또는 Chip Selector
            </p>
            <p>
              <strong>모바일 중심 서비스:</strong> Toggle Switch 또는 FAB
            </p>
            <p>
              <strong>고급스러운 브랜딩:</strong> Segmented Control (macOS 스타일)
            </p>
            <p>
              <strong>공간 효율성 우선:</strong> Toggle Switch 또는 FAB
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
