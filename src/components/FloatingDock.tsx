'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/skills';
import { 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  FileCode, 
  ArrowLeftRight, 
  X,
  Layers
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '@/lib/sound';
import { toast } from 'sonner';

interface FloatingDockProps {
  selectedSkills: Skill[];
  onRemoveSkill: (skillId: string) => void;
  onClearSelection: () => void;
  onSaveAsPack: (skillIds: string[]) => void;
  onCompare?: () => void;
  onDownloadAgentsMd: () => void;
  onDownloadPs1: () => void;
}

export function FloatingDock({
  selectedSkills,
  onRemoveSkill,
  onClearSelection,
  onSaveAsPack,
  onCompare,
  onDownloadAgentsMd,
  onDownloadPs1,
}: FloatingDockProps) {
  const [copied, setCopied] = useState(false);

  if (selectedSkills.length === 0) return null;

  // Generate batch command grouped by repository
  const repoMap = new Map<string, string[]>();
  selectedSkills.forEach((s) => {
    const existing = repoMap.get(s.repo) || [];
    existing.push(s.name);
    repoMap.set(s.repo, existing);
  });

  const commands: string[] = [];
  repoMap.forEach((skills, repo) => {
    commands.push(`npx skills add ${repo} --skill ${skills.join(' ')}`);
  });
  const fullCommand = commands.join(' && ');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommand);
    playSuccessSound();
    setCopied(true);
    toast.success(`${selectedSkills.length} skills copiadas al portapapeles`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-6 duration-200">
      <div className="specular-border-active rounded-2xl bg-zinc-950/90 backdrop-blur-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Interactive Skills Stack Chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {/* Spring Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold text-xs shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tabular-nums animate-spring-bump font-mono">{selectedSkills.length}</span>
            <span className="hidden sm:inline">en stack</span>
          </div>

          {/* Mini Chips */}
          <div className="flex items-center gap-1.5">
            {selectedSkills.slice(0, 4).map((skill) => (
              <span
                key={skill.id}
                className="group inline-flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-300 shrink-0"
              >
                <span>{skill.name}</span>
                <button
                  onClick={() => onRemoveSkill(skill.id)}
                  className="text-zinc-500 group-hover:text-rose-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedSkills.length > 4 && (
              <span className="text-[11px] text-zinc-500 font-mono px-1">
                +{selectedSkills.length - 4} más
              </span>
            )}
          </div>
        </div>

        {/* Right: Tactile Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Compare (if 2) */}
          {selectedSkills.length === 2 && onCompare && (
            <button
              onClick={() => {
                playClickSound();
                onCompare();
              }}
              className="tap-active flex items-center gap-1 rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/50 transition-colors"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Comparar</span>
            </button>
          )}

          {/* AGENTS.md */}
          <button
            onClick={onDownloadAgentsMd}
            className="tap-active flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Generar y descargar AGENTS.md"
          >
            <FileCode className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden lg:inline">AGENTS.md</span>
          </button>

          {/* Script .ps1 */}
          <button
            onClick={onDownloadPs1}
            className="tap-active flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Descargar script PowerShell (.ps1)"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono hidden md:inline">.ps1</span>
          </button>

          {/* Pack */}
          <button
            onClick={() => {
              playClickSound();
              onSaveAsPack(selectedSkills.map(s => s.id));
            }}
            className="tap-active flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Guardar selección como Pack"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Pack</span>
          </button>

          {/* Main Copy Button */}
          <button
            onClick={handleCopy}
            className="tap-active flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-1.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Comando</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
