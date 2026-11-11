'use client';

import React from 'react';
import { 
  Plus, 
  Database, 
  Sparkles, 
  Search, 
  Layers, 
  Compass, 
  LayoutGrid, 
  SplitSquareVertical, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenPacksDrawer: () => void;
  onOpenCommandPalette: () => void;
  onOpenExploreModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCloud: boolean;
  totalSkillsCount: number;
  viewMode: 'grid' | 'studio';
  onToggleViewMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function Navbar({
  onOpenAddModal,
  onOpenPacksDrawer,
  onOpenCommandPalette,
  onOpenExploreModal,
  searchQuery,
  onSearchChange,
  isCloud,
  totalSkillsCount,
  viewMode,
  onToggleViewMode,
  soundEnabled,
  onToggleSound,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-white text-base">SkillsHub</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                {totalSkillsCount}
              </span>
            </div>
            <p className="hidden sm:block text-xs text-zinc-400">
              Architecture & Skill Studio
            </p>
          </div>
        </div>

        {/* Search Bar with Ctrl+K trigger */}
        <div className="relative flex-1 max-w-md mx-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, autor o palabra clave..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-1.5 pl-9 pr-14 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/60 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-colors"
          />
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
            title="Abrir Command Palette (Ctrl + K)"
          >
            Ctrl K
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Grid vs Architecture Studio */}
          <button
            onClick={onToggleViewMode}
            className="tap-active flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
            title={viewMode === 'studio' ? "Cambiar a vista de cuadrícula clásica" : "Cambiar a Studio de Arquitectura con Terminal"}
          >
            {viewMode === 'studio' ? (
              <>
                <LayoutGrid className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Cuadrícula</span>
              </>
            ) : (
              <>
                <SplitSquareVertical className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-bold text-emerald-400">Studio</span>
              </>
            )}
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className="tap-active rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white transition-colors hidden md:flex"
            title={soundEnabled ? "Silenciar efectos táctiles" : "Activar efectos sonoros táctiles"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-zinc-300" /> : <VolumeX className="h-3.5 w-3.5 text-zinc-600" />}
          </button>

          {/* Explore / Directory Button */}
          <button
            onClick={onOpenExploreModal}
            className="tap-active flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Explorar skills populares"
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Descubrir</span>
          </button>

          {/* Packs Button */}
          <button
            onClick={onOpenPacksDrawer}
            className="tap-active flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Packs</span>
          </button>

          {/* Add Skill Button */}
          <button
            onClick={onOpenAddModal}
            className="tap-active flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:brightness-110 shadow-sm shadow-emerald-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
