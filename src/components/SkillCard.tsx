'use client';

import React, { useState } from 'react';
import { Skill } from '@/types/skills';
import { Copy, Check, ExternalLink, Terminal, Tag, MessageSquareQuote, StickyNote } from 'lucide-react';
import { playClickSound, playPopSound, playSuccessSound } from '@/lib/sound';
import { toast } from 'sonner';

interface SkillCardProps {
  skill: Skill;
  isSelected: boolean;
  onToggleSelect: (skillId: string) => void;
  onViewDetails: (skill: Skill) => void;
}

export function SkillCard({
  skill,
  isSelected,
  onToggleSelect,
  onViewDetails,
}: SkillCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skill.install_command);
    setCopied(true);
    toast.success(`Comando copiado: ${skill.name}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    let promptText = `Por favor aplica las siguientes directrices y reglas de la skill en nuestra tarea:\n\n`;
    promptText += `# Skill: ${skill.title} (${skill.name})\n`;
    promptText += `Repositorio: ${skill.repo}\n`;
    promptText += `Categoría: ${skill.category}\n\n`;
    promptText += `## Propósito:\n${skill.description}\n\n`;
    if (skill.triggers && skill.triggers.length > 0) {
      promptText += `## Cuándo se activa:\n${skill.triggers.map(t => `- ${t}`).join('\n')}\n\n`;
    }
    if (skill.key_rules && skill.key_rules.length > 0) {
      promptText += `## Reglas clave:\n${skill.key_rules.map(r => `- ${r}`).join('\n')}\n\n`;
    }
    if (skill.raw_content) {
      promptText += `## Instrucciones:\n${skill.raw_content.slice(0, 1500)}`;
    }

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    toast.success(`Prompt enriquecido de "${skill.name}" copiado`);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'security': return 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      case 'design': return 'text-purple-400 bg-purple-950/30 border-purple-800/40';
      case 'animation': return 'text-amber-400 bg-amber-950/30 border-amber-800/40';
      case 'clean-code': return 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40';
      case 'mobile': return 'text-blue-400 bg-blue-950/30 border-blue-800/40';
      case 'frontend': return 'text-cyan-400 bg-cyan-950/30 border-cyan-800/40';
      case 'backend': return 'text-orange-400 bg-orange-950/30 border-orange-800/40';
      case 'devops': return 'text-sky-400 bg-sky-950/30 border-sky-800/40';
      case 'testing': return 'text-teal-400 bg-teal-950/30 border-teal-800/40';
      case 'prompting': return 'text-indigo-400 bg-indigo-950/30 border-indigo-800/40';
      default: return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/40';
    }
  };

  return (
    <div
      onClick={() => {
        playPopSound(!isSelected);
        onToggleSelect(skill.id);
      }}
      className={`group relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'specular-border-active bg-zinc-900/90'
          : 'specular-border bg-[#111114]/90 hover:bg-[#15151a] hover:border-zinc-700/80 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Header: Checkbox + Title + Category */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-2.5">
            {/* Custom Checkbox */}
            <div
              className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                  : 'border-zinc-700 bg-zinc-900/80 group-hover:border-zinc-500'
              }`}
            >
              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
            </div>

            <div>
              <h3 className="font-medium text-sm text-zinc-100 group-hover:text-white transition-colors">
                {skill.title}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {skill.repo}
              </p>
            </div>
          </div>

          {/* Category Chip */}
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border ${getCategoryColor(skill.category)}`}>
            {skill.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-3">
          {skill.description}
        </p>

        {/* Notes if available */}
        {skill.notes && (
          <div className="mb-3 flex items-start gap-1.5 p-2 rounded-lg bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-300">
            <StickyNote className="h-3 w-3 shrink-0 mt-0.5 text-amber-400" />
            <span className="line-clamp-2">{skill.notes}</span>
          </div>
        )}

        {/* Badges: Allowed tools, Tech, Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {skill.triggers && skill.triggers.length > 0 && (
            <span className="inline-flex items-center text-[10px] text-amber-300 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40">
              🎯 {skill.triggers[0]}
            </span>
          )}
          {skill.allowed_tools && skill.allowed_tools.length > 0 && (
            <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40 font-mono">
              ⚡ {skill.allowed_tools.slice(0, 3).join(', ')}{skill.allowed_tools.length > 3 ? '...' : ''}
            </span>
          )}
          {skill.technologies && skill.technologies.length > 0 && (
            <span className="inline-flex items-center text-[10px] text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-800/40 font-mono">
              {skill.technologies.join(', ')}
            </span>
          )}
          {skill.tags && skill.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center text-[10px] text-zinc-400 bg-zinc-800/40 px-1.5 py-0.5 rounded border border-zinc-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        {/* Actions Left */}
        <div className="flex items-center gap-1.5">
          {/* Fast Copy Command */}
          <button
            onClick={handleCopyCommand}
            className="tap-active flex items-center gap-1.5 rounded-md bg-zinc-800/70 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition-colors"
            title="Copiar comando de instalación"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[11px] font-medium">Instalar</span>
              </>
            )}
          </button>

          {/* Copy Prompt for Chats */}
          <button
            onClick={handleCopyPrompt}
            className="tap-active flex items-center gap-1 rounded-md bg-zinc-800/40 hover:bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Copiar prompt para usar sin instalar (ChatGPT, Claude web, etc.)"
          >
            {copiedPrompt ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <MessageSquareQuote className="h-3.5 w-3.5" />
            )}
            <span className="text-[11px] hidden sm:inline">Prompt</span>
          </button>
        </div>

        {/* View Details */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(skill);
            }}
            className="tap-active rounded-md p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Ver documentación / README"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
