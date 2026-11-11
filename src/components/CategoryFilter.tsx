'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/seed-data';
import { CategoryType } from '@/types/skills';
import { 
  Layers, 
  Palette, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  Server, 
  CheckCircle2, 
  Bot 
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  categoryCounts: Record<CategoryType, number>;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryFilterProps) {
  const getIcon = (id: CategoryType) => {
    switch (id) {
      case 'all': return <Layers className="h-3.5 w-3.5" />;
      case 'design': return <Palette className="h-3.5 w-3.5" />;
      case 'animation': return <Sparkles className="h-3.5 w-3.5" />;
      case 'clean-code': return <ShieldCheck className="h-3.5 w-3.5" />;
      case 'mobile': return <Smartphone className="h-3.5 w-3.5" />;
      case 'frontend': return <Globe className="h-3.5 w-3.5" />;
      case 'backend': return <Server className="h-3.5 w-3.5" />;
      case 'testing': return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'prompting': return <Bot className="h-3.5 w-3.5" />;
      default: return <Layers className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`tap-active flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              <span>{getIcon(cat.id)}</span>
              <span>{cat.label}</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] font-semibold tabular-nums ${
                  isSelected
                    ? 'bg-zinc-950/15 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
