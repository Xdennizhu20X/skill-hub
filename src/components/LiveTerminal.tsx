'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/skills';
import { Copy, Check, Terminal, Play, Sparkles } from 'lucide-react';
import { playClickSound, playSuccessSound } from '@/lib/sound';
import { toast } from 'sonner';

interface LiveTerminalProps {
  selectedSkills: Skill[];
}

export function LiveTerminal({ selectedSkills }: LiveTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);

  // Generate command grouped by repo
  const repoMap = new Map<string, string[]>();
  selectedSkills.forEach((s) => {
    const list = repoMap.get(s.repo) || [];
    list.push(s.name);
    repoMap.set(s.repo, list);
  });

  const commands: string[] = [];
  repoMap.forEach((skills, repo) => {
    commands.push(`npx skills add ${repo} --skill ${skills.join(' ')}`);
  });
  const fullCommand = commands.length > 0 ? commands.join(' && ') : 'npx skills list';

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommand);
    playSuccessSound();
    setCopied(true);
    toast.success('Comando copiado para tu terminal');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateRun = () => {
    playClickSound();
    setIsSimulating(true);
    setSimulatedLogs(['Verificando dependencias en el proyecto...', 'Conectando con GitHub API...']);

    setTimeout(() => {
      const logs = ['✓ Conexión establecida con éxito'];
      repoMap.forEach((skills, repo) => {
        logs.push(`✓ Repositorio ${repo} resuelto`);
        skills.forEach((s) => logs.push(`  + Instalando skill "${s}" en .agents/skills/${s}`));
      });
      logs.push('✨ ¡Todas las skills quedaron vinculadas y listas para usar!');
      setSimulatedLogs((prev) => [...prev, ...logs]);
      setIsSimulating(false);
      playSuccessSound();
    }, 900);
  };

  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-[#0a0a0d] shadow-2xl overflow-hidden font-mono text-xs">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-[11px] text-zinc-500 ml-2 font-sans font-medium">
            Terminal en Vivo • Project Manifest
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSimulateRun}
            disabled={isSimulating || selectedSkills.length === 0}
            className="tap-active flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-40"
            title="Simular ejecución"
          >
            <Play className="h-3 w-3 text-emerald-400" />
            <span className="hidden sm:inline">Simular</span>
          </button>

          <button
            onClick={handleCopy}
            className="tap-active flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 px-2.5 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/30"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 space-y-3 leading-relaxed max-h-60 overflow-y-auto">
        <div className="flex items-start gap-2">
          <span className="text-zinc-500 select-none">$</span>
          <div className="flex-1 break-all">
            {selectedSkills.length === 0 ? (
              <span className="text-zinc-600 italic">
                Selecciona una o más skills del catálogo para compilar el comando...
              </span>
            ) : (
              <span>
                <span className="text-cyan-400 font-semibold">npx </span>
                <span className="text-emerald-400">skills add </span>
                {Array.from(repoMap.entries()).map(([repo, skills], i) => (
                  <span key={repo}>
                    {i > 0 && <span className="text-zinc-500"> && </span>}
                    {i > 0 && <span className="text-cyan-400 font-semibold">npx </span>}
                    {i > 0 && <span className="text-emerald-400">skills add </span>}
                    <span className="text-purple-300">{repo}</span>
                    <span className="text-amber-400"> --skill </span>
                    <span className="text-zinc-100 font-bold">{skills.join(' ')}</span>
                  </span>
                ))}
              </span>
            )}
            <span className="inline-block w-2 h-3.5 ml-1 bg-emerald-400 animate-cursor-blink align-middle" />
          </div>
        </div>

        {/* Simulation logs */}
        {simulatedLogs.length > 0 && (
          <div className="pt-2 border-t border-zinc-900 space-y-1 text-[11px] text-zinc-400">
            {simulatedLogs.map((log, idx) => (
              <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400/90' : log.startsWith('✨') ? 'text-amber-300 font-semibold' : 'text-zinc-500'}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
