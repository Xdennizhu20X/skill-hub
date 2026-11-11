'use client';

import React, { useState } from 'react';
import { CategoryType, Skill } from '@/types/skills';
import { X, Copy, Check, ExternalLink, Terminal, Trash2 } from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { toast } from 'sonner';

interface SkillDetailModalProps {
  skill: Skill | null;
  onClose: () => void;
  onDeleteSkill: (skillId: string) => void;
  onUpdateCategory?: (skillId: string, newCategory: CategoryType) => void;
}

export function SkillDetailModal({
  skill,
  onClose,
  onDeleteSkill,
  onUpdateCategory,
}: SkillDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!skill) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(skill.install_command);
    setCopied(true);
    toast.success('Comando copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar la skill "${skill.title}" de tu repositorio?`)) {
      onDeleteSkill(skill.id);
      toast.success('Skill eliminada de tu catálogo');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{skill.title}</h2>
              {onUpdateCategory ? (
                <select
                  value={skill.category}
                  onChange={(e) => {
                    const newCat = e.target.value as CategoryType;
                    onUpdateCategory(skill.id, newCat);
                    toast.success(`Categoría actualizada a: ${newCat}`);
                  }}
                  className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-200 border border-zinc-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="security">🛡️ Seguridad</option>
                  <option value="design">🎨 Diseño & UI</option>
                  <option value="animation">✨ Animación</option>
                  <option value="clean-code">🧼 Anti-Slop</option>
                  <option value="mobile">📱 Mobile</option>
                  <option value="frontend">🌐 Frontend</option>
                  <option value="backend">🗄️ Backend</option>
                  <option value="devops">☁️ DevOps</option>
                  <option value="testing">🧪 Testing</option>
                  <option value="prompting">🤖 Prompts</option>
                  <option value="other">📦 Otros</option>
                </select>
              ) : (
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                  {skill.category}
                </span>
              )}
            </div>
            <a
              href={skill.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>{skill.repo}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Descripción & Propósito
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
              {skill.description}
            </p>
          </div>

          {/* Installation Command */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Comando de Instalación
            </h4>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-200">
              <span className="truncate">{skill.install_command}</span>
              <button
                onClick={handleCopy}
                className="tap-active flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs text-zinc-200 transition-colors shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Etiquetas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw Content Excerpt if available */}
          {skill.raw_content && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                README Extracto
              </h4>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs text-zinc-400 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {skill.raw_content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="tap-active flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Eliminar de mi catálogo</span>
          </button>

          <button
            onClick={onClose}
            className="tap-active rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
