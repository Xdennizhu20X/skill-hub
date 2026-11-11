'use client';

import React, { useState } from 'react';
import { X, Search, Sparkles, Check, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { ScrapedRepoResult, ScrapedSkillItem, Skill } from '@/types/skills';
import { toast } from 'sonner';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkills: (skills: Omit<Skill, 'id' | 'created_at'>[]) => void;
}

export function AddSkillModal({
  isOpen,
  onClose,
  onAddSkills,
}: AddSkillModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedResult, setScrapedResult] = useState<ScrapedRepoResult | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setScrapedResult(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Error al analizar el repositorio');
        setLoading(false);
        return;
      }

      setScrapedResult(data);
      // Select all detected skills by default
      setSelectedIndices(data.detected_skills.map((_: unknown, i: number) => i));
      toast.success(`Se encontraron ${data.detected_skills.length} skills en ${data.repo}`);
    } catch {
      toast.error('No se pudo conectar con el servidor para analizar el repositorio');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIndex = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSaveSelected = () => {
    if (!scrapedResult) return;

    const toSave: Omit<Skill, 'id' | 'created_at'>[] = selectedIndices.map((idx) => {
      const item: ScrapedSkillItem = scrapedResult.detected_skills[idx];
      return {
        name: item.name,
        title: item.title,
        repo: scrapedResult.repo,
        repo_url: scrapedResult.repo_url,
        skill_path: item.skill_path,
        description: item.description,
        category: item.category,
        tags: item.tags,
        author: scrapedResult.owner,
        install_command: item.install_command,
        raw_content: scrapedResult.raw_readme,
        is_favorite: false,
      };
    });

    onAddSkills(toSave);
    toast.success(`${toSave.length} skills agregadas a tu repositorio`);
    handleClose();
  };

  const handleClose = () => {
    setUrl('');
    setScrapedResult(null);
    setSelectedIndices([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <GithubIcon className="h-5 w-5 text-emerald-400" />
              <span>Registrar Skills desde GitHub</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pega un enlace de GitHub o WhatsApp para leer su README y extraer skills automáticamente.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="mt-4 flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/emilkowalski/skills o owner/repo"
            className="flex-1 rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="tap-active flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <span>Analizar Repo</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Examples */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
          <span>Ejemplos rápidos:</span>
          <button
            type="button"
            onClick={() => setUrl('https://github.com/emilkowalski/skills')}
            className="text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700"
          >
            emilkowalski/skills
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setUrl('https://github.com/miqdadbadjuber/anti-slop')}
            className="text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700"
          >
            miqdadbadjuber/anti-slop
          </button>
        </div>

        {/* Results Area */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {scrapedResult && (
            <div>
              {/* Repo Metadata Header */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">{scrapedResult.repo}</h3>
                  <span className="text-xs text-amber-400 flex items-center gap-1">
                    ★ {scrapedResult.stars}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{scrapedResult.description}</p>
              </div>

              {/* Skills List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
                  <span>Skills detectadas ({scrapedResult.detected_skills.length})</span>
                  <span>Selecciona las que desees guardar</span>
                </div>

                {scrapedResult.detected_skills.map((skill, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleIndex(idx)}
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-emerald-500/60 bg-emerald-950/10'
                          : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-xs text-zinc-200">{skill.title}</span>
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800">
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {skill.description}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-500 mt-1.5 truncate">
                          {skill.install_command}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {scrapedResult && (
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {selectedIndices.length} de {scrapedResult.detected_skills.length} seleccionadas
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="tap-active rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSelected}
                disabled={selectedIndices.length === 0}
                className="tap-active rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                Guardar {selectedIndices.length} Skills
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
