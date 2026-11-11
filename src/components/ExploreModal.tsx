'use client';

import React from 'react';
import { POPULAR_SKILLS_DIRECTORY, PopularSkillDirectoryItem } from '@/lib/popular-skills';
import { Skill, CategoryType } from '@/types/skills';
import { X, Compass, Plus, Check, Star, ExternalLink, Terminal } from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { toast } from 'sonner';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSkills: Skill[];
  onAddSkill: (skill: Omit<Skill, 'id' | 'created_at'>) => void;
}

export function ExploreModal({
  isOpen,
  onClose,
  existingSkills,
  onAddSkill,
}: ExploreModalProps) {
  if (!isOpen) return null;

  const isAlreadyAdded = (item: PopularSkillDirectoryItem) => {
    return existingSkills.some(
      (s) => s.repo.toLowerCase() === item.repo.toLowerCase() && s.name.toLowerCase() === item.name.toLowerCase()
    );
  };

  const handleAdd = (item: PopularSkillDirectoryItem) => {
    onAddSkill({
      name: item.name,
      title: item.title,
      repo: item.repo,
      repo_url: `https://github.com/${item.repo}`,
      description: item.description,
      category: item.category as CategoryType,
      tags: item.tags,
      author: item.author,
      install_command: item.install_command,
      is_favorite: true,
    });
    toast.success(`Skill "${item.title}" agregada a tu catálogo`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              <span>Explorar Skills Populares & Oficiales</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Descubre skills seleccionadas de Vercel Labs, Cloudflare, Supabase, Anthropic y la comunidad para agregar a tu repositorio con 1 clic.
            </p>
          </div>
          <button
            onClick={onClose}
            className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {POPULAR_SKILLS_DIRECTORY.map((item, idx) => {
              const added = isAlreadyAdded(item);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-xs text-zinc-100">{item.title}</h3>
                        <p className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <GithubIcon className="h-3 w-3" />
                          <span>{item.repo}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-amber-400 font-medium flex items-center gap-0.5 shrink-0">
                        <Star className="h-2.5 w-2.5 fill-amber-400" />
                        <span>{item.stars}</span>
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {item.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.2 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                      {item.category}
                    </span>

                    <button
                      onClick={() => handleAdd(item)}
                      disabled={added}
                      className={`tap-active flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        added
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>En tu catálogo</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Agregar</span>
                        </>
                      )}
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
