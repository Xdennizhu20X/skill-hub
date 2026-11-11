'use client';

import React, { useState } from 'react';
import { Skill, SkillPack } from '@/types/skills';
import { X, Sparkles, Check, Copy, Plus, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface PacksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  packs: SkillPack[];
  allSkills: Skill[];
  onSelectSkills: (skillIds: string[]) => void;
  onCreatePack: (pack: Omit<SkillPack, 'id' | 'created_at'>) => void;
  initialSelectedSkillIds?: string[];
}

export function PacksDrawer({
  isOpen,
  onClose,
  packs,
  allSkills,
  onSelectSkills,
  onCreatePack,
  initialSelectedSkillIds = [],
}: PacksDrawerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  if (!isOpen) return null;

  const handleApplyPack = (pack: SkillPack) => {
    onSelectSkills(pack.skill_ids);
    toast.success(`Pack "${pack.title}" seleccionado (${pack.skill_ids.length} skills)`);
    onClose();
  };

  const handleCopyPackCommand = (pack: SkillPack, e: React.MouseEvent) => {
    e.stopPropagation();
    const skillsInPack = allSkills.filter((s) => pack.skill_ids.includes(s.id));
    
    // Group by repo
    const repoMap = new Map<string, string[]>();
    skillsInPack.forEach((s) => {
      const list = repoMap.get(s.repo) || [];
      list.push(s.name);
      repoMap.set(s.repo, list);
    });

    const commands: string[] = [];
    repoMap.forEach((names, repo) => {
      commands.push(`npx skills add ${repo} --skill ${names.join(' ')}`);
    });

    const fullCmd = commands.join(' && ');
    navigator.clipboard.writeText(fullCmd);
    toast.success(`Comando copiado para el pack "${pack.title}"`);
  };

  const handleCreatePackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreatePack({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Pack personalizado de skills para proyectos',
      skill_ids: initialSelectedSkillIds.length > 0 ? initialSelectedSkillIds : allSkills.slice(0, 3).map((s) => s.id),
      icon: '✨',
      category: 'other',
    });

    setNewTitle('');
    setNewDescription('');
    setShowCreateForm(false);
    toast.success('Pack creado exitosamente');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Packs de Skills Preconfigurados</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Instala sets completos de skills diseñados para tipos específicos de proyectos con un solo clic.
            </p>
          </div>
          <button
            onClick={onClose}
            className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {showCreateForm ? (
            <form onSubmit={handleCreatePackSubmit} className="rounded-xl border border-emerald-500/40 bg-zinc-900/80 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Nuevo Pack Personalizado</h3>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre del Pack</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ej. Fullstack Next.js Pack"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Descripción</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="ej. Mis skills preferidas para desarrollo web"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-zinc-400">
                Se incluirán las {initialSelectedSkillIds.length > 0 ? initialSelectedSkillIds.length : 'skills seleccionadas'} skills actuales.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
                >
                  Guardar Pack
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="tap-active w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-3 text-xs font-medium text-zinc-300 hover:border-emerald-500/50 hover:bg-zinc-900/60 hover:text-white transition-all mb-2"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Crear nuevo Pack a partir de selección</span>
            </button>
          )}

          {/* List of Packs */}
          <div className="space-y-3">
            {packs.map((pack) => {
              const skillsInPack = allSkills.filter((s) => pack.skill_ids.includes(s.id));

              return (
                <div
                  key={pack.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-sm text-white flex items-center gap-2">
                        <span>{pack.title}</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {pack.description}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                      {pack.skill_ids.length} skills
                    </span>
                  </div>

                  {/* Included Skills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skillsInPack.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300 font-mono"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  {/* Pack Actions */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => handleCopyPackCommand(pack, e)}
                      className="tap-active flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Copiar comando</span>
                    </button>

                    <button
                      onClick={() => handleApplyPack(pack)}
                      className="tap-active flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Seleccionar Pack</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end">
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
