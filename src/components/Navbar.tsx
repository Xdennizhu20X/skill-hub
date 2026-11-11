'use client';

import React from 'react';
import { Plus, Database, Sparkles, Search, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenPacksDrawer: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCloud: boolean;
  totalSkillsCount: number;
}

export function Navbar({
  onOpenAddModal,
  onOpenPacksDrawer,
  searchQuery,
  onSearchChange,
  isCloud,
  totalSkillsCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-white text-base">SkillsHub</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                {totalSkillsCount} skills
              </span>
            </div>
            <p className="hidden sm:block text-xs text-zinc-400">
              Gestor inteligente para proyectos de IA
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mx-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, autor o palabra clave..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-1.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/60 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cloud Indicator Badge */}
          <div 
            title={isCloud ? "Conectado a Supabase (Sincronizado)" : "Modo Local / Standalone (Configura Supabase en .env para Multi-usuario)"}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${
              isCloud 
                ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400' 
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>{isCloud ? 'Cloud' : 'Local'}</span>
          </div>

          {/* Stacks / Packs Button */}
          <button
            onClick={onOpenPacksDrawer}
            className="tap-active flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Packs</span>
          </button>

          {/* Add Skill Button */}
          <button
            onClick={onOpenAddModal}
            className="tap-active flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Skill</span>
          </button>
        </div>
      </div>
    </header>
  );
}
