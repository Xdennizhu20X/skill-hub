'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/skills';
import { 
  Copy, 
  Check, 
  Terminal, 
  X, 
  Sparkles, 
  Download, 
  FileCode, 
  ArrowLeftRight 
} from 'lucide-react';
import { toast } from 'sonner';

interface MultiSelectBarProps {
  selectedSkills: Skill[];
  onClearSelection: () => void;
  onSaveAsPack: (skillIds: string[]) => void;
  onCompare?: () => void;
}

type CommandFormat = 'skills-cli' | 'claude' | 'cursor' | 'powershell' | 'json';

export function MultiSelectBar({
  selectedSkills,
  onClearSelection,
  onSaveAsPack,
  onCompare,
}: MultiSelectBarProps) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<CommandFormat>('skills-cli');

  if (selectedSkills.length === 0) return null;

  // Generate batch command grouped by repository
  const generateCommand = (fmt: CommandFormat): string => {
    const repoMap = new Map<string, string[]>();
    selectedSkills.forEach((s) => {
      const existing = repoMap.get(s.repo) || [];
      existing.push(s.name);
      repoMap.set(s.repo, existing);
    });

    if (fmt === 'skills-cli') {
      const commands: string[] = [];
      repoMap.forEach((skills, repo) => {
        commands.push(`npx skills add ${repo} --skill ${skills.join(' ')}`);
      });
      return commands.join(' && ');
    }

    if (fmt === 'claude') {
      const commands: string[] = [];
      repoMap.forEach((skills, repo) => {
        commands.push(`claude skill add ${repo} --skill ${skills.join(' ')}`);
      });
      return commands.join(' && ');
    }

    if (fmt === 'cursor') {
      const commands: string[] = [];
      repoMap.forEach((skills, repo) => {
        commands.push(`agent skill add ${repo} --skill ${skills.join(' ')}`);
      });
      return commands.join(' && ');
    }

    if (fmt === 'powershell') {
      const lines: string[] = [
        '# SkillsHub Installer Script for Windows (PowerShell)',
        'Write-Host "=====================================" -ForegroundColor Cyan',
        'Write-Host "  Instalando Skills en este proyecto  " -ForegroundColor Cyan',
        'Write-Host "=====================================" -ForegroundColor Cyan',
        '',
      ];
      repoMap.forEach((skills, repo) => {
        lines.push(`Write-Host "-> Instalando de ${repo}..." -ForegroundColor Yellow`);
        lines.push(`npx skills add ${repo} --skill ${skills.join(' ')} -y`);
      });
      lines.push('');
      lines.push('Write-Host "¡Todas las skills fueron instaladas exitosamente!" -ForegroundColor Green');
      return lines.join('\r\n');
    }

    if (fmt === 'json') {
      const lockObj: Record<string, { source: string; sourceType: string; skillPath: string }> = {};
      selectedSkills.forEach((s) => {
        lockObj[s.name] = {
          source: s.repo,
          sourceType: 'github',
          skillPath: s.skill_path || `skills/${s.name}/SKILL.md`,
        };
      });
      return JSON.stringify({ version: 2, skills: lockObj }, null, 2);
    }

    return '';
  };

  const currentCommand = generateCommand(format);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    toast.success(`${selectedSkills.length} skills copiadas al portapapeles`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    let filename = 'install-skills.sh';
    if (format === 'powershell') filename = 'install-skills.ps1';
    else if (format === 'json') filename = 'skills-lock.json';

    const blob = new Blob([currentCommand], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Archivo descargado: ${filename}`);
  };

  const handleDownloadAgentsMd = () => {
    let md = `# Instructions for AI Coding Agents (AGENTS.md)\n\n`;
    md += `This repository uses the following specialized skills:\n\n`;
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
    md += `## Guidelines for Claude Code, Cursor and Antigravity\n`;
    md += `- Consult the skills above when planning and executing architectural or UI changes.\n`;
    md += `- Maintain clean code standards, strict type safety, and verify functionality before finalizing.\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AGENTS.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo AGENTS.md generado y descargado para tu proyecto');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
        {/* Left: Count & Skill preview */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">
                {selectedSkills.length} {selectedSkills.length === 1 ? 'skill seleccionada' : 'skills seleccionadas'}
              </span>
              <button
                onClick={onClearSelection}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline decoration-zinc-600 underline-offset-2 ml-1"
              >
                Limpiar
              </button>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
              {selectedSkills.map((s) => s.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Center: Format Selector */}
        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 text-[11px] self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setFormat('skills-cli')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
              format === 'skills-cli' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            npx skills
          </button>
          <button
            onClick={() => setFormat('powershell')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
              format === 'powershell' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            PowerShell (.ps1)
          </button>
          <button
            onClick={() => setFormat('claude')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
              format === 'claude' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Claude
          </button>
          <button
            onClick={() => setFormat('cursor')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
              format === 'cursor' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cursor
          </button>
          <button
            onClick={() => setFormat('json')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
              format === 'json' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            lockfile
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Compare Button (if exactly 2 skills are selected) */}
          {selectedSkills.length === 2 && onCompare && (
            <button
              onClick={onCompare}
              className="tap-active flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-2.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/50 transition-colors"
              title="Comparar las 2 skills seleccionadas lado a lado"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Comparar</span>
            </button>
          )}

          {/* Generate AGENTS.md button */}
          <button
            onClick={handleDownloadAgentsMd}
            className="tap-active flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
            title="Generar y descargar archivo AGENTS.md para este proyecto"
          >
            <FileCode className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden lg:inline">AGENTS.md</span>
          </button>

          {/* Save as pack */}
          <button
            onClick={() => onSaveAsPack(selectedSkills.map((s) => s.id))}
            className="tap-active flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
            title="Guardar selección como un Pack reutilizable"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Pack</span>
          </button>

          {/* Download script */}
          <button
            onClick={handleDownloadScript}
            className="tap-active flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            title={`Descargar ${format === 'powershell' ? 'PowerShell (.ps1)' : format === 'json' ? 'skills-lock.json' : 'script'}`}
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono hidden sm:inline">
              {format === 'powershell' ? '.ps1' : format === 'json' ? '.json' : '.sh'}
            </span>
          </button>

          {/* Copy Command Main CTA */}
          <button
            onClick={handleCopy}
            className="tap-active flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar comando</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
