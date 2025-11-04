import { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon = "🔍",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const isEmoji = typeof icon === "string";

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="mb-6">
        {isEmoji ? (
          <div className="text-7xl opacity-40">{icon}</div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center opacity-60">
            {icon}
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}
