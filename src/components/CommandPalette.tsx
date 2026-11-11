'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Skill, CategoryType } from '@/types/skills';
import { Search, Plus, Terminal, Sparkles, Layers, Check, X, ShieldAlert, Palette, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  selectedSkillIds: string[];
  onToggleSelect: (skillId: string) => void;
  onSelectCategory: (cat: CategoryType) => void;
  onOpenAddModal: () => void;
  onViewSkill: (skill: Skill) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  skills,
  selectedSkillIds,
  onToggleSelect,
  onSelectCategory,
  onOpenAddModal,
  onViewSkill,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSkills = skills.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.author.toLowerCase().includes(q) ||
      s.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }).slice(0, 10);

  const handleSelectSkill = (skill: Skill) => {
    onToggleSelect(skill.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-zinc-700/80 bg-[#121215] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Escribe para buscar skills, acciones o categorías..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* List of items */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Quick Actions if query is short */}
          {!query && (
            <div className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Acciones Rápidas
            </div>
          )}

          {!query && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">Registrar nueva skill desde GitHub</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectCategory('security');
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-rose-500/20 text-rose-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">Ver Skills de Seguridad & Auditoría</span>
                </div>
                <span className="text-[11px] text-zinc-500">Filtrar</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectCategory('design');
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 text-purple-400">
                    <Palette className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">Ver Skills de Diseño & UI</span>
                </div>
                <span className="text-[11px] text-zinc-500">Filtrar</span>
              </button>

              <div className="my-2 border-t border-zinc-800/80" />
            </>
          )}

          {/* Skills Results */}
          <div className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Skills ({filteredSkills.length})
          </div>

          {filteredSkills.map((skill, index) => {
            const isSelected = selectedSkillIds.includes(skill.id);
            return (
              <div
                key={skill.id}
                onClick={() => handleSelectSkill(skill)}
                className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                        : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-500'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-zinc-200 truncate">{skill.title}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
                        {skill.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">{skill.repo}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onViewSkill(skill);
                  }}
                  className="tap-active text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/50 hover:bg-zinc-700"
                >
                  Detalles
                </button>
              </div>
            );
          })}

          {filteredSkills.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500">
              No se encontraron skills con "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Usa <kbd className="font-mono text-zinc-400">Ctrl + K</kbd> en cualquier momento</span>
          <span>Presiona <kbd className="font-mono text-zinc-400">Clic</kbd> para alternar selección</span>
        </div>
      </div>
    </div>
  );
}
