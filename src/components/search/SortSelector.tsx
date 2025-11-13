'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption, SORT_LABELS } from '@/types/search';

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  availableOptions?: SortOption[];
}

export function SortSelector({
  value,
  onChange,
  availableOptions = ['relevance', 'price-asc', 'price-desc', 'popularity', 'newest', 'discount'],
}: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">정렬:</span>
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {SORT_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
