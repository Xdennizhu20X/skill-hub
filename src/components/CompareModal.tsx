'use client';

import React from 'react';
import { Skill } from '@/types/skills';
import { X, ArrowLeftRight, Terminal, Wrench, Bot, Copy, Check } from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { toast } from 'sonner';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
}

export function CompareModal({ isOpen, onClose, skills }: CompareModalProps) {
  if (!isOpen || skills.length < 2) return null;

  const [skillA, skillB] = skills.slice(0, 2);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    toast.success('Comando copiado al portapapeles');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-emerald-400" />
              <span>Comparador de Skills</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparativa lado a lado para evaluar diferencias técnicas, requerimientos y casos de uso.
            </p>
          </div>
          <button
            onClick={onClose}
            className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Column A */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  {skillA.category}
                </span>
                <h3 className="text-sm font-semibold text-white mt-2">{skillA.title}</h3>
                <p className="text-xs text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                  <GithubIcon className="h-3 w-3" />
                  <span>{skillA.repo}</span>
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Propósito
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                  {skillA.description}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Herramientas Requeridas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {skillA.allowed_tools && skillA.allowed_tools.length > 0 ? (
                    skillA.allowed_tools.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono text-emerald-300 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">Sin herramientas externas</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Comando
                </h4>
                <div className="flex items-center justify-between gap-2 p-2 bg-zinc-950 rounded border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  <span className="truncate">{skillA.install_command}</span>
                  <button
                    onClick={() => handleCopy(skillA.install_command)}
                    className="tap-active text-emerald-400 hover:text-emerald-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column B */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  {skillB.category}
                </span>
                <h3 className="text-sm font-semibold text-white mt-2">{skillB.title}</h3>
                <p className="text-xs text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                  <GithubIcon className="h-3 w-3" />
                  <span>{skillB.repo}</span>
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Propósito
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                  {skillB.description}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Herramientas Requeridas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {skillB.allowed_tools && skillB.allowed_tools.length > 0 ? (
                    skillB.allowed_tools.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono text-cyan-300 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">Sin herramientas externas</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Comando
                </h4>
                <div className="flex items-center justify-between gap-2 p-2 bg-zinc-950 rounded border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  <span className="truncate">{skillB.install_command}</span>
                  <button
                    onClick={() => handleCopy(skillB.install_command)}
                    className="tap-active text-cyan-400 hover:text-cyan-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="tap-active rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            Cerrar comparador
          </button>
        </div>
      </div>
    </div>
  );
}
