'use client';

import React from 'react';
import { TechnologyType } from '@/types/skills';

interface TechFilterProps {
  selectedTech: TechnologyType;
  onSelectTech: (tech: TechnologyType) => void;
}

const TECH_LIST: Array<{ id: TechnologyType; label: string }> = [
  { id: 'all', label: 'Todos los entornos' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'react', label: 'React' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'swift', label: 'Swift (iOS)' },
  { id: 'expo', label: 'Expo / React Native' },
  { id: 'tailwind', label: 'Tailwind CSS' },
  { id: 'cloudflare', label: 'Cloudflare' },
  { id: 'python', label: 'Python' },
];

export function TechFilter({ selectedTech, onSelectTech }: TechFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1 text-[11px]">
      <span className="text-zinc-500 mr-1 font-medium hidden sm:inline">Filtrar por tecnología:</span>
      {TECH_LIST.map((item) => {
        const isSelected = selectedTech === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTech(item.id)}
            className={`tap-active rounded-md px-2 py-0.5 font-medium transition-colors ${
              isSelected
                ? 'bg-zinc-200 text-zinc-950 font-semibold'
                : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
