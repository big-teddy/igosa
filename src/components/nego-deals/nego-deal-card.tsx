import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, TrendingDown, Zap } from "lucide-react";
import { NegoDeal } from "@/lib/data/mock-nego-deals";

interface NegoDealCardProps {
  deal: NegoDeal;
}

export function NegoDealCard({ deal }: NegoDealCardProps) {
  const timeUrgent = deal.hoursRemaining <= 24;
  const nearGoal = deal.progress >= 90;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={deal.productImage}
            alt={deal.productName}
            fill
            className="object-cover"
          />
          {deal.status === 'goal_reached' && (
            <Badge className="absolute top-3 right-3 bg-green-600">
              <Zap className="h-3 w-3 mr-1" />
              목표 달성!
            </Badge>
          )}
          {timeUrgent && deal.status === 'active' && (
            <Badge className="absolute top-3 right-3 bg-red-600">
              <Clock className="h-3 w-3 mr-1" />
              마감 임박
            </Badge>
          )}
          {nearGoal && deal.status === 'active' && !timeUrgent && (
            <Badge className="absolute top-3 right-3 bg-orange-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              거의 달성!
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white font-semibold text-sm">{deal.brand}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {deal.productName}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {deal.description}
          </p>
        </div>

        {/* 가격 정보 */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              ₩{deal.targetPrice.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ₩{deal.originalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {deal.discountRate}% 할인
            </Badge>
            <span className="text-sm text-green-600 font-medium">
              ₩{deal.savings.toLocaleString()} 절약
            </span>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {deal.currentParticipants}/{deal.targetParticipants}명 참여
              </span>
            </div>
            <span className="font-medium">{deal.progress}%</span>
          </div>
          <Progress value={deal.progress} className="h-2" />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{deal.hoursRemaining}시간 남음</span>
          </div>
        </div>

        {/* 하이라이트 */}
        <div className="flex flex-wrap gap-1">
          {deal.highlights.slice(0, 2).map((highlight, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {highlight}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/nego-deals/${deal.id}`} className="w-full">
          <Button className="w-full" size="lg">
            {deal.status === 'goal_reached' ? '참여하기 (마감 임박)' : '지금 참여하기'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
