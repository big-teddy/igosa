'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Trash2 } from 'lucide-react';
import { Button } from './button';

interface RecentSearchesProps {
  searches: string[];
  onSearchClick: (search: string) => void;
  onRemove: (search: string) => void;
  onClearAll: () => void;
  maxDisplay?: number;
}

export function RecentSearches({
  searches,
  onSearchClick,
  onRemove,
  onClearAll,
  maxDisplay = 5,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  const displayedSearches = searches.slice(0, maxDisplay);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-gray-900">최근 검색어</h3>
            <span className="text-xs text-muted-foreground">({searches.length})</span>
          </div>
          {searches.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              전체삭제
            </Button>
          )}
        </div>

        {/* Search Items */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {displayedSearches.map((search, index) => (
              <motion.div
                key={search}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <button
                  onClick={() => onSearchClick(search)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-accent border border-border hover:border-primary/50 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-primary pr-8"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="max-w-[150px] truncate">{search}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(search);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-transparent hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label={`${search} 삭제`}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show more indicator */}
        {searches.length > maxDisplay && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            +{searches.length - maxDisplay}개 더 있습니다
          </p>
        )}
      </div>
    </motion.div>
  );
}
