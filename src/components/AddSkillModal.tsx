'use client';

import React, { useState } from 'react';
import { X, Search, Sparkles, Check, ExternalLink, Loader2, ArrowRight, FileJson, MessageSquare, Upload } from 'lucide-react';
import { ScrapedRepoResult, ScrapedSkillItem, Skill, CategoryType } from '@/types/skills';
import { GithubIcon } from '@/components/icons/GithubIcon';
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
  const [activeMode, setActiveMode] = useState<'url' | 'lockfile'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedResult, setScrapedResult] = useState<ScrapedRepoResult | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [lockfileJson, setLockfileJson] = useState('');

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
        technologies: item.technologies,
        allowed_tools: item.allowed_tools,
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

  const handleImportLockfile = () => {
    try {
      const parsed = JSON.parse(lockfileJson.trim());
      const skillsObj = parsed.skills || parsed;
      const imported: Omit<Skill, 'id' | 'created_at'>[] = [];

      Object.entries(skillsObj).forEach(([skillName, data]: [string, any]) => {
        const repo = data.source || 'unknown/repo';
        const formattedTitle = skillName
          .split(/[-_]/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        imported.push({
          name: skillName,
          title: formattedTitle,
          repo: repo,
          repo_url: `https://github.com/${repo}`,
          skill_path: data.skillPath,
          description: `Skill importada desde skills-lock.json (${skillName})`,
          category: 'other',
          tags: [skillName, 'lockfile'],
          author: repo.split('/')[0] || 'community',
          install_command: `npx skills add ${repo} --skill ${skillName}`,
          is_favorite: false,
        });
      });

      if (imported.length === 0) {
        toast.error('No se encontraron skills en el JSON ingresado');
        return;
      }

      onAddSkills(imported);
      toast.success(`${imported.length} skills importadas desde tu lockfile`);
      handleClose();
    } catch {
      toast.error('El formato JSON no es válido. Asegúrate de pegar el contenido completo de skills-lock.json');
    }
  };

  const handleClose = () => {
    setUrl('');
    setScrapedResult(null);
    setSelectedIndices([]);
    setLockfileJson('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <GithubIcon className="h-5 w-5 text-emerald-400" />
              <span>Registrar Skills</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Importa por enlace directo, mensaje de WhatsApp o archivo `skills-lock.json`.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-3 my-3 text-xs font-medium border-b border-zinc-800/80 pb-2">
          <button
            onClick={() => setActiveMode('url')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              activeMode === 'url'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span>Enlace de GitHub o WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveMode('lockfile')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              activeMode === 'lockfile'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="h-3.5 w-3.5 text-amber-400" />
            <span>Importar skills-lock.json</span>
          </button>
        </div>

        {/* Mode: URL / WhatsApp */}
        {activeMode === 'url' && (
          <>
            <form onSubmit={handleAnalyze} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Pega un enlace de GitHub o el mensaje que te enviaron por WhatsApp..."
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
                    <span>Analizar</span>
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
                onClick={() => setUrl('https://github.com/cloudflare/security-audit-skill')}
                className="text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700"
              >
                cloudflare/security-audit-skill
              </button>
              <span>•</span>
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
                              <select
                                value={skill.category}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const newCat = e.target.value as any;
                                  setScrapedResult((prev) => {
                                    if (!prev) return prev;
                                    const updated = [...prev.detected_skills];
                                    updated[idx] = { ...updated[idx], category: newCat };
                                    return { ...prev, detected_skills: updated };
                                  });
                                }}
                                className="text-[11px] font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500"
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
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                              {skill.description}
                            </p>

                            {/* Tech and tools chips */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {skill.allowed_tools && skill.allowed_tools.length > 0 && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1 rounded border border-emerald-800/40">
                                  tools: {skill.allowed_tools.join(', ')}
                                </span>
                              )}
                              {skill.technologies && skill.technologies.length > 0 && (
                                <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1 rounded border border-cyan-800/40">
                                  {skill.technologies.join(', ')}
                                </span>
                              )}
                            </div>
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
          </>
        )}

        {/* Mode: Lockfile Import */}
        {activeMode === 'lockfile' && (
          <div className="space-y-3 mt-1">
            <p className="text-xs text-zinc-400">
              Pega el contenido de tu archivo <code className="text-emerald-400 font-mono">skills-lock.json</code> para importar de golpe todas las skills instaladas en tus proyectos:
            </p>

            <textarea
              value={lockfileJson}
              onChange={(e) => setLockfileJson(e.target.value)}
              placeholder={`{\n  "version": 2,\n  "skills": {\n    "animate": {\n      "source": "emilkowalski/skills"\n    }\n  }\n}`}
              className="w-full h-56 rounded-xl border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportLockfile}
                disabled={!lockfileJson.trim()}
                className="tap-active rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                Importar Skills desde JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
