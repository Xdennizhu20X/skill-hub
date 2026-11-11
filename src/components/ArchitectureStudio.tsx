'use client';

import React from 'react';
import { Skill, CategoryType, SkillPack } from '@/types/skills';
import { LiveTerminal } from './LiveTerminal';
import { SkillCard } from './SkillCard';
import { 
  ShieldAlert, 
  Palette, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Server, 
  Layers, 
  FileCode, 
  Download, 
  Check, 
  X,
  ArrowRight
} from 'lucide-react';
import { playClickSound, playPopSound, playSuccessSound } from '@/lib/sound';
import { toast } from 'sonner';

interface ArchitectureStudioProps {
  skills: Skill[];
  selectedSkills: Skill[];
  packs?: SkillPack[];
  onToggleSelect: (skillId: string) => void;
  onViewDetails: (skill: Skill) => void;
  onClearSelection: () => void;
  onSelectSkills?: (skillIds: string[]) => void;
}

export function ArchitectureStudio({
  skills,
  selectedSkills,
  packs = [],
  onToggleSelect,
  onViewDetails,
  onClearSelection,
  onSelectSkills,
}: ArchitectureStudioProps) {
  // Group selected skills into architectural layers
  const securityLayer = selectedSkills.filter(s => s.category === 'security');
  const qualityLayer = selectedSkills.filter(s => s.category === 'clean-code' || s.category === 'testing');
  const designLayer = selectedSkills.filter(s => s.category === 'design' || s.category === 'animation');
  const platformLayer = selectedSkills.filter(s => s.category === 'mobile' || s.category === 'frontend' || s.category === 'backend' || s.category === 'devops');
  const otherLayer = selectedSkills.filter(s => s.category === 'prompting' || s.category === 'other');

  const handleDownloadAgentsMd = () => {
    playSuccessSound();
    let md = `# Instructions for AI Coding Agents (AGENTS.md)\n\n`;
    md += `This repository utilizes the following specialized architectural skill stack:\n\n`;
    md += `<!-- skills:start -->\n`;
    selectedSkills.forEach((s, idx) => {
      md += `### ${idx + 1}. ${s.title} (\`${s.name}\`)\n`;
      md += `- **Repository:** ${s.repo}\n`;
      md += `- **Category:** ${s.category}\n`;
      md += `- **Purpose:** ${s.description}\n`;
      if (s.allowed_tools && s.allowed_tools.length > 0) {
        md += `- **Allowed Tools:** ${s.allowed_tools.join(', ')}\n`;
      }
      md += `- **Install Command:** \`${s.install_command}\`\n\n`;
    });
    md += `<!-- skills:end -->\n\n`;
    md += `## Architectural Directives\n`;
    md += `- Prioritize security audits and input sanitation.\n`;
    md += `- Enforce clean design tokens and purposeful micro-interactions.\n`;
    md += `- Maintain type safety and test coverage before merging code.\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AGENTS.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo AGENTS.md generado');
  };

  const handleDownloadPs1 = () => {
    playSuccessSound();
    const repoMap = new Map<string, string[]>();
    selectedSkills.forEach((s) => {
      const list = repoMap.get(s.repo) || [];
      list.push(s.name);
      repoMap.set(s.repo, list);
    });

    const lines: string[] = [
      '# SkillsHub Installer Script for Windows (PowerShell)',
      'Write-Host "==========================================" -ForegroundColor Cyan',
      'Write-Host "  Instalando Stack Arquitectonico de IA   " -ForegroundColor Cyan',
      'Write-Host "==========================================" -ForegroundColor Cyan',
      '',
    ];
    repoMap.forEach((skills, repo) => {
      lines.push(`Write-Host "-> Conectando con ${repo}..." -ForegroundColor Yellow`);
      lines.push(`npx skills add ${repo} --skill ${skills.join(' ')} -y`);
    });
    lines.push('');
    lines.push('Write-Host "¡Stack arquitectonico instalado con exito!" -ForegroundColor Green');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'install-stack.ps1';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Script install-stack.ps1 descargado');
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Project Blueprints */}
      {packs.length > 0 && (
        <div className="rounded-2xl specular-border bg-[#0d0d10] p-4.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Packs por Tipo de Proyecto (1-Click Blueprints)
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Selecciona una arquitectura completa para tu framework en 1 clic
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {packs.slice(0, 4).map((pack) => {
              const isFullyActive = pack.skill_ids.every((id) =>
                selectedSkills.some((s) => s.id === id)
              );
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => {
                    if (onSelectSkills) {
                      playSuccessSound();
                      onSelectSkills(pack.skill_ids);
                      toast.success(`Stack "${pack.title}" activado (${pack.skill_ids.length} skills)`);
                    }
                  }}
                  className={`tap-active text-left p-3 rounded-xl border transition-all ${
                    isFullyActive
                      ? 'border-emerald-500/80 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{pack.icon || '📦'}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isFullyActive
                          ? 'bg-emerald-500 text-zinc-950 font-semibold'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isFullyActive ? '✓ ACTIVO' : `${pack.skill_ids.length} skills`}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-zinc-200 line-clamp-1">{pack.title}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                    {pack.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column (Catalog Explorer) - 7 cols */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Biblioteca de Componentes & Skills</h3>
            <p className="text-xs text-zinc-400">Haz clic en cualquier tarjeta para acoplarla al Blueprint de tu proyecto.</p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{skills.length} disponibles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isSelected={selectedSkills.some(s => s.id === skill.id)}
              onToggleSelect={(id) => {
                const wasSelected = selectedSkills.some(s => s.id === id);
                playPopSound(!wasSelected);
                onToggleSelect(id);
              }}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>

      {/* Right Column (The Project Manifest Blueprint) - 5 cols STICKY */}
      <div className="lg:col-span-5 sticky top-20 space-y-4">
        <div className="rounded-2xl specular-border bg-[#0d0d10] p-5 space-y-4">
          {/* Blueprint Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Project Architecture Blueprint</h3>
                <p className="text-[11px] text-zinc-400">Capas de capacidades activas</p>
              </div>
            </div>

            {selectedSkills.length > 0 && (
              <button
                onClick={onClearSelection}
                className="tap-active text-[11px] text-zinc-400 hover:text-zinc-200 underline decoration-zinc-700"
              >
                Limpiar stack
              </button>
            )}
          </div>

          {/* Blueprint Layers Visualization */}
          {selectedSkills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800/80 p-8 text-center text-xs text-zinc-500 space-y-2">
              <Layers className="h-8 w-8 mx-auto text-zinc-700 stroke-[1.5]" />
              <p className="text-zinc-300 font-medium">El Blueprint está vacío</p>
              <p className="text-zinc-500 text-[11px] max-w-xs mx-auto">
                Selecciona skills en el panel izquierdo para componer la arquitectura de tu proyecto.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Layer 1: Security */}
              {securityLayer.length > 0 && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mb-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                    <span>Capa de Seguridad & Auditoría ({securityLayer.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {securityLayer.map(s => (
                      <span key={s.id} className="text-[11px] font-mono text-rose-200 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer 2: Quality & Anti-Slop */}
              {qualityLayer.length > 0 && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Capa de Calidad & Anti-Slop ({qualityLayer.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {qualityLayer.map(s => (
                      <span key={s.id} className="text-[11px] font-mono text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer 3: Design & Motion */}
              {designLayer.length > 0 && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-2">
                    <Palette className="h-3.5 w-3.5 text-purple-400" />
                    <span>Capa de UI Craft & Motion ({designLayer.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {designLayer.map(s => (
                      <span key={s.id} className="text-[11px] font-mono text-purple-200 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer 4: Platform & Environment */}
              {platformLayer.length > 0 && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 mb-2">
                    <Smartphone className="h-3.5 w-3.5 text-blue-400" />
                    <span>Capa de Entorno & Plataforma ({platformLayer.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {platformLayer.map(s => (
                      <span key={s.id} className="text-[11px] font-mono text-blue-200 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer 5: Others */}
              {otherLayer.length > 0 && (
                <div className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Prompts & Otras Capacidades ({otherLayer.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {otherLayer.map(s => (
                      <span key={s.id} className="text-[11px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Terminal inside Studio */}
          <LiveTerminal selectedSkills={selectedSkills} />

          {/* Quick Export Actions */}
          {selectedSkills.length > 0 && (
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleDownloadAgentsMd}
                className="tap-active flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 p-2.5 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <FileCode className="h-4 w-4 text-emerald-400" />
                <span>Descargar AGENTS.md</span>
              </button>

              <button
                onClick={handleDownloadPs1}
                className="tap-active flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 p-2.5 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <Download className="h-4 w-4 text-cyan-400" />
                <span>Script .ps1 (Windows)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
